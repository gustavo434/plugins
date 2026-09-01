#!/usr/bin/env node
// Translate upstream Cursor plugins into a Codex plugin.
// Upstream directories are READ-ONLY. All host coupling lives in the rules below.
// Run: node codex-port/port.mjs [--check]

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, statSync, copyFileSync, chmodSync } from "node:fs";
import { resolve, dirname, relative, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const portDir = join(root, "codex-port");
const dist = join(portDir, "dist");
const runners = JSON.parse(readFileSync(join(portDir, "runners.json"), "utf8"));
const role = (r) => { const x = runners.roles[r]; return "`" + x.model + "` at effort `" + x.effort + "`"; };
const allow = readFileSync(join(portDir, "allow.txt"), "utf8")
  .split("\n").filter((l) => l.trim() && !l.startsWith("#")).map((l) => l.trim());

// Host-bound: depends on Cursor-hosted infrastructure with no Codex equivalent.
// make-bot-ui posts to api2.cursor.sh; pr-review-canvas renders into Cursor's Canvas UI.
const EXCLUDE = new Set(["pstack/make-bot-ui", "cursor-team-kit/pr-review-canvas"]);

const SOURCES = [
  { dir: "pstack", ns: "pstack" },
  { dir: "cursor-team-kit", ns: "team-kit" },
];

// ---------------------------------------------------------------- rules
// Each rule is [name, pattern, replacement]. Order matters: paths before words.
const RULES = [
  // 1. paths — longest and most specific FIRST; a bare rule that fires early corrupts a longer match
  ["transcripts-shell", /\$HOME\/\.cursor\/projects\/\$slug\/agent-transcripts/g, "$HOME/.codex/sessions"],
  ["transcripts-glob", /`?~\/\.cursor\/projects\/[^\s`]*?agent-transcripts[^\s`]*`?/g, "`~/.codex/sessions/`"],
  ["transcripts-angle", /<agent-transcripts>/g, "<~/.codex/sessions>"],
  ["transcripts-prose", /(?:the active workspace's )?`?agent-transcripts\/?`? directory/g,
    "Codex session log directory (`~/.codex/sessions/`, indexed by `~/.codex/session_index.jsonl`)"],
  ["transcripts-bare", /agent-transcripts\/?/g, "~/.codex/sessions/"],
  ["worktrees", /`?\.cursor\/worktrees\//g, "~/.codex/worktrees/"],
  ["skills-path-user", /~\/\.cursor\/skills\//g, "~/.codex/skills/"],
  ["skills-path-proj", /(?<!~\/)\.cursor\/skills\//g, ".codex/skills/"],
  ["models-rule-file", /~\/\.cursor\/rules\/pstack-models\.mdc/g, "~/.codex/pstack-runners.md"],
  ["rules-path", /~\/\.cursor\/rules\//g, "~/.codex/"],
  ["plugin-path", /~\/\.cursor\/plugins\//g, "~/.codex/plugins/cache/"],
  ["projects-path", /~\/\.cursor\/projects\//g, "~/.codex/sessions/"],

  // 2. delegation primitive -> single documented indirection (backticked forms before bare ones)
  ["sa-bt-general", /`subagent_type`: `generalPurpose`/g, "worker type: default (see references/host-delegation.md)"],
  ["sa-inline-general", /`subagent_type: generalPurpose`/g, "the default worker type"],
  ["sa-inline-quoted", /`subagent_type: "([^"]+)"`/g, "the `$1` worker"],
  ["sa-quoted", /subagent_type:\s*"([a-z0-9 -]+)"/gi, "the `$1` worker (see references/host-delegation.md)"],
  ["sa-bare", /`subagent_type`/g, "worker type"],
  ["task-spawn", /Spawn `Task` with /g, "Spawn a subagent with "],
  ["task-n-calls", /(\w+) `Task` calls/g, "$1 subagent spawns"],
  ["task-tool-poss", /the `?Task`? tool's/g, "the host's spawn"],
  ["task-tool-the", /the Task tool\b/g, "the host's subagent spawn (see references/host-delegation.md)"],
  ["task-tool", /\bTask tool\b/g, "subagent delegation primitive (see references/host-delegation.md)"],
  ["task-every", /\bevery `Task` call\b/g, "every subagent spawn (see references/host-delegation.md)"],
  ["task-subagent", /\ba `Task` subagent\b/g, "a subagent"],
  ["env-cloud", /`environment: "cloud"`/g, "a background subagent"],
  ["env-local", /`environment: "local"`/g, "a local subagent"],

  // 3. host built-ins
  ["babysit-not", /and not Cursor's built-in babysit skill/g, "and not any host built-in babysit skill"],
  ["babysit-ref", /Cursor's built-in \*\*babysit\*\* skill/g, "the `$team-kit:loop-on-ci` skill"],
  ["create-skill-paren-a", /Cursor's built-in `create-skill` \(authoring\)/g, "direct SKILL.md authoring"],
  ["create-skill-paren-b", /\(Cursor's built-in for authoring SKILL\.md files\)/g, "(author the SKILL.md directly)"],
  ["create-skill-ref", /Cursor's built-in `?create-skill`? skill/g, "direct SKILL.md authoring"],
  ["deslop-full", /the `deslop` skill from the `cursor-team-kit` plugin \(`\/deslop`\)/g, "the `$team-kit:deslop` skill"],
  ["deslop-run", /Run `\/deslop` from `cursor-team-kit`/g, "Run `$team-kit:deslop`"],
  ["tk-skill-from", /`([a-z-]+)` (?:skill )?from (?:the )?`cursor-team-kit`(?: plugin)?/g, "`$team-kit:$1`"],
  ["tk-publishes", /`cursor-team-kit` publishes/g, "`team-kit` skills in this plugin provide"],
  ["tk-bare", /`cursor-team-kit` plugin/g, "the team-kit skills in this plugin"],
  ["loop-cmd", /Cursor's `\/loop` command \(a built-in, not a pstack skill\)/g,
    "a Codex automation (`~/.codex/automations/`, rrule-scheduled) or a shell wake loop"],
  ["loop-cursors", /Cursor's `\/loop` command/g, "a Codex automation"],
  ["loop-bare", /`\/loop`/g, "a Codex automation"],
  ["cursor-env", /the Cursor environment/g, "the Codex environment"],
  ["cursor-mcps", /the `mcps\/` directory Cursor exposes/g, "the MCP servers configured in `~/.codex/config.toml`"],
  ["cursor-restart", /a Cursor restart/g, "a Codex restart"],
  ["cursor-planmode", /Cursor already has a great plan mode/g, "Codex has a planning mode"],
  ["cursor-cloud", /(?:one |a )?Cursor cloud agents?/g, "a Codex subagent"],
  ["cursor-chats", /recent Cursor chats/g, "recent Codex sessions"],
  ["cursor-models-api", /If Cursor also exposes a models API or CLI/g, "If the host exposes a models API or CLI"],
  ["restart-cursor", /restart Cursor/g, "restart Codex"],
  ["cursor-appsupport", /Application Support\/Cursor/g, "Application Support/Codex"],
  ["tk-paren", /\(from `cursor-team-kit`\)/g, "(team-kit skills in this plugin)"],
  ["cursor-dashboard", /the cloud agent's status in the Cursor dashboard/g, "the subagent's status reported by the host"],
  ["babysit-builtin2", /Cursor's built-in babysit skill/g, "any host built-in babysit skill"],
  ["askquestion", /`AskQuestion`/g, "a direct question to the user"],

  // 4. models -> runner roles
  ["m-grok-fast", /`?grok-4\.6-fast-xhigh`?/g, () => role("fast")],
  ["m-fable-max", /`?claude-fable-5-thinking-max`?/g, () => role("judgment")],
  ["m-opus5-xhigh", /`?claude-opus-5-thinking-xhigh`?/g, () => role("judgment")],
  ["m-sol-max", /`?gpt-5\.6-sol-max`?/g, () => role("code-exact")],
  ["m-composer", /`?composer-2\.5-fast`?/g, () => role("fast")],
  ["m-opus48", /`?claude-opus-4-8-thinking-xhigh`?/g, () => role("judgment")],
  ["m-gpt55fast", /`?gpt-5\.5-high-fast`?/g, () => role("code")],
];

// ---------------------------------------------------------------- guard
const DENY = [
  [/\.cursor\//, "unported .cursor/ path"],
  [/\.mdc\b/, "Cursor .mdc rule file"],
  [/\b(?:claude|grok|gemini|llama|mistral|composer)-[a-z0-9.]+(?:-[a-z0-9]+)*\b/i, "non-Codex vendor model slug"],
  [/subagent_type/, "raw Cursor subagent primitive"],
  [/agent-transcripts/, "Cursor transcript path"],
  [/Cursor's built-in/, "unmapped Cursor built-in"],
  [/\bCanvas\b/, "Cursor Canvas UI surface"],
  [/\bcursor\b/i, "bare Cursor reference"],
];

function guard(text, file) {
  const hits = [];
  text.split("\n").forEach((line, i) => {
    if (allow.some((a) => line.toLowerCase().includes(a.toLowerCase()))) return;
    for (const [re, why] of DENY) {
      if (re.test(line)) { hits.push({ file, line: i + 1, why, text: line.trim().slice(0, 110) }); break; }
    }
  });
  return hits;
}

// ---------------------------------------------------------------- transform
function splitFrontmatter(src) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(src);
  return m ? { fm: m[1], body: src.slice(m[0].length) } : { fm: null, body: src };
}

function translate(src) {
  let out = src;
  for (const [, pattern, replacement] of RULES) {
    out = out.replace(pattern, typeof replacement === "function" ? replacement() : replacement);
  }
  return out;
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

// ---------------------------------------------------------------- run
// Prose is translated. Everything else (TypeScript, JSON, lockfiles, the
// watch-pr executable) is copied verbatim: rewriting code with prose rules
// corrupts it. Non-prose files are scanned advisory-only.
const TRANSLATABLE = /\.(md|sh)$/;

const checkOnly = process.argv.includes("--check");
if (!checkOnly) { rmSync(dist, { recursive: true, force: true }); mkdirSync(dist, { recursive: true }); }

let violations = [], advisory = [], skills = 0, overrides = 0, files = 0, verbatim = 0;

for (const { dir, ns } of SOURCES) {
  for (const src of walk(join(root, dir, "skills"))) {
    const rel = relative(join(root, dir, "skills"), src);
    const skillName = rel.split("/")[0];
    if (EXCLUDE.has(`${dir}/${skillName}`)) continue;
    const outRel = join("skills", `${ns}-${skillName}`, rel.split("/").slice(1).join("/") || "SKILL.md");
    const outPath = join(dist, outRel);

    // non-prose: copy bytes, preserve the exec bit, never translate
    if (!TRANSLATABLE.test(src)) {
      verbatim++; files++;
      if (!checkOnly) {
        mkdirSync(dirname(outPath), { recursive: true });
        copyFileSync(src, outPath);
        chmodSync(outPath, statSync(src).mode & 0o777);
      }
      try {
        const t = readFileSync(src, "utf8");
        if (/\.cursor\/|cursor\.sh|Cursor/i.test(t)) advisory.push(outRel);
      } catch { /* binary */ }
      continue;
    }

    // overrides win verbatim — that's where judgment lives, not in the rules
    const ovr = join(portDir, "overrides", ns, rel);
    let text, isOverride = false;
    if (existsSync(ovr)) { text = readFileSync(ovr, "utf8"); isOverride = true; overrides++; }
    else text = translate(readFileSync(src, "utf8"));

    if (src.endsWith("SKILL.md")) {
      skills++;
      const { fm, body } = splitFrontmatter(text);
      if (fm !== null) {
        const explicitOnly = /^disable-model-invocation:\s*true\s*$/m.test(fm);
        const cleanFm = fm.split("\n")
          .filter((l) => !/^(disable-model-invocation|mode|icon|color):/.test(l)).join("\n");
        text = `---\n${cleanFm}\n---\n${body}`;
        if (explicitOnly && !checkOnly) {
          const y = join(dirname(outPath), "agents", "openai.yaml");
          mkdirSync(dirname(y), { recursive: true });
          writeFileSync(y, "policy:\n  allow_implicit_invocation: false\n");
        }
      }
    }

    if (!isOverride) violations.push(...guard(text, outRel));
    files++;
    if (!checkOnly) { mkdirSync(dirname(outPath), { recursive: true }); writeFileSync(outPath, text); }
  }
}

if (!checkOnly) {
  mkdirSync(join(dist, ".codex-plugin"), { recursive: true });
  writeFileSync(join(dist, ".codex-plugin", "plugin.json"), JSON.stringify({
    name: "pstack", version: "0.1.0",
    description: "Upstream pstack + cursor-team-kit, mechanically translated for Codex. Generated by codex-port/port.mjs — do not hand-edit.",
    license: "MIT", skills: "./skills/",
  }, null, 2) + "\n");
  mkdirSync(join(dist, "references"), { recursive: true });
  writeFileSync(join(dist, "references", "host-delegation.md"),
    readFileSync(join(portDir, "host-delegation.md"), "utf8"));
}

console.log(`${files} files · ${skills} skills · ${verbatim} copied verbatim · ${overrides} from overrides`);
if (advisory.length) {
  console.log(`\nnote: ${advisory.length} non-prose file(s) mention Cursor and were copied untranslated:`);
  for (const f of advisory.slice(0, 10)) console.log(`  ${f}`);
}
if (violations.length) {
  console.error(`\n${violations.length} unported Cursor reference(s) — build is NOT clean:\n`);
  const byFile = {};
  for (const v of violations) (byFile[v.file] ??= []).push(v);
  for (const [f, vs] of Object.entries(byFile).slice(0, 40)) {
    console.error(`  ${f}`);
    for (const v of vs.slice(0, 3)) console.error(`    :${v.line}  ${v.why}\n      ${v.text}`);
    if (vs.length > 3) console.error(`    … ${vs.length - 3} more`);
  }
  console.error(`\nFix by adding a rule to port.mjs, or a verbatim file under codex-port/overrides/.`);
  process.exit(1);
}
console.log("clean — no unported Cursor references");
