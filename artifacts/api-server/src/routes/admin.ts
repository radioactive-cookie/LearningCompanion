import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { db, adminEmailsTable, adminConfigTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  getSessionId,
  getSession,
  updateSession,
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
  const isAuthenticated = req.isAuthenticated();
  const email = req.user?.email ?? null;

  // Bootstrap mode: no admins exist yet → let first authenticated user self-register
  const adminCount = await getAdminCount();
  const bootstrapMode = adminCount === 0;

  if (!isAuthenticated || !email) {
    res.json({ isAuthenticated: false, isAdminEmail: false, isAdminVerified: false, bootstrapMode });
    return;
  }

  const adminEmail = bootstrapMode || await isAdminEmail(email);
  res.json({
    isAuthenticated: true,
    isAdminEmail: adminEmail,
    isAdminVerified: req.adminVerified === true,
    bootstrapMode,
    displayName: [req.user?.firstName, req.user?.lastName].filter(Boolean).join(" ") || email,
    email,
  });
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
  if (!email || !(await isAdminEmail(email))) {
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

// DELETE /api/admin/remove — remove an admin email
router.delete("/admin/remove", async (req: Request, res: Response) => {
  if (!requireAdminSession(req, res)) return;

  const { email } = req.body;
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email required" });
    return;
  }

  const normalized = email.toLowerCase().trim();

  // Prevent removing self
  if (normalized === req.user?.email?.toLowerCase()) {
    res.status(400).json({ error: "Cannot remove your own admin access" });
    return;
  }

  await db.delete(adminEmailsTable).where(eq(adminEmailsTable.email, normalized));
  res.json({ success: true });
});

export default router;
