/** Default OpenAI model when the host does not specify one. */
export const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini'

/** Allowlisted OpenAI model IDs accepted by jerry-lib hosts. */
export const OPENAI_MODEL_IDS = [
  'gpt-5.5',
  'gpt-5.5-pro',
  'gpt-5.4',
  'gpt-5.4-mini',
  'gpt-5.4-nano',
  'gpt-5.2',
  'gpt-5-mini',
  'gpt-5-nano',
  'o4-mini',
  'o3-mini',
  'o3',
  'gpt-4.1',
  'gpt-4.1-mini',
  'gpt-4.1-nano',
  'gpt-4o',
  'gpt-4o-mini',
] as const

/** Union of model IDs in {@link OPENAI_MODEL_IDS}. */
export type OpenAiModelId = (typeof OPENAI_MODEL_IDS)[number]

/**
 * Type guard for allowlisted OpenAI model IDs.
 *
 * @param model Model string from host config.
 * @returns `true` when `model` is a known {@link OpenAiModelId}.
 */
export function isAllowedOpenAiModel(model: string): model is OpenAiModelId {
  return (OPENAI_MODEL_IDS as readonly string[]).includes(model)
}

/** Default Gemini model when the host does not specify one. */
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'

/** Allowlisted Gemini model IDs accepted by jerry-lib hosts. */
export const GEMINI_MODEL_IDS = [
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
] as const

/** Union of model IDs in {@link GEMINI_MODEL_IDS}. */
export type GeminiModelId = (typeof GEMINI_MODEL_IDS)[number]

/**
 * Type guard for allowlisted Gemini model IDs.
 *
 * @param model Model string from host config.
 * @returns `true` when `model` is a known {@link GeminiModelId}.
 */
export function isAllowedGeminiModel(model: string): model is GeminiModelId {
  return (GEMINI_MODEL_IDS as readonly string[]).includes(model)
}
