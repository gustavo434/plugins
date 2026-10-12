---
name: review-and-ship
description: Review the current branch for bugs, intent fit, and test coverage; run or write tests; commit focused work; open or update a PR.
---

Before choosing models or delegating, read [Codex host guidance](references/host-delegation.md).

Before work, read [the documentation policy](references/documentation-policy.md).

# Review and ship

## Trigger

Reviewing changes before shipping. Close key issues, verify behavior, and open or update a PR.

## Workflow

1. Gather context: diff against base branch, uncommitted changes, recent commits, changed files, and user intent from recent relevant chats if useful.
2. Run targeted tests for changed behavior. If no focused tests exist, decide whether to add them or document the gap.
3. Review for correctness, regressions, security, and intent fit. Use parallel subagents for larger diffs.
4. Fix critical issues before finalizing and re-run affected tests.
5. Apply the documentation policy before committing. Identify the concrete future use or explicit requirement for each documentation file, inspect the staged diff, and commit selective files with a concise message.
6. Push branch and open or update a PR/MR. Put task-specific reasoning, rejected alternatives, and verification summaries in its body. Keep raw plans, logs, and review receipts local unless explicitly required to be tracked.

## Suggested Checks

```bash
git fetch origin main
git diff origin/main...HEAD
git status
gh pr checks --json name,bucket,state,workflow,link
```

## Guardrails

- Prioritize correctness, security, and regressions over style-only comments.
- Keep commits focused and avoid unrelated file changes.
- If pre-commit checks fail, fix the issues rather than bypassing hooks.
- Use `gh pr checks` instead of GitHub Actions-only commands when judging PR readiness.

## Output

- Findings summary (critical, warning, note)
- Tests run and outcomes
- PR URL
