# Codex host guidance

Read `~/.codex/pstack-runners.md` when it exists before selecting a model or
runner. It contains the per-role choices written by `setup-pstack`. It is an
ordinary Markdown file read by these skills, not an automatically loaded rule.
Missing roles keep the skill's inline defaults.

## Subagents

Use the delegation tools exposed by the current host. In Codex desktop these
may be `collaboration.spawn_agent`, `send_message`, and `wait_agent`. Use their
actual schemas, supported models, and concurrency limits. Do not pass parameters
such as `readonly` or `run_in_background` unless the tool supports them.

Pass the scope, file paths, expected output, and whether the worker may edit.
A request for read-only work in a prompt is not a filesystem sandbox. If the
work needs enforced read-only access, use a runner with that sandbox.

Named upstream workers are prompt templates, not registered Codex agent types:

| Worker | Prompt template |
| --- | --- |
| `poteto-agent` | [agents/poteto-agent.md](agents/poteto-agent.md) |
| `Comment Sicko` | [agents/comment-sicko.md](agents/comment-sicko.md) |

Read the template and include it in the worker's instructions. A poteto worker
also needs the installed `skills/pstack-poteto-mode/SKILL.md` path. Other workers
use the default agent type with the prompt supplied by the invoking skill.

For `inherit-parent` or `auto`, omit model and reasoning overrides. Otherwise
use a model and effort supported by the current tool. These files do not grant
access to models or tools that the host does not expose.

## Panels and CLI runners

[runners.json](runners.json) is bundled with the plugin. Its `roles` map single
workers to Codex models and efforts. Its `panels` map panel names to entries in
`runners`. Resolve a panel through that map unless the user's per-role file
overrides it. `arena cross-judge pool` uses the arena panel by default.

Each runner's `cmd` is an argument array. Pass the prompt on stdin and collect
stdout and the exit status. Resolve the configured executable on this machine
before running it. The bundled paths reflect the maintainer's installation.
For another machine, locate the installed CLI and verify its flags with `--help`.
Use its existing authentication. Do not install or authenticate another CLI as
a side effect of selecting a model.

The Claude runner provides a second vendor for adversarial panels. Distinct
Codex models can add useful disagreement, but repeated calls to one model do
not provide the same diversity. If a runner is unavailable, report which panel
arm is missing and use a supported substitute only if the skill still has
enough independent reviewers to answer its question.

CLI runners are configured for read-only review. Use native workers with the
appropriate permissions for implementation arms. Apply the current task's
authorization boundaries to every worker, including commits and remote writes.
