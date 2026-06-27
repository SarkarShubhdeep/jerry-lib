# Local development guide

How to test jerry-lib changes from consuming hosts (jerry-cli, jerry-client) **before** publishing to JSR.

## Branch workflow

```
feature/foo → develop (test bench) → main (stable releases)
```

| Branch | Purpose | CI | Auto-publish |
|--------|---------|-----|--------------|
| `feature/*` | Individual work, created from `develop` | On PR | No |
| `develop` | Integration staging, receives PRs, runs CI | On push/PR | No |
| `main` | Stable releases only | On push/PR | Yes → JSR |

Feature branches merge into `develop`. When integration testing passes, `develop` merges into `main` to trigger a stable release.

## Option 1: Local path override (daily development)

Point a host project at your local jerry-lib without publishing anything.

### Setup

In the **host project** (e.g., jerry-cli), add an import override to `deno.json`:

```json
{
  "imports": {
    "@sarkarshubhdeep/jerry-lib": "../jerry-lib/mod.ts"
  }
}
```

Or use an absolute file URL:

```json
{
  "imports": {
    "@sarkarshubhdeep/jerry-lib": "file:///Users/you/projects/jerry-lib/mod.ts"
  }
}
```

### Workflow

1. Create a feature branch from `develop` in jerry-lib
2. Make changes and run `deno task test` to verify unit tests pass
3. In the host project, add the local import override
4. Run the host — it now uses your local jerry-lib
5. Iterate: edit jerry-lib → save → re-run host (no publish needed)
6. When satisfied, remove the override from the host
7. Open a PR from your feature branch to `develop`

### Cleanup

Before committing the host, **remove the local override** from `deno.json`. The override should never be committed — it's a development-time convenience only.

## Option 2: Pre-release publish (broader testing)

When you need to test from multiple machines, CI, or share with collaborators.

JSR supports semver pre-release tags: `0.3.0-alpha.1`, `0.3.0-beta.1`, etc.

### Workflow

1. Work on `develop` (or merge a feature branch into develop)
2. Bump `version` in `deno.json` to a pre-release tag:

   ```json
   "version": "0.3.0-alpha.1"
   ```

3. Publish manually from the `develop` branch:

   ```bash
   deno task test
   npx jsr publish
   ```

4. In host projects, install the pre-release:

   ```bash
   deno add @sarkarshubhdeep/jerry-lib@0.3.0-alpha.1
   ```

5. Test across environments
6. Iterate: bump to `-alpha.2`, `-alpha.3`, etc. as needed
7. When satisfied, bump to stable (`0.3.0`), merge `develop` to `main`
8. CI auto-publishes the stable version

### Pre-release version tips

- Use `-alpha.N` for early/unstable testing
- Use `-beta.N` for feature-complete testing
- Use `-rc.N` for release candidates
- Increment the suffix number for each iteration: `-alpha.1` → `-alpha.2`

## When to use which option

| Scenario | Approach |
|----------|----------|
| Quick iteration on a feature | Local path override |
| Testing from jerry-cli on your machine | Local path override |
| Testing from multiple machines | Pre-release publish |
| Sharing with contributors | Pre-release publish |
| Final verification before stable release | Pre-release publish |
| Stable release | Merge `develop` → `main` |

## Checklist before merging to main

- [ ] All unit tests pass (`deno task test`)
- [ ] Typecheck passes (`deno task check`)
- [ ] Tested from at least one host (jerry-cli or jerry-client)
- [ ] Pre-release published and verified (if applicable)
- [ ] `deno.json` version bumped to stable (e.g., `0.3.0`, not `0.3.0-alpha.1`)
- [ ] `CHANGELOG.md` updated with new version entry

## GitHub repository settings

To use `develop` as the default branch for PRs:

1. Go to repository **Settings** → **General**
2. Under **Default branch**, change from `main` to `develop`

This ensures new PRs target `develop` by default. Direct pushes to `main` are discouraged — merge from `develop` only.

## See also

- [PUBLISH.md](../PUBLISH.md) — CI publish workflow and pre-release details
- [host-integration.md](./host-integration.md) — how hosts consume jerry-lib
