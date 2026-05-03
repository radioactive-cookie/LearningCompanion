import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { db, adminEmailsTable, adminConfigTable, usersTable, sessionsTable, learnProgress } from "@workspace/db";
import { eq, gt, count, sql } from "drizzle-orm";

// Track last API request time globally
let lastRequestTime: Date | null = null;
export function updateLastRequestTime() { lastRequestTime = new Date(); }
import {
  getSessionId,
  getSession,
  updateSession,
  createSession,
  SESSION_COOKIE,
  SESSION_TTL,
} from "../lib/auth";

const router: IRouter = Router();

const ADMIN_PASSWORD_CONFIG_KEY = "admin_password_hash";

async function getPasswordHash(): Promise<string | null> {
  const [row] = await db
    .select()
    .from(adminConfigTable)
    .where(eq(adminConfigTable.key, ADMIN_PASSWORD_CONFIG_KEY));
  return row?.value ?? null;
}

async function isAdminEmail(email: string): Promise<boolean> {
  const [row] = await db
    .select()
    .from(adminEmailsTable)
    .where(eq(adminEmailsTable.email, email.toLowerCase()));
  return !!row;
}

function requireAdminSession(req: Request, res: Response): boolean {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  if (!req.adminVerified) {
    res.status(403).json({ error: "Admin password not verified" });
    return false;
  }
  return true;
}

declare global {
  namespace Express {
    interface Request {
      adminVerified?: boolean;
    }
  }
}

export async function adminSessionMiddleware(
  req: Request,
  _res: Response,
  next: () => void,
): Promise<void> {
  const sid = getSessionId(req);
  if (sid) {
    const session = await getSession(sid);
    if (session?.adminVerified) {
      req.adminVerified = true;
    }
  }
  next();
}

async function getAdminCount(): Promise<number> {
  const rows = await db.select().from(adminEmailsTable);
  return rows.length;
}

// GET /api/admin/status — returns auth + admin state (no sensitive data)
router.get("/admin/status", async (req: Request, res: Response) => {
  // Only sessions explicitly created via login-direct have adminVerified=true
  if (!req.adminVerified) {
    const hasPassword = !!(await getPasswordHash());
    res.json({ isAuthenticated: false, isAdminEmail: false, isAdminVerified: false, hasPassword });
    return;
  }

  const email = req.user?.email ?? null;
  res.json({
    isAuthenticated: true,
    isAdminEmail: true,
    isAdminVerified: true,
    hasPassword: true,
    email,
  });
});

// POST /api/admin/login-direct — email + password login (no OAuth required)
router.post("/admin/login-direct", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  // Check if email is a registered admin
  const adminCount = await getAdminCount();
  const bootstrapMode = adminCount === 0;
  const emailOk = bootstrapMode || await isAdminEmail(normalizedEmail);
  if (!emailOk) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // Verify password
  const hash = await getPasswordHash();
  if (!hash) {
    res.status(401).json({ error: "No admin password set. Use the setup endpoint first." });
    return;
  }
  const passwordOk = await bcrypt.compare(String(password), hash);
  if (!passwordOk) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  // Bootstrap: register first admin
  if (bootstrapMode) {
    await db.insert(adminEmailsTable).values({ email: normalizedEmail }).onConflictDoNothing();
  }

  // Create session with synthetic user (no OAuth)
  const sid = await createSession({
    user: {
      id: `admin:${normalizedEmail}`,
      email: normalizedEmail,
      firstName: null,
      lastName: null,
      profileImageUrl: null,
    },
    access_token: "admin-direct",
    adminVerified: true,
  });

  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL,
    path: "/",
  });

  res.json({ success: true });
});

// POST /api/admin/add-initial — one-shot setup: register email + set password (only when no password exists)
router.post("/admin/add-initial", async (req: Request, res: Response) => {
  const hash = await getPasswordHash();
  if (hash) {
    res.status(400).json({ error: "Admin already configured. Use the login page." });
    return;
  }

  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  if (String(password).length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const newHash = await bcrypt.hash(String(password), 12);

  await db.insert(adminEmailsTable).values({ email: normalizedEmail }).onConflictDoNothing();
  await db.insert(adminConfigTable).values({ key: ADMIN_PASSWORD_CONFIG_KEY, value: newHash })
    .onConflictDoUpdate({ target: adminConfigTable.key, set: { value: newHash } });

  res.json({ success: true });
});

// POST /api/admin/setup-password — set password for the first time (only if none set yet)
// In bootstrap mode (0 admins), also auto-registers the calling user as the first admin.
router.post("/admin/setup-password", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const email = req.user?.email;
  if (!email) {
    res.status(400).json({ error: "User has no email" });
    return;
  }

  const adminCount = await getAdminCount();
  const bootstrapMode = adminCount === 0;

  // Outside bootstrap mode, only existing admins can set the password
  if (!bootstrapMode && !(await isAdminEmail(email))) {
    res.status(403).json({ error: "Not an admin" });
    return;
  }

  const existing = await getPasswordHash();
  if (existing && !bootstrapMode) {
    res.status(400).json({ error: "Password already set. Use verify-password instead." });
    return;
  }

  const { password } = req.body;
  if (!password || typeof password !== "string" || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  await db
    .insert(adminConfigTable)
    .values({ key: ADMIN_PASSWORD_CONFIG_KEY, value: hash })
    .onConflictDoUpdate({
      target: adminConfigTable.key,
      set: { value: hash, updatedAt: new Date() },
    });

  // In bootstrap mode, register this user as the first admin
  if (bootstrapMode) {
    await db
      .insert(adminEmailsTable)
      .values({ email: email.toLowerCase() })
      .onConflictDoNothing();
  }

  res.json({ success: true });
});

// POST /api/admin/verify-password — second-factor verify
router.post("/admin/verify-password", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const email = req.user?.email;
  if (!email) {
    res.status(400).json({ error: "User has no email" });
    return;
  }

  // Allow in bootstrap mode (0 admins) — email will be registered by setup-password
  const adminCount = await getAdminCount();
  const bootstrapMode = adminCount === 0;
  if (!bootstrapMode && !(await isAdminEmail(email))) {
    res.status(403).json({ error: "Not an admin" });
    return;
  }

  const { password } = req.body;
  if (!password || typeof password !== "string") {
    res.status(400).json({ error: "Password required" });
    return;
  }

  const hash = await getPasswordHash();
  if (!hash) {
    res.status(400).json({ error: "Admin password not configured yet" });
    return;
  }

  const match = await bcrypt.compare(password, hash);
  if (!match) {
    res.status(401).json({ error: "Incorrect password" });
    return;
  }

  const sid = getSessionId(req);
  if (sid) {
    const session = await getSession(sid);
    if (session) {
      await updateSession(sid, { ...session, adminVerified: true });
    }
  }

  res.json({ success: true });
});

