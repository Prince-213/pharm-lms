"use client";

import { CheckCircle2, HelpCircle, ListChecks, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  gradeSubmission,
  type NormalizedQuestion,
  normalizeQuizQuestions,
  seededShuffle,
} from "@/lib/section-quiz-questions";
import { LabeledIconButton } from "@/components/student/labeled-icon-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SectionQuiz = {
  id: string;
  title: string;
  questions: unknown;
};

export function SectionQuizLauncher({
  quizzes,
  triggerVariant = "default",
  size = "default",
  defaultQuizId,
  quizTitle,
}: {
  quizzes: SectionQuiz[];
  triggerVariant?:
    | "default"
    | "icon"
    | "labeled"
    | "sidebar-link"
    | "section-badge"
    | "button-group";
  size?: "sm" | "default";
  /** When set, opens this quiz first (e.g. sidebar row click). */
  defaultQuizId?: string;
  /** Label for sidebar-link trigger; defaults to first quiz title. */
  quizTitle?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [attemptedThisSession, setAttemptedThisSession] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<string>(
    quizzes[0]?.id ?? "",
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [serverScore, setServerScore] = useState<number | null>(null);
  const [hasAnswerKey, setHasAnswerKey] = useState<boolean>(true);
  const [pending, startTransition] = useTransition();

  const activeQuiz =
    quizzes.find((q) => q.id === activeQuizId) ?? quizzes[0] ?? null;
  const questions = useMemo(
    () => (activeQuiz ? normalizeQuizQuestions(activeQuiz.questions) : []),
    [activeQuiz],
  );

  const results = useMemo(() => {
    const graded = questions.map((q, index) => {
      const key = `${activeQuiz?.id ?? "quiz"}:${index}`;
      const userAnswer = (answers[key] ?? "").trim();
      const isCorrect = gradeSubmission(q, userAnswer);
      return { q, userAnswer, isCorrect };
    });
    return { graded };
  }, [activeQuiz?.id, answers, questions]);

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
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
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
        setAttemptedThisSession(true);
        router.refresh();
      } catch {
        setSubmitError("Network error while submitting quiz.");
      }
    });
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!quizzes.length) return null;

  const openQuiz = (quizId?: string) => {
    if (quizId && quizzes.some((q) => q.id === quizId)) {
      setActiveQuizId(quizId);
    } else if (defaultQuizId && quizzes.some((q) => q.id === defaultQuizId)) {
      setActiveQuizId(defaultQuizId);
    }
    setOpen(true);
    setShowResults(false);
  };

  const quizTooltip = "Take section quiz";
  const linkLabel = quizTitle ?? quizzes[0]?.title ?? "Section quiz";

  const trigger =
    triggerVariant === "labeled" ? (
      <LabeledIconButton
        icon={ListChecks}
        label="Quiz"
        ariaLabel={quizTooltip}
        tone={
          open || showResults
            ? "primary"
            : attemptedThisSession
              ? "success"
              : "default"
        }
        onClick={() => openQuiz()}
      />
    ) : triggerVariant === "icon" ? (
      <button
        type="button"
        onClick={() => openQuiz()}
        title={quizTooltip}
        aria-label={quizTooltip}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
          size === "sm" ? "h-9 w-9" : "h-10 w-10",
          open || showResults
            ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-strong)] ring-2 ring-[var(--primary)]/20"
            : attemptedThisSession
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-white text-foreground hover:border-primary/40 hover:bg-muted/40",
        )}
      >
        <ListChecks
          className={size === "sm" ? "h-4.5 w-4.5" : "h-5 w-5"}
          aria-hidden
        />
      </button>
    ) : triggerVariant === "button-group" ? (
      <Button
        type="button"
        variant="outline"
        onClick={() => openQuiz()}
        className="h-10 gap-2 rounded-none px-4 font-semibold"
      >
        <ListChecks className="h-4 w-4" aria-hidden />
        Quiz
      </Button>
    ) : triggerVariant === "sidebar-link" ? (
      <button
        type="button"
        onClick={() => openQuiz(defaultQuizId)}
        className="flex w-full items-center gap-3 py-0 text-left text-sm text-foreground hover:text-primary"
      >
        <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 flex-1 truncate">{linkLabel}</span>
        <span className="shrink-0 text-[10px] font-semibold uppercase text-muted-foreground">
          Quiz
        </span>
      </button>
    ) : triggerVariant === "section-badge" ? (
      <button
        type="button"
        onClick={() => openQuiz()}
        title={quizTooltip}
        aria-label={quizTooltip}
        className="flex h-5 w-5 items-center justify-center rounded bg-amber-100 text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-200/80"
      >
        <ListChecks className="h-3 w-3" aria-hidden />
      </button>
    ) : (
      <button
        type="button"
        onClick={() => openQuiz()}
        className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--primary)]/25 bg-[var(--primary-soft)] px-4 text-sm font-semibold text-[var(--primary-strong)] transition hover:border-[var(--primary)]/45"
      >
        Take section quiz
      </button>
    );

  const modal =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <button
              type="button"
              className="absolute inset-0 bg-black/45"
              aria-label="Close quiz"
              onClick={() => setOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="section-quiz-title"
              className="relative z-[101] flex max-h-[min(90dvh,900px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]"
            >
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-5 py-3">
              <div>
                <p
                  id="section-quiz-title"
                  className="text-sm font-semibold text-[var(--foreground)]"
                >
                  Section quiz
                </p>
                <p className="text-xs text-muted-foreground">
                  Answer and review instantly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-[var(--surface-muted)]"
                aria-label="Close quiz"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="shrink-0 border-b border-[var(--border)] px-5 py-3">
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
                        : "rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                    }
                  >
                    {q.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {!activeQuiz || !questions.length ? (
                <p className="text-sm text-muted-foreground">
                  No questions configured for this quiz.
                </p>
              ) : !showResults ? (
                <div className="space-y-4">
                  {questions.map((q, index) => {
                    const key = `${activeQuiz.id}:${index}`;
                    return (
                      <QuestionBlock
                        key={key}
                        q={q}
                        index={index}
                        answerKey={key}
                        quizId={activeQuiz.id}
                        value={answers[key] ?? ""}
                        onChange={(v) =>
                          setAnswers((prev) => ({ ...prev, [key]: v }))
                        }
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      Quiz results
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {!hasAnswerKey
                        ? "This quiz has no configured answer keys, so only your responses were saved."
                        : `Score: ${serverScore ?? 0}% — saved to your achievements.`}
                    </p>
                  </div>
                  {results.graded.map((r, index) => (
                    <div
                      key={`${activeQuiz?.id ?? "quiz"}:${index}`}
                      className="rounded-lg border border-[var(--border)] p-3"
                    >
                      <div className="flex items-start gap-2">
                        {r.isCorrect === true ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        ) : r.isCorrect === false ? (
                          <HelpCircle className="mt-0.5 h-4 w-4 text-amber-600" />
                        ) : (
                          <HelpCircle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="text-sm font-medium text-[var(--foreground)]">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground opacity-60">
                              Q{index + 1}
                            </span>
                            {r.q.type === "free_text" && r.q.badge ? (
                              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                                {r.q.badge}
                              </span>
                            ) : null}
                          </div>
                          {r.q.prompt}
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        <span className="font-semibold">Your answer:</span>{" "}
                        {r.userAnswer || "No answer"}
                      </p>
                      {r.q.type === "multiple_choice" ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="font-semibold">Result:</span>{" "}
                          {r.isCorrect === true
                            ? "Correct."
                            : r.isCorrect === false
                              ? `Incorrect. Correct option: ${r.q.correctAnswer}`
                              : "Not graded."}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="font-semibold">
                            Expected answer:
                          </span>{" "}
                          {r.q.expectedAnswer ?? "Not configured by mentor"}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-muted-foreground"
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
        </div>,
          document.body,
        )
      : null;

  return (
    <>
      {trigger}
      {modal}
    </>
  );
}

function QuestionBlock({
  q,
  index,
  answerKey,
  quizId,
  value,
  onChange,
}: {
  q: NormalizedQuestion;
  index: number;
  answerKey: string;
  quizId: string;
  value: string;
  onChange: (v: string) => void;
}) {
  if (q.type === "multiple_choice") {
    const displayOptions = seededShuffle(q.allOptions, `${quizId}:${index}`);
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
        <div className="text-sm font-medium text-[var(--foreground)]">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground opacity-60">
              Q{index + 1}
            </span>
          </div>
          {q.prompt}
        </div>
        <fieldset className="mt-3 space-y-2">
          <legend className="sr-only">Choose one answer</legend>
          {displayOptions.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-start gap-2 rounded-md border border-transparent px-1 py-0.5 hover:bg-[var(--surface-muted)]"
            >
              <input
                type="radio"
                className="mt-1"
                name={answerKey}
                checked={value === opt}
                onChange={() => onChange(opt)}
              />
              <span className="text-sm leading-snug">{opt}</span>
            </label>
          ))}
        </fieldset>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="text-sm font-medium text-[var(--foreground)]">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground opacity-60">
            Q{index + 1}
          </span>
          {q.badge ? (
            <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
              {q.badge}
            </span>
          ) : null}
        </div>
        {q.prompt}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm"
        placeholder="Type your answer"
      />
    </div>
  );
}
