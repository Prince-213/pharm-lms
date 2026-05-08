import { InferenceClient } from "@huggingface/inference";

const token = process.env.HUGGINGFACE_API_KEY;
const model =
  process.env.HUGGINGFACE_QUIZ_MODEL ?? "mistralai/Mistral-7B-Instruct-v0.2"; // Better model for instruction following

// Logging helper
function aiLog(action: string, data: any) {
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

function fallbackQuiz(
  sectionContext: string,
  questionCount: number,
): QuizQuestion[] {
  const sentences = truncateContext(sectionContext)
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 50 && s.length < 300)
    .slice(0, Math.max(questionCount * 2, 10));

  const base = sentences.length
    ? sentences
    : [
        "In pharmaceutical clinical trials, data integrity and validation are paramount for regulatory success.",
        "Pharmacovigilance involves monitoring the effects of medicines after they have been licensed for use.",
        "Drug stability testing ensures that the pharmaceutical product remains within specifications throughout its shelf life.",
      ];

  const shuffled = [...base].sort(() => Math.random() - 0.5);

  return Array.from({ length: questionCount }).map((_, i) => {
    const raw = shuffled[i % shuffled.length];
    // Attempt a slightly dynamic question from the sentence
    const question = raw.endsWith("?") 
      ? `Considering the following: "${raw}", what is the primary takeaway?`
      : `Based on the context: "${raw.slice(0, 80)}...", which interpretation is most accurate?`;

    return {
      question,
      options: [
        raw,
        "It is secondary to speed of market entry.",
        "Only applies during the initial chemical formulation phase.",
        "Can be ignored if the sample size is sufficiently large.",
      ].sort(() => Math.random() - 0.5),
      answer: raw,
      explanation:
        "This option directly reflects the core factual content found in the course materials.",
    };
  });
}

function parseContextHighlights(rawContext: string) {
  const source = rawContext.replace(/\r/g, " ");
  const sectionMatches = [...source.matchAll(/Section:\s*(.+?)(?=\s+Lesson:|\s+Section:|$)/gi)];
  const lessonMatches = [...source.matchAll(/Lesson:\s*(.+?)(?=\s+Section:|$)/gi)];

  const sections = sectionMatches
    .map((m) => m[1]?.trim())
    .filter(Boolean)
    .map((s) => s.slice(0, 80));
  const lessons = lessonMatches
    .map((m) => m[1]?.trim())
    .filter(Boolean)
    .map((l) => l.slice(0, 100));

  return {
    sections: [...new Set(sections)].slice(0, 4),
    lessons: [...new Set(lessons)].slice(0, 6),
  };
}

function fallbackChatReply(context: string, message: string) {
  const safeMessage = message.trim();
  const safeContext = truncateContext(context);
  const { sections: uniqueSections, lessons: uniqueLessons } = parseContextHighlights(context);

  const preview = safeContext.slice(0, 280);

  const lowerQuestion = safeMessage.toLowerCase();
  const asksCourseOverview =
    /\b(what|about|summary|overview|course)\b/.test(lowerQuestion) &&
    /\b(course|this|cover|about)\b/.test(lowerQuestion);

  if (asksCourseOverview) {
    const sectionLine = uniqueSections.length
      ? `It mainly covers: ${uniqueSections.join(", ")}.`
      : "It focuses on clinical data quality, validation, and compliance practices.";
    const lessonLine = uniqueLessons.length
      ? `You have already touched lessons like: ${uniqueLessons.slice(0, 3).join("; ")}.`
      : "As you complete more lessons, I can give a deeper personalized summary.";
    return `This course is about building reliable, audit-ready clinical data workflows in pharmaceutical settings.\n\n${sectionLine}\n${lessonLine}\n\nIf you want, I can also break it down into: (1) key concepts, (2) practical workflow, and (3) likely exam-style questions.`;
  }

  const firstSection = uniqueSections[0] ?? "your completed section";
  const firstLesson = uniqueLessons[0] ?? "the latest lesson";
  return `I am having trouble reaching the live AI provider right now, but I can still help from your completed course context.\n\nFrom ${firstSection} (${firstLesson}), the key idea is to apply structured validation checks, document decisions clearly, and maintain compliance-ready evidence.\n\nContext snapshot: ${preview}...\n\nAsk me something specific (for example: \"give me 3 key takeaways\" or \"test me with 2 questions\") and I will tailor it.`;
}

