# codex-port

Translates upstream pstack and cursor-team-kit into one installable Codex plugin.
The current build follows **pstack 0.15.0** and includes 63 skills.

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
node --test codex-port/port.test.mjs
node codex-port/port.mjs --check
```

`--check` compares generated contents and executable permissions against `dist/`
and reports missing, changed, or obsolete files. It never writes. A normal build
checks for unported dependencies before replacing the previous output.

If upstream introduces a host dependency, add either:

- A mechanical translation rule in `port.mjs` for paths, tools, or model names.
- An override in `overrides/<namespace>/<skill>/<path>` for a workflow that needs
  different instructions in Codex. Overrides skip translation and the host guard.
  Frontmatter conversion and shared-reference relocation still apply.

Translated Markdown and shell files pass the host guard. Other files are copied
byte for byte with their executable permissions preserved. References to Cursor
inside those copied scripts produce advisory output. They must be assessed in
context, since package names and test data can legitimately retain upstream names.
Use `allow.txt` only for literal false positives in translated prose.

The regression tests build the actual upstream tree in an isolated fixture.
They check file coverage, invocation policy, executable permissions, bundled
resources, repeatable generation, stale output detection, and preservation of
the previous build when a new host dependency is rejected.

## Changes in 0.15.0

- Adds `principle-attack-the-premise` and
  `principle-test-behavior-not-implementation`.
- Updates the poteto-mode playbooks, including shipping through GitHub or Origin
  without requiring Graphite. Repository and user forge instructions still apply.
- Simplifies `how` and `why`, removes `how`'s architectural critique mode, and
  revises the writing guidance.
- Preserves upstream's explicit invocation settings as Codex
  `agents/openai.yaml` policies, including the newly explicit `how`, `why`,
  `teach`, `unslop`, and `typescript-best-practices` skills.
- Maps Fable 5.1 defaults to the configured Codex judgment role.

## Models and runners

`runners.json` maps individual roles to Codex models and reasoning efforts.
Panels resolve to CLI runner definitions for `codex exec` and `claude -p`.
The generated package carries this file under `references/`.

[Host guidance](host-delegation.md) explains native delegation, named worker
prompts, panel selection, and unavailable runners. Read it before changing the
configuration. Verify executable paths and CLI flags on the target machine.

The Codex setup skill writes `~/.codex/pstack-runners.md`. Skills read that file
when selecting models. It is ordinary Markdown, not an automatically loaded rule.

## Excluded skills

These depend on host features without a port:

- `pstack/make-bot-ui` posts to hosted Cursor bot webhooks.
- `cursor-team-kit/pr-review-canvas` renders into Cursor's Canvas UI.

Other upstream marketplace plugins stay in the fork but are not part of this
Codex package.

## Install or refresh

Use a Codex CLI that supports `codex plugin`. On this machine the bundled binary
is `/Applications/ChatGPT.app/Contents/Resources/codex`; the Homebrew binary on
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
