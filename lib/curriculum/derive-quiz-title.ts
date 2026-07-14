/** Quiz title from the first question prompt (DB requires a title field). */
export function deriveQuizTitle(
  questions: { prompt: string }[],
  fallback = "Section quiz",
): string {
  const prompt = questions[0]?.prompt?.trim();
  if (!prompt) return fallback;
  if (prompt.length <= 140) return prompt;
  return `${prompt.slice(0, 137)}…`;
}
