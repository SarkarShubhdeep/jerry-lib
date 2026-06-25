import OpenAI from 'openai'
import type { ChatMessage } from './types.ts'
import type { LlmProvider } from '../types.ts'
import {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_OPENAI_MODEL,
  isAllowedGeminiModel,
  isAllowedOpenAiModel,
} from './models.ts'

export const API_KEY_ERROR = 'API key is not configured'

/** Google's OpenAI-compatible endpoint base URL. */
export const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/'

/**
 * Resolve the model ID, falling back to provider-specific default if unrecognized.
 *
 * @param model Model string from host config.
 * @param provider LLM provider (defaults to `'openai'`).
 * @returns Valid model ID for the provider.
 */
export function resolveModel(model: string, provider: LlmProvider = 'openai'): string {
  if (provider === 'gemini') {
    return isAllowedGeminiModel(model) ? model : DEFAULT_GEMINI_MODEL
  }
  return isAllowedOpenAiModel(model) ? model : DEFAULT_OPENAI_MODEL
}

export function requireApiKey(apiKey: string): string {
  const trimmed = apiKey.trim()
  if (!trimmed) {
    throw new Error(API_KEY_ERROR)
  }
  return trimmed
}

/**
 * Build an OpenAI SDK client for the specified provider.
 *
 * For Gemini, uses Google's OpenAI-compatible endpoint.
 *
 * @param apiKey Validated API key.
 * @param provider LLM provider (defaults to `'openai'`).
 * @returns Configured OpenAI client instance.
 */
export function buildClient(apiKey: string, provider: LlmProvider = 'openai'): OpenAI {
  if (provider === 'gemini') {
    return new OpenAI({ apiKey, baseURL: GEMINI_BASE_URL })
  }
  return new OpenAI({ apiKey })
}

export async function chatCompletion(
  client: OpenAI,
  modelId: string,
  messages: ChatMessage[],
): Promise<string> {
  const completion = await client.chat.completions.create({
    model: modelId,
    messages,
    stream: false,
  })
  const content = completion.choices[0]?.message?.content?.trim()
  if (!content) {
    throw new Error('No response from the model')
  }
  return content
}
