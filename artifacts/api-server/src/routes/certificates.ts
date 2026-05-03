import { Router } from "express";
import { db, certificates } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

const router = Router();

// ---------------------------------------------------------------------------
// POST /api/certificates — requires authentication
// ---------------------------------------------------------------------------
router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized", message: "Login required to issue certificates." });
    return;
  }

  const userId = req.user.id;
  const { language, topic } = req.body ?? {};

  if (typeof language !== "string" || !language.trim()) {
    res.status(400).json({ error: "Bad Request", message: "language is required." });
    return;
  }
  if (typeof topic !== "string" || !topic.trim()) {
    res.status(400).json({ error: "Bad Request", message: "topic is required." });
    return;
  }

  // Derive display name from the authenticated user's profile
  const firstName = req.user.firstName ?? "";
  const lastName = req.user.lastName ?? "";
  const userName = [firstName, lastName].filter(Boolean).join(" ").trim() || req.user.email?.split("@")[0] || "Learner";

  try {
    const existing = await db
      .select()
      .from(certificates)
      .where(
        and(
          eq(certificates.userId, userId),
          eq(certificates.language, language.trim().toLowerCase()),
          eq(certificates.topic, topic.trim()),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      const cert = existing[0];
      res.json({
        id: cert.id,
        userId: cert.userId,
        userName: cert.userName,
        language: cert.language,
        topic: cert.topic,
        issuedAt: cert.issuedAt.toISOString(),
      });
      return;
    }

    const [cert] = await db
      .insert(certificates)
      .values({
        id: randomUUID(),
        userId,
        userName,
        language: language.trim().toLowerCase(),
        topic: topic.trim(),
        issuedAt: new Date(),
      })
      .returning();

    res.status(201).json({
      id: cert.id,
      userId: cert.userId,
      userName: cert.userName,
      language: cert.language,
      topic: cert.topic,
      issuedAt: cert.issuedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating certificate");
    res.status(500).json({ error: "Internal Server Error", message: "Failed to create certificate." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/certificates/:id — public (share link)
// ---------------------------------------------------------------------------
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ error: "Bad Request", message: "id param is required." });
    return;
  }

  try {
    const rows = await db
      .select()
      .from(certificates)
      .where(eq(certificates.id, id))
      .limit(1);

    if (rows.length === 0) {
      res.status(404).json({ error: "Not Found", message: "Certificate not found." });
      return;
    }

    const cert = rows[0];
    res.json({
      id: cert.id,
      userId: cert.userId,
      userName: cert.userName,
      language: cert.language,
      topic: cert.topic,
      issuedAt: cert.issuedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching certificate");
    res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch certificate." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/certificates — list certificates for authenticated user
// ---------------------------------------------------------------------------
router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized", message: "Login required." });
    return;
  }

  const userId = req.user.id;

  try {
    const rows = await db
      .select()
      .from(certificates)
      .where(eq(certificates.userId, userId));

    res.json({
      items: rows.map((c) => ({
        id: c.id,
        userId: c.userId,
        userName: c.userName,
        language: c.language,
        topic: c.topic,
        issuedAt: c.issuedAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error listing certificates");
    res.status(500).json({ error: "Internal Server Error", message: "Failed to list certificates." });
  }
});

export default router;
