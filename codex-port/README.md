# codex-port

Translates upstream pstack and cursor-team-kit into one installable Codex plugin.
The current build follows **pstack 0.15.32** and includes 74 skills, synced from
`cursor/plugins` commit `99b609a72323b70204eab407c622f436e858e112` on 2026-10-25.

## Upstream and local files

Keep `pstack/`, `cursor-team-kit/`, and `.cursor-plugin/marketplace.json`
unchanged from upstream. Host adaptations live in `codex-port/`. The separate
`.github/workflows/validate-codex-port.yml` checks the Codex build.

`dist/` is committed so a checkout contains the installable plugin. Its manifest
version follows upstream pstack. The package includes the logo, license, runner
configuration, and worker prompt templates.

## Update and verify

Run from the repository root:

```sh
git fetch upstream
git merge upstream/main
node codex-port/port.mjs
node --test codex-port/*.test.mjs
node codex-port/port.mjs --check
```

`--check` compares generated contents and executable permissions against `dist/`
and reports missing, changed, or obsolete files. It never writes. A normal build
checks for unported dependencies before replacing the previous output.

If upstream introduces a host dependency, add either:

- A mechanical translation rule in `port.mjs` for paths, tools, or model names.
- An override in `overrides/<namespace>/<skill>/<path>` for a workflow that needs
  different instructions in Codex. Overrides skip translation and the host guard.
  Frontmatter conversion and shared-reference relocation still apply. Review
  upstream changes to overridden files on every update; overrides replace the
  whole file and do not inherit those changes automatically.
- An override in `overrides/agents/<path>` for a bundled worker prompt. These
  use the same precedence and shared-reference relocation as skill overrides.

Translated Markdown and shell files pass the host guard. Other files are copied
byte for byte from upstream or an explicit override, with their upstream executable
permissions preserved. References to Cursor
inside those copied scripts produce advisory output. They must be assessed in
context, since package names and test data can legitimately retain upstream names.
Use `allow.txt` only for literal false positives in translated prose.

The regression tests build the actual upstream tree in an isolated fixture.
They check file coverage, invocation policy, executable permissions, bundled
resources, repeatable generation, stale output detection, and preservation of
the previous build when a new host dependency is rejected.

## Documentation policy

[documentation-policy.md](documentation-policy.md) is the shared source. The
generator bundles one copy at `dist/references/documentation-policy.md` and
relocates `references/documentation-policy.md` links from skill overrides and
worker prompts. It travels with the plugin in both Codex desktop and CLI.
It does not depend on personal runner settings or a rule installed separately.

Poteto Mode, Show Me Your Work, Figure It Out, Architect, technical writing,
and the commit and PR entrypoints read it before work. Host delegation requires
every worker, including CLI reviewers, to read its installed absolute path or
receive its text when that path is inaccessible. Worker and audit prompts carry
the same requirement. Review these overrides against upstream on updates.

Task reasoning and verification summaries belong in the ticket or PR/MR body,
or the final response when neither exists. Plans, logs, and audit receipts stay
local by default. Before tracking documentation, identify its concrete future
maintenance or operational use, or an explicit user or repository requirement.
Raw working records need an explicit tracking requirement. Required public and
API docs, QA reports, and metric histories keep their existing workflows.

## Changes in 0.15.32

- Adds `create-formal-verification-skill`, `maintain-formal-verification-skill`,
  `in-your-own-words`, `ketchup-video`, `sharpen`, and `statechart`, preserving
  their upstream explicit-invocation policies.
- Carries forward upstream orchestration, PR watcher, worktree-audit, and
  planning fixes. The Codex plan checker now handles CommonMark code fences
  and inline code spans while retaining the Codex automation requirement.
- Reconciles the workflow and help overrides with upstream while preserving
  the bundled documentation policy and Codex runner configuration.
- Updates model-family translation for upstream's expanded fallback guidance.

## Changes in 0.15.17

- Adds `ketchup`, `poteto-help`, `correct`, `benchmark-checklist`, and
  `principle-explain-the-number`, with upstream explicit-invocation policies.
- Carries forward shorter skill prompts, updated design and review guidance,
  and stronger performance measurement checks.
- Maps the new Opus 5.5 and Grok 4.7 defaults to the configured Codex roles.
  Existing personal choices in `~/.codex/pstack-runners.md` continue to win.
- Adapts the help skill to Codex installation, invocation, and automations.
  Relative skill links resolve to the installed namespaced directories.
- Reconciles setup budgets and per-run decision logs with the Codex overrides,
  retaining the stronger final-audit policy.
