# Prompts worth copying

Substitute the real paths, skill names, and checks. Give the user only the
example that fits their question.

## Understand

- `$pstack:poteto-mode read <issue>. Restate the underlying issue in plain words.`
- `$pstack:poteto-mode investigate <symptom>. Explain what we know, the evidence, and the best hypotheses. Do not change code yet.`
- `$pstack:how explain <subsystem>.`
- `$pstack:why investigate why <behavior> changed recently.`
- `$pstack:recall my work on <topic> from last week, then read <issue>.`
- `$pstack:teach explain the tradeoffs behind this implementation.`
- `$pstack:poteto-mode take over this branch. Read the decision log and continue from the verified state.`

## Build

- Bug: `$pstack:poteto-mode reproduce <symptom>, fix the cause, and verify the original flow.`
- App bug: `$pstack:poteto-mode reproduce <symptom> using <installed verification skill>. Compare with <base>, fix it, and show the real flow.`
- Cheap regression test: `$pstack:tdd reproduce <bug> with a failing test, then fix it and rerun.`
- Feature: `$pstack:poteto-mode add <behavior>. Keep <current output> byte-identical and verify both.`
- Refactor: `$pstack:poteto-mode move <code> into one module with zero behavior change. Record current output and prove it is unchanged afterward.`
- Performance: `$pstack:poteto-mode <operation> takes <time> on <fixture>. Trace it, fix the measured cause, and show comparable before and after results.`

## Design and plan

- `$pstack:poteto-mode prototype a few options for <feature>. Capture the flows for comparison.`
- `$pstack:architect design <feature> with checkpoint. Answer open questions with prototypes and let me review before implementation.`
- `$pstack:poteto-mode write a tutorial for <new package> to define its intended use.`
- `$pstack:arena compare approaches to <problem>.`
- `$pstack:poteto-mode turn this design into a plan of small, verifiable PRs. Do not implement yet.`

## Review and verify

- `$pstack:interrogate review this branch for proven bugs and regressions. Do not change code yet.`
- `$pstack:swarm check each package under <dir> with its documented command. Give each worker a package and return one report.`
- `$pstack:poteto-mode open a PR with focused commits and verification evidence in the description.`
- `$pstack:poteto-mode babysit this PR and get its checks green.`
- `$pstack:poteto-mode check on PR <number>. Report what is outstanding.`
- `$pstack:maintain-verification-skill audit <verification skill> against the current source and live app.`
- `$pstack:correct find recurring mistakes in this repo and prove the checks that prevent them.`

## Away and back

- `$pstack:poteto-mode I am stepping away. Complete <goal> in a fresh worktree off <base>. Done means <checks>. Keep a decision log and report any blocker you cannot resolve within the authorized scope.`
- `Set up a Codex automation to check <PR> every <interval> and address failing checks. Stop when <finish condition>. Notify me only on a meaningful change, completion, or required action.`
- `$pstack:show-me-your-work catch me up on the run and its evidence.`
- `$pstack:ketchup catch me up on this chat and the decisions waiting for me.`
- `$pstack:poteto-mode work through this queue as ordered PRs. I will merge them.`
- `$pstack:reflect capture lessons that would change a future decision.`
- `$pstack:bro explain the last reply in plain words.`
