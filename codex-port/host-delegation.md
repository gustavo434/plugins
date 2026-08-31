# Host delegation

Every translated skill points here instead of naming a host's spawn primitive.
This is the only file that knows how *this* host runs parallel work. When Codex
changes, you edit one file, not sixty.

## Subagents

Codex runs parallel workers with independent context windows. Define them as
TOML under `.codex/agents/` and spawn them from a parent turn.

> **Verify before trusting.** These details are from Codex docs, not from a run
> on your machine. After `brew upgrade codex`, confirm the exact spawn syntax
> and the parallel cap for your installed version, then correct this file. It is
> the single source of truth for every skill in this plugin.

Defaults pstack assumes, and their Codex equivalents:

| pstack expects | Codex |
| --- | --- |
| `run_in_background: true` | background worker |
| readonly agent mode | `--sandbox read-only` |
| file pointers, not inlined context | pass paths; let the worker read |
| one worker per panel model | one worker per **runner** (see below) |

## Runners

pstack's panels (`interrogate`, `arena`, `architect`, `how` critics) get their
signal from **independent priors**, not from personas. Upstream gets that by
routing each arm to a different vendor's model. Codex is single-vendor, so
running N arms on one model produces N correlated opinions and the skill's
premise quietly dies.

The substitute: each arm is a **CLI process**, not a model slug. Two
subscriptions you already pay for give two genuinely independent priors.

Runner definitions live in `codex-port/runners.json`. Each takes a prompt on
stdin and returns prose on stdout:

```
codex exec --sandbox read-only -m gpt-5.6-sol -c model_reasoning_effort="xhigh" -
claude -p --permission-mode plan
```

Both authenticate from their own subscription. Neither needs an API key.

When a skill names a role (`code`, `fast`, `judgment`) or a panel
(`interrogate`, `arena`), resolve it through `runners.json` and spawn one
process per entry. Reasoning effort and model tier are the weak diversity axis;
crossing vendors is the strong one. Prefer the strong one where the skill's
value depends on disagreement.
