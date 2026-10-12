---
name: new-branch-and-pr
description: Create a fresh branch, complete work, and open a pull request
---

Before work, read [the documentation policy](references/documentation-policy.md).

# New branch and PR

## Trigger

Starting work that should be shipped through a clean branch and pull request workflow.

## Workflow

1. Ensure the working tree is clean or explicitly handled.
2. Create a descriptive branch from the latest main.
3. Complete implementation and tests.
4. Apply the documentation policy before committing. Identify the concrete future use or explicit requirement for each documentation file, inspect the staged diff, then commit selected deliverables and push.
5. Create a concise PR/MR with task-specific reasoning, relevant rejected alternatives, and verification summaries in its body. Keep raw working records local unless explicitly required to be tracked.

## Guardrails

- Keep branch scope focused on one change set.
- Include verification notes before requesting review.

## Output

- New branch name
- PR summary and test notes
- PR URL
