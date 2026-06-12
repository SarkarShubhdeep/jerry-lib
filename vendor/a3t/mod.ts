/**
 * Vendored a3t (Universal Asset Loader) for JSR publish compatibility.
 * Source: https://github.com/mieweb/a3t @ 115171ecb6d1dca856295b8e8f2a4346126ef07f
 * Adapted: node:path + node:fs/promises (Deno + Node).
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'

interface A3tContext {
  language?: string
  workspace?: string
  system?: string
  buildHash?: string
  nonce?: number
  [key: string]: unknown
}

let globalContext: A3tContext = { nonce: 1 }
const cache = new Map<string, { found: boolean; value: unknown }>()
let isLoggingEnabled = true

function log(level: string, message: string, data?: Record<string, unknown>): void {
  if (!isLoggingEnabled) return
  console.log(JSON.stringify({ level, time: Date.now(), msg: message, ...data }))
}

function setA3tContext(context: Partial<A3tContext>): void {
  globalContext = { ...globalContext, ...context }
}

function getA3tContext(): A3tContext {
  return { ...globalContext }
}

function getCacheKey(key: string, contextOverride: Partial<A3tContext> = {}): string {
  const context = { ...globalContext, ...contextOverride }
  return JSON.stringify({ key, context })
}

export interface DbBackend {
  findAsset(query: Record<string, unknown>): Promise<string | null>
}

export interface FsBackend {
  readAsset(key: string): Promise<string | null>
  readBinaryAsset(key: string): Promise<Uint8Array | null>
}

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'ENOENT'
  )
}

class NodeFsBackend implements FsBackend {
  constructor(private rootPath: string = './assets') {}

  async readAsset(key: string): Promise<string | null> {
    try {
      const fullPath = path.join(this.rootPath, key)
      const resolvedPath = path.resolve(fullPath)
      const resolvedRoot = path.resolve(this.rootPath)

      if (
        resolvedPath !== resolvedRoot &&
        !resolvedPath.startsWith(resolvedRoot + path.sep)
      ) {
        throw new Error('Path traversal not allowed')
      }

      const content = await readFile(fullPath, { encoding: 'utf8' })
      log('debug', 'Backend node-fs: readAsset', { key, success: true })
      return content
    } catch (error) {
      if (isNotFoundError(error)) {
        log('debug', 'Backend node-fs: readAsset', { key, success: false })
        return null
      }
      const message = error instanceof Error ? error.message : String(error)
      log('warn', 'Backend node-fs: readAsset', { key, success: false, error: message })
      return null
    }
  }

  async readBinaryAsset(key: string): Promise<Uint8Array | null> {
    try {
      const fullPath = path.join(this.rootPath, key)
      const resolvedPath = path.resolve(fullPath)
      const resolvedRoot = path.resolve(this.rootPath)

      if (
        resolvedPath !== resolvedRoot &&
        !resolvedPath.startsWith(resolvedRoot + path.sep)
      ) {
        throw new Error('Path traversal not allowed')
      }

      const buffer = await readFile(fullPath)
      log('debug', 'Backend node-fs: readBinaryAsset', { key, success: true })
      return new Uint8Array(buffer)
    } catch (error) {
      if (isNotFoundError(error)) {
        log('debug', 'Backend node-fs: readBinaryAsset', { key, success: false })
        return null
      }
      const message = error instanceof Error ? error.message : String(error)
      log('warn', 'Backend node-fs: readBinaryAsset', { key, success: false, error: message })
      return null
    }
  }
}

/** @deprecated Use NodeFsBackend — kept as alias for vendored API compatibility */
const DenoFsBackend = NodeFsBackend

class HttpBackend implements FsBackend {
  constructor(private baseUrl: string) {}

  async readAsset(key: string): Promise<string | null> {
    try {
      const url = new URL(key, this.baseUrl)
      const response = await fetch(url.toString())

      if (!response.ok) {
        log('debug', 'Backend http: readAsset', { key, success: false, status: response.status })
        return null
      }

      const content = await response.text()
      log('debug', 'Backend http: readAsset', { key, success: true })
      return content
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      log('warn', 'Backend http: readAsset', { key, success: false, error: message })
      return null
    }
  }

  async readBinaryAsset(key: string): Promise<Uint8Array | null> {
    try {
      const url = new URL(key, this.baseUrl)
      const response = await fetch(url.toString())

      if (!response.ok) {
        log('debug', 'Backend http: readBinaryAsset', { key, success: false, status: response.status })
        return null
      }

      const buffer = await response.arrayBuffer()
      log('debug', 'Backend http: readBinaryAsset', { key, success: true })
      return new Uint8Array(buffer)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      log('warn', 'Backend http: readBinaryAsset', { key, success: false, error: message })
      return null
    }
  }
}

let dbBackend: DbBackend | null = null
let fsBackend: FsBackend = new NodeFsBackend()

