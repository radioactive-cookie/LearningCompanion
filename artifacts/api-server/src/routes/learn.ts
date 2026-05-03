import { Router } from "express";
import { callAIFast } from "../lib/groq";
import { getFundamentalsLesson } from "../data/fundamentalsLessons";

const router = Router();

const suggestionsCache = new Map<string, { data: LearnSuggestion[]; ts: number }>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

interface LearnSuggestion {
  id: string;
  title: string;
  description: string;
}

interface LessonPayload {
  level: number;
  totalLevels: number;
  levelTitle: string;
  explanation: string;
  codeExample: string;
  task: string;
  hint: string;
}

const SUPPORTED_DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const TOTAL_LEVELS = 5;

const LEVEL_META = [
  {
    title: "Fundamentals",
    focus: "Start from absolute zero. In 1-2 plain-English sentences define what this concept IS and why a programmer would use it. Then show the ABSOLUTE MINIMUM working code (3-5 lines max). Use the simplest variable names possible. No jargon, no prerequisites, just the bare concept working.",
  },
  {
    title: "Introduction",
    focus: "The learner has seen the bare concept. Now introduce it properly: explain what it is, why it matters, and show the simplest realistic working code example. Assume zero prior experience with this specific topic.",
  },
  {
    title: "Hands-on Practice",
    focus: "The learner understands the basics. Show 2-3 practical code examples covering the most common real-world usage patterns. Each example should build on the last.",
  },
  {
    title: "Deep Dive",
    focus: "The learner can use this in practice. Teach edge cases, common mistakes beginners make, performance tips, and professional best practices. Include a pitfall-avoidance example.",
  },
  {
    title: "Challenge",
    focus: "The learner is ready for a challenge. Give a non-trivial, specific mini-project or problem that requires combining everything learned in previous levels. Be very specific about what to build.",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a raw AI string into a LessonPayload, returning null if invalid. */
function parseLessonJson(raw: string, level: number, meta: typeof LEVEL_META[0]): LessonPayload | null {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const explanation = typeof parsed.explanation === "string" ? parsed.explanation.trim() : "";
    const codeExample = typeof parsed.codeExample === "string" ? parsed.codeExample.trim() : "";
    const task = typeof parsed.task === "string" ? parsed.task.trim() : "";
    const hint = typeof parsed.hint === "string" ? parsed.hint.trim() : "";
    if (!explanation || !task) return null;
    return { level, totalLevels: TOTAL_LEVELS, levelTitle: meta.title, explanation, codeExample, task, hint };
  } catch {
    return null;
  }
}

/** Build a static fallback lesson so the UI never completely fails. */
function buildFallback(lang: string, topicClean: string, level: number, meta: typeof LEVEL_META[0]): LessonPayload {
  const tips: Record<string, string> = {
    python: "Run your code with `python filename.py` in the terminal.",
    javascript: "Open your browser console (F12) and paste your code to test it.",
    html: "Save as .html and open it in any browser to see the result.",
    css: "Add your styles inside a `<style>` tag and reload the page.",
    java: "Compile with `javac Main.java` then run with `java Main`.",
    typescript: "Use the TypeScript playground at typescriptlang.org to test snippets.",
    react: "Start a project with `npx create-react-app my-app` to experiment.",
    sql: "Use an online SQL sandbox like sqliteonline.com to run queries.",
    default: "Read the official documentation for the best learning resources.",
  };
  const tip = tips[lang.toLowerCase()] ?? tips.default;

  return {
    level,
    totalLevels: TOTAL_LEVELS,
    levelTitle: meta.title,
    explanation: `This lesson covers **${topicClean}** in ${lang} (${meta.title}). The AI couldn't generate content right now, but here's how to get started: search for "${topicClean} in ${lang}" on a site like GeeksForGeeks, MDN, or the official docs.`,
    codeExample: `// ${topicClean} — ${lang}\n// Add your code here and experiment as you read`,
    task: `Research "${topicClean}" in ${lang} and write a minimal working example. Focus on understanding the core idea first, then expand.`,
    hint: tip,
  };
}

// ---------------------------------------------------------------------------
// GET /api/learn/suggestions
// ---------------------------------------------------------------------------
router.get("/suggestions", async (req, res) => {
  const language = (req.query.language as string ?? "").toLowerCase().trim();
  const difficulty = (req.query.difficulty as string ?? "").toLowerCase().trim();

  if (!language) {
    res.status(400).json({ error: "Bad Request", message: "language query param is required." });
    return;
  }
  if (!SUPPORTED_DIFFICULTIES.includes(difficulty)) {
    res.status(400).json({ error: "Bad Request", message: `difficulty must be one of: ${SUPPORTED_DIFFICULTIES.join(", ")}.` });
    return;
  }

  const cacheKey = `${language}::${difficulty}`;
  const cached = suggestionsCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    res.json({ suggestions: cached.data });
    return;
  }

  const systemPrompt = `You are a coding education expert. Return ONLY a valid JSON array — no markdown, no code fences, no extra text.

Each element must have exactly these keys:
- "id": a short kebab-case identifier (e.g. "arrays-basics")
- "title": a concise topic title (3-6 words)
- "description": one sentence describing what the learner will understand

Return exactly 6 topic objects.`;

  const userMsg = `Generate 6 ${difficulty} ${language} programming topics that are practical and engaging. Return ONLY the JSON array.`;

  try {
    const raw = await callAIFast(systemPrompt, [{ role: "user", content: userMsg }]);
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("AI response did not contain a JSON array.");

    const parsed = JSON.parse(jsonMatch[0]) as unknown[];
    const suggestions: LearnSuggestion[] = parsed
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map((item) => ({
        id: typeof item.id === "string" ? item.id : String(Math.random()),
        title: typeof item.title === "string" ? item.title.trim() : "",
        description: typeof item.description === "string" ? item.description.trim() : "",
      }))
      .filter((s) => s.title);

    suggestionsCache.set(cacheKey, { data: suggestions, ts: Date.now() });
    res.json({ suggestions });
  } catch (err) {
    req.log.error({ err }, "Error generating learn suggestions");
    const fallback: LearnSuggestion[] = [
      { id: "variables", title: "Variables & Data Types", description: "Learn how to store and work with different kinds of data." },
      { id: "conditionals", title: "Conditionals & Logic", description: "Make decisions in your code using if/else statements." },
      { id: "loops", title: "Loops & Iteration", description: "Repeat actions efficiently using for and while loops." },
      { id: "functions", title: "Functions & Scope", description: "Organize code into reusable, self-contained blocks." },
      { id: "arrays", title: "Arrays & Lists", description: "Store and manipulate collections of values." },
      { id: "objects", title: "Objects & Dictionaries", description: "Group related data together using key-value pairs." },
    ];
    res.json({ suggestions: fallback });
  }
});

