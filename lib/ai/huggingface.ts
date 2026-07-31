import type { InferenceProvider } from "@huggingface/inference";
import { InferenceClient } from "@huggingface/inference";
import {
  AiConfigurationError,
  AiProviderError,
} from "@/lib/ai/huggingface-errors";

const token = process.env.HUGGINGFACE_API_KEY;
const provider = (process.env.HUGGINGFACE_INFERENCE_PROVIDER ??
  "auto") as InferenceProvider;
const model = process.env.HUGGINGFACE_QUIZ_MODEL ?? "Qwen/Qwen2.5-7B-Instruct";

function aiLog(action: string, data: unknown) {
  const timestamp = new Date().toISOString();
  console.log(`[AI-LOG][${timestamp}] ${action}:`, JSON.stringify(data, null, 2));
}

const client = token ? new InferenceClient(token) : null;

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

type ChatTurn = { role: "user" | "assistant"; content: string };

const MAX_CONTEXT_CHARS = 12000;

function cleanText(input: string) {
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function truncateContext(input: string) {
  const cleaned = cleanText(input);
  if (cleaned.length <= MAX_CONTEXT_CHARS) return cleaned;
  return `${cleaned.slice(0, MAX_CONTEXT_CHARS)} ...`;
}

function extractJsonArray(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "[]";
  if (trimmed.startsWith("[")) return trimmed;
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }
  return "[]";
}

/** Reject letter-only options like "A"/"B" — answers must be full text. */
function isLetterOnlyOption(option: string) {
  return /^[A-Da-d]$/.test(option.trim());
}

function isQuizQuestion(value: unknown): value is QuizQuestion {
  if (!value || typeof value !== "object") return false;
  const q = value as {
    question?: unknown;
    options?: unknown;
    answer?: unknown;
    explanation?: unknown;
  };
  if (
    typeof q.question !== "string" ||
    !Array.isArray(q.options) ||
    q.options.length < 2 ||
    !q.options.every((o) => typeof o === "string") ||
    typeof q.answer !== "string" ||
    typeof q.explanation !== "string"
  ) {
    return false;
  }
  const options = q.options.map((o) => (o as string).trim()).filter(Boolean);
  if (options.length < 2) return false;
  if (options.some(isLetterOnlyOption)) return false;
  const answer = q.answer.trim();
  if (!answer || isLetterOnlyOption(answer)) return false;
  if (!options.includes(answer)) return false;
  return true;
}

function normalizeQuizQuestion(q: QuizQuestion): QuizQuestion {
  const options = q.options.map((o) => o.trim()).filter(Boolean);
  return {
    question: q.question.trim(),
    options,
    answer: q.answer.trim(),
    explanation: q.explanation.trim(),
  };
}

function assertAiClient() {
  if (!token || !client) {
    aiLog("AI_DISABLED", { reason: "HUGGINGFACE_API_KEY is missing" });
    throw new AiConfigurationError();
  }
  return client;
}

function sanitizeProviderError(err: unknown): string {
  if (err instanceof Error && err.message) {
    const msg = err.message.slice(0, 200);
    if (/unauthorized|invalid.*token|api key/i.test(msg)) {
      return "AI service authentication failed. Check HUGGINGFACE_API_KEY.";
    }
    if (/rate limit|429/i.test(msg)) {
      return "AI service is rate-limited. Please wait a moment and try again.";
    }
    if (/model.*not found|404|no inference provider/i.test(msg)) {
      return "Configured AI model is unavailable. Contact support.";
    }
  }
  return "AI service is temporarily unavailable. Please try again.";
}

