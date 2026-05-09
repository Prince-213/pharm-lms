/**
 * Shared normalization for SectionQuiz.questions (Json).
 * Supports: legacy free-text lines, { question, answer }, tutor MCQ objects,
 * and AI-generated { question, options, answer }.
 */

export type NormalizedQuestion =
  | {
      type: "multiple_choice";
      prompt: string;
      /** Canonical correct option (must match one of allOptions for grading). */
      correctAnswer: string;
      /** Four choices; shuffle order in UI with seededShuffle. */
      allOptions: [string, string, string, string];
    }
  | {
      type: "free_text";
      prompt: string;
      expectedAnswer: string | null;
      badge?: string | null;
    };

function hashString(s: string): number {
  let h = 1779033703;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/** Deterministic shuffle for stable UI across re-renders. */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const arr = [...items];
  let state = hashString(seed) || 1;
  function rnd() {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function parseLegacyString(raw: string): NormalizedQuestion | null {
  const parts = raw.split(/\s*(?:\|\||::|=>)\s*/);
  let rawPrompt = parts[0]?.trim() || "";
  const explicitAnswer = parts[1]?.trim() || null;

  if (!rawPrompt) return null;

  const badgeMatch = rawPrompt.match(/^\[(.*?)\]\s*(.*)$/);
  let prompt = rawPrompt;
  let badge: string | null = null;
  let expectedAnswer = explicitAnswer;

  if (badgeMatch) {
    const bText = badgeMatch[1].trim();
    const pText = badgeMatch[2].trim();

    if (bText && pText && !explicitAnswer) {
      return {
        type: "free_text",
        prompt: bText,
        expectedAnswer: pText,
        badge: null,
      };
    }

    badge = bText;
    prompt = pText || rawPrompt;
  }

  return {
    type: "free_text",
    prompt,
    expectedAnswer,
    badge,
  };
}

function normalizeTutorMcq(o: Record<string, unknown>): NormalizedQuestion | null {
  const prompt = typeof o.prompt === "string" ? o.prompt.trim() : "";
  const correctAnswer =
    typeof o.correctAnswer === "string" ? o.correctAnswer.trim() : "";
  const inc = o.incorrectOptions;
  if (
    !prompt ||
    !correctAnswer ||
    !Array.isArray(inc) ||
    inc.length !== 3
  ) {
    return null;
  }
  const wrong = inc.map((x) =>
    typeof x === "string" ? x.trim() : "",
  ) as [string, string, string];
  if (wrong.some((w) => !w)) return null;
  const all = [correctAnswer, wrong[0], wrong[1], wrong[2]] as [
    string,
    string,
    string,
    string,
  ];
  const lower = new Set(all.map((s) => s.toLowerCase()));
  if (lower.size !== 4) return null;

  return {
    type: "multiple_choice",
    prompt,
    correctAnswer,
    allOptions: all,
  };
}

function normalizeAiMcq(o: Record<string, unknown>): NormalizedQuestion | null {
  if (typeof o.question !== "string" || typeof o.answer !== "string") {
    return null;
  }
  const prompt = o.question.trim();
  const answerRaw = o.answer.trim();
  if (!prompt || !answerRaw) return null;

  const opts = (Array.isArray(o.options) ? o.options : [])
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim())
    .filter(Boolean);

  if (opts.length < 2) return null;

  const matchIdx = opts.findIndex(
    (x) => x.toLowerCase() === answerRaw.toLowerCase(),
  );
  const correctAnswer = matchIdx >= 0 ? opts[matchIdx] : answerRaw;

  let four: string[];
  if (opts.length >= 4) {
    four = opts.slice(0, 4);
  } else {
    four = [...opts];
    while (four.length < 4) {
      four.push(four[four.length - 1] ?? correctAnswer);
    }
  }

  return {
    type: "multiple_choice",
    prompt,
    correctAnswer,
    allOptions: four as [string, string, string, string],
  };
}

export function normalizeQuestion(raw: unknown): NormalizedQuestion | null {
  if (typeof raw === "string") {
    return parseLegacyString(raw);
  }

  if (!raw || typeof raw !== "object") return null;

  const o = raw as Record<string, unknown>;

  if (o.kind === "multiple_choice") {
    return normalizeTutorMcq(o);
  }

  if (
    typeof o.question === "string" &&
    Array.isArray(o.options) &&
    typeof o.answer === "string"
  ) {
    return normalizeAiMcq(o);
  }

  if (typeof o.question === "string" && o.question.trim()) {
    return {
      type: "free_text",
      prompt: o.question.trim(),
      expectedAnswer:
        typeof o.answer === "string" && o.answer.trim()
          ? o.answer.trim()
          : null,
      badge: typeof o.badge === "string" ? o.badge : null,
    };
  }

  return null;
}

export function normalizeQuizQuestions(raw: unknown): NormalizedQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeQuestion)
    .filter((q): q is NormalizedQuestion => Boolean(q));
}

export function hasAnswerKey(q: NormalizedQuestion): boolean {
  if (q.type === "multiple_choice") return true;
  return Boolean(q.expectedAnswer?.trim());
}

export function answersMatch(canonical: string, submitted: string): boolean {
  return canonical.trim().toLowerCase() === submitted.trim().toLowerCase();
}

export function gradeSubmission(
  q: NormalizedQuestion,
  userAnswer: string,
): boolean | null {
  if (q.type === "multiple_choice") {
    return answersMatch(q.correctAnswer, userAnswer);
  }
  if (!q.expectedAnswer?.trim()) return null;
  return answersMatch(q.expectedAnswer, userAnswer);
}
