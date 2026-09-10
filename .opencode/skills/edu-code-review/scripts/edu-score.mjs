#!/usr/bin/env node
// edu-score.mjs — helper scorer for edu-code-review (advisory)
// Usage: node ./scripts/edu-score.mjs [--deductions path.json] [--out edu-score.json]
// If no deductions file, emits a placeholder 0/0/0/0 (CI fills real values).

import { writeFileSync, readFileSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};

const deductionsPath = getArg("--deductions", null);
const outPath = getArg("--out", "edu-score.json");

let deductions = [];
if (deductionsPath && existsSync(deductionsPath)) {
  try {
    deductions = JSON.parse(readFileSync(deductionsPath, "utf8"));
  } catch (e) {
    console.warn(`[edu-score] could not parse ${deductionsPath}: ${e.message}`);
  }
}

function scoreFor(category) {
  const cats = deductions.filter((d) => d.category === category);
  const critical = cats.filter((d) => d.severity === "Critical").length;
  const major = cats.filter((d) => d.severity === "Major").length;
  const minor = cats.filter((d) => d.severity === "Minor").length;
  let s = 10 - critical * 3 - major * 1.5 - minor * 0.5;
  s = Math.max(0, Math.min(10, s));
  // step 0.5
  s = Math.round(s * 2) / 2;
  return { score: s, critical, major, minor };
}

const s = scoreFor("S");
const p = scoreFor("P");
const c = scoreFor("C");
const o = scoreFor("O");
const finalRaw = (s.score + p.score + c.score + o.score) / 4;
const final = Math.round(finalRaw * 2) / 2;

function gradeFor(f) {
  if (f >= 9) return "Excelente";
  if (f >= 7) return "Bueno";
  if (f >= 5) return "Aprobado con deuda";
  return "Reprobado";
}

const result = {
  security: s.score,
  performance: p.score,
  cleanCode: c.score,
  organization: o.score,
  final,
  grade: gradeFor(final),
  deductions,
  meta: {
    rubric: "docs/edu-rubric.md",
    skill: "edu-code-review",
    mode: "advisory",
    prefix: "edu-",
  },
};

writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log(`[edu-score] wrote ${outPath}: Final ${final}/10 — ${result.grade}`);
console.log(`  S ${s.score} (C×${s.critical} M×${s.major} m×${s.minor})`);
console.log(`  P ${p.score} (C×${p.critical} M×${p.major} m×${p.minor})`);
console.log(`  C ${c.score} (C×${c.critical} M×${c.major} m×${c.minor})`);
console.log(`  O ${o.score} (C×${o.critical} M×${o.major} m×${o.minor})`);