function getDbQueryHierarchy(
  key: string,
  contextOverride: Partial<A3tContext> = {},
): Record<string, unknown>[] {
  const context = { ...globalContext, ...contextOverride }
  const queries: Record<string, unknown>[] = []

  if (context.workspace && context.language) {
    queries.push({ workspace: context.workspace, language: context.language, key })
  }
  if (context.workspace) {
    queries.push({ workspace: context.workspace, key })
  }
  if (context.language) {
    queries.push({ language: context.language, key })
  }
  if (context.system) {
    queries.push({ system: context.system, key })
  }
  queries.push({ key })

  return queries
}

async function queryDatabase(queries: Record<string, unknown>[]): Promise<string | null> {
  if (!dbBackend) return null

  for (const query of queries) {
    try {
      const result = await dbBackend.findAsset(query)
      if (result !== null) {
        return result
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      log('warn', 'Database query error', { query, error: message })
    }
  }

  return null
}

async function resolveAsset(
  key: string,
  defaultValue: unknown = undefined,
  contextOverride: Partial<A3tContext> = {},
  binary = false,
): Promise<unknown> {
  const cacheKey = getCacheKey(key, contextOverride)

  const cached = cache.get(cacheKey)
  if (cached !== undefined) {
    log('debug', 'Cache hit', { key, context: contextOverride })
    return cached.found ? cached.value : defaultValue
  }

  log('debug', 'Cache miss', { key, context: contextOverride })

  try {
    const dbQueries = getDbQueryHierarchy(key, contextOverride)
    const dbResult = await queryDatabase(dbQueries)

    if (dbResult !== null) {
      log('info', 'Asset resolution: database', { key, context: contextOverride, found: true })
      cache.set(cacheKey, { found: true, value: dbResult })
      return dbResult
    }

    const fsResult = binary
      ? await fsBackend.readBinaryAsset(key)
      : await fsBackend.readAsset(key)

    if (fsResult !== null) {
      log('info', 'Asset resolution: filesystem', { key, context: contextOverride, found: true })
      cache.set(cacheKey, { found: true, value: fsResult })
      return fsResult
    }

    if (defaultValue !== undefined) {
      log('info', 'Asset resolution: default', { key, context: contextOverride, found: true })
      cache.set(cacheKey, { found: true, value: defaultValue })
      return defaultValue
    }

    log('info', 'Asset resolution: not_found', { key, context: contextOverride, found: false })
    cache.set(cacheKey, { found: false, value: undefined })
    return undefined
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    log('warn', 'Asset resolution: error', { key, context: contextOverride, error: message })

    if (defaultValue !== undefined) {
      cache.set(cacheKey, { found: true, value: defaultValue })
      return defaultValue
    }

    cache.set(cacheKey, { found: false, value: undefined })
    return undefined
  }
}

export interface A3tConfig {
  db?: {
    backend?: DbBackend
  }
  fs?: {
    rootPath?: string
    httpBaseUrl?: string
    backend?: FsBackend
  }
  context?: Partial<A3tContext>
  logging?: {
    enabled?: boolean
  }
}

function init(config: A3tConfig = {}): void {
  if (config.logging?.enabled === false) {
    isLoggingEnabled = false
  }

  if (config.db?.backend) {
    dbBackend = config.db.backend
  }

  if (config.fs?.backend) {
    fsBackend = config.fs.backend
  } else if (config.fs?.httpBaseUrl) {
    fsBackend = new HttpBackend(config.fs.httpBaseUrl)
  } else if (config.fs?.rootPath) {
    fsBackend = new NodeFsBackend(config.fs.rootPath)
  }

  if (config.context) {
    setA3tContext(config.context)
  }
}

async function getMultiple(
  keys: string[],
  defaults: Record<string, unknown> = {},
  contextOverride: Partial<A3tContext> = {},
): Promise<Record<string, unknown>> {
  const promises = keys.map(async (key) => {
    const value = await resolveAsset(key, defaults[key], contextOverride)
    return [key, value] as [string, unknown]
  })

  const results = await Promise.all(promises)
  return Object.fromEntries(results)
}

function clearCache(): void {
  cache.clear()
}

function incrementNonce(): number {
  const newNonce = (globalContext.nonce ?? 0) + 1
  setA3tContext({ nonce: newNonce })
  clearCache()
  return newNonce
}

const a3t = {
  get: resolveAsset,
  __: resolveAsset,
  getBinary: (key: string, defaultValue?: unknown, contextOverride?: Partial<A3tContext>) =>
    resolveAsset(key, defaultValue, contextOverride, true),
  getMultiple,
  init,
  setContext: setA3tContext,
  getContext: getA3tContext,
  incrementNonce,
  clearCache,
  DenoFsBackend,
  HttpBackend,
}

export default a3t
export { a3t, DenoFsBackend, HttpBackend, NodeFsBackend }
