#!/usr/bin/env node
// edu-score.mjs — helper scorer for edu-code-review (advisory, local-first)
// Usage:
//   node ./scripts/edu-score.mjs          # full 0-10 por defecto (para /edu)
//   node ./scripts/edu-score.mjs --quick  # indicación semáforo (local rápido)
//   node ./scripts/edu-score.mjs --deductions path.json   # con deducciones
//   node ./scripts/edu-score.mjs --out custom.json        # custom out
//   node ./scripts/edu-score.mjs --history                # append a .crisol/history/history.ndjson
// Default: full 0-10; --quick para semáforo. Out -> .crisol/results/edu-score.json (gitignored)

import { writeFileSync, readFileSync, existsSync, mkdirSync, appendFileSync } from "node:fs";
import { dirname } from "node:path";

const args = process.argv.slice(2);
const has = (name) => args.includes(name);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : def;
};

const deductionsPath = getArg("--deductions", null);
const outPath = getArg("--out", ".crisol/results/edu-score.json");
const hasQuick = has("--quick");
const hasFull = has("--full");
const fullMode = hasQuick ? false : true; // /edu full por defecto, --quick para indicación
const historyFlag = getArg("--history", has("--history") ? ".crisol/history/history.ndjson" : null);

let deductions = [];
if (deductionsPath && existsSync(deductionsPath)) {
  try {
    deductions = JSON.parse(readFileSync(deductionsPath, "utf8"));
    if (!Array.isArray(deductions)) deductions = deductions.deductions || [];
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
function semaforo(f) {
  if (f >= 7) return "🟢";
  if (f >= 5) return "🟡";
  return "🔴";
}
function tipFor(cat, score) {
  if (score >= 9) return "sin deuda — mantené";
  if (cat === "S") return "revisá validación/zod y secretos";
  if (cat === "P") return "revisá paginación/batching";
  if (cat === "C") return "partí funciones, inglés en lógica";
  if (cat === "O") return "ordená por feature, commits atómicos";
  return "1 fix por eje";
}

const result = {
  security: s.score,
  performance: p.score,
  cleanCode: c.score,
  organization: o.score,
  final,
  grade: gradeFor(final),
  mode: fullMode ? "full" : "indication",
  deductions,
  meta: {
    rubric: "docs/edu-rubric.md",
    skill: "edu-code-review",
    mode: fullMode ? "full" : "indication",
    prefix: "edu-",
    resultsPath: outPath,
    historyPath: historyFlag || null,
  },
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(result, null, 2));

if (historyFlag) {
  const hp = typeof historyFlag === "string" ? historyFlag : ".crisol/history/history.ndjson";
  mkdirSync(dirname(hp), { recursive: true });
  const entry = {
    timestamp: new Date().toISOString(),
    final,
    grade: result.grade,
    security: s.score,
    performance: p.score,
    cleanCode: c.score,
    organization: o.score,
    deductionsCount: deductions.length,
  };
  appendFileSync(hp, JSON.stringify(entry) + "\n");
  console.log(`[edu-score] appended history → ${hp}`);
}

if (fullMode) {
  console.log(`[edu-score] wrote ${outPath}: Final ${final}/10 — ${result.grade} ${semaforo(final)}`);
  console.log(`  S ${s.score} (C×${s.critical} M×${s.major} m×${s.minor}) — ${tipFor("S", s.score)}`);
  console.log(`  P ${p.score} (C×${p.critical} M×${p.major} m×${p.minor}) — ${tipFor("P", p.score)}`);
  console.log(`  C ${c.score} (C×${c.critical} M×${c.major} m×${c.minor}) — ${tipFor("C", c.score)}`);
  console.log(`  O ${o.score} (C×${o.critical} M×${o.major} m×${o.minor}) — ${tipFor("O", o.score)}`);
} else {
  // indicación local: semáforo + 1 tip por eje, sin volcar 0-10 si no se pide
  console.log(`[edu-score] ${semaforo(final)} ${result.grade} — indicación local (usá --full para 0-10)`);
  console.log(`  S ${semaforo(s.score)} ${tipFor("S", s.score)}`);
  console.log(`  P ${semaforo(p.score)} ${tipFor("P", p.score)}`);
  console.log(`  C ${semaforo(c.score)} ${tipFor("C", c.score)}`);
  console.log(`  O ${semaforo(o.score)} ${tipFor("O", o.score)}`);
  console.log(`  Detalle completo en ${outPath}`);
}
