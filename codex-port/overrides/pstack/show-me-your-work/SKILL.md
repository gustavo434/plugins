---
name: show-me-your-work
description: "Keep a reviewable decision trail for long-running or unattended work: a TSV log with one row per decision (what, why, evidence, result). Local by default; commit raw records only when the user or repository policy explicitly requires them. Use for /show-me-your-work, autonomous or multi-phase runs, or work a human reviews after stepping away."
disable-model-invocation: true
---

Before choosing models or delegating, read [Codex host guidance](references/host-delegation.md).

Before work, read [the documentation policy](references/documentation-policy.md).

# Show me your work

Keep one canonical log.

## The format

A single TSV file, one row per decision. Cells stay single-line. Evidence is a pointer, not prose.

Copy `references/decision-log-template.tsv` (the header row) to start a clean log. Columns:

- **ts.** ISO8601 timestamp.
- **phase.** The phase or workstream.
- **decision.** What was chosen or done, one line.
- **why.** The reason in plain words. If a principle drove it, say it plainly, not as a jargon tag.
- **evidence.** A link or path that proves it: commit SHA, PR number, `file:line`, or an artifact, trace, or screenshot path. Never a paragraph.
- **result.** The outcome or predicate state: `tests green`, `reverted`, `pixel-diff 0`, `INCONCLUSIVE`, `open`.

An example, plain-spoken so a reviewer reads it at a glance. This is illustration only. Don't copy these rows into a real log.

```
ts	phase	decision	why	evidence	result
2026-05-24T09:02:00Z	frame	counted the work first, about 100 components and roughly 75 hours	wanted to know the size before starting a long run	commit 3a9f1c2	found 5 things to sort out before starting
2026-05-24T09:40:00Z	harness	took screenshots of the old version before changing anything	so we can compare old against new and catch any visual change	scripts/snapshot.sh, baseline/	saved 120 reference screenshots
2026-05-24T11:15:00Z	widget	moved the widget styles over without changing how it looks	keep the change small and the result identical	commit 7c21e0a, pixel-diff 0	looks identical, tests pass
2026-05-24T12:30:00Z	widget	threw out a helper's work because its screenshots were blank	checked the real files instead of trusting its summary	worktree reset	reverted, tightened the instructions for next time
```

## Logging a row

Write each entry the way you'd tell a teammate what you did. Plain words, concrete actions, no AI speak or abstract jargon (the **unslop** skill applies to log text too).

Use the helper `scripts/log.sh <logfile> <phase> <decision> <why> <evidence> <result>`. It stamps `ts`, writes the header on first use, strips stray tabs/newlines, and prefixes any cell starting with `=`, `+`, `-`, or `@` with a single quote. A bare `printf` appending a row works too, but mind those same bytes if cells come from generated or user-supplied text.

Log decision points and checkpoints, not every action: a fork chosen, a unit completed with its verification result, a pivot or revert with its trigger, a blocker surfaced, a gate fixed. For loop runs, one row per iteration. Skip the trivial and self-evident.

A run is one agent conversation, including its later turns and any summary of it. A pickup, a replacement agent, or a new chat starts a new run. When a run adds to a log that already has rows, its first row has phase `start`, and so does its first row after another run's `start` row. So a run that comes back to a log in a later turn first reads the log's last rows to see whether another run wrote since. A `start` row names the `ts` range of the rows before it that this run did not write, and its evidence names this run, such as its agent id. Use phase `start` for nothing else.

## Where it lives

Keep the log in the existing local agent store, or outside the repository under `~/.codex/pstack/work/<task-slug>/decisions.tsv`. Existing untracked logs may stay in place if kept out of commits. Preserve them for pickup and audit.

Put task-specific reasoning, rejected alternatives, and verification summaries in the ticket or PR/MR body, or the final response when neither exists. Commit the raw log only when the user or repository policy explicitly requires it. Apply the documentation policy before staging it.

## Rules

- Append-only. A wrong call gets a new row that supersedes it. Never edit or delete history.
- Prefer evidence produced by committed scripts over hand-made one-offs (the **encode-lessons-in-structure** principle skill).

## Audit the log against the transcript

At the end of the run, before handing back, check the log told the truth. Read this run's transcript under the Codex session log directory (`~/.codex/sessions/`, indexed by `~/.codex/session_index.jsonl`). Resolve the current run's transcript by its session or agent id; do not assume the system prompt provides a path. Don't glob across `~/.codex/sessions/*/`. That reads unrelated private chats. Walk this run's rows against what actually happened. Each stretch of them begins at one of this run's `start` rows, or at the first row if this run created the log, and ends at the next `start` row of another run:

- Check that every row maps to a real decision or action.
- Check that each row's evidence resolves and shows what the row claims.
- A fork, pivot, or abandoned approach that shaped the work but isn't logged is a gap. Add it.

Correct the log, not the story. The audit never edits or removes a row, even an invented one. When a row records neither a real decision nor a real action, or its claim or evidence is wrong, add a row that supersedes it with what actually happened and a pointer that resolves. This audit does not check rows outside this run's stretches. If this run's own work shows one of them is wrong, supersede it like any wrong call.

## Cross-model review of the trail

Before handing back, choose one independent reviewer from the `final reviewer`
list in `~/.codex/pstack-runners.md`. This is an ordered candidate pool, not a
parallel panel. If the role is absent, use `gpt-6-astra` at effort `medium` for
Sol-owned runs (`high` otherwise), then
`gpt-6.1-sol` at effort `high`. Select the first available entry from a different
model family than the agent that owned the run. Treat Sol versions as one family.
This selects Astra for a Sol-owned run and Sol for an Astra-owned run.

For Sol-owned runs, Astra at effort `medium` or greater qualifies. Other final
audits require Astra or Sol at effort `high` or greater. Luna may
provide a supplementary scan but cannot satisfy this review. `inherit-parent`
and `auto` cannot satisfy the different-family requirement. If no eligible
reviewer is available, report the final audit as unavailable instead of silently
downgrading or claiming it happened.

Give the reviewer the documentation policy's installed absolute path and require
it to read the policy first. Include the policy text if that path is inaccessible.
The trail and review receipt stay local unless explicitly required to be tracked.
Spawn that reviewer to read the audit trail and the run's transcript, follow
evidence pointers, and flag what the user should pay attention to. Self-review
is not a substitute. This audits decisions and verification evidence; it does
not replace an independent code review or exercising the real artifact.

- Decisions logged with weak or absent evidence.
- Verification steps skipped or claimed without proof in the transcript.
- Choices that look risky in hindsight (premature, scope-creeping, papering over a symptom).
- Gaps the user would otherwise miss on a casual skim.

Every reply for a run that produced a trail ends with an "Attention" section. Lead with the reviewer's model on its own line (`reviewed by <model>`), then list each flag pointing to specific rows or moments. "No flags" is a valid value. The model name is not.

## Reviewing the trail

Read the local log top to bottom, follow the evidence pointers, and spot-check. `column -s$'\t' -t <logfile>` renders it in a terminal. Tracking is unnecessary for audit review.

## Composing this skill

Other skills route their audit trail here instead of inventing one. Reference it by name and let it own the format. Don't restate the columns.
