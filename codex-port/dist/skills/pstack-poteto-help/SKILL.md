---
name: poteto-help
description: Guides users through pstack setup in Codex, poteto-mode, and choosing a skill, playbook, or principle for a task. Use for pstack help questions.
---

# Poteto help

Answer the user's question about pstack, give them a usable prompt when helpful,
and link the file the answer came from. A help question does not start the work.
A request such as "use pstack to fix this bug" does: read
[`poteto-mode`](../pstack-poteto-mode/SKILL.md) and continue the authorized task.

Read the skill you route to before recommending it. Its instructions own the
details. Link the installed file by its actual path; for installation and port
behavior, use the [Codex port README](https://github.com/gustavo434/plugins/blob/main/codex-port/README.md).
Upstream's public files describe the original host and may differ from this port.

## Find the need

Infer it from the message and conversation. A named situation goes straight to
its section. If necessary, ask one short question to distinguish setup, choosing
a workflow, fixing a run, or personalizing pstack. Do not make the user select
from the whole catalog.

Check state only when it changes the answer:

- Missing `~/.codex/pstack-runners.md` means roles use their installed defaults.
  It does not mean pstack is missing or broken. For setup or cost questions,
  mention [`setup-pstack`](../pstack-setup-pstack/SKILL.md) once; the user can configure
  roles now or keep those defaults.
- Missing project verification skills or an app harness matters when the user
  wants behavioral proof. Recommend
  [`create-verification-skill`](../pstack-create-verification-skill/SKILL.md).
- Missing formal verification matters when the question concerns a race, an
  invariant, or cases tests rarely reach. Recommend
  [`create-formal-verification-skill`](../pstack-create-formal-verification-skill/SKILL.md).
  If a formal verification skill exists and its covered code changed after its
  recorded sync commit, recommend
  [`maintain-formal-verification-skill`](../pstack-maintain-formal-verification-skill/SKILL.md)
  when the question touches that code.

## Get set up

This Codex plugin bundles pstack and the supported team-kit skills together.
Skill directories use `pstack-*` and `team-kit-*` prefixes, but explicit
invocations use the plugin name, such as `$pstack:poteto-mode` and
`$pstack:deslop`.

For installation or refresh, read the Codex port README above and use a Codex
CLI that supports `codex plugin`. The documented flow registers the local
marketplace root, adds `pstack@pstack-port`, verifies the installed version,
then starts a new Codex chat to load refreshed skills. Check local CLI support
before giving an executable-specific command.

[`setup-pstack`](../pstack-setup-pstack/SKILL.md) configures supported models and
reasoning efforts for each role. It writes `~/.codex/pstack-runners.md`, ordinary
Markdown that the workflows read when choosing a model. The next invocation
reads changed choices; this file is not an automatically loaded rule.
Setup also offers once each to create a project verification skill and a formal
verification skill when the project lacks one.

For cost questions, explain that extra workers and review panels spend extra
tokens. Fewer panel entries mean fewer workers. Smaller supported models or
reasoning efforts can lower cost; `auto` and `inherit-parent` use the chat's
model and effort and are cheaper only when the parent is cheaper. Preserve any
reviewer requirements in the selected workflow. Read
[Codex host guidance](../../references/host-delegation.md) for models and runners.

## Start a task with poteto-mode

`$pstack:poteto-mode` matches the task to a playbook and runs the skills its
steps need. A prompt states the goal, useful context, and a check that can pass
or fail. Read [`references/prompting.md`](references/prompting.md) when helping
word one. Let the playbook supply the sequence unless the user wants to change
a particular choice.

Invoke the skill at the start of a task and keep its guidance with that task.
This port does not register a persistent custom mode or a keyboard shortcut.
In a new chat, invoke it again. "New task" signals that the skill should select
a fresh playbook.

Workers use the delegation tools and permissions available in the current
host. Named workers such as `poteto-agent` are bundled prompt templates, not
registered agent types. Follow the host guidance for passing their instructions,
selecting models, and isolating writes. Do not assume workers have separate
machines or separate checkouts.

## Pick a skill

The default for substantial implementation work is `$pstack:poteto-mode`.
Recommend a specific skill when its narrower outcome fits. Read it first and
give at most one example prompt.

| The user wants to | Skill |
| --- | --- |
| Work through a substantial task with verification | [`poteto-mode`](../pstack-poteto-mode/SKILL.md) |
| Check the agent's understanding of their goal before work begins | [`in-your-own-words`](../pstack-in-your-own-words/SKILL.md) |
| Rewrite a prompt with deeper methods and an outside check, without doing the task | [`sharpen`](../pstack-sharpen/SKILL.md) |
| Know how code works or where new code belongs | [`how`](../pstack-how/SKILL.md) |
| Know why code is shaped this way or where a number came from | [`why`](../pstack-why/SKILL.md) |
| Understand a change or subsystem in plain words | [`teach`](../pstack-teach/SKILL.md) |
| Recover recent working context across their chats and shared records | [`recall`](../pstack-recall/SKILL.md) |
| Catch up on this chat and its pending decisions | [`ketchup`](../pstack-ketchup/SKILL.md) |
| Catch up in a short silent video, with pending decisions written below it | [`ketchup-video`](../pstack-ketchup-video/SKILL.md) |
| Find what a small diff could break outside itself | [`blast-radius`](../pstack-blast-radius/SKILL.md) |
| Settle types and module boundaries before implementation | [`architect`](../pstack-architect/SKILL.md) |
| Compare attempts at one brief and combine the best parts | [`arena`](../pstack-arena/SKILL.md) |
| Run parallel coverage or a race and receive one report | [`swarm`](../pstack-swarm/SKILL.md) |
| Have independent reviewers try to break a diff | [`interrogate`](../pstack-interrogate/SKILL.md) |
| Fix a bug test-first when a cheap local test exists | [`tdd`](../pstack-tdd/SKILL.md) |
| Apply TypeScript guidance to `.ts` or `.tsx` work | [`typescript-best-practices`](../pstack-typescript-best-practices/SKILL.md) |
| Have an independent reviewer inspect code comments | [`no-comments`](../pstack-no-comments/SKILL.md) |
| Remove AI tells from prose | [`unslop`](../pstack-unslop/SKILL.md) |
| Write docs, an RFC, a PR description, or a commit message | [`technical-writing`](../pstack-technical-writing/SKILL.md) |
| Hear the last reply again in plain words | [`bro`](../pstack-bro/SKILL.md) |
| Build a harness and feature map that prove app behavior | [`create-verification-skill`](../pstack-create-verification-skill/SKILL.md) |
| Audit an existing verification skill against source and live behavior | [`maintain-verification-skill`](../pstack-maintain-verification-skill/SKILL.md) |
| Formally verify a race, invariant, or other property tests rarely reach | [`create-formal-verification-skill`](../pstack-create-formal-verification-skill/SKILL.md) |
| Update formal verification after code changes and distinguish drift from bugs | [`maintain-formal-verification-skill`](../pstack-maintain-formal-verification-skill/SKILL.md) |
| Draw checked state transitions and bug paths, turn an agreed chart into a TLA+ skeleton, or audit code against a spec | [`statechart`](../pstack-statechart/SKILL.md) |
| Vet a performance number before using it | [`benchmark-checklist`](../pstack-benchmark-checklist/SKILL.md) |
| Organize a large change or work to review after stepping away | [`figure-it-out`](../pstack-figure-it-out/SKILL.md) |
| Keep a decision log and review a completed run | [`show-me-your-work`](../pstack-show-me-your-work/SKILL.md) |
| Configure models and reasoning efforts | [`setup-pstack`](../pstack-setup-pstack/SKILL.md) |
| Turn personal working habits into a skill | [`automate-me`](../pstack-automate-me/SKILL.md) |
| Turn a finished task's lessons into skill edits | [`reflect`](../pstack-reflect/SKILL.md) |
| Prevent recurring mistakes with structure and proven checks | [`correct`](../pstack-correct/SKILL.md) |
| Clean up generated code style | [`deslop`](../team-kit-deslop/SKILL.md) |
| Drive or inspect a CLI or TUI | [`control-cli`](../team-kit-control-cli/SKILL.md) |
| Drive or inspect a browser or desktop web UI | [`control-ui`](../team-kit-control-ui/SKILL.md) |
| Find their way around pstack | `poteto-help` |

Other installed team-kit skills also belong to this plugin. If a neighboring
skill is absent from the table, read its frontmatter and route by its actual
description. Recommend only installed skills. Principles are covered below.

Close calls:

- `how` explains mechanics; `why` investigates reasons; `teach` explains the
  result plainly.
- `arena` compares attempts at the same brief; `swarm` partitions coverage or
  races workers and returns a report.
- `architect` implements after settling a design. "With checkpoint" requests
  a design review first.
- `interrogate` reviews the diff; `blast-radius` investigates effects beyond it.
- `recall` rebuilds context across chats. `ketchup` catches up on this chat.
  Resuming one particular chat or branch uses the Session pickup playbook.
- `figure-it-out` structures one rigorous run. Orchestrate handles a program
  spanning multiple PRs; Autonomous run follows one task to its finish checks.

## Playbooks and principles

Playbooks live inside [`poteto-mode`](../pstack-poteto-mode/SKILL.md). They do not have
their own skill command. Describe the task, or name a playbook in the prompt:

- "Babysit this PR" or "check on PR 123" selects Babysit.
- "Take over this branch" selects Session pickup.
- "Pause safely" selects Pause safely.
- "Full autopilot on this queue" selects Autopilot-full; "stack them, don't
  ship" selects Autopilot-stack.
- "Run the eval playbook" selects Eval.
- Asking for a plan across phases or ordered PRs selects
  [Multi-phase plan](../pstack-poteto-mode/playbooks/multi-phase-plan.md), which plans
  without implementing.

Read the chosen playbook for its full scope. Current user, repository, and host
instructions govern external actions and any merge or release; a workflow name
does not expand authorization. The user's forge and branch conventions also
take precedence over upstream examples.

Principle skills supply individual rules that `poteto-mode` reads and cites.
Usually the user can steer with the principle's name, such as "apply prove it
works; show me the real output." Read the installed principle when explaining
it. Planning tools and scheduling tools come from the host, not from pstack.

## Fix a run that went wrong

| Symptom | Guidance |
| --- | --- |
| A new chat lacks the workflow context | Invoke `$pstack:poteto-mode` with the goal and current state. |
| A question was treated as continuation of another task | Say "new task" or explicitly ask for explanation only. |
| New model choices had no effect | Check the role in `~/.codex/pstack-runners.md`, its availability, and whether the workflow read it. |
| A skill did not load automatically | Invoke it by its installed name; respect its invocation policy. |
| Parallel agents overwrote each other's work | Give editing workers separate worktrees or disjoint files, and coordinate shared state. |
| A long run made progress without reaching done | Give it checks that can pass or fail and a concrete stopping condition. |
| The user needs work to resume later | Use an explicit future-work request with the host's available Codex automation tool and a finish condition. |
| A reply claims success from a green build | Ask for the real flow, command output, stored value, or profile that proves the behavior. |

Read [`references/prompting.md`](references/prompting.md) for short steers and
[`references/recipes.md`](references/recipes.md) for examples. If a needed host
tool is unavailable, report that limitation and offer a supported path.

## Make pstack personal

[`automate-me`](../pstack-automate-me/SKILL.md) creates or updates a personal workflow
skill. [`reflect`](../pstack-reflect/SKILL.md) turns lessons from completed work into
skill improvements. Skill authoring and evaluation are also `poteto-mode`
playbooks. Keep skill fixes focused and separate from unrelated feature work.

## Reply

Lead with the answer. Give at most one example prompt, adapted to the user's
task, then link the relevant installed file or the Codex port README. Keep the
answer short unless the user asked for the full map.
