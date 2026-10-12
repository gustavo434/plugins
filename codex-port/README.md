# codex-port

Translates upstream pstack and cursor-team-kit into one installable Codex plugin.
The current build follows **pstack 0.15.17** and includes 68 skills, synced from
`cursor/plugins` commit `11713c683fe4add4fd403ea880580abbc9e0875f` on 2026-10-11.

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

For a configured local marketplace, rebuild and run the add command again.
Use `codex plugin list --marketplace pstack-port` to verify the installed version.
For same-version local iterations, the plugin-creator skill's
`update_plugin_cachebuster.py codex-port/dist` helper adds a temporary cachebuster
before reinstalling. Regenerate afterward to restore the committed release
manifest. Start a new Codex task to load the refreshed skills.

Skill directories use `pstack-*` and `team-kit-*` prefixes. Both sets belong to
plugin `pstack`, so an explicit invocation uses names such as `$pstack:how` or
`$pstack:deslop`.
