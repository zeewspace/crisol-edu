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
  console.log(`[edu-score] ${semaforo(final)} ${result.grade} — indicación local (usá --full para 0-10)`);
  console.log(`  S ${semaforo(s.score)} ${tipFor("S", s.score)}`);
  console.log(`  P ${semaforo(p.score)} ${tipFor("P", p.score)}`);
  console.log(`  C ${semaforo(c.score)} ${tipFor("C", c.score)}`);
  console.log(`  O ${semaforo(o.score)} ${tipFor("O", o.score)}`);
  console.log(`  Detalle completo en ${outPath}`);
}

// --- HTML report (como testing automatizado) ---
try {
  const reportPath = ".crisol/results/edu-report.html";
  if (reportPath === outPath) {
    // fallback if out doesn't end with .json
    // keep default
  }
  const htmlOut = reportPath.endsWith(".html") ? reportPath : ".crisol/results/edu-report.html";
  let history = [];
  const hp2 = ".crisol/history/history.ndjson";
  if (existsSync(hp2)) {
    try { history = readFileSync(hp2, "utf8").trim().split("\n").filter(Boolean).map(l=>JSON.parse(l)).slice(-10); } catch {}
  }
  function colorFor(f){ if(f>=9) return "var(--success)"; if(f>=7) return "var(--info)"; if(f>=5) return "var(--warning)"; return "var(--danger)"; }
  function pct(f){ return Math.round((f/10)*100); }
  const rows = deductions.length ? deductions.map(d=>`<tr class="border-t" style="border-color:var(--hairline)"><td class="px-3 py-2 font-mono text-xs">${d.category}</td><td class="px-3 py-2 text-xs"><span class="rounded-full px-2 py-0.5 text-[10px] ${d.severity==='Critical'?'bg-[var(--danger-soft)] text-[var(--danger)]':d.severity==='Major'?'bg-[var(--warning-soft)] text-[var(--warning)]':'bg-[var(--muted)]'}">${d.severity}</span></td><td class="px-3 py-2 font-mono text-xs">${d.rule}</td><td class="px-3 py-2 font-mono text-xs">${d.file}:${d.line}</td><td class="px-3 py-2 text-xs">${d.message}</td><td class="px-3 py-2 text-xs text-[var(--muted-foreground)]">${d.fix||""}</td></tr>`).join("") : `<tr><td colspan="6" class="px-3 py-6 text-center text-sm text-[var(--faint)]">Sin deducciones — excelente. Mantené el estándar.</td></tr>`;
  const hbars = history.length ? history.map(h=>`<div class="flex items-center gap-2 text-xs"><span class="w-20 font-mono text-[10px] text-[var(--faint)]">${new Date(h.timestamp).toLocaleDateString("es-AR")}</span><div class="h-2 flex-1 rounded-full bg-[var(--muted)]"><div class="h-2 rounded-full" style="width:${pct(h.final)}%; background:${colorFor(h.final)}"></div></div><span class="w-8 font-mono">${h.final}</span><span class="text-[10px]">${h.grade}</span></div>`).join("") : `<p class="text-xs text-[var(--faint)]">Sin historial aún. Corré <code class="font-mono">npm run edu:score -- --full --history</code> varias veces.</p>`;
  const html = `<!doctype html><html lang="es" class="dark"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Crisol Report — ${final}/10 ${result.grade} ${semaforo(final)}</title><link rel="stylesheet" href="../../site/tokens.css"/><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"><script src="https://cdn.tailwindcss.com"><\/script><script>tailwind.config={darkMode:'class',theme:{extend:{fontFamily:{sans:['Inter','sans-serif'],display:['Poppins','sans-serif'],mono:['JetBrains Mono','monospace']},colors:{background:'var(--background)',foreground:'var(--foreground)',card:'var(--card)',border:'var(--border)',muted:'var(--muted)','muted-foreground':'var(--muted-foreground)'},boxShadow:{card:'var(--shadow-card)',glow:'var(--shadow-glow)'}}}}</script><style>body{background:var(--background);color:var(--foreground);font-family:Inter,sans-serif} .gradient-cosmic{background:var(--gradient-cosmic)} .hairline{border-color:var(--hairline)} .shadow-card{box-shadow:var(--shadow-card)}</style></head><body class="min-h-screen antialiased"><header class="border-b hairline bg-[var(--hull)]/80 backdrop-blur"><div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"><div class="flex items-center gap-3"><div class="grid h-8 w-8 place-items-center rounded-lg gradient-cosmic text-xs font-bold text-[var(--cta-foreground)]">◆</div><span class="font-display text-sm font-semibold">crisol-edu</span><span class="rounded-full bg-[var(--cta-soft)] px-2 py-0.5 text-[10px] tracking-widest text-[var(--cta)]">${result.mode}</span><span class="text-xs text-[var(--faint)]">${new Date().toLocaleString("es-AR")}</span></div><span class="rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-[var(--primary-foreground)]">${semaforo(final)} ${final}/10 — ${result.grade}</span></div></header><main class="mx-auto max-w-6xl px-6 py-8"><div class="rounded-2xl border hairline bg-[var(--card)] p-6 shadow-card"><div class="flex flex-wrap items-start justify-between gap-4"><div><p class="font-mono text-xs tracking-widest text-[var(--faint)]">FINAL</p><p class="font-display text-5xl font-bold">${final}<span class="text-2xl text-[var(--muted-foreground)]">/10</span> <span class="text-2xl">${semaforo(final)}</span></p><p class="text-sm text-[var(--muted-foreground)]">${result.grade} · (S+P+C+O)/4 · Fuente <a href="../../docs/edu-rubric.md" class="underline">docs/edu-rubric.md</a></p></div><div class="text-right"><p class="font-mono text-xs text-[var(--faint)]">MODO ${result.mode} · PREFIJO edu-</p><p class="font-mono text-xs text-[var(--faint)]">${outPath} → ${htmlOut}</p><p class="mt-1 text-xs text-[var(--muted-foreground)]">${deductions.length} deducciones total</p></div></div><div class="mt-6 grid gap-3 md:grid-cols-4">${[["S",s.score,"Security"],["P",p.score,"Performance"],["C",c.score,"Clean Code"],["O",o.score,"Organization"]].map(([k,v,l])=>`<div class="rounded-xl border hairline bg-[var(--muted)]/30 p-4"><p class="font-mono text-[10px] tracking-widest text-[var(--faint)]">${k}</p><p class="font-display text-xl font-semibold">${v}<span class="text-sm text-[var(--muted-foreground)]">/10</span> <span>${semaforo(v)}</span></p><div class="mt-2 h-1.5 rounded-full bg-[var(--muted)]"><div class="h-1.5 rounded-full" style="width:${pct(v)}%; background:${colorFor(v)}"></div></div><p class="mt-1 text-xs text-[var(--muted-foreground)]">${l}</p></div>`).join("")}</div></div><div class="mt-6 rounded-2xl border hairline bg-[var(--card)] shadow-card overflow-hidden"><div class="border-b hairline px-6 py-4"><h2 class="font-semibold">Deducciones</h2><p class="text-xs text-[var(--muted-foreground)]">Critical −3 · Major −1.5 · Minor −0.5 — cada fila trae <code class="font-mono text-xs">file:line</code> + fix.</p></div><div class="overflow-x-auto"><table class="w-full text-left text-sm"><thead class="bg-[var(--muted)]/40 text-xs tracking-widest text-[var(--faint)]"><tr><th class="px-3 py-2">Eje</th><th class="px-3 py-2">Sev</th><th class="px-3 py-2">Regla</th><th class="px-3 py-2">File:Line</th><th class="px-3 py-2">Mensaje</th><th class="px-3 py-2">Fix</th></tr></thead><tbody>${rows}</tbody></table></div></div><div class="mt-6 grid gap-4 md:grid-cols-2"><div class="rounded-2xl border hairline bg-[var(--card)] p-5 shadow-card"><h3 class="font-semibold text-sm">Historial (últimos 10)</h3><p class="text-xs text-[var(--muted-foreground)]">De <code class="font-mono text-xs">.crisol/history/history.ndjson</code> — local-first.</p><div class="mt-3 space-y-1.5">${hbars}</div></div><div class="rounded-2xl border hairline bg-[var(--card)] p-5 shadow-card"><h3 class="font-semibold text-sm">Glosario rápido</h3><dl class="mt-2 space-y-2 text-xs"><div><dt class="font-mono font-semibold">/edu vs /edu --quick</dt><dd class="text-[var(--muted-foreground)]">Sin flag → full 0-10. Con <code class="font-mono text-xs">--quick</code> → semáforo.</dd></div><div><dt class="font-mono font-semibold">Conventional Commits</dt><dd class="text-[var(--muted-foreground)]"><code class="font-mono text-xs">feat(todo): ...</code> no <code class="font-mono text-xs">arreglado</code>.</dd></div><div><dt class="font-mono font-semibold">.crisol</dt><dd class="text-[var(--muted-foreground)]">Cache local — ver <code class="font-mono text-xs">.crisol/README.md</code>.</dd></div></dl><p class="mt-3 text-xs"><a href="../../site/index.html" class="underline">Landing con glosario completo →</a> · <a href="../../docs/edu-rubric.md" class="underline">Rubric →</a></p></div></div><p class="mt-6 text-center font-mono text-xs text-[var(--faint)]">Generado por <code>edu-score.mjs</code> desde <code>${outPath}</code> · <a href="https://github.com/zeewspace/crisol-edu" class="underline">zeewspace/crisol-edu</a> · Advisory</p></main></body></html>`;
  mkdirSync(dirname(htmlOut), { recursive: true });
  writeFileSync(htmlOut, html);
  console.log(`[edu-report] wrote ${htmlOut}`);
} catch (e) {
  console.warn(`[edu-report] skip html: ${e.message}`);
}
