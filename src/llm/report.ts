import type OpenAI from 'openai'
import type {
  GenerateReportInput,
  RecheckReportInput,
  ReportProgress,
  ReportResult,
} from '../types.ts'
import type { ChatMessage } from './types.ts'
import { getRecheckPrompt, getReportPrompt } from './prompt.ts'
import { buildClient, chatCompletion, requireApiKey, resolveModel } from './internal.ts'

async function writeNarrative(
  client: OpenAI,
  modelId: string,
  activityContext: string,
  userPrompt: string,
  onProgress?: ReportProgress,
): Promise<string> {
  onProgress?.('writing')
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: await getReportPrompt(modelId, activityContext),
    },
    {
      role: 'user',
      content: userPrompt.trim(),
    },
  ]
  return await chatCompletion(client, modelId, messages)
}

/**
 * Review and refine a draft report against ActivityWatch context.
 *
 * @param input Draft report, original user prompt, formatted AW context, and LLM config.
 * @param onProgress Optional callback; emits `rechecking` phase.
 * @returns Refined report markdown.
 */
export async function recheckReport(
  input: RecheckReportInput,
  onProgress?: ReportProgress,
): Promise<string> {
  const provider = input.config.provider ?? 'openai'
  const apiKey = requireApiKey(input.config.apiKey)
  const modelId = resolveModel(input.config.model, provider)
  const client = buildClient(apiKey, provider)

  onProgress?.('rechecking')
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: await getRecheckPrompt(modelId, input.activityContext),
    },
    {
      role: 'user',
      content: [
        `Original request: ${input.userPrompt.trim()}`,
        '\n## Draft report\n',
        input.draft,
      ].join(''),
    },
  ]
  return await chatCompletion(client, modelId, messages)
}

/**
 * Draft and recheck a work narrative from pre-formatted ActivityWatch context.
 *
 * Runs a two-phase pipeline: draft (`writing`), then recheck (`rechecking`).
 * The host must fetch ActivityWatch data and call {@link formatActivityContext}
 * before invoking this function.
 *
 * @param input User prompt, pre-formatted `activityContext`, and `JerryLlmConfig`.
 * @param onProgress Optional callback with `ReportPhase` codes.
 * @returns `ReportResult` with assistant message content.
 *
 * @example
 * ```ts
 * const result = await generateReport(
 *   { userPrompt: 'yesterday', activityContext, config },
 *   (phase) => console.log(phase),
 * )
 * console.log(result.message.content)
 * ```
 */
export async function generateReport(
  input: GenerateReportInput,
  onProgress?: ReportProgress,
): Promise<ReportResult> {
  const provider = input.config.provider ?? 'openai'
  const apiKey = requireApiKey(input.config.apiKey)
  const modelId = resolveModel(input.config.model, provider)
  const client = buildClient(apiKey, provider)

  let content = await writeNarrative(
    client,
    modelId,
    input.activityContext,
    input.userPrompt,
    onProgress,
  )

  content = await recheckReport(
    {
      userPrompt: input.userPrompt,
      activityContext: input.activityContext,
      draft: content,
      config: input.config,
    },
    onProgress,
  )

  return {
    model: modelId,
    api: 'completions',
    message: {
      role: 'assistant',
      content,
      model: modelId,
      api: 'completions',
    },
  }
}
