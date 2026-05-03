import { Router } from "express";
import { callAI, callAIFast, getUsageStats, type ConversationMessage } from "../lib/groq";
import { db } from "@workspace/db";
import { conversations, messages, insertConversationSchema, insertMessageSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const MAX_USER_MESSAGE_LENGTH = 2000;

const DEFAULT_SYSTEM_PROMPT = `You are a friendly and knowledgeable Learning Companion Bot. Your purpose is to help users learn any topic they're curious about.

FORMATTING — always use clean Markdown so responses are easy to read:
- Use **bold** for key terms and important concepts
- Use bullet lists (- item) or numbered lists (1. item) whenever you present multiple points, steps, or examples
- Use ## or ### headings to separate major sections in longer answers
- Use \`inline code\` for code terms, commands, or syntax
- Use fenced code blocks with the language name for multi-line code examples
- Never dump a wall of plain prose — structure everything with lists, headings, or both

RESPONSE LENGTH — follow this strictly:
- For simple factual questions, calculations, or quick lookups: give a SHORT, direct answer (1–3 sentences). Structure even short answers with **bold** key terms.
- Only give a LONG, detailed response when the user's message contains words like: explain, elaborate, describe, summarize, how does, why does, walk me through, break down, detail, in depth, step by step, teach me.

Examples:
- "What is DNA?" → "**DNA** (deoxyribonucleic acid) is the molecule that carries **genetic instructions** in all living organisms."
- "Explain DNA replication" → use headings and numbered steps with bold key terms throughout.

General guidelines:
- Match your tone and depth to what the user actually asked
- Be accurate and engaging
- If you don't know something, say so honestly`;

// ---------------------------------------------------------------------------
// POST /api/ai
// ---------------------------------------------------------------------------
router.post("/", async (req, res) => {
  // --- Validate request body ------------------------------------------------
  const { systemPrompt, userMessage, message, sessionId, topic, temporary } = req.body ?? {};
  const isTemporary = temporary === true;

  // Support both { userMessage } (new spec) and { message } (legacy frontend)
  const userInput: unknown = userMessage ?? message;

  if (!userInput || typeof userInput !== "string" || userInput.trim() === "") {
    res.status(400).json({
      error: "Bad Request",
      message: "userMessage is required and must be a non-empty string.",
    });
    return;
  }

  if (userInput.length > MAX_USER_MESSAGE_LENGTH) {
    res.status(400).json({
      error: "Bad Request",
      message: `userMessage must not exceed ${MAX_USER_MESSAGE_LENGTH} characters.`,
    });
    return;
  }

  const resolvedSystemPrompt =
    typeof systemPrompt === "string" && systemPrompt.trim()
      ? systemPrompt.trim()
      : DEFAULT_SYSTEM_PROMPT + (topic ? `\nCurrent topic focus: ${topic}` : "");

  const trimmedInput = userInput.trim();

  try {
    if (isTemporary) {
      // --- Temporary / ephemeral mode: no DB reads or writes -----------------
      // The client passes its in-memory history as a JSON-encoded string in
      // the topic field (not used), so we just build the history from the
      // request body directly and call the AI without touching the DB.
      // We return a synthetic sessionId of "temp" so the client can track
      // the session in memory only.
      const tempHistory: ConversationMessage[] = [];

      // If the client sends prior messages for context, decode them
      const priorMessages: unknown = (req.body as Record<string, unknown>).priorMessages;
      if (Array.isArray(priorMessages)) {
        for (const m of priorMessages as Array<{ role: string; content: string }>) {
          if ((m.role === "user" || m.role === "assistant") && typeof m.content === "string") {
            tempHistory.push({ role: m.role, content: m.content });
          }
        }
      }

      // Append current user message
      tempHistory.push({ role: "user", content: trimmedInput });

      const reply = await callAI(resolvedSystemPrompt, tempHistory);

      res.json({ reply, sessionId: "temp", timestamp: new Date().toISOString() });
      return;
    }

    // --- Persistent mode: normal DB-backed conversation ---------------------
    // sessionId from the client is always a string; convert to int for DB ops.
    const incomingId = typeof sessionId === "string" ? parseInt(sessionId, 10) : NaN;
    let conversationId: number | undefined = !isNaN(incomingId) ? incomingId : undefined;

    if (!conversationId) {
      const [conv] = await db
        .insert(conversations)
        .values(insertConversationSchema.parse({ title: topic ?? "New conversation" }))
        .returning();
      conversationId = conv.id;
    } else {
      const existing = await db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
      });
      if (!existing) {
        const [conv] = await db
          .insert(conversations)
          .values(insertConversationSchema.parse({ title: topic ?? "New conversation" }))
          .returning();
        conversationId = conv.id;
      }
    }

    // Persist user message before calling AI
    await db.insert(messages).values(
      insertMessageSchema.parse({ conversationId, role: "user", content: trimmedInput }),
    );

    // Fetch full conversation history so the model has real context
    const history = await db.query.messages.findMany({
      where: eq(messages.conversationId, conversationId),
      orderBy: (m, { asc }) => [asc(m.createdAt)],
    });

    const conversationMessages: ConversationMessage[] = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const reply = await callAI(resolvedSystemPrompt, conversationMessages);

    // Persist assistant reply
    await db.insert(messages).values(
      insertMessageSchema.parse({ conversationId, role: "assistant", content: reply }),
    );

    res.json({
      reply,
      sessionId: String(conversationId),
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    req.log.error({ err }, "Error in POST /api/ai");

    // Groq rate-limit (429)
    if (
      err != null &&
      typeof err === "object" &&
      "status" in err &&
      (err as { status: number }).status === 429
    ) {
      // Try to extract the retry-after hint from the error message
      const raw = err instanceof Error ? err.message : "";
      const retryMatch = raw.match(/Please try again in ([^.]+)\./);
      const retryHint = retryMatch ? ` Please try again in ${retryMatch[1]}.` : " Please try again later.";
      res.status(429).json({
        error: "Rate limit exceeded",
        message: `The AI service has reached its daily token limit.${retryHint}`,
      });
      return;
    }

    const message =
      err instanceof Error && err.message.includes("timed out")
        ? "The AI took too long to respond. Please try again."
        : "Something went wrong. Please try again in a moment.";

    res.status(500).json({ error: "Internal Server Error", message });
  }
});

// ---------------------------------------------------------------------------
// GET /api/ai/usage
// ---------------------------------------------------------------------------
router.get("/usage", (_req, res) => {
  res.json(getUsageStats());
});

// ---------------------------------------------------------------------------
// GET /api/ai/history
// ---------------------------------------------------------------------------
router.get("/history", async (req, res) => {
  try {
    const { sessionId } = req.query as { sessionId?: string };

    if (sessionId) {
      // Return messages for a specific conversation
      const convId = parseInt(sessionId, 10);
      if (isNaN(convId)) {
        res.status(400).json({ error: "Bad Request", message: "Invalid sessionId." });
        return;
      }

      const history = await db.query.messages.findMany({
        where: eq(messages.conversationId, convId),
        orderBy: (m, { asc }) => [asc(m.createdAt)],
      });

      res.json({
        sessionId,
        messages: history.map((msg) => ({
          id: String(msg.id),
          role: msg.role,
          content: msg.content,
          timestamp: msg.createdAt.toISOString(),
          conversationId: String(msg.conversationId),
        })),
      });
    } else {
      // No sessionId — return all messages from all conversations
      const allMessages = await db.query.messages.findMany({
        orderBy: (m, { asc }) => [asc(m.createdAt)],
      });

      res.json({
        sessionId: "",
        messages: allMessages.map((msg) => ({
          id: String(msg.id),
          role: msg.role,
          content: msg.content,
          timestamp: msg.createdAt.toISOString(),
          conversationId: String(msg.conversationId),
        })),
      });
    }
  } catch (err) {
    req.log.error({ err }, "Error in GET /api/ai/history");
    res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch history." });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/ai/history/:sessionId
// ---------------------------------------------------------------------------
router.delete("/history/:sessionId", async (req, res) => {
  const convId = parseInt(req.params.sessionId, 10);
  if (isNaN(convId)) {
    res.status(400).json({ error: "Bad Request", message: "Invalid sessionId." });
    return;
  }

  try {
    const existing = await db.query.conversations.findFirst({
      where: eq(conversations.id, convId),
    });

    if (!existing) {
      res.status(404).json({ error: "Not Found", message: "Conversation not found." });
      return;
    }

    // messages.conversationId has onDelete: "cascade" so deleting the
    // conversation also removes its messages automatically.
    await db.delete(conversations).where(eq(conversations.id, convId));

    res.json({ success: true, sessionId: req.params.sessionId });
  } catch (err) {
    req.log.error({ err }, "Error in DELETE /api/ai/history/:sessionId");
    res.status(500).json({ error: "Internal Server Error", message: "Failed to delete conversation." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/ai/topics  — AI-generated, refreshed every 10 minutes
// ---------------------------------------------------------------------------
type TopicEntry = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
};

const FALLBACK_TOPICS: TopicEntry[] = [
  { id: "math-basics", title: "Mathematics Fundamentals", description: "Explore numbers, algebra, geometry, and calculus concepts", category: "Mathematics", difficulty: "beginner" },
  { id: "python-programming", title: "Python Programming", description: "Learn Python from scratch with hands-on examples", category: "Programming", difficulty: "beginner" },
  { id: "world-history", title: "World History", description: "Journey through major civilizations and historical events", category: "History", difficulty: "beginner" },
  { id: "biology-basics", title: "Biology & Life Sciences", description: "Understand living organisms, cells, genetics, and ecosystems", category: "Science", difficulty: "beginner" },
  { id: "data-structures", title: "Data Structures & Algorithms", description: "Master fundamental CS concepts for technical interviews", category: "Programming", difficulty: "intermediate" },
  { id: "machine-learning", title: "Machine Learning", description: "Introduction to ML algorithms, neural networks and AI", category: "Technology", difficulty: "advanced" },
];

let cachedTopics: TopicEntry[] | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours — topics don't need constant refresh

const TOPICS_SYSTEM_PROMPT = `You are a curriculum designer. Return ONLY a valid JSON array — no markdown, no explanation, no code fences. The array must contain exactly 6 objects.

Each object must have these exact keys:
- "id": a unique kebab-case slug (string)
- "title": a short, engaging topic title (string, max 40 chars)
- "description": one sentence explaining what learners will explore (string, max 90 chars)
- "category": one of: Mathematics, Science, Programming, History, Technology, Language, Arts, Social Science, Philosophy, Health
- "difficulty": exactly one of: "beginner", "intermediate", "advanced"

Rules:
- Cover at least 4 different categories
- Include at least one beginner and one advanced topic
- Make topics feel fresh, specific, and genuinely interesting — not generic
- Vary topics each call; do not repeat the same titles every time`;

router.get("/topics", async (req, res) => {
  const now = Date.now();

  if (cachedTopics && now < cacheExpiresAt) {
    res.json({ topics: cachedTopics });
    return;
  }

  try {
    const raw = await callAIFast(TOPICS_SYSTEM_PROMPT, [
      { role: "user", content: `Today is ${new Date().toDateString()}. Generate 6 diverse learning topic suggestions.` },
    ]);

    // Extract JSON array from the response (handle any stray text)
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found in response");

    const parsed: unknown = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid topics array");

    const topics: TopicEntry[] = (parsed as TopicEntry[]).map((t, i) => ({
      id: typeof t.id === "string" ? t.id : `topic-${i}`,
      title: typeof t.title === "string" ? t.title : "Learning Topic",
      description: typeof t.description === "string" ? t.description : "",
      category: typeof t.category === "string" ? t.category : "General",
      difficulty: ["beginner", "intermediate", "advanced"].includes(t.difficulty)
        ? t.difficulty
        : "beginner",
    }));

    cachedTopics = topics;
    cacheExpiresAt = now + CACHE_TTL_MS;

    res.json({ topics });
  } catch (err) {
    req.log.error({ err }, "Failed to generate AI topics, using fallback");
    res.json({ topics: FALLBACK_TOPICS });
  }
});

export default router;
