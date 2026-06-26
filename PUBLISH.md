# Publishing to JSR

Package: `@sarkarshubhdeep/jerry-lib`

## Branch strategy

```
feature/* → develop → main
```

| Branch | Purpose | Auto-publish |
|--------|---------|--------------|
| `feature/*` | Individual work | No |
| `develop` | Integration staging (test bench) | No |
| `main` | Stable releases | Yes → JSR |

- Feature branches merge into `develop`
- Test from hosts using local overrides or pre-release versions
- When ready, merge `develop` into `main` to trigger stable release

See [docs/local-development.md](./docs/local-development.md) for the full workflow.

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

## Pre-release testing

Test changes from hosts before merging to `main` by publishing a pre-release version.

### Workflow

1. Work on `develop` branch (or merge a feature branch into it)
2. Bump version to a pre-release tag in `deno.json`:

   ```json
   "version": "0.3.0-alpha.1"
   ```

3. Publish manually:

   ```bash
   deno task test
   npx jsr publish
   ```

4. In host projects, install the pre-release:

   ```bash
   deno add @sarkarshubhdeep/jerry-lib@0.3.0-alpha.1
   ```

5. Test integration
6. Iterate with `-alpha.2`, `-alpha.3`, etc. as needed
7. When ready: bump to stable (`0.3.0`), merge `develop` → `main`, CI auto-publishes

### Version tag conventions

| Tag | Use case |
|-----|----------|
| `-alpha.N` | Early/unstable testing |
| `-beta.N` | Feature-complete testing |
| `-rc.N` | Release candidates |

### Convenience task

```bash
deno task prerelease
```

Reminds you of the steps. Actual version bump is manual in `deno.json`.

## Verify

```bash
./scripts/smoke-jsr.sh 0.1.3
```

Or manually:

```bash
deno add jsr:@sarkarshubhdeep/jerry-lib@0.1.3
npx jsr add @sarkarshubhdeep/jerry-lib@0.1.3
```

## Promoting develop to main

When integration testing passes and you're ready for a stable release:

1. Ensure `develop` is up to date and CI passes
2. Bump `version` in `deno.json` to stable (remove any `-alpha.N` suffix)
3. Update `CHANGELOG.md` with the new version entry
4. Merge `develop` into `main`:

   ```bash
   git checkout main
   git pull origin main
   git merge develop
   git push origin main
   ```

5. CI runs tests and auto-publishes to JSR
6. Verify with `./scripts/smoke-jsr.sh <version>`

## JSR score checklist (package Settings on jsr.io)

After each release:

- **Description** — one-line summary for search
- **Runtime compatibility** — mark Deno and Node.js as Supported
- **Provenance** — appears automatically after a successful CI publish (OIDC)
