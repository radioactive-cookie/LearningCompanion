import { Router } from "express";
import { PROJECT, findStep } from "../config/project";
import { callAI } from "../lib/groq";

const router = Router();

const MENTOR_SYSTEM_PROMPT = `You are a friendly coding mentor teaching beginners step-by-step.

When given a step goal, respond with ONLY a valid JSON object — no markdown, no code fences, no explanation outside the JSON.

The JSON must have exactly these three keys:
- "explanation": A clear, simple 2-4 sentence explanation of the concept. Use plain language suitable for a beginner.
- "task": A small, concrete coding task the learner should try (1-3 lines of code). Be specific.
- "hint": A short optional hint or tip that helps if they get stuck (1-2 sentences).

Example format:
{
  "explanation": "...",
  "task": "...",
  "hint": "..."
}`;

// ---------------------------------------------------------------------------
// GET /api/project
// ---------------------------------------------------------------------------
router.get("/", (_req, res) => {
  res.json({
    title: PROJECT.title,
    steps: PROJECT.steps.map((s) => ({ id: s.id, goal: s.goal })),
  });
});

// ---------------------------------------------------------------------------
// POST /api/lesson
// ---------------------------------------------------------------------------
router.post("/lesson", async (req, res) => {
  const { stepId } = req.body ?? {};

  // Validate: stepId must be a number
  if (stepId === undefined || stepId === null || typeof stepId !== "number" || !Number.isInteger(stepId)) {
    res.status(400).json({
      error: "Bad Request",
      message: "stepId is required and must be an integer.",
    });
    return;
  }

  // Validate: stepId must exist in the server-side project config
  const step = findStep(stepId);
  if (!step) {
    res.status(404).json({
      error: "Not Found",
      message: `Step ${stepId} does not exist in the current project.`,
    });
    return;
  }

  try {
    const raw = await callAI(MENTOR_SYSTEM_PROMPT, [
      {
        role: "user",
        content: `Teach this step: ${step.goal}\nProvide a simple explanation, a small coding task, and an optional hint.`,
      },
    ]);

    // Extract JSON from the AI response (guards against any stray text)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response did not contain valid JSON.");
    }

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

    // Sanitize: only extract expected string fields, reject anything else
    const explanation = typeof parsed.explanation === "string" ? parsed.explanation.trim() : "";
    const task = typeof parsed.task === "string" ? parsed.task.trim() : "";
    const hint = typeof parsed.hint === "string" ? parsed.hint.trim() : "";

    if (!explanation || !task) {
      throw new Error("AI response missing required fields.");
    }

    res.json({ explanation, task, hint });
  } catch (err) {
    req.log.error({ err }, "Error in POST /api/project/lesson");
    const message =
      err instanceof Error && err.message.includes("timed out")
        ? "The AI took too long to respond. Please try again."
        : "Something went wrong generating the lesson. Please try again.";
    res.status(500).json({ error: "Internal Server Error", message });
  }
});

export default router;