export async function generateSectionQuiz(
  sectionContext: string,
  questionCount = 5,
) {
  const safeCount = Math.max(3, Math.min(12, questionCount));
  const safeContext = truncateContext(sectionContext);

  if (!token) {
    aiLog("QUIZ_GEN_DISABLED", { reason: "HUGGINGFACE_API_KEY is missing" });
    return fallbackQuiz(safeContext, safeCount);
  }
  if (!client) {
    aiLog("QUIZ_GEN_DISABLED", { reason: "InferenceClient initialization failed" });
    return fallbackQuiz(safeContext, safeCount);
  }

  const prompt = `
[SYSTEM]
You are a Pharmacy School Professor. Your task is to generate challenging and diverse multiple-choice questions (MCQs) for your students based strictly on the provided lesson content.

[INSTRUCTIONS]
1. Generate ${safeCount} unique MCQs. 
2. Each question must be specific to the concepts in the text.
3. Avoid generic phrasing like "key concept 1". Use actual terms from the text.
4. Provide 4 distinct options for each question.
5. Identify the correct answer (full string matching one of the options).
6. Provide a concise pedagogical explanation.
7. Return ONLY a valid JSON array of objects. Do not include any conversational text.

[FORMAT]
[
  { 
    "question": "Specific question text using course terms?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A",
    "explanation": "Brief reasoning why A is correct."
  }
]

[LESSON CONTENT]
${safeContext}
`;

  aiLog("QUIZ_GEN_START", { questionCount: safeCount, contextLength: safeContext.length });

  try {
    const response = await client.chatCompletion({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const raw = response.choices?.[0]?.message?.content ?? "[]";
    aiLog("QUIZ_GEN_RAW_RESPONSE", { rawLength: raw.length, preview: raw.slice(0, 100) });

    const jsonStr = extractJsonArray(raw);
    const parsed = JSON.parse(jsonStr) as unknown;

    if (!Array.isArray(parsed)) {
      aiLog("QUIZ_GEN_ERROR", { error: "AI returned non-array JSON", raw });
      return fallbackQuiz(safeContext, safeCount);
    }

    const valid = parsed.filter(isQuizQuestion).slice(0, safeCount);
    aiLog("QUIZ_GEN_SUCCESS", { validCount: valid.length });
    
    if (valid.length >= 2) return valid;
    
    return fallbackQuiz(safeContext, safeCount);
  } catch (err: any) {
    aiLog("QUIZ_GEN_CRITICAL_FAILURE", { error: err?.message || err });
    return fallbackQuiz(safeContext, safeCount);
  }
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

  aiLog("CHAT_START", { message: safeMessage, historyLength: safeHistory.length });

  if (!token || !client) {
    aiLog("CHAT_DISABLED", { reason: "HuggingFace client not configured" });
    return fallbackChatReply(sectionContext, safeMessage);
  }

  try {
    const response = await client.chatCompletion({
      model,
      temperature: 0.5,
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content:
            "You are a professional Pharmacy Education Assistant. Your primary goal is to help students understand the provided lesson context. Be precise, educational, and encouraging. Cite specific parts of the context when possible. If the context doesn't contain the answer, say you don't know based on the current material and encourage them to check other parts of the course.",
        },
        {
          role: "system",
          content: `HERE IS THE LESSON CONTEXT YOU MUST USE:\n---\n${safeContext}\n---`,
        },
        ...safeHistory.map((t) => ({ role: t.role, content: t.content })),
        { role: "user", content: safeMessage },
      ],
    });

    const reply = response.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      aiLog("CHAT_ERROR", { error: "AI returned empty response" });
      return fallbackChatReply(sectionContext, safeMessage);
    }
    
    aiLog("CHAT_SUCCESS", { replyLength: reply.length });
    return reply;
  } catch (err: any) {
    aiLog("CHAT_CRITICAL_FAILURE", { error: err?.message || err });
    return fallbackChatReply(sectionContext, safeMessage);
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
