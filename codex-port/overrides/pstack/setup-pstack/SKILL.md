---
name: setup-pstack
description: Configure pstack models, reasoning budgets, and panel runners for Codex. Use for setup-pstack, "configure pstack models", "pstack budget", or changing pstack's model choices.
---

# Setup pstack

Write per-role choices to `~/.codex/pstack-runners.md`. The installed skills
read this file through [Codex host guidance](references/host-delegation.md).

## Detect models and runners

Read the host guidance first. Enumerate the models and reasoning efforts
supported by the current delegation tool. Never write an unconfirmed model
slug. `inherit-parent` and `auto` mean to omit model and reasoning overrides.

For CLI panels, read the bundled `references/runners.json` beside the host
guidance. Check whether each configured executable is available before offering
it. Runner names are CLI configurations, not native model slugs.

## Load and confirm choices

Read `~/.codex/pstack-runners.md` if it exists, including its `# budget` line.
Missing lines use the inline defaults in the installed skills and the bundled
runner definitions. Preserve existing model slugs, panel lists, aliases, and
per-role efforts unless the user chooses to change them. A configuration without
a budget line has per-role efforts; do not infer a global budget from them.

Keep these role labels, which the workflows use:

- `feature, refactoring`
- `bug-fix`
- `perf-issue`
- `hillclimb`
- `judgment and prose`
- `hardest tasks`
- `final reviewer`
- `how explorer`
- `how explainer`
- `why investigators`
- `why synthesizer`
- `reflect tooling`
- `reflect judgment, divergent, synthesizer`
- `arena runners`
- `arena cross-judge pool`
- `swarm workers`
- `architect runners`
- `interrogate reviewers`

Drop configuration lines for retired roles, such as `how critics`, and list
each dropped line when presenting the proposed configuration.

Panel lists run one worker per entry. Alias entries also count. Arena selects
one cross-judge from its pool, preferring a different model family from the
parent. Swarm workers share a default unless a race assigns a model per arm.

`final reviewer` is an ordered candidate pool, not a parallel panel. Default to
`gpt-6-astra` at effort `medium` for Sol-owned runs (`high` otherwise), then
`gpt-6.1-sol` at effort `high`. The final
audit chooses the first available model from a different family than the run's
owner; Sol versions count as one family. Astra at effort `medium` or greater
qualifies for Sol-owned runs. Other audits require Astra or Sol at effort `high`
or greater. `inherit-parent` and `auto` do not qualify for this role.

## Choose a reasoning budget

During initial setup, offer the current per-role defaults or a reasoning budget.
On a re-run, keep the current efforts unless the user requests a budget change.
Show a recorded budget when present. The budget choices are:

- `unlimited — max reasoning`
- `large — xhigh reasoning`
- `medium — high reasoning`
- `small — medium reasoning`

A selected budget sets the target effort for every real native model, including
panel entries, while preserving its model slug and the panel's size and order.
Codex passes the model and effort separately: change the effort setting, never
construct a new model slug. Use the highest supported effort at or below the
target on the ladder `max` > `xhigh` > `high` > `medium` > `low`. If none is
supported, flag the entry for a choice. `inherit-parent` and `auto` remain
unchanged.

Keep the `final reviewer` eligibility requirements above even when the chosen
budget is lower. Preserve qualifying final-reviewer efforts above the target,
or choose a supported effort that meets the required minimum; flag an
unavailable minimum for a replacement instead of weakening the audit. Show
these exceptions before saving.

CLI runner names refer to bundled configurations. Only offer a budget-adjusted
runner when a verified definition supports the requested model and effort;
otherwise show its fixed effort and request an available runner or native-model
choice. Do not silently rewrite a runner's executable or arguments.

Show every proposed role, model or runner, and effort. Flag unavailable entries
and ask whether to accept the table or change specific roles, offering supported
models and `inherit-parent` or `auto` where permitted. Prefer the host's
user-input tool when available.

## Save and verify

After the user chooses, validate each native model and effort against the host
and each CLI runner against the bundled definitions. Rewrite the configuration
as ordinary Markdown, one role per line. Record a chosen budget as
`# budget: <label> (<target effort>)`, or use `# budget: custom (per-role efforts)`
when retaining or individually customizing efforts. Keep the actual per-role
efforts explicit, including final-reviewer exceptions. Preserve the user's
applicable explanatory notes and task-specific escalation rules; replace only
superseded budget and role entries. Do not add `alwaysApply` frontmatter. For
example, when those choices are available:

```text
# budget: custom (per-role efforts)
feature, refactoring: inherit-parent
bug-fix: gpt-6.1-sol at effort high
final reviewer: gpt-6-astra at effort medium, gpt-6.1-sol at effort high
arena runners: gpt-6.1-sol at effort high, gpt-6-astra at effort high, gpt-6-luna at effort medium
```

Read the file back. Report its path and the choices saved. The next invocation
reads the new values. Re-running setup updates the same file.

If the project lacks a way to exercise its real application, offer the installed
`create-verification-skill` skill once. Only invoke it if the user accepts.
