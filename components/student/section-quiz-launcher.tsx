"use client";

import { CheckCircle2, HelpCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type QuizQuestion = {
  prompt: string;
  expectedAnswer: string | null;
  badge?: string | null;
};

type SectionQuiz = {
  id: string;
  title: string;
  questions: unknown;
};

function parseQuestion(raw: unknown): QuizQuestion | null {
  if (typeof raw === "string") {
    const parts = raw.split(/\s*(?:\|\||::|=>)\s*/);
    let rawPrompt = parts[0]?.trim() || "";
    const expectedAnswer = parts[1]?.trim() || null;

    if (!rawPrompt) return null;

    // Support for [Badge] Question format
    const badgeMatch = rawPrompt.match(/^\[(.*?)\]\s*(.*)$/);
    let prompt = rawPrompt;
    let badge: string | null = null;

    if (badgeMatch) {
      const bText = badgeMatch[1].trim();
      const pText = badgeMatch[2].trim();

      // If we have [Text] MoreText and no explicit answer key from ||,
      // assume [Question] Answer format to prevent question/answer swap.
      if (bText && pText && !expectedAnswer) {
        return {
          prompt: bText,
          expectedAnswer: pText,
          badge: null,
        };
      }

      badge = bText;
      prompt = pText || rawPrompt;
    }

    return {
      prompt,
      expectedAnswer,
      badge,
    };
  }

  if (raw && typeof raw === "object") {
    const maybe = raw as { question?: unknown; answer?: unknown; badge?: unknown };
    if (typeof maybe.question === "string" && maybe.question.trim()) {
      return {
        prompt: maybe.question.trim(),
        expectedAnswer: typeof maybe.answer === "string" && maybe.answer.trim() ? maybe.answer.trim() : null,
        badge: typeof maybe.badge === "string" ? maybe.badge : null,
      };
    }
  }

  return null;
}

function parseQuestions(value: unknown): QuizQuestion[] {
  if (!Array.isArray(value)) return [];
  return value.map(parseQuestion).filter((q): q is QuizQuestion => Boolean(q));
}

export function SectionQuizLauncher({ quizzes }: { quizzes: SectionQuiz[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<string>(quizzes[0]?.id ?? "");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [serverScore, setServerScore] = useState<number | null>(null);
  const [hasAnswerKey, setHasAnswerKey] = useState<boolean>(true);
  const [pending, startTransition] = useTransition();

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId) ?? quizzes[0] ?? null;
  const questions = useMemo(
    () => (activeQuiz ? parseQuestions(activeQuiz.questions) : []),
    [activeQuiz],
  );

  const results = useMemo(() => {
    const graded = questions.map((q, index) => {
      const key = `${activeQuiz?.id ?? "quiz"}:${index}`;
      const userAnswer = (answers[key] ?? "").trim();
      const isCorrect = q.expectedAnswer
        ? userAnswer.toLowerCase() === q.expectedAnswer.toLowerCase()
        : null;
      return {
        ...q,
        userAnswer,
        isCorrect,
      };
    });
    return { graded };
  }, [activeQuiz, answers, questions]);

  function submit() {
    if (!activeQuiz) return;
    setSubmitError(null);
    const payload: Record<string, string> = {};
    questions.forEach((_, index) => {
      const key = `${activeQuiz.id}:${index}`;
      payload[String(index)] = (answers[key] ?? "").trim();
    });
    startTransition(async () => {
      try {
        const res = await fetch("/api/student/section-quiz/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quizId: activeQuiz.id, answers: payload }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          setSubmitError(
            typeof data?.error === "string"
              ? data.error
              : "Could not submit quiz. Please try again.",
          );
          return;
        }
        const data = (await res.json()) as {
          score: number;
          hasAnswerKey: boolean;
        };
        setServerScore(data.score);
        setHasAnswerKey(data.hasAnswerKey);
        setShowResults(true);
        router.refresh();
      } catch {
        setSubmitError("Network error while submitting quiz.");
      }
    });
  }

  if (!quizzes.length) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setShowResults(false);
        }}
        className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--primary)]/25 bg-[var(--primary-soft)] px-4 text-sm font-semibold text-[var(--primary-strong)] transition hover:border-[var(--primary)]/45"
      >
        Take section quiz
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-3xl rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Section quiz</p>
                <p className="text-xs text-[var(--muted)]">Answer and review instantly.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-[var(--muted)] hover:bg-[var(--surface-muted)]"
                aria-label="Close quiz"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-[var(--border)] px-5 py-3">
              <div className="flex flex-wrap gap-2">
                {quizzes.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setActiveQuizId(q.id);
                      setShowResults(false);
                    }}
                    className={
                      activeQuizId === q.id
                        ? "rounded-full bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-foreground)]"
                        : "rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)]"
                    }
                  >
                    {q.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[65vh] overflow-auto px-5 py-4">
              {!activeQuiz || !questions.length ? (
                <p className="text-sm text-[var(--muted)]">No questions configured for this quiz.</p>
              ) : !showResults ? (
                <div className="space-y-4">
                  {questions.map((q, index) => {
                    const key = `${activeQuiz.id}:${index}`;
                    return (
                      <div key={key} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                        <div className="text-sm font-medium text-[var(--foreground)]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-[var(--muted)] opacity-60">Q{index + 1}</span>
                            {q.badge && (
                              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                                {q.badge}
                              </span>
                            )}
                          </div>
                          {q.prompt}
                        </div>
                        <textarea
                          value={answers[key] ?? ""}
                          onChange={(e) => setAnswers((prev) => ({ ...prev, [key]: e.target.value }))}
                          rows={2}
                          className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm"
                          placeholder="Type your answer"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-sm font-semibold text-[var(--foreground)]">Quiz results</p>
                    <p className="text-xs text-[var(--muted)]">
                      {!hasAnswerKey
                        ? "This quiz has no configured answer keys, so only your responses were saved."
                        : `Score: ${serverScore ?? 0}% — saved to your achievements.`}
                    </p>
                  </div>
                  {results.graded.map((r, index) => (
                    <div key={`${activeQuiz?.id ?? "quiz"}:${index}`} className="rounded-lg border border-[var(--border)] p-3">
                      <div className="flex items-start gap-2">
                        {r.isCorrect === true ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                        ) : (
                          <HelpCircle className="mt-0.5 h-4 w-4 text-amber-600" />
                        )}
                        <div className="text-sm font-medium text-[var(--foreground)]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-[var(--muted)] opacity-60">Q{index + 1}</span>
                            {r.badge && (
                              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                                {r.badge}
                              </span>
                            )}
                          </div>
                          {r.prompt}
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-[var(--muted)]">
                        <span className="font-semibold">Your answer:</span> {r.userAnswer || "No answer"}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        <span className="font-semibold">Expected answer:</span>{" "}
                        {r.expectedAnswer ?? "Not configured by mentor"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)]"
              >
                Close
              </button>
              {!showResults ? (
                <>
                  {submitError ? (
                    <p className="text-xs font-medium text-rose-600">
                      {submitError}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={submit}
                    disabled={pending || !activeQuiz || questions.length === 0}
                    className="rounded-md bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-foreground)] disabled:opacity-60"
                  >
                    {pending ? "Submitting…" : "Submit quiz"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowResults(false);
                    setServerScore(null);
                  }}
                  className="rounded-md bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-strong)]"
                >
                  Edit answers
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