- Adapts the plan checker to require the Codex automation described by the
  playbook. Other upstream scripts remain unchanged.

## Models and runners

`runners.json` maps individual roles to Codex models and reasoning efforts.
Defaults use GPT-6.1 Sol at high effort for code, judgment, and prose, and GPT-6
Luna at medium effort for focused exploration. Three-worker review panels add
one GPT-6 Astra reviewer at high effort. Personal hardest-task choices can reserve
Astra at max effort for exceptional work. Native panel overrides
select model slugs; CLI review panels resolve to read-only runner definitions
for `codex exec` and the optional `claude -p` runner.
The generated package carries this file under `references/`.

[Host guidance](host-delegation.md) explains native delegation, named worker
prompts, panel selection, and unavailable runners. Read it before changing the
configuration. Verify executable paths and CLI flags on the target machine.

The Codex setup skill writes `~/.codex/pstack-runners.md`. Skills read that file
when selecting models. It is ordinary Markdown, not an automatically loaded rule.

The `final reviewer` role selects one strong reviewer from an ordered pool.
The audit trail uses Astra at medium effort for Sol-owned runs and Sol at high
effort for Astra-owned runs. Luna can provide supplementary checks but does not
satisfy the final audit.

## Excluded skills

These depend on host features without a port:

- `pstack/make-bot-ui` posts to hosted Cursor bot webhooks.
- `cursor-team-kit/pr-review-canvas` renders into Cursor's Canvas UI.

Other upstream marketplace plugins stay in the fork but are not part of this
Codex package.

## Install or refresh

Use a Codex CLI that supports `codex plugin`. On this machine the bundled binary
is `/Users/gustavo/.codex/plugins/.plugin-appserver/codex-cli/bin/codex`; the Homebrew binary on
PATH is older and does not support these commands.

For initial installation, register the marketplace root, then add the plugin:

```sh
codex plugin marketplace add /absolute/path/to/plugins/codex-port
codex plugin add pstack@pstack-port
```

On **each computer**, first make these source changes available in its local
checkout. Use that computer's plugin-capable binary and configured Codex home.
For this machine:

```sh
cd /Users/gustavo/Documents/GitHub/plugins
PSTACK_CODEX=/Users/gustavo/.codex/plugins/.plugin-appserver/codex-cli/bin/codex
"$PSTACK_CODEX" plugin --help
node codex-port/port.mjs
```

On another computer, change the `cd` path and set `PSTACK_CODEX` to its verified
plugin-capable `codex` executable. If `codex` on PATH supports `plugin`, use
`PSTACK_CODEX="$(command -v codex)"`. If the local marketplace is not registered,
run `"$PSTACK_CODEX" plugin marketplace add "$PWD/codex-port"` first.

For same-version local iterations, preserve the existing cachebuster procedure.
Set `PSTACK_CACHEBUSTER` to that installation's actual
`plugin-creator/scripts/update_plugin_cachebuster.py` path. The helper adds a
temporary cachebuster before reinstalling:

```sh
python3 "$PSTACK_CACHEBUSTER" codex-port/dist
"$PSTACK_CODEX" plugin add pstack@pstack-port
node codex-port/port.mjs
node codex-port/port.mjs --check
"$PSTACK_CODEX" plugin list --marketplace pstack-port
```

Regeneration restores the release manifest. Do not commit the temporary
cachebuster or hand-edit the installed cache. If reinstalling fails, regenerate
before retrying. The helper is supplied by plugin-creator, not by this port.
If it is unavailable, clear and reinstall this plugin through the supported CLI
instead of manually editing cache files:

```sh
"$PSTACK_CODEX" plugin remove pstack@pstack-port
"$PSTACK_CODEX" plugin add pstack@pstack-port
"$PSTACK_CODEX" plugin list --marketplace pstack-port
```

Version `0.15.32` alone does not prove that a same-version refresh took effect.
With the default Codex home and this release, compare the installed policy:

```sh
PSTACK_CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
cmp codex-port/documentation-policy.md \
  "$PSTACK_CODEX_HOME/plugins/cache/pstack-port/pstack/0.15.32/references/documentation-policy.md"
```

Start a **fresh Codex desktop chat and a fresh Codex CLI session** after the
refresh. Existing sessions retain their loaded instructions. When desktop and
CLI share the same Codex home, one reinstall covers their shared plugin cache.
If they use separate homes, repeat the refresh for each. These instructions do
not imply that another computer or either running session has been updated.

Skill directories use `pstack-*` and `team-kit-*` prefixes. Both sets belong to
plugin `pstack`, so an explicit invocation uses names such as `$pstack:how` or
`$pstack:deslop`.
