# Word the prompt

A prompt states the intent and the check for done. The playbook supplies the
steps. Use explicit Codex plugin invocations such as `$pstack:poteto-mode`.

## Include

- The goal: what is wrong or what the user wants.
- A check that can pass or fail. "Make it better" and a duration are not checks.
- The proof to show: real command output, a recorded flow, a stored value, or a
  measured before and after.
- Relevant context: a symptom, reproduction step, log, path, or issue link.
- Constraints that change the work: "reproduce first", "investigate only",
  "zero behavior change", or a requested review checkpoint.

Leave implementation choices open unless the user has a reason to constrain
them. A list of skill calls can omit steps that the playbook would supply. Name
a narrower skill when the user wants that specific outcome.

## Load useful context

- For a noisy report, ask the agent to restate the underlying issue in plain
  words before changing code.
- Use `$pstack:recall` to recover relevant earlier work within the user's scope.
- Use `$pstack:how` for mechanics and `$pstack:why` for reasons when the code is
  unfamiliar.
- Use `$pstack:teach` to explain the evidence and tradeoffs behind a choice.

## Design and plan

- Ask for prototypes when an open design question needs evidence. For UI,
  screenshots or a recorded flow can make the choices easier to compare.
- For a shared package or API, a tutorial can define the intended experience
  before implementation.
- When planning is the goal, say so. Each planned phase should end in a check.

## Follow up

Once the chat holds the task, "do it", "continue", and "keep going until done"
are enough. Use "new task" when changing subjects. State a changed constraint
directly: "The goal is reproduction; I have not asked for a fix yet."

## Before stepping away

- State the goal, the checks for done, and any decisions the agent can make.
- Give a named base if requesting a fresh worktree.
- Request a decision log when the work will need a later audit.
- Define when to stop and report a blocker. Existing authorization and host
  permissions still apply while the user is away.
- Continuing the active task does not require a scheduler. For work that should
  resume later or recur, explicitly ask for a Codex automation, including its
  schedule, finish condition, and when a notification would help. Use the host's
  available automation tools; pstack does not supply its own scheduling command.

## Steer in one line

- "Apply prove it works. Show me the real output."
- "Restate the goal and compare the result to the original done checks."
- "Catch me up with `$pstack:ketchup`, including decisions that need me."
