"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, Sparkles, XCircle } from "lucide-react";

type AttemptQuestion = {
  id: string;
  question: string;
  options: string[] | null;
  correctAnswer: string;
  explanation: string | null;
};

type AttemptPayload = {
  id: string;
  questions: AttemptQuestion[];
};

type GradedReview = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
};

export function AiQuizWorkspace({
  courseId,
  courseTitle,
  completedSectionsCount,
}: {
  courseId: string;
  courseTitle: string;
  completedSectionsCount: number;
}) {
  const [attempt, setAttempt] = useState<AttemptPayload | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [grading, setGrading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; reviews: GradedReview[] } | null>(null);

  const wrong = useMemo(() => result?.reviews.filter((r) => !r.isCorrect) ?? [], [result]);

  async function generate() {
    setError(null);
    setResult(null);
    setAttempt(null);
    setAnswers([]);
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, source: "completed", questionCount: 4 }),
      });
      const body = (await res.json().catch(() => null)) as { error?: string } | AttemptPayload | null;
      if (!res.ok) {
        setError(body && "error" in body ? body.error ?? "Could not generate quiz." : "Could not generate quiz.");
        return;
      }
      const created = body as AttemptPayload;
      setAttempt(created);
      setAnswers(Array(created.questions.length).fill(""));
    } finally {
      setGenerating(false);
    }
  }

  async function submitQuiz() {
    if (!attempt) return;
    setError(null);
    setGrading(true);
    try {
      const res = await fetch("/api/ai/quiz/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: attempt.id, answers }),
      });
      const body = (await res.json().catch(() => null)) as
        | { error?: string; score?: number; reviews?: GradedReview[] }
        | null;
      if (!res.ok) {
        setError(body?.error ?? "Could not grade quiz.");
        return;
      }
      setResult({
        score: body?.score ?? 0,
        reviews: body?.reviews ?? [],
      });
    } finally {
      setGrading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-muted)] p-6 shadow-[var(--shadow-md)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">Adaptive assessment</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-[var(--foreground)]">AI quiz for {courseTitle}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Generates questions from sections you have completed, then compares your answers against the best-fit
          answers with explanations.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-[var(--muted)]">
          <span className="rounded-full border border-[var(--border)] px-2.5 py-1">
            Completed sections: {completedSectionsCount}
          </span>
          <span className="rounded-full border border-[var(--border)] px-2.5 py-1">Format: 4 MCQs</span>
        </div>
        <button
          type="button"
          onClick={() => void generate()}
          disabled={generating || completedSectionsCount === 0}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate personalized quiz
        </button>
        {completedSectionsCount === 0 ? (
          <p className="mt-2 text-xs text-amber-700">Complete at least one lesson first.</p>
        ) : null}
        {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
      </div>

      {attempt ? (
        <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Quiz questions</h2>
            <span className="text-xs text-[var(--muted)]">{attempt.questions.length} questions</span>
          </div>
          {attempt.questions.map((q, i) => (
            <div key={q.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 shadow-[var(--shadow-sm)]">
              <p className="text-sm font-medium text-[var(--foreground)]">
                Q{i + 1}. {q.question}
              </p>
              <div className="mt-3 grid gap-2">
                {(Array.isArray(q.options) && q.options.length ? q.options : []).map((option, idx) => (
                  <label
                    key={`${q.id}-${idx}`}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm transition hover:border-[var(--primary)]/35 hover:bg-[var(--surface)]"
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={option}
                      checked={answers[i] === option}
                      onChange={(e) =>
                        setAnswers((prev) => {
                          const next = [...prev];
                          next[i] = e.target.value;
                          return next;
                        })
                      }
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void submitQuiz()}
              disabled={grading}
              className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]"
            >
              {grading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit answers
            </button>
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">Performance</p>
            <p className="mt-1 text-3xl font-bold text-[var(--foreground)]">{Math.round(result.score)}%</p>
            <p className="text-sm text-[var(--muted)]">
              Correct: {result.reviews.filter((r) => r.isCorrect).length} / {result.reviews.length}
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Missed vs correct answers</h3>
            {wrong.length === 0 ? (
              <p className="mt-2 text-sm text-emerald-700">Excellent — all answers are correct.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {wrong.map((r, idx) => (
                  <li key={`${r.question}-${idx}`} className="rounded-md border border-rose-200 bg-rose-50 p-3">
                    <div className="flex items-start gap-2">
                      <XCircle className="mt-0.5 h-4 w-4 text-rose-700" />
                      <p className="text-sm font-medium text-rose-900">{r.question}</p>
                    </div>
                    <p className="mt-2 text-xs text-rose-900">
                      <span className="font-semibold">Your answer:</span> {r.userAnswer || "No answer"}
                    </p>
                    <p className="mt-1 text-xs text-emerald-900">
                      <span className="font-semibold">Correct:</span> {r.correctAnswer}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{r.explanation}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Full review</h3>
            <ul className="mt-3 space-y-2">
              {result.reviews.map((r, i) => (
                <li key={`${r.question}-${i}`} className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-3">
                  <div className="flex items-start gap-2">
                    {r.isCorrect ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 text-rose-600" />
                    )}
                    <p className="text-sm font-medium text-[var(--foreground)]">{r.question}</p>
                  </div>
                  <p className="mt-2 text-xs text-[var(--muted)]">Your answer: {r.userAnswer || "No answer"}</p>
                  <p className="text-xs text-[var(--muted)]">Correct answer: {r.correctAnswer}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
