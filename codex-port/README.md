# codex-port

Translates upstream Cursor plugins into a Codex plugin. Upstream stays pristine
so `git merge upstream/main` is always clean.

## The invariant

**Never edit `pstack/`, `cursor-team-kit/`, or `.cursor-plugin/marketplace.json`.**

Those are upstream's. Every merge conflict you will ever have comes from
breaking this rule. `marketplace.json` especially — registering anything there
guarantees a conflict on every upstream release, and it is what upstream CI
validates against the *Cursor* plugin schema.

Everything of yours lives in `codex-port/`. Upstream will never create that
directory, so it can never conflict.

## Update protocol

```
git fetch upstream && git merge upstream/main   # clean, by construction
node codex-port/port.mjs                        # regenerate
```

If the build fails, upstream introduced a Cursor dependency the rules don't
know. That is the system working. Fix it one of two ways:

- **A rule** in `port.mjs` — for anything mechanical (a path, a renamed
  built-in, a new model slug).
- **An override** in `codex-port/overrides/<plugin>/<path>` — used verbatim,
  skipping translation *and* the guard. For anything needing judgment.

Rules hold mechanics. Overrides hold judgment. Keep them separate or the rules
rot into a pile of special cases.

## The guard

After translating, every output file is scanned for surviving Cursor
references. Any hit fails the build and names the file and line.

This is the whole point. Without it, upstream adds a skill using a primitive
Codex lacks, translation silently passes it through, and you find out when an
agent misbehaves unattended at 3am. Genuine false positives go in `allow.txt` —
never a real gap.

## Runners

`runners.json` maps roles and panels to **CLI processes**, not model slugs.

pstack's panels (`interrogate`, `arena`, `architect`, `how` critics) get their
signal from independent priors. Upstream achieves that across vendors. Codex is
single-vendor, so N arms on one model is N correlated opinions and the skill's
premise dies quietly. Routing each arm to a different CLI — `codex exec` and
`claude -p` — restores real diversity using subscriptions you already have, with
no API key.

Verify the command lines in `runners.json` after upgrading Codex.

## Excluded

Host-bound, no Codex equivalent:

- `pstack/make-bot-ui` — posts to `api2.cursor.sh` webhooks
- `cursor-team-kit/pr-review-canvas` — renders into Cursor's Canvas UI

## Install

`dist/` is committed on purpose. Its diff across an upstream merge is the
clearest review surface you get for how your agents' behavior changed.

Add `dist/` as a personal Codex plugin, then enable it in
`~/.codex/config.toml`. Skills are namespaced `pstack-*` and `team-kit-*` so
they never collide with your own in `~/.codex/skills/`.
