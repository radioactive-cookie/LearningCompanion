/**
 * Project configuration — server-side only.
 *
 * The structure is defined here and never accepted from user input.
 * stepId values are validated against this list before any AI call is made.
 */

export type ProjectStep = {
  id: number;
  goal: string;
};

export type Project = {
  title: string;
  steps: ProjectStep[];
};

export const PROJECT: Project = {
  title: "Build a Calculator",
  steps: [
    { id: 1, goal: "Store two numbers for calculator" },
    { id: 2, goal: "Take user input for numbers" },
    { id: 3, goal: "Perform addition of two numbers" },
    { id: 4, goal: "Wrap logic into a function" },
  ],
};

/**
 * Look up a step by its id.
 * Returns undefined if the id is not found — callers must handle this.
 */
export function findStep(stepId: number): ProjectStep | undefined {
  return PROJECT.steps.find((s) => s.id === stepId);
}
