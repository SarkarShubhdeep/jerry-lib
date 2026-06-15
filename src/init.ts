import { type AssetsInitOptions, initAssets } from './assets/index.ts'

/** Options for {@link initJerryLib}. */
export type JerryLibInitOptions = {
  /** a3t layered filesystem roots. Call once per process before using ask/report. */
  assets?: AssetsInitOptions
}

let initialized = false

/**
 * One-time process setup for a3t prompt loading.
 *
 * Call before `ask` or `generateReport`. When omitted, prompts auto-initialize
 * with shipped defaults on first use — but `overridePath` will not apply unless
 * you call this with `assets` options.
 *
 * @param options Optional asset roots. Pass `assets.overridePath` for user-local prompt overrides.
 *
 * @example CLI host
 * ```ts
 * import { join } from 'node:path'
 * import { homedir } from 'node:os'
 * initJerryLib({ assets: { overridePath: join(homedir(), '.config/jerry/assets') } })
 * ```
 */
export function initJerryLib(options?: JerryLibInitOptions): void {
  if (options?.assets) {
    initAssets(options.assets)
    initialized = true
    return
  }
  if (!initialized) {
    initAssets()
    initialized = true
  }
}
