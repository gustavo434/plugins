import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, chmodSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const port = dirname(fileURLToPath(import.meta.url));
const root = dirname(port);

function fixture(t) {
  const dir = mkdtempSync(join(port, ".test-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const path of ["pstack", "cursor-team-kit", ...["port.mjs", "runners.json", "allow.txt", "host-delegation.md", "overrides"].map((name) => `codex-port/${name}`)]) {
    cpSync(join(root, path), join(dir, path), { recursive: true });
  }
  return dir;
}

function run(dir, ...args) {
  return spawnSync(process.execPath, [join(dir, "codex-port/port.mjs"), ...args], { encoding: "utf8" });
}

function built(dir) {
  const result = run(dir);
  assert.equal(result.status, 0, result.stderr);
  return join(dir, "codex-port/dist");
}

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

function snapshot(dir) {
  return files(dir).map((path) => [relative(dir, path), readFileSync(path).toString("base64"), statSync(path).mode & 0o111]);
}

test("the generated plugin contains the upstream release and its invocation policies", (t) => {
  const dir = fixture(t);
  const dist = built(dir);
  const manifest = JSON.parse(readFileSync(join(dist, ".codex-plugin/plugin.json")));
  const upstream = JSON.parse(readFileSync(join(dir, "pstack/.cursor-plugin/plugin.json")));
  assert.equal(manifest.version, upstream.version);
  assert.deepEqual(readFileSync(join(dist, "assets/logo.png")), readFileSync(join(dir, "pstack", upstream.logo)));
  assert.deepEqual(readFileSync(join(dist, "LICENSE")), readFileSync(join(dir, "pstack/LICENSE")));
  assert.deepEqual(readFileSync(join(dist, "references/runners.json")), readFileSync(join(dir, "codex-port/runners.json")));

  let skills = 0;
  for (const [source, namespace, excluded] of [["pstack", "pstack", "make-bot-ui"], ["cursor-team-kit", "team-kit", "pr-review-canvas"]]) {
    for (const path of files(join(dir, source, "skills"))) {
      const [skill, ...parts] = relative(join(dir, source, "skills"), path).split("/");
      if (skill === excluded) continue;
      const target = join(dist, "skills", `${namespace}-${skill}`, ...parts);
      assert.ok(existsSync(target), target);
      assert.equal(statSync(target).mode & 0o111, statSync(path).mode & 0o111, target);
      if (!/\.(md|sh)$/.test(path)) {
        const override = join(dir, "codex-port/overrides", namespace, skill, ...parts);
        assert.deepEqual(readFileSync(target), readFileSync(existsSync(override) ? override : path), target);
      }
      if (parts.join("/") === "SKILL.md") {
        skills++;
        const explicit = /^disable-model-invocation: true$/m.test(readFileSync(path, "utf8"));
        const policy = join(dirname(target), "agents/openai.yaml");
        assert.equal(existsSync(policy), explicit, target);
        if (explicit) assert.match(readFileSync(policy, "utf8"), /allow_implicit_invocation: false/);
      }
    }
    assert.ok(!existsSync(join(dist, "skills", `${namespace}-${excluded}`)));
  }
  assert.equal(files(join(dist, "skills")).filter((path) => path.endsWith("/SKILL.md")).length, skills);
  for (const name of ["attack-the-premise", "test-behavior-not-implementation"]) {
    assert.ok(existsSync(join(dist, `skills/pstack-principle-${name}/SKILL.md`)));
  }
  for (const name of ["benchmark-checklist", "correct", "ketchup", "poteto-help", "principle-explain-the-number"]) {
    const skill = join(dist, `skills/pstack-${name}`);
    assert.ok(existsSync(join(skill, "SKILL.md")));
    assert.match(readFileSync(join(skill, "agents/openai.yaml"), "utf8"), /allow_implicit_invocation: false/);
  }
  for (const name of ["critic-prompt", "critique-rubric"]) {
    assert.ok(!existsSync(join(dist, `skills/pstack-how/references/${name}.md`)));
  }
  for (const path of files(dist).filter((path) => path.endsWith(".md"))) {
    const text = readFileSync(path, "utf8");
    for (const match of text.matchAll(/(?:\.\.\/)*references\/host-delegation\.md/g)) {
      assert.ok(existsSync(resolve(dirname(path), match[0])), `${path}: ${match[0]}`);
    }
    for (const match of text.matchAll(/\]\(((?:\.\.\/|\.\/)[^\s)#]+)(?:#[^\s)]*)?\)/g)) {
      assert.ok(existsSync(resolve(dirname(path), match[1])), `${path}: ${match[1]}`);
    }
    assert.doesNotMatch(text, /subagent subagent|\$team-kit:|claude-fable-5(?:-1)?-thinking-max|claude-opus-5-5-xhigh|grok-4\.7-xhigh-fast|pstack-models\.mdc/);
  }
  const help = readFileSync(join(dist, "skills/pstack-poteto-help/SKILL.md"), "utf8");
  assert.match(help, /\.\.\/pstack-ketchup\/SKILL\.md/);
  assert.doesNotMatch(help, /Custom Mode|\/add-plugin|\.\.\/make-bot-ui\/|\.\.\/\.\.\/docs\/guide/);
  const rationale = readFileSync(join(dist, "skills/pstack-architect/references/rationale-template.md"), "utf8");
  assert.match(rationale, /\.\.\/\.\.\/pstack-arena\/SKILL\.md/);
  const before = snapshot(dist);
  assert.equal(run(dir, "--check").status, 0);
  built(dir);
  assert.deepEqual(snapshot(dist), before);
});

test("check detects stale content, extra files, and a missing executable bit", (t) => {
  const dir = fixture(t);
  const dist = built(dir);
  const manifest = join(dist, ".codex-plugin/plugin.json");
  writeFileSync(manifest, "{}\n");
  assert.equal(run(dir, "--check").status, 1);
  assert.equal(readFileSync(manifest, "utf8"), "{}\n");
  built(dir);
  writeFileSync(join(dist, "obsolete.md"), "Old upstream reference\n");
  assert.equal(run(dir, "--check").status, 1);
  built(dir);
  assert.ok(!existsSync(join(dist, "obsolete.md")));
  const executable = files(dist).find((path) => statSync(path).mode & 0o111);
  assert.ok(executable);
  chmodSync(executable, 0o644);
  assert.equal(run(dir, "--check").status, 1);
});

test("unknown upstream host dependencies fail without replacing the installed artifact", (t) => {
  const dir = fixture(t);
  const dist = built(dir);
  const before = snapshot(dist);
  const skill = join(dir, "pstack/skills/how/SKILL.md");
  writeFileSync(skill, readFileSync(skill, "utf8") + "\nUse `claude-unknown-99` via .cursor/new-tool.\n");
  for (const args of [[], ["--check"]]) {
    const result = run(dir, ...args);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /unported Cursor reference/);
    assert.deepEqual(snapshot(dist), before);
  }
});

test("the installed decision-log helper appends without losing earlier evidence", (t) => {
  const dir = fixture(t);
  const dist = built(dir);
  const log = join(dir, "decisions.tsv");
  writeFileSync(log, "");
  const helper = join(dist, "skills/pstack-show-me-your-work/scripts/log.sh");
  const append = (phase, decision) => {
    const result = spawnSync(helper, [log, phase, decision, "why", "evidence", "verified"], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  };
  append("start", "first run");
  const before = readFileSync(log, "utf8");
  append("audit", "=correction\twith\nnewlines");
  const after = readFileSync(log, "utf8");
  assert.ok(after.startsWith(before));
  const rows = after.trimEnd().split("\n");
  assert.equal(rows.length, 3);
  assert.equal(rows[0], "ts\tphase\tdecision\twhy\tevidence\tresult");
  assert.deepEqual(rows[2].split("\t").slice(1), ["audit", "'=correction with newlines", "why", "evidence", "verified"]);
});
