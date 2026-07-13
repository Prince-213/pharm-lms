import { InferenceClient } from "@huggingface/inference";
import {
  AiConfigurationError,
  AiProviderError,
} from "@/lib/ai/huggingface-errors";

const token = process.env.HUGGINGFACE_API_KEY;
const model =
  process.env.HUGGINGFACE_QUIZ_MODEL ?? "mistralai/Mistral-7B-Instruct-v0.2";

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

function isQuizQuestion(value: unknown): value is QuizQuestion {
  if (!value || typeof value !== "object") return false;
  const q = value as {
    question?: unknown;
    options?: unknown;
    answer?: unknown;
    explanation?: unknown;
  };
  return (
    typeof q.question === "string" &&
    Array.isArray(q.options) &&
    q.options.length >= 2 &&
    q.options.every((o) => typeof o === "string") &&
    typeof q.answer === "string" &&
    typeof q.explanation === "string"
  );
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
    if (/model.*not found|404/i.test(msg)) {
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
You are a Pharmacy School Professor. Generate challenging multiple-choice questions (MCQs) strictly from the lesson content.

[INSTRUCTIONS]
1. Generate ${safeCount} unique MCQs.
2. Each question must reference specific concepts from the text.
3. Provide 4 distinct options per question.
4. Return ONLY a valid JSON array. No markdown fences or commentary.

[FORMAT]
[
  {
    "question": "Question text?",
    "options": ["A", "B", "C", "D"],
    "answer": "A",
    "explanation": "Why A is correct."
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

      const valid = parsed.filter(isQuizQuestion).slice(0, safeCount);
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
      model,
      temperature: 0.5,
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content:
            "You are a professional Pharmacy Education Assistant. Answer using only the provided course context. If the answer is not in the context, say so clearly.",
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
