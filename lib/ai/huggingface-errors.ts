export class AiConfigurationError extends Error {
  constructor(message = "AI assistant is not configured. Ask your admin to set HUGGINGFACE_API_KEY.") {
    super(message);
    this.name = "AiConfigurationError";
  }
}

export class AiProviderError extends Error {
  constructor(message = "AI service is temporarily unavailable. Please try again.") {
    super(message);
    this.name = "AiProviderError";
  }
}
