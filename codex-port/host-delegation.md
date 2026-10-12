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

Before spawning any worker, read [the documentation policy](documentation-policy.md).
Give each worker its absolute installed path and require the worker to read it
before work. If that path is inaccessible, include the policy text in the prompt.
This includes implementation workers, architects, reviewers, audit reviewers,
and separate CLI runners. Pass applicable user and repository requirements too.
Keep plans, logs, and review receipts in the existing local store by default.

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
workers to Codex models and efforts. Native model entries in the user's per-role
file select native subagents, one per entry. CLI runner names select the command
definitions in `runners`; the `panels` map supplies defaults for CLI review
panels. Respect the invoking skill's inline defaults for native panels.
Use native workers for implementation panels and cross-judges that need native
host tools. Resolve an explicit CLI review panel through the `panels` map unless
the user's per-role file overrides it.

Each runner's `cmd` is an argument array. Pass the prompt on stdin and collect
stdout and the exit status. Resolve the configured executable on this machine
before running it. The bundled paths reflect the maintainer's installation.
For another machine, locate the installed CLI and verify its flags with `--help`.
Use its existing authentication. Do not install or authenticate another CLI as
a side effect of selecting a model.

The optional Claude runner provides a second vendor for adversarial review
panels. Distinct Codex models can add useful disagreement, but repeated calls
to one model do not provide the same diversity. If a runner is unavailable,
report which panel arm is missing and use a supported substitute only if the
skill still has enough independent reviewers to answer its question.

CLI runners are configured for read-only review. Use native workers with the
appropriate permissions for implementation arms. Apply the current task's
authorization boundaries to every worker, including commits and remote writes.
