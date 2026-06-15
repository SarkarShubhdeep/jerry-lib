import path from 'node:path'
import { assertEquals, assertStringIncludes } from 'jsr:@std/assert@^1.0.13'
import { clearAssetCache, getPrompt, initAssets } from './index.ts'

const TEST_KEY = 'prompts/test.txt'

Deno.test('getPrompt returns inline default when no asset files exist', async () => {
  const shippedRoot = await Deno.makeTempDir()
  const overrideRoot = await Deno.makeTempDir()

  initAssets({ shippedRoot, overridePath: overrideRoot })
  clearAssetCache()

  const value = await getPrompt(TEST_KEY, 'default')
  assertEquals(value, 'default')

  await Deno.remove(shippedRoot, { recursive: true })
  await Deno.remove(overrideRoot, { recursive: true })
})

Deno.test('getPrompt prefers local override over shipped default and inline default', async () => {
  const shippedRoot = await Deno.makeTempDir()
  const overrideRoot = await Deno.makeTempDir()

  await Deno.mkdir(`${overrideRoot}/prompts`, { recursive: true })
  await Deno.writeTextFile(`${overrideRoot}/prompts/test.txt`, 'override')

  initAssets({ shippedRoot, overridePath: overrideRoot })
  clearAssetCache()

  const value = await getPrompt(TEST_KEY, 'default')
  assertEquals(value, 'override')

  await Deno.remove(shippedRoot, { recursive: true })
  await Deno.remove(overrideRoot, { recursive: true })
})

Deno.test('getPrompt uses shipped default when override is missing', async () => {
  const shippedRoot = await Deno.makeTempDir()
  const overrideRoot = await Deno.makeTempDir()

  await Deno.mkdir(`${shippedRoot}/prompts`, { recursive: true })
  await Deno.writeTextFile(`${shippedRoot}/prompts/test.txt`, 'shipped')

  initAssets({ shippedRoot, overridePath: overrideRoot })
  clearAssetCache()

  const value = await getPrompt(TEST_KEY, 'default')
  assertEquals(value, 'shipped')

  await Deno.remove(shippedRoot, { recursive: true })
  await Deno.remove(overrideRoot, { recursive: true })
})

Deno.test('getPrompt loads package shipped ask.txt from default assets root', async () => {
  initAssets()
  clearAssetCache()

  const value = await getPrompt('prompts/ask.txt', '')
  assertStringIncludes(value, 'You are Jerry, a helpful command-line assistant.')
  assertStringIncludes(value, '{{modelId}}')
})

Deno.test('getPrompt reads shipped assets from non-file URL root (JSR-style)', async () => {
  const assetsRoot = await Deno.makeTempDir()
  await Deno.mkdir(`${assetsRoot}/prompts`, { recursive: true })
  await Deno.writeTextFile(`${assetsRoot}/prompts/test.txt`, 'url-shipped')

  const server = Deno.serve({ hostname: '127.0.0.1', port: 0 }, async (request) => {
    const url = new URL(request.url)
    const relativePath = decodeURIComponent(url.pathname.replace(/^\//, ''))
    try {
      const body = await Deno.readTextFile(path.join(assetsRoot, relativePath))
      return new Response(body, { status: 200 })
    } catch {
      return new Response('not found', { status: 404 })
    }
  })

  const shippedRoot = `http://127.0.0.1:${server.addr.port}/`
  initAssets({ shippedRoot })
  clearAssetCache()

  const value = await getPrompt(TEST_KEY, 'default')
  assertEquals(value, 'url-shipped')

  await server.shutdown()
  await Deno.remove(assetsRoot, { recursive: true })
})
