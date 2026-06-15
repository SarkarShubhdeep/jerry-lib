import type { ChatResponse } from './llm/types.ts'

/**
 * LLM credentials and model selection.
 *
 * Supplied by the host application — jerry-lib never reads environment variables.
 */
export type JerryLlmConfig = {
  /** OpenAI API key. */
  apiKey: string
  /** OpenAI model ID (see {@link OPENAI_MODEL_IDS}). */
  model: string
}

/** Progress phase emitted during {@link generateReport}. */
export type ReportPhase = 'writing' | 'rechecking'

/** Callback invoked with {@link ReportPhase} codes during report generation. */
export type ReportProgress = (phase: ReportPhase) => void

/**
 * Input for {@link generateReport}.
 *
 * The host must fetch ActivityWatch data and call {@link formatActivityContext}
 * before invoking the report pipeline.
 */
export type GenerateReportInput = {
  /** Natural-language user request (also used for time-range parsing in hosts). */
  userPrompt: string
  /** Pre-formatted ActivityWatch markdown from {@link formatActivityContext}. */
  activityContext: string
  /** LLM credentials from the host. */
  config: JerryLlmConfig
}

/** Input for {@link recheckReport} — refines a draft against AW context. */
export type RecheckReportInput = {
  /** Original user request. */
  userPrompt: string
  /** Formatted ActivityWatch context. */
  activityContext: string
  /** Draft narrative to review. */
  draft: string
  /** LLM credentials from the host. */
  config: JerryLlmConfig
}

/** Result of {@link generateReport} — assistant message plus model metadata. */
export type ReportResult = ChatResponse
