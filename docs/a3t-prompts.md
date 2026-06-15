# a3t prompt overrides

jerry-lib loads LLM system prompts via [a3t](https://github.com/mieweb/a3t) (Universal Overridable Asset Loader) with a layered filesystem backend. Prompts live as text files instead of hardcoded strings, so you can iterate on wording without rebuilding your host application.

## Asset layout

Shipped defaults ship inside the JSR package:

```
assets/prompts/
  ask.txt       # ask() system prompt
  report.txt    # generateReport() draft prompt
  recheck.txt   # recheckReport() review prompt
```

Source files: [jerry-lib `assets/prompts/`](https://github.com/SarkarShubhdeep/jerry-lib/tree/main/assets/prompts).

## Three-tier resolution

When jerry-lib loads a prompt, a3t resolves in this order:

1. **Local override** — directory passed as `assets.overridePath` in `initJerryLib()`
2. **Shipped default** — bundled in `@sarkarshubhdeep/jerry-lib` on JSR
3. **Inline fallback** — empty string if neither exists (development edge case)

Delete a local override file to revert to the shipped default on the next call.

## Override workflow

Copy a shipped prompt to your override directory, edit it, and rerun — no rebuild required:

```bash
mkdir -p ~/.config/jerry/assets/prompts

curl -o ~/.config/jerry/assets/prompts/report.txt \
  https://raw.githubusercontent.com/SarkarShubhdeep/jerry-lib/main/assets/prompts/report.txt

# edit ~/.config/jerry/assets/prompts/report.txt
# rerun your host app — override applies on next generateReport()
```

Wire the override path in your host:

```ts
import { join } from 'node:path'
import { homedir } from 'node:os'
import { initJerryLib } from '@sarkarshubhdeep/jerry-lib'

initJerryLib({
  assets: { overridePath: join(homedir(), '.config/jerry/assets') },
})
```

### Testing via jerry-cli (no Cliffy knowledge required)

If you use [jerry-cli](https://github.com/SarkarShubhdeep/jerry-client/tree/main/jerry-cli) as a reference adapter:

```bash
# After editing ~/.config/jerry/assets/prompts/report.txt
cd jerry-cli
deno task jerry report yesterday
deno task jerry report today --dry-run   # AW context only, no LLM
```

You do not need to understand Cliffy, Electron IPC, or jerry-lib internals — only the override directory and report command.

## Template variables

Prompts may include placeholders replaced at runtime:

| Variable | Used in | Replaced with |
|----------|---------|---------------|
| `{{modelId}}` | all prompts | OpenAI model ID from `JerryLlmConfig` |
| `{{activityContext}}` | `report.txt`, `recheck.txt` | ActivityWatch data block from `formatActivityContext()` |

Example from `report.txt`:

```text
This request uses the OpenAI API with model ID `{{modelId}}`. When asked what model you are, answer with this exact model ID.
...
{{activityContext}}
```

## Hot reload

Each process invocation starts fresh. Edits to override files apply on the **next** `ask()` or `generateReport()` call — no daemon restart, no rebuild, no cache clear needed.

To force a reload within a long-lived process, call `clearAssetCache()` (advanced; most hosts restart per request).

## Contributor workflow

End-to-end flow for prompt changes:

1. **Clone** [jerry-lib](https://github.com/SarkarShubhdeep/jerry-lib) for shipped defaults
2. **Override locally** — copy a prompt to your host's override directory and edit
3. **Test** — via jerry-cli (`deno task jerry report yesterday`) or your own host
4. **Ship** — open a PR in jerry-lib with the prompt change, publish a new JSR version, bump the dependency in consuming hosts

```bash
# After testing an override, promote it to jerry-lib
cp ~/.config/jerry/assets/prompts/report.txt \
  /path/to/jerry-lib/assets/prompts/report.txt
```

## Future: org-wide overrides

v1 uses filesystem backends only (local override + shipped defaults). A future MongoDB backend could serve org-wide prompt overrides from a shared database — the layered backend in [`src/assets/index.ts`](../src/assets/index.ts) is structured to add that without changing the host API surface.

## Related

- [host-integration.md](./host-integration.md) — `initJerryLib` and host override paths
- [agents-and-ides.md](./agents-and-ides.md) — agents tuning prompts during integration
