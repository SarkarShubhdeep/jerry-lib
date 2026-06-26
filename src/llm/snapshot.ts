import type { CaptureSnapshotInput, SnapshotProgress, SnapshotResult } from '../types.ts'
import type { ChatMessage } from './types.ts'
import { getSnapshotPrompt } from './prompt.ts'
import { buildClient, chatCompletion, requireApiKey, resolveModel } from './internal.ts'

/**
 * Capture a quick context snapshot from ActivityWatch data.
 *
 * Unlike {@link generateReport}, this is a single-phase LLM call optimized for
 * short time windows (15min–2hr). The output includes a "Current Focus" summary,
 * an activity timeline, and a "Gaps & Missing Context" section that identifies
 * things the data suggests but cannot confirm (meetings without transcripts,
 * PR status unknown, etc.).
 *
 * The host must fetch ActivityWatch data for a short time window and call
 * {@link formatActivityContext} before invoking this function. Use
 * {@link validateSnapshotRange} to ensure the time range is within bounds.
 *
 * @param input User prompt, pre-formatted `activityContext`, and `JerryLlmConfig`.
 * @param onProgress Optional callback with `SnapshotPhase` codes.
 * @returns `SnapshotResult` with context summary, model info, and range hours.
 *
 * @example
 * ```ts
 * const range = resolveActivityRange('last 30 minutes', undefined, buckets)
 * validateSnapshotRange(range)
 * const summary = buildActivitySummary(buckets, events, pages, range)
 * const activityContext = formatActivityContext(summary)
 *
 * const result = await captureSnapshot(
 *   { userPrompt: 'last 30 minutes', activityContext, config },
 *   (phase) => console.log(phase),
 * )
 * console.log(result.content)
 * ```
 */
export async function captureSnapshot(
  input: CaptureSnapshotInput,
  onProgress?: SnapshotProgress,
): Promise<SnapshotResult> {
  const provider = input.config.provider ?? 'openai'
  const apiKey = requireApiKey(input.config.apiKey)
  const modelId = resolveModel(input.config.model, provider)
  const client = buildClient(apiKey, provider)

  onProgress?.('analyzing')

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: await getSnapshotPrompt(modelId, input.activityContext),
    },
    {
      role: 'user',
      content: input.userPrompt.trim(),
    },
  ]

  const content = await chatCompletion(client, modelId, messages)

  const rangeMatch = input.activityContext.match(/Span:\s*([\d.]+)h/)
  const rangeHours = rangeMatch ? parseFloat(rangeMatch[1]) : 0

  return {
    content,
    model: modelId,
    rangeHours,
  }
}
