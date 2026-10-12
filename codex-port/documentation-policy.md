# Documentation policy

Apply this policy in Codex desktop and Codex CLI. Respect applicable user and
repository instructions, including required documentation paths and formats.

## Choose the destination

- Put task-specific reasoning, rejected alternatives, and verification summaries
  in the ticket or PR/MR body on GitLab or GitHub. When no ticket or PR/MR exists,
  include them in the final response. A review needing more context is a reason
  to improve that briefing, not to create a tracked task notebook.
- Keep agent plans, checkpoints, execution logs, decision trails, candidate
  designs, and review receipts local by default. Continue the existing logging,
  evidence collection, append-only correction, and independent audit workflows.
- Commit documentation when it provides a lasting reference for maintaining or
  operating the system, when repository policy requires it, or when the user
  explicitly requests a tracked document. A lasting reference serves a concrete
  future task without requiring the current conversation, such as understanding
  module ownership, recovering a service, or using a public API.
- A task being large, complicated, autonomous, or multi-phase is not sufficient
  justification for committing documentation.
- Prefer updating an existing document over creating a separate document for
  each task. Preserve required public documentation, API documentation, QA
  reports, and metric histories. Keep their established workflows and formats.
- Raw agent working records stay uncommitted unless the user or repository
  policy explicitly requires committing those records. An architecture reference
  can qualify for tracking without making its candidate notes or audit trail
  qualify too.

## Before committing documentation

For each proposed documentation file, identify its concrete future use for a
maintainer or operator, or the explicit user or repository requirement that
makes tracking it necessary. Put this justification in the ticket or PR/MR
body, or in the final response when neither exists. Do not create another
tracked document to record the justification. If neither use nor requirement
exists, keep the working record local and summarize the task in the briefing.
Apply the stricter explicit-requirement rule above to raw working records.

Inspect both the working tree and staged diff before committing, including a
checkpoint or WIP commit. Stage selected deliverables. Leave local working
records out of the commit unless explicitly required. This check also applies
to delegated workers that may stage files, commit, or open a PR/MR.

## Local records and delegation

Use the workflow's existing local agent store when available. Otherwise keep
working records outside the repository, for example under
`~/.codex/pstack/work/<task-slug>/`. An existing untracked working record can
stay where it is if it is kept out of commits. Do not change project-wide
gitignore rules to implement this policy. Preserve the records and their
evidence pointers for pickup and audit. Report their local paths and summarize
the useful decisions and verification in the briefing.

Before delegating, give every worker the installed absolute path to this
policy and require it to read the policy before work. Include the policy text
when the worker cannot access that path, including a separate CLI runner.
Carry applicable user and repository requirements in the brief. An audit
reviews local records in place and returns its findings to the parent. It
does not require committing the trail or its review receipt.
