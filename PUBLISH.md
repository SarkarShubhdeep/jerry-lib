# Publishing to JSR

Package: `@sarkarshubhdeep/jerry-lib`

## One-time setup

1. Sign in at [jsr.io](https://jsr.io) with GitHub
2. Register scope `@sarkarshubhdeep` (linked to your GitHub account)
3. Locally: `deno login` (browser OAuth)
4. Link GitHub repo `SarkarShubhdeep/jerry-lib` in JSR package settings (optional, for provenance)
5. Add `JSR_TOKEN` to GitHub Actions secrets for tag publishes (JSR dashboard → GitHub Actions)

## Manual publish

```bash
deno task test
deno task check
deno publish --dry-run
git tag v0.1.0   # skip if tag exists
deno publish
```

## CI publish

Push a version tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The `publish` job in `.github/workflows/ci.yml` runs `deno publish` when `JSR_TOKEN` is configured.

## Verify

```bash
./scripts/smoke-jsr.sh 0.1.0
```

Or manually:

```bash
deno add jsr:@sarkarshubhdeep/jerry-lib@0.1.0
npx jsr add @sarkarshubhdeep/jerry-lib@0.1.0
```