// ---------------------------------------------------------------------------
// POST /api/learn/lesson
// ---------------------------------------------------------------------------
router.post("/lesson", async (req, res) => {
  const { language, difficulty, topic, level } = req.body ?? {};

  if (typeof language !== "string" || !language.trim()) {
    res.status(400).json({ error: "Bad Request", message: "language is required." });
    return;
  }
  if (typeof difficulty !== "string" || !SUPPORTED_DIFFICULTIES.includes(difficulty.toLowerCase())) {
    res.status(400).json({ error: "Bad Request", message: `difficulty must be one of: ${SUPPORTED_DIFFICULTIES.join(", ")}.` });
    return;
  }
  if (typeof topic !== "string" || !topic.trim()) {
    res.status(400).json({ error: "Bad Request", message: "topic is required." });
    return;
  }
  if (typeof level !== "number" || !Number.isInteger(level) || level < 1 || level > TOTAL_LEVELS) {
    res.status(400).json({ error: "Bad Request", message: `level must be an integer between 1 and ${TOTAL_LEVELS}.` });
    return;
  }

  const lang = language.trim();
  const diff = difficulty.toLowerCase().trim();
  const topicClean = topic.trim().slice(0, 200);
  const meta = LEVEL_META[level - 1];

  // ── Static fundamentals content: always serve immediately, no AI call ──
  const staticLesson = getFundamentalsLesson(lang, topicClean, level);
  if (staticLesson) {
    res.json({
      level,
      totalLevels: TOTAL_LEVELS,
      levelTitle: meta.title,
      ...staticLesson,
    });
    return;
  }

  // Compact prompt that fits comfortably within 2048 tokens output
  const systemPrompt = `You are an expert coding instructor. Respond ONLY with a valid JSON object — no markdown, no code fences, no extra text before or after the JSON.

Required JSON keys:
- "explanation": 3-6 clear sentences. ${meta.focus}
- "codeExample": working ${lang} code snippet (5-12 lines). Just the code.
- "task": specific coding task for the learner (2-3 sentences). Level ${level}/${TOTAL_LEVELS}.
- "hint": one practical tip without giving away the answer (1 sentence).`;

  const userMsg = `Topic: "${topicClean}" | Language: ${lang} | Difficulty: ${diff} | Level ${level}/${TOTAL_LEVELS} (${meta.title})`;

  // Try up to 2 times; on the second attempt use a shorter prompt to avoid truncation
  let result: LessonPayload | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const promptToUse = attempt === 1 ? systemPrompt : `You are a coding instructor. Return ONLY JSON with keys: explanation, codeExample, task, hint. Topic: ${topicClean} in ${lang} (${diff}), Level ${level}: ${meta.title}. Be concise.`;
      const raw = await callAIFast(promptToUse, [{ role: "user", content: userMsg }], 2048);
      result = parseLessonJson(raw, level, meta);
      if (result) break;
      req.log.warn({ attempt }, "Lesson JSON parse failed, retrying");
    } catch (err) {
      req.log.warn({ err, attempt }, "Lesson generation attempt failed");
      if (attempt === 2) break; // fall through to fallback
    }
  }

  if (result) {
    res.json(result);
  } else {
    // Return a helpful fallback so the user sees content instead of an error
    req.log.error("Both lesson generation attempts failed — serving fallback");
    res.json(buildFallback(lang, topicClean, level, meta));
  }
});

export default router;
