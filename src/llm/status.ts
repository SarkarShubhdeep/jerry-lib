/** Status phase emitted during {@link ask} (no ActivityWatch). */
export type LlmStatusPhase =
  | 'thinking'
  | 'web_search_searching'
  | 'web_search_done'
  | 'finalizing'
  | 'done'

/** Status update passed to {@link LlmStatusCallback}. Hosts map `phase` to UI labels. */
export type LlmStatusUpdate = {
  phase: LlmStatusPhase
  /** Optional; hosts map phase codes to UI copy. */
  label?: string
  /** Elapsed milliseconds for timed phases (e.g. web search). */
  durationMs?: number
}

/** Callback invoked during {@link ask} with {@link LlmStatusUpdate} objects. */
export type LlmStatusCallback = (update: LlmStatusUpdate) => void
