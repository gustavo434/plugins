import assert from "node:assert/strict";
import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const port = dirname(fileURLToPath(import.meta.url));
const root = dirname(port);
const rule = "Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.";
const scenarios = [
  "Compare an empty search on trunk and head",
  "Search for an exact title",
  "Search for a partial title",
  "Clear the search field",
  "Search with leading whitespace",
  "Search with mixed case",
  "Search for a missing title",
  "Navigate the results with the keyboard",
  "Repeat a search after navigating back",
  "Search on a narrow viewport",
];
const plan = `# Improve search feedback

Show an empty state when a search has no matches. PR 1 owns this change.

## How to read this

One box is one unit of work. Every box names the evidence that checks it.
Check a box only when its evidence exists. Follow \`playbooks/autopilot-full.md\`.
${rule}

## Program checklist

### Arm the program

- [ ] Read \`git show origin/main:docs/search.md\` before starting.
- [ ] Arm a Codex automation every hour to audit the active owners.
- [ ] Send the operator a status message when the audit finds a meaningful change.

### Spawn owners

- [ ] Spawn the owner of PR 1 with the search files and verification commands.

### PR mechanics

- [ ] Open PR 1 ready for review against main.

### Verdict and merge

- [ ] Report the verified head SHA and leave merging to the operator.

### Boot recipe

- [ ] Start the search application and drive it through the control-ui skill.

## Show an empty state for unmatched searches (PR 1)

**Depends on.** None.

**Files.**

- [ ] Edit \`src/search.ts\`.

**Build.**

- [ ] Render the empty state when the filtered result list has no items.

**You see.**

- [ ] An unmatched query displays No results.

**Verify, unit.** ${rule}

- [ ] Run \`node --test tests/search.test.mjs\` for empty and matched results.

**Verify, live.** ${rule} Ten lanes on \`gpt-6-luna\` at effort \`medium\` at the PR head.

${scenarios.map((scenario, i) => `- [ ] Lane ${i + 1}. ${scenario}. Save \`search-${i + 1}.png\`. Pass when the displayed results match the query and an unmatched query displays No results.`).join("\n")}

**Verify, perf.** ${rule}

- [ ] Metric. Measure search render latency in milliseconds on trunk and head.
- [ ] Probe. Run \`node scripts/search-perf.mjs\` on alternating trunk and head checkouts.
- [ ] Baseline. Record the trunk median before measuring head.
- [ ] Rule. Fail when the head median exceeds trunk by 10 percent.

**Review gate.** The operator reviews before merge.

- [ ] Save a screenshot and video of the empty state for the operator.

**Merge.**

- [ ] Stop at merge-ready and leave merging to the operator.

## Close the program

- [ ] Report the verified PR and saved evidence.

## Appendix A. Prototype evidence

The fixture exercises the plan checker. It does not claim application verification.
`;

test("the generated plan checker validates Codex plans", async (t) => {
  const dir = mkdtempSync(join(port, ".test-plan-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const path of ["pstack", "cursor-team-kit", ...["port.mjs", "runners.json", "allow.txt", "host-delegation.md", "documentation-policy.md", "overrides"].map((name) => `codex-port/${name}`)]) {
    cpSync(join(root, path), join(dir, path), { recursive: true });
  }
  const build = spawnSync(process.execPath, [join(dir, "codex-port/port.mjs")], { encoding: "utf8" });
  assert.equal(build.status, 0, build.stderr);
  const checker = join(dir, "codex-port/dist/skills/pstack-poteto-mode/scripts/check-plan.mjs");
  const file = join(dir, "plan.md");
  function check(text) {
    writeFileSync(file, text);
    return spawnSync(process.execPath, [checker, file], { encoding: "utf8" });
  }

  await t.test("accepts a concrete plan with automation and a Codex model effort", () => {
    const result = check(plan);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /1 PR sections, 0 problems/);
  });

  await t.test("rejects a plan without an automation", () => {
    const result = check(plan.replace("a Codex automation", "an audit reminder"));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Program checklist lacks "Codex automation"/);
  });

  await t.test("rejects an unfilled worker model", () => {
    const result = check(plan.replace("gpt-6-luna", "<swarm workers model>"));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /with the model filled in/);
  });

  await t.test("accepts ordinary, indented, and longer closing fences", () => {
    for (const indent of ["", " ", "  ", "   "]) {
      const result = check(plan + `${indent}\`\`\`markdown\n## Example only\n${indent}\`\`\`\n`);
      assert.equal(result.status, 0, result.stderr);
    }
    const result = check(plan + "```markdown\n## Example only\n````\n");
    assert.equal(result.status, 0, result.stderr);
  });

  await t.test("accepts nested backticks and tilde info strings", () => {
    for (const example of [
      "````markdown\n```markdown\n## Example only\n```\n````\n",
      "~~~markdown `info`\n## Example only\n ~~~\n",
    ]) {
      const result = check(plan + example);
      assert.equal(result.status, 0, result.stderr);
    }
  });

  await t.test("keeps mismatched, shorter, and suffixed closers inside the fence", () => {
    for (const closer of ["~~~", "```", "``` info"]) {
      const result = check(plan + `\`\`\`\`markdown\n${closer}\n## Example only\n\`\`\`\`\n`);
      assert.equal(result.status, 0, result.stderr);
    }
  });

  await t.test("rejects headings and prose outside a proper close", () => {
    for (const suffix of ["  ", "\t"]) {
      const result = check(plan + `\`\`\`markdown\n## Example only\n\`\`\`${suffix}\n## Example only\n`);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /"## Example only" after Close the program is not an appendix/);
    }
    const result = check(plan + "```markdown\nThis prose has a mid-sentence colon: inside code\n```\nThis prose has a mid-sentence colon: bad.\n");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /mid-sentence colon/);
  });

  await t.test("rejects backtick info strings containing a backtick", () => {
    const result = check(plan + "```markdown `invalid`\n## Example only\n```\n");
    assert.equal(result.status, 1);
    assert.match(result.stderr, /"## Example only" after Close the program is not an appendix/);
  });

  await t.test("ignores prose punctuation inside matching multi-backtick code spans", () => {
    for (const count of [2, 3, 4]) {
      const delimiter = "`".repeat(count);
      const result = check(plan + `Use ${delimiter}echo \`x\`: “quoted” — example${delimiter}.\n`);
      assert.equal(result.status, 0, result.stderr);
    }
  });

  await t.test("checks prose following a multi-backtick span and unmatched delimiters", () => {
    for (const example of ["Use ``echo `x`: y``. Bad: prose.\n", "Use ``unclosed: bad` here.\n"]) {
      const result = check(plan + example);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /mid-sentence colon/);
    }
  });
});
