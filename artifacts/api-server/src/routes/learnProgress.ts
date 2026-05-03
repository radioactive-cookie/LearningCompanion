import { Router } from "express";
import { db, learnProgress, streakActivity } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

async function logActivity(userId: string): Promise<void> {
  const date = todayUtc();
  await db
    .insert(streakActivity)
    .values({ userId, activityDate: date })
    .onConflictDoNothing();
}

function computeStreak(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const sorted = [...dates].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
    if (diffDays === 1) {
      run++;
      if (run > longest) longest = run;
    } else if (diffDays > 1) {
      run = 1;
    }
  }

  const today = todayUtc();
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const last = sorted[sorted.length - 1];

  if (last !== today && last !== yesterday) return { current: 0, longest };

  let current = 1;
  for (let i = sorted.length - 2; i >= 0; i--) {
    const next = new Date(sorted[i + 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.round((next.getTime() - curr.getTime()) / 86_400_000);
    if (diffDays === 1) current++;
    else break;
  }

  return { current, longest };
}

// ---------------------------------------------------------------------------
// GET /api/learn/progress — requires authentication
// ---------------------------------------------------------------------------
router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized", message: "Login required to view progress." });
    return;
  }

  const userId = req.user.id;

  try {
    const rows = await db
      .select()
      .from(learnProgress)
      .where(eq(learnProgress.userId, userId));

    res.json({
      items: rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        language: r.language,
        difficulty: r.difficulty,
        topic: r.topic,
        completedLevels: r.completedLevels ?? [],
        updatedAt: r.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching learn progress");
    res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch progress." });
  }
});

// ---------------------------------------------------------------------------
// POST /api/learn/progress — requires authentication
// ---------------------------------------------------------------------------
router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized", message: "Login required to save progress." });
    return;
  }

  const userId = req.user.id;
  const { language, difficulty, topic, completedLevels } = req.body ?? {};

  if (typeof language !== "string" || !language.trim()) {
    res.status(400).json({ error: "Bad Request", message: "language is required." });
    return;
  }
  if (typeof difficulty !== "string" || !difficulty.trim()) {
    res.status(400).json({ error: "Bad Request", message: "difficulty is required." });
    return;
  }
  if (typeof topic !== "string" || !topic.trim()) {
    res.status(400).json({ error: "Bad Request", message: "topic is required." });
    return;
  }
  if (!Array.isArray(completedLevels) || !completedLevels.every((l) => Number.isInteger(l) && l >= 1 && l <= 5)) {
    res.status(400).json({ error: "Bad Request", message: "completedLevels must be an array of integers 1-5." });
    return;
  }

  try {
    const existing = await db
      .select()
      .from(learnProgress)
      .where(
        and(
          eq(learnProgress.userId, userId),
          eq(learnProgress.language, language.trim().toLowerCase()),
          eq(learnProgress.difficulty, difficulty.trim().toLowerCase()),
          eq(learnProgress.topic, topic.trim()),
        ),
      )
      .limit(1);

    let row;

    if (existing.length > 0) {
      const [updated] = await db
        .update(learnProgress)
        .set({ completedLevels, updatedAt: new Date() })
        .where(eq(learnProgress.id, existing[0].id))
        .returning();
      row = updated;
    } else {
      const [inserted] = await db
        .insert(learnProgress)
        .values({
          id: randomUUID(),
          userId,
          language: language.trim().toLowerCase(),
          difficulty: difficulty.trim().toLowerCase(),
          topic: topic.trim(),
          completedLevels,
          updatedAt: new Date(),
        })
        .returning();
      row = inserted;
    }

    logActivity(userId).catch(() => {});

    res.json({
      id: row.id,
      userId: row.userId,
      language: row.language,
      difficulty: row.difficulty,
      topic: row.topic,
      completedLevels: row.completedLevels ?? [],
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error saving learn progress");
    res.status(500).json({ error: "Internal Server Error", message: "Failed to save progress." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/learn/progress/activity — requires authentication
// ---------------------------------------------------------------------------
router.get("/activity", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized", message: "Login required." });
    return;
  }

  const userId = req.user.id;
  const weeksRaw = parseInt((req.query.weeks as string) ?? "26", 10);
  const weeks = Number.isFinite(weeksRaw) && weeksRaw >= 1 && weeksRaw <= 52 ? weeksRaw : 26;

  try {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const endDate = now.toISOString().slice(0, 10);
    const startMs = now.getTime() - (dayOfWeek + (weeks - 1) * 7) * 86_400_000;
    const startDate = new Date(startMs).toISOString().slice(0, 10);

    const rows = await db
      .select({ activityDate: streakActivity.activityDate })
      .from(streakActivity)
      .where(
        and(
          eq(streakActivity.userId, userId),
          gte(streakActivity.activityDate, startDate),
        ),
      );

    const dates = rows.map((r) => r.activityDate);

    res.json({ dates, startDate, endDate });
  } catch (err) {
    req.log.error({ err }, "Error fetching activity dates");
    res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch activity." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/learn/streak — requires authentication
// ---------------------------------------------------------------------------
router.get("/streak", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized", message: "Login required." });
    return;
  }

  const userId = req.user.id;

  try {
    const rows = await db
      .select({ activityDate: streakActivity.activityDate })
      .from(streakActivity)
      .where(eq(streakActivity.userId, userId))
      .orderBy(sql`${streakActivity.activityDate} asc`);

    const dates = rows.map((r) => r.activityDate);
    const { current, longest } = computeStreak(dates);
    const today = todayUtc();
    const lastActivityDate = dates.length > 0 ? dates[dates.length - 1] : null;

    res.json({
      currentStreak: current,
      longestStreak: longest,
      todayActive: dates.includes(today),
      lastActivityDate,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching streak");
    res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch streak." });
  }
});

export default router;
