#!/usr/bin/env node
/**
 * SaturnSwap Agent Skills — Validation Script
 *
 * Checks that all skills have valid structure:
 * - SKILL.md exists with valid YAML frontmatter (name + description)
 * - scripts/ directory exists and contains .js files
 * - Core shared files exist
 * - No broken imports in scripts
 */

import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dirname, "..");
let errors = 0;
let warnings = 0;

function error(msg) {
  console.error(`  ERROR: ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`  WARN:  ${msg}`);
  warnings++;
}

function ok(msg) {
  console.log(`  OK:    ${msg}`);
}

// ─── Check shared files ──────────────────────────────────────────────────────

console.log("\n=== Shared Files ===");
for (const f of ["shared/saturnswap-api.md", "shared/signing-flow.md", "scripts/saturnswap-client.js", "scripts/saturnswap-signer.js", "package.json"]) {
  const path = join(ROOT, f);
  if (existsSync(path)) {
    ok(f);
  } else {
    error(`Missing: ${f}`);
  }
}

// ─── Check each skill ────────────────────────────────────────────────────────

const skillsDir = join(ROOT, "skills");
const skills = readdirSync(skillsDir).filter((d) =>
  statSync(join(skillsDir, d)).isDirectory()
);

console.log(`\n=== Skills (${skills.length}) ===`);

for (const skill of skills) {
  console.log(`\n--- ${skill} ---`);
  const skillDir = join(skillsDir, skill);

  // Check SKILL.md
  const skillMd = join(skillDir, "SKILL.md");
  if (!existsSync(skillMd)) {
    error("Missing SKILL.md");
    continue;
  }

  const content = readFileSync(skillMd, "utf-8");

  // Check YAML frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    error("SKILL.md missing YAML frontmatter (---...---)");
  } else {
    const fm = fmMatch[1];
    if (!fm.includes("name:")) error("Frontmatter missing 'name' field");
    else ok("name field present");

    if (!fm.includes("description:")) error("Frontmatter missing 'description' field");
    else ok("description field present");

    if (!fm.includes("version:")) warn("Frontmatter missing 'version' field");
    else ok("version field present");
  }

  // Check scripts directory
  const scriptsDir = join(skillDir, "scripts");
  if (!existsSync(scriptsDir)) {
    warn("No scripts/ directory");
    continue;
  }

  const scripts = readdirSync(scriptsDir).filter((f) => f.endsWith(".js"));
  if (scripts.length === 0) {
    warn("scripts/ directory is empty");
  } else {
    ok(`${scripts.length} script(s): ${scripts.join(", ")}`);
  }

  // Check imports in scripts
  for (const script of scripts) {
    const scriptPath = join(scriptsDir, script);
    const scriptContent = readFileSync(scriptPath, "utf-8");
    const imports = scriptContent.match(/from\s+"([^"]+)"/g) || [];
    for (const imp of imports) {
      const modPath = imp.match(/from\s+"([^"]+)"/)[1];
      if (modPath.startsWith(".") || modPath.startsWith("/")) {
        const resolved = join(scriptsDir, modPath);
        // Handle .js extension
        const checkPath = resolved.endsWith(".js") ? resolved : `${resolved}.js`;
        if (!existsSync(checkPath) && !existsSync(resolved)) {
          error(`${script}: broken import "${modPath}"`);
        }
      }
    }
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log("\n=== Summary ===");
console.log(`Skills: ${skills.length}`);
console.log(`Errors: ${errors}`);
console.log(`Warnings: ${warnings}`);

if (errors > 0) {
  console.error("\nValidation FAILED");
  process.exit(1);
} else {
  console.log("\nValidation PASSED");
}
