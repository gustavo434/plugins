---
name: setup-pstack
description: Configure pstack models and panel runners for Codex. Use for setup-pstack, "configure pstack models", or changing pstack's model choices.
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

Read `~/.codex/pstack-runners.md` if it exists. Missing lines use the inline
defaults in the installed skills and the bundled runner definitions. Show the
current choices and flag anything unavailable. Offer supported replacements
through the host's user-input tool when available.

Keep these role labels, which the workflows use:

- `feature, refactoring`
- `bug-fix`
- `perf-issue`
- `hillclimb`
- `judgment and prose`
- `hardest tasks`
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

Panel lists run one worker per entry. Alias entries also count. Arena selects
one cross-judge from its pool, preferring a different model family from the
parent. Swarm workers share a default unless a race assigns a model per arm.

## Save and verify

After the user chooses, validate each native model and effort against the host
and each CLI runner against the bundled definitions. Rewrite the configuration
as ordinary Markdown, one role per line. Do not add `alwaysApply` frontmatter.
For example, when those choices are available:

```text
feature, refactoring: inherit-parent
bug-fix: gpt-5.6-sol at effort max
arena runners: claude-opus, codex-sol, codex-terra
```

Read the file back. Report its path and the choices saved. The next invocation
reads the new values. Re-running setup updates the same file.

If the project lacks a way to exercise its real application, offer the installed
`create-verification-skill` skill once. Only invoke it if the user accepts.
