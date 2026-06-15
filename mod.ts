/**
 * jerry-lib — host-agnostic Jerry engine (LLM + ActivityWatch formatting + a3t prompts).
 *
 * No CLI, no stdout, no Cliffy. Hosts (jerry-cli, Electron, web backend) supply
 * I/O boundaries: config loading, ActivityWatch HTTP fetches, and user-facing output.
 *
 * @example Install and initialize
 * ```ts
 * import { initJerryLib, generateReport, type JerryLlmConfig } from '@sarkarshubhdeep/jerry-lib'
 *
 * initJerryLib({ assets: { overridePath: '/path/to/overrides' } })
 *
 * const config: JerryLlmConfig = { apiKey: 'sk-...', model: 'gpt-4o-mini' }
 * const result = await generateReport(
 *   { userPrompt: 'yesterday', activityContext: '...', config },
 *   (phase) => console.log(phase),
 * )
 * ```
 *
 * @example ActivityWatch pipeline (host fetches HTTP)
 * ```ts
 * import {
 *   resolveActivityRange,
 *   buildActivitySummary,
 *   formatActivityContext,
 * } from '@sarkarshubhdeep/jerry-lib'
 *
 * const range = resolveActivityRange('yesterday', undefined, buckets)
 * const summary = buildActivitySummary(buckets, eventsByBucket, pagesByBucket, range)
 * const activityContext = formatActivityContext(summary)
 * ```
 *
 * Deep guides: https://github.com/SarkarShubhdeep/jerry-lib/tree/main/docs
 *
 * @module
 */

// --- Init ---
export { initJerryLib, type JerryLibInitOptions } from './src/init.ts'

// --- LLM ---
export { ask } from './src/llm/ask.ts'
export { generateReport, recheckReport } from './src/llm/report.ts'

// --- ActivityWatch ---
export {
  aggregateMeetingSessions,
  aggregateTopActivities,
  aggregateTopWebLinks,
  isWorkRelatedUrl,
  mergeTopActivities,
} from './src/aw/aggregate.ts'
export {
  buildActivitySummary,
  type BuildActivitySummaryOptions,
  pickBucket,
  watcherFromBucketId,
} from './src/aw/build-summary.ts'
export { filterEventsInRange } from './src/aw/event-range.ts'
export { formatActivityContext } from './src/aw/format.ts'
export {
  type ActivityTimeRange,
  formatActivityWindowLog,
  mentionsFullHistory,
  mentionsYesterday,
  resolveActivityRange,
  resolveRangeHours,
} from './src/aw/intent.ts'

// --- Assets (advanced; prefer initJerryLib for prompt setup) ---
export {
  type AssetsInitOptions,
  clearAssetCache,
  getPrompt,
  initAssets,
} from './src/assets/index.ts'

// --- Models ---
export {
  DEFAULT_OPENAI_MODEL,
  isAllowedOpenAiModel,
  OPENAI_MODEL_IDS,
  type OpenAiModelId,
} from './src/llm/models.ts'

// --- Types ---
export type {
  GenerateReportInput,
  JerryLlmConfig,
  RecheckReportInput,
  ReportPhase,
  ReportProgress,
  ReportResult,
} from './src/types.ts'

export type { ChatMessage, ChatResponse, ChatRole, LlmApiPath } from './src/llm/types.ts'
export type { LlmStatusCallback, LlmStatusPhase, LlmStatusUpdate } from './src/llm/status.ts'
export type {
  AwActivityError,
  AwActivityResult,
  AwActivitySummary,
  Bucket,
  LatestWatcherEvent,
  MeetingPlatform,
  MeetingSession,
  RawEvent,
  TopActivity,
  WatcherKind,
  WebLinkActivity,
} from './src/aw/types.ts'
