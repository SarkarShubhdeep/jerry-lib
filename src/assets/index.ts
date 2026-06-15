import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import a3t, { type FsBackend } from 'a3t'

/** Options for {@link initAssets} and {@link initJerryLib}. */
export type AssetsInitOptions = {
  /** User-local override directory (e.g. `~/.config/jerry/assets`). */
  overridePath?: string
  /** Shipped defaults root; defaults to package `assets/` next to `src/`. */
  shippedRoot?: string
}

let defaultShippedRoot: string | undefined

function resolveDefaultShippedRoot(): string {
  if (defaultShippedRoot !== undefined) return defaultShippedRoot

  const assetsUrl = new URL('../../assets/', import.meta.url)
  defaultShippedRoot = assetsUrl.protocol === 'file:' ? fileURLToPath(assetsUrl) : assetsUrl.href

  return defaultShippedRoot
}

function isUrlRoot(rootPath: string): boolean {
  return rootPath.includes('://')
}

function normalizeUrlRoot(rootPath: string): string {
  return rootPath.endsWith('/') ? rootPath : `${rootPath}/`
}

function isKeyWithinUrlRoot(rootPath: string, key: string): boolean {
  const rootUrl = new URL(normalizeUrlRoot(rootPath))
  const assetUrl = new URL(key, rootUrl)
  const rootPrefix = rootUrl.pathname.endsWith('/') ? rootUrl.pathname : `${rootUrl.pathname}/`
  return assetUrl.pathname === rootUrl.pathname || assetUrl.pathname.startsWith(rootPrefix)
}

function isKeyWithinFileRoot(rootPath: string, key: string): boolean {
  const fullPath = path.join(rootPath, key)
  const resolvedPath = path.resolve(fullPath)
  const resolvedRoot = path.resolve(rootPath)
  return (
    resolvedPath === resolvedRoot ||
    resolvedPath.startsWith(resolvedRoot + path.sep)
  )
}

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'ENOENT'
  )
}

async function readTextFromUrl(url: URL): Promise<string | null> {
  if (url.protocol === 'http:' || url.protocol === 'https:') {
    const response = await fetch(url)
    if (!response.ok) return null
    return await response.text()
  }
  return await Deno.readTextFile(url)
}

async function readBinaryFromUrl(url: URL): Promise<Uint8Array | null> {
  if (url.protocol === 'http:' || url.protocol === 'https:') {
    const response = await fetch(url)
    if (!response.ok) return null
    return new Uint8Array(await response.arrayBuffer())
  }
  return await Deno.readFile(url)
}

async function readTextFromRoot(rootPath: string, key: string): Promise<string | null> {
  try {
    if (isUrlRoot(rootPath)) {
      if (!isKeyWithinUrlRoot(rootPath, key)) return null
      return await readTextFromUrl(new URL(key, normalizeUrlRoot(rootPath)))
    }

    if (!isKeyWithinFileRoot(rootPath, key)) return null
    const fullPath = path.join(rootPath, key)
    return await readFile(fullPath, { encoding: 'utf8' })
  } catch (error) {
    if (isNotFoundError(error)) return null
    if (error instanceof Deno.errors.NotFound) return null
    return null
  }
}

async function readBinaryFromRoot(rootPath: string, key: string): Promise<Uint8Array | null> {
  try {
    if (isUrlRoot(rootPath)) {
      if (!isKeyWithinUrlRoot(rootPath, key)) return null
      return await readBinaryFromUrl(new URL(key, normalizeUrlRoot(rootPath)))
    }

    if (!isKeyWithinFileRoot(rootPath, key)) return null
    const fullPath = path.join(rootPath, key)
    const buffer = await readFile(fullPath)
    return new Uint8Array(buffer)
  } catch (error) {
    if (isNotFoundError(error)) return null
    if (error instanceof Deno.errors.NotFound) return null
    return null
  }
}

class LayeredFsBackend implements FsBackend {
  constructor(
    private overrideRoot: string | undefined,
    private shippedRoot: string,
  ) {}

  async readAsset(key: string): Promise<string | null> {
    if (this.overrideRoot) {
      const override = await readTextFromRoot(this.overrideRoot, key)
      if (override !== null) return override
    }
    return readTextFromRoot(this.shippedRoot, key)
  }

  async readBinaryAsset(key: string): Promise<Uint8Array | null> {
    if (this.overrideRoot) {
      const override = await readBinaryFromRoot(this.overrideRoot, key)
      if (override !== null) return override
    }
    return readBinaryFromRoot(this.shippedRoot, key)
  }
}

let initialized = false

/**
 * Initialize a3t with a layered filesystem backend.
 *
 * Resolution order: local override → shipped defaults → inline fallback in {@link getPrompt}.
 * Prefer {@link initJerryLib} for normal host setup.
 *
 * @param options Optional override and shipped asset roots.
 */
export function initAssets(options?: AssetsInitOptions): void {
  const shippedRoot = options?.shippedRoot ?? resolveDefaultShippedRoot()

  a3t.init({
    fs: {
      backend: new LayeredFsBackend(options?.overridePath, shippedRoot),
    },
    logging: { enabled: false },
  })

  initialized = true
}

function ensureAssetsInitialized(): void {
  if (!initialized) initAssets()
}

/**
 * Load a prompt asset by key with layered resolution.
 *
 * @param key Asset path (e.g. `prompts/report.txt`).
 * @param defaultValue Inline fallback when no override or shipped file exists.
 * @returns Resolved prompt text.
 */
export async function getPrompt(key: string, defaultValue: string): Promise<string> {
  ensureAssetsInitialized()
  const value = await a3t.get(key, defaultValue)
  return typeof value === 'string' ? value : defaultValue
}

/** Clear the in-memory a3t asset cache (e.g. after editing override files in a long-lived process). */
export function clearAssetCache(): void {
  a3t.clearCache()
}
