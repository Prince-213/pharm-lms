import { z } from "zod";

export type TutorMcqQuestion = {
  kind: "multiple_choice";
  prompt: string;
  correctAnswer: string;
  incorrectOptions: [string, string, string];
};

export const mcqQuestionSchema = z
  .object({
    kind: z.literal("multiple_choice"),
    prompt: z.string().min(1).max(500),
    correctAnswer: z.string().min(1).max(300),
    incorrectOptions: z.tuple([
      z.string().min(1).max(300),
      z.string().min(1).max(300),
      z.string().min(1).max(300),
    ]),
  })
  .superRefine((q, ctx) => {
    const all = [q.correctAnswer, ...q.incorrectOptions];
    if (new Set(all.map((s) => s.trim().toLowerCase())).size !== 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Each question needs four distinct options (correct answer plus three different distractors).",
      });
    }
  });

export const quizQuestionsSchema = z.array(mcqQuestionSchema).min(1).max(20);

function distinctFour(
  correctAnswer: string,
  incorrectOptions: [string, string, string],
): boolean {
  return (
    new Set([correctAnswer, ...incorrectOptions].map((s) => s.toLowerCase()))
      .size === 4
  );
}

function fromTutorShape(o: Record<string, unknown>): TutorMcqQuestion | null {
  if (typeof o.prompt !== "string" || typeof o.correctAnswer !== "string") {
    return null;
  }
  if (!Array.isArray(o.incorrectOptions)) return null;
  const wrong = o.incorrectOptions
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);
  const prompt = o.prompt.trim();
  const correctAnswer = o.correctAnswer.trim();
  if (!prompt || !correctAnswer || wrong.length < 3) return null;
  const incorrectOptions = [wrong[0], wrong[1], wrong[2]] as [
    string,
    string,
    string,
  ];
  if (!distinctFour(correctAnswer, incorrectOptions)) return null;
  return {
    kind: "multiple_choice",
    prompt,
    correctAnswer,
    incorrectOptions,
  };
}

function fromAiShape(o: Record<string, unknown>): TutorMcqQuestion | null {
  if (typeof o.question !== "string" || typeof o.answer !== "string") {
    return null;
  }
  if (!Array.isArray(o.options)) return null;
  const prompt = o.question.trim();
  const answer = o.answer.trim();
  const opts = o.options
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!prompt || !answer || opts.length < 4) return null;
  const match = opts.find((x) => x.toLowerCase() === answer.toLowerCase());
  const correctAnswer = match ?? answer;
  const distractors = opts.filter(
    (x) => x.toLowerCase() !== correctAnswer.toLowerCase(),
  );
  if (distractors.length < 3) return null;
  const incorrectOptions = [distractors[0], distractors[1], distractors[2]] as [
    string,
    string,
    string,
  ];
  if (!distinctFour(correctAnswer, incorrectOptions)) return null;
  return {
    kind: "multiple_choice",
    prompt,
    correctAnswer,
    incorrectOptions,
  };
}

export function toTutorMcqQuestion(raw: unknown): TutorMcqQuestion | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return fromTutorShape(o) ?? fromAiShape(o);
}

/**
 * Returns MCQ payloads only when every stored question can be edited without
 * dropping unsupported (e.g. free-text) items. Otherwise null.
 */
export function hydrateTutorMcqQuestions(
  raw: unknown,
): TutorMcqQuestion[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 20) return null;
  const out: TutorMcqQuestion[] = [];
  for (const item of raw) {
    const q = toTutorMcqQuestion(item);
    if (!q) return null;
    out.push(q);
  }
  return out;
}
