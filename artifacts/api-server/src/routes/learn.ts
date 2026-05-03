import { Router } from "express";
import { callAIFast, callAIFastJson } from "../lib/groq";
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

/**
 * Extract a string field from a parsed JSON object, trying multiple common key variants.
 * Handles camelCase, snake_case, and nested "lesson" wrapper objects.
 */
function extractField(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return "";
}

/**
 * Parse a structured-text AI response (EXPLANATION / CODE / TASK / HINT sections).
 * Splits on section labels so partial responses (missing CODE / TASK / HINT) still work.
 */
function parseLessonText(raw: string, level: number, meta: typeof LEVEL_META[0]): LessonPayload | null {
  // Split at each section header (EXPLANATION, CODE, TASK, HINT) wherever they appear
  const chunks = raw.split(/\n(?=(?:EXPLANATION|CODE|TASK|HINT):?\s)/i);
  const sections: Record<string, string> = {};
  for (const chunk of chunks) {
    const m = chunk.match(/^(EXPLANATION|CODE|TASK|HINT):?\s*([\s\S]*)/i);
    if (m) sections[m[1].toUpperCase()] = m[2].trim();
  }

  const explanation = sections["EXPLANATION"] ?? "";
  if (!explanation) return null;

  // Strip markdown code fences from the code block
  const rawCode = sections["CODE"] ?? "";
  const codeExample = rawCode.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();

  // Graceful fallback for missing TASK
  const task = sections["TASK"] || `Practice what you've learned: write a short ${meta.title.toLowerCase()} program that uses the concept from the code example above.`;
  const hint = sections["HINT"] ?? "";

  return { level, totalLevels: TOTAL_LEVELS, levelTitle: meta.title, explanation, codeExample, task, hint };
}

/** Parse a raw JSON AI response into a LessonPayload, returning null if invalid. */
function parseLessonJson(raw: string, level: number, meta: typeof LEVEL_META[0]): LessonPayload | null {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    let parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

    // Some models wrap everything in a "lesson" key
    if (typeof parsed.lesson === "object" && parsed.lesson !== null) {
      parsed = parsed.lesson as Record<string, unknown>;
    }

    // Accept camelCase OR snake_case field names
    const explanation = extractField(parsed, "explanation", "Explanation");
    const codeExample = extractField(parsed, "codeExample", "code_example", "code", "example", "codeExamples", "Code_Example");
    const task = extractField(parsed, "task", "Task", "coding_task", "challenge");
    const hint = extractField(parsed, "hint", "Hint", "tip", "Tip");

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

  // Use a structured-text format instead of JSON to avoid escaping issues with code examples.
  // Code blocks in JSON are fragile (the model uses triple-quotes, unescaped newlines, etc.).
  // Plain sections are parsed reliably with regex and never fail due to JSON invalidity.
  const systemPrompt = `You are an expert coding instructor. Respond using EXACTLY these four labelled sections, in this order. Do not add any other text.

EXPLANATION:
${meta.focus} Write 3-6 sentences in plain English. Use **bold** for key terms. No code in this section.

CODE:
\`\`\`${lang.toLowerCase()}
[write a working ${lang} code example here, 5–15 lines]
\`\`\`

TASK:
[write a specific hands-on coding task for the learner — 2-3 sentences, level ${level}/${TOTAL_LEVELS}]

HINT:
[write one practical tip that guides without giving the answer — 1 sentence]`;

  const userMsg = `Topic: "${topicClean}" | Language: ${lang} | Difficulty: ${diff} | Level ${level}/${TOTAL_LEVELS} — ${meta.title}`;

  let result: LessonPayload | null = null;

  try {
    const raw = await callAIFast(systemPrompt, [{ role: "user", content: userMsg }], 2048);
    result = parseLessonText(raw, level, meta);
    if (!result) {
      req.log.warn({ raw: raw.slice(0, 600) }, "Structured text parse failed, trying JSON fallback");
      result = parseLessonJson(raw, level, meta);
    }
  } catch (err) {
    req.log.warn({ err }, "Primary lesson generation failed — retrying");
    try {
      const raw2 = await callAIFast(
        `You are a coding instructor. Reply in exactly four sections labelled EXPLANATION, CODE, TASK, HINT. Topic: ${topicClean} in ${lang}, level ${level} — ${meta.title}.`,
        [{ role: "user", content: userMsg }],
        2048,
      );
      result = parseLessonText(raw2, level, meta) ?? parseLessonJson(raw2, level, meta);
    } catch (err2) {
      req.log.error({ err2 }, "Both lesson generation attempts failed");
    }
  }

  if (result) {
    res.json(result);
  } else {
    req.log.error("Lesson generation failed — serving fallback");
    res.json(buildFallback(lang, topicClean, level, meta));
  }
});

export default router;