// GET /api/admin/accounts — returns admin email list for authenticated users (no adminVerified needed)
router.get("/admin/accounts", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const rows = await db.select({ email: adminEmailsTable.email }).from(adminEmailsTable).orderBy(adminEmailsTable.createdAt);
  res.json({ accounts: rows.map((r) => r.email) });
});

// POST /api/admin/skip-verify — skip password step (only when no password is set)
router.post("/admin/skip-verify", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const email = req.user?.email;
  if (!email) {
    res.status(400).json({ error: "User has no email" });
    return;
  }

  const adminCount = await getAdminCount();
  const bootstrapMode = adminCount === 0;
  if (!bootstrapMode && !(await isAdminEmail(email))) {
    res.status(403).json({ error: "Not an admin" });
    return;
  }

  // In bootstrap mode with no password set, register this user as first admin
  if (bootstrapMode) {
    await db.insert(adminEmailsTable).values({ email: email.toLowerCase() }).onConflictDoNothing();
  }

  const sid = getSessionId(req);
  if (sid) {
    const session = await getSession(sid);
    if (session) await updateSession(sid, { ...session, adminVerified: true });
  }

  res.json({ success: true });
});

// POST /api/admin/logout — clear admin verification only
router.post("/admin/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  if (sid) {
    const session = await getSession(sid);
    if (session) {
      const { adminVerified: _, ...rest } = session;
      await updateSession(sid, rest);
    }
  }
  res.json({ success: true });
});

// GET /api/admin/list — list all admin emails
router.get("/admin/list", async (req: Request, res: Response) => {
  if (!requireAdminSession(req, res)) return;

  const rows = await db.select().from(adminEmailsTable).orderBy(adminEmailsTable.createdAt);
  res.json({ admins: rows.map((r) => ({ id: r.id, email: r.email, createdAt: r.createdAt })) });
});

// POST /api/admin/add — add a new admin email
router.post("/admin/add", async (req: Request, res: Response) => {
  if (!requireAdminSession(req, res)) return;

  const { email } = req.body;
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email required" });
    return;
  }

  const normalized = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }

  try {
    const [row] = await db
      .insert(adminEmailsTable)
      .values({ email: normalized })
      .returning();
    res.json({ success: true, admin: row });
  } catch {
    res.status(409).json({ error: "Email already exists" });
  }
});

// DELETE /api/admin/remove — remove an admin email (superadmin only)
const SUPERADMIN = "pritammunshi2005@gmail.com";
router.delete("/admin/remove", async (req: Request, res: Response) => {
  if (!requireAdminSession(req, res)) return;

  const callerEmail = req.user?.email?.toLowerCase() ?? "";
  if (callerEmail !== SUPERADMIN) {
    res.status(403).json({ error: "Only the superadmin can remove admins" });
    return;
  }

  const { email } = req.body;
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email required" });
    return;
  }

  const normalized = email.toLowerCase().trim();

  if (normalized === callerEmail) {
    res.status(400).json({ error: "Cannot remove your own admin access" });
    return;
  }

  await db.delete(adminEmailsTable).where(eq(adminEmailsTable.email, normalized));
  res.json({ success: true });
});

// GET /api/admin/stats — user activity + system health data
router.get("/admin/stats", async (req: Request, res: Response) => {
  if (!requireAdminSession(req, res)) return;

  const now = new Date();

  // Total registered users
  const [{ total: totalUsers }] = await db.select({ total: count() }).from(usersTable);

  // Active sessions (non-expired, non-admin-direct)
  const [{ active: activeSessions }] = await db
    .select({ active: count() })
    .from(sessionsTable)
    .where(gt(sessionsTable.expire, now));

  // Step distribution: group by topic from learnProgress
  const stepRows = await db
    .select({ topic: learnProgress.topic, language: learnProgress.language, userCount: count() })
    .from(learnProgress)
    .groupBy(learnProgress.topic, learnProgress.language)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  res.json({
    totalUsers: Number(totalUsers),
    activeSessions: Number(activeSessions),
    stepDistribution: stepRows.map(r => ({
      label: `${r.language} · ${r.topic}`,
      count: Number(r.userCount),
    })),
    apiStatus: "working",
    lastRequestTime: lastRequestTime?.toISOString() ?? null,
  });
});

export default router;
