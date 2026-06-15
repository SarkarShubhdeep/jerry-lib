/** Role of a chat message in an LLM conversation. */
export type ChatRole = 'user' | 'assistant' | 'system'

/** OpenAI API surface used by jerry-lib report/ask flows. */
export type LlmApiPath = 'completions'

/** A single message in a chat completion request. */
export type ChatMessage = {
  role: ChatRole
  content: string
  model?: string
  api?: LlmApiPath
}

/** Response wrapper returned by {@link generateReport} and similar LLM calls. */
export type ChatResponse = {
  message: ChatMessage
  model: string
  api: LlmApiPath
}
