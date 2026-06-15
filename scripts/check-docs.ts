/**
 * Verify README links to GitHub docs and key doc files exist.
 * Run: deno task check:docs
 */
const readme = await Deno.readTextFile(new URL('../README.md', import.meta.url))

const requiredDocs = [
  'docs/README.md',
  'docs/host-integration.md',
  'docs/a3t-prompts.md',
  'docs/agents-and-ides.md',
]

for (const doc of requiredDocs) {
  try {
    await Deno.stat(new URL(`../${doc}`, import.meta.url))
  } catch {
    console.error(`Missing required doc: ${doc}`)
    Deno.exit(1)
  }
}

const readmeLinks = [
  'docs/host-integration.md',
  'docs/a3t-prompts.md',
  'docs/agents-and-ides.md',
  'jsr.io/@sarkarshubhdeep/jerry-lib/doc',
]

let failed = false
for (const link of readmeLinks) {
  if (!readme.includes(link)) {
    console.error(`README.md missing link/reference to: ${link}`)
    failed = true
  }
}

const integrationSteps = [
  'initJerryLib',
  'resolveActivityRange',
  'buildActivitySummary',
  'formatActivityContext',
  'generateReport',
]

for (const step of integrationSteps) {
  if (!readme.includes(step)) {
    console.error(`README.md missing integration step: ${step}`)
    failed = true
  }
}

if (failed) {
  Deno.exit(1)
}

console.log('check:docs OK — README links and doc files verified')