export async function generateSectionQuiz(
  sectionContext: string,
  questionCount = 5,
) {
  const safeCount = Math.max(3, Math.min(12, questionCount));
  const safeContext = truncateContext(sectionContext);
  if (!safeContext.trim()) {
    throw new AiProviderError("No course content available for quiz generation.");
  }

  const inference = assertAiClient();

  const prompt = `
[SYSTEM]
You are a Pharmacy School Professor. Generate challenging multiple-choice questions (MCQs) strictly from the teaching content below.

[INSTRUCTIONS]
1. Generate ${safeCount} unique MCQs about pharmacy and course subject matter.
2. Each question must test understanding of concepts in the lesson/resource text — not filenames, uploads, LMS mechanics, or metadata.
3. Never ask about file names, resource titles as labels, section order, or platform details.
4. Provide exactly 4 distinct options per question. Each option MUST be the full answer text (a phrase or sentence), NEVER a single letter like A/B/C/D.
5. The "answer" field MUST be an exact copy of one of the option strings (full text), not a letter label.
6. Return ONLY a valid JSON array. No markdown fences or commentary.

[FORMAT]
[
  {
    "question": "Which organ is the primary site of first-pass metabolism for many oral drugs?",
    "options": [
      "Liver",
      "Kidney",
      "Small intestine lumen only",
      "Lungs"
    ],
    "answer": "Liver",
    "explanation": "Hepatic first-pass metabolism reduces bioavailability of many oral drugs."
  }
]

[LESSON CONTENT]
${safeContext}
`;

  aiLog("QUIZ_GEN_START", {
    questionCount: safeCount,
    contextLength: safeContext.length,
  });

  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await inference.chatCompletion({
        provider,
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: attempt === 0 ? 0.7 : 0.4,
        max_tokens: 1800,
      });

      const raw = response.choices?.[0]?.message?.content ?? "[]";
      const jsonStr = extractJsonArray(raw);
      const parsed = JSON.parse(jsonStr) as unknown;

      if (!Array.isArray(parsed)) {
        throw new AiProviderError("AI returned invalid quiz format.");
      }

      const valid = parsed
        .filter(isQuizQuestion)
        .map(normalizeQuizQuestion)
        .slice(0, safeCount);
      if (valid.length >= 2) {
        aiLog("QUIZ_GEN_SUCCESS", { validCount: valid.length, attempt });
        return valid;
      }

      lastError = new AiProviderError("AI returned too few valid questions.");
    } catch (err) {
      lastError = err;
      aiLog("QUIZ_GEN_ATTEMPT_FAILED", { attempt, error: String(err) });
    }
  }

  if (lastError instanceof AiConfigurationError) throw lastError;
  if (lastError instanceof AiProviderError) throw lastError;
  throw new AiProviderError(sanitizeProviderError(lastError));
}

export async function chatWithCourseContext(
  sectionContext: string,
  message: string,
  history: ChatTurn[] = [],
) {
  const safeContext = truncateContext(sectionContext);
  const safeMessage = message.trim().slice(0, 1500);
  const safeHistory = history
    .slice(-10)
    .map((t) => ({ role: t.role, content: t.content.trim().slice(0, 1000) }))
    .filter((t) => t.content.length > 0);

  if (!safeMessage) {
    return "Please share a question about the course and I will help.";
  }

  if (!safeContext.trim()) {
    throw new AiProviderError("No course content available for this assistant.");
  }

  const inference = assertAiClient();
  aiLog("CHAT_START", { message: safeMessage, historyLength: safeHistory.length });

  try {
    const response = await inference.chatCompletion({
      provider,
      model,
      temperature: 0.5,
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content:
            "You are a professional Pharmacy Education Assistant. Answer using only the provided course teaching content. Focus on pharmacy and subject-matter concepts. Never ask about or emphasize filenames, upload metadata, or LMS mechanics. If the answer is not in the context, say so clearly.",
        },
        {
          role: "system",
          content: `COURSE CONTEXT:\n---\n${safeContext}\n---`,
        },
        ...safeHistory.map((t) => ({ role: t.role, content: t.content })),
        { role: "user", content: safeMessage },
      ],
    });

    const reply = response.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      throw new AiProviderError("AI returned an empty response.");
    }

    aiLog("CHAT_SUCCESS", { replyLength: reply.length });
    return reply;
  } catch (err) {
    aiLog("CHAT_FAILURE", { error: String(err) });
    if (err instanceof AiConfigurationError || err instanceof AiProviderError) {
      throw err;
    }
    throw new AiProviderError(sanitizeProviderError(err));
  }
}

export function gradeQuiz(questions: QuizQuestion[], answers: string[]) {
  const reviews = questions.map((question, index) => {
    const userAnswer = answers[index] ?? "";
    const isCorrect =
      userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase();
    return {
      question: question.question,
      userAnswer,
      correctAnswer: question.answer,
      explanation: question.explanation,
      isCorrect,
    };
  });

  const score = reviews.length
    ? (reviews.filter((review) => review.isCorrect).length / reviews.length) *
      100
    : 0;

  return { score, reviews };
}
