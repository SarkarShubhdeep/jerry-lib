# Publishing to JSR

Package: `@sarkarshubhdeep/jerry-lib`

## One-time setup

1. Sign in at [jsr.io](https://jsr.io) with GitHub
2. Register scope `@sarkarshubhdeep` (linked to your GitHub username)
3. Create the package at [jsr.io/new](https://jsr.io/new) if it does not exist yet (`@sarkarshubhdeep/jerry-lib`)
4. Link GitHub repo `SarkarShubhdeep/jerry-lib` in JSR package settings (optional, for provenance)
5. For non–GitHub Actions CI: create an access token in JSR account settings and add `JSR_TOKEN` to GitHub Actions secrets

**Note:** Deno 2.x has no `deno login` command. Running `deno login` tries to execute a file named `login.ts` in the current directory. Authentication happens **during** `deno publish` (browser opens automatically).

## Manual publish

From the repo root:

```bash
cd "/Users/shubhdeepsarkar/Developer/my_project/MIE Team Jerry/jerry-lib"
deno task test
deno task check
deno publish --dry-run
deno publish
```

On first `deno publish`, the CLI prints a URL like `https://jsr.io/auth?code=XXXX-XXXX`. Open it in your browser, sign in to JSR, and click **Allow** to authorize publishing.

Alternative (same browser auth flow):

```bash
npx jsr publish
```

If `v0.1.0` is already tagged and published, bump `version` in `deno.json` before publishing again.

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
