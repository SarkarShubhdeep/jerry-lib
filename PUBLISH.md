# Publishing to JSR

Package: `@sarkarshubhdeep/jerry-lib`

## One-time setup

1. Sign in at [jsr.io](https://jsr.io) with GitHub
2. Register scope `@sarkarshubhdeep` (linked to your GitHub username)
3. Create the package at [jsr.io/new](https://jsr.io/new) if it does not exist yet (`@sarkarshubhdeep/jerry-lib`)
4. **Link GitHub repo** `SarkarShubhdeep/jerry-lib` in JSR package **Settings** (required for CI OIDC publish + provenance)

No `JSR_TOKEN` secret is needed when publishing from GitHub Actions — authentication uses OIDC (`id-token: write`).

## CI publish (recommended)

On every push to `main`, CI runs tests then `npx jsr publish`:

1. Bump `version` in [`deno.json`](./deno.json)
2. Update [`CHANGELOG.md`](./CHANGELOG.md)
3. Merge to `main`

The publish job fails if that version is already on JSR (expected when you forget to bump the version).

Workflow: [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)

## Manual publish

From the repo root:

```bash
deno task test
deno task check
deno publish --dry-run
npx jsr publish
```

On first local publish, the CLI opens a browser URL to authorize JSR.

If the current version is already published, bump `version` in `deno.json` first.

## Verify

```bash
./scripts/smoke-jsr.sh 0.1.3
```

Or manually:

```bash
deno add jsr:@sarkarshubhdeep/jerry-lib@0.1.3
npx jsr add @sarkarshubhdeep/jerry-lib@0.1.3
```

## JSR score checklist (package Settings on jsr.io)

After each release:

- **Description** — one-line summary for search
- **Runtime compatibility** — mark Deno and Node.js as Supported
- **Provenance** — appears automatically after a successful CI publish (OIDC)
