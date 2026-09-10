#!/usr/bin/env node
// edu-report.mjs — genera HTML desde edu-score.json (como reportes de testing)
// Usage: node ./scripts/edu-report.mjs [--in .crisol/results/edu-score.json] [--out .crisol/results/edu-report.html]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const getArg = (name, def) => {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : def;
};
const inPath = getArg("--in", ".crisol/results/edu-score.json");
const outPath = getArg("--out", ".crisol/results/edu-report.html");

if (!existsSync(inPath)) {
  console.error(`[edu-report] no existe ${inPath} — corré primero: npm run edu`);
  process.exit(1);
}
const data = JSON.parse(readFileSync(inPath, "utf8"));
const { security, performance, cleanCode, organization, final, grade, deductions = [], meta = {} } = data;

// history
let history = [];
const historyPath = ".crisol/history/history.ndjson";
if (existsSync(historyPath)) {
  try {
    history = readFileSync(historyPath, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)).slice(-10);
  } catch {}
}

function semaforo(f) { if (f >= 7) return "🟢"; if (f >= 5) return "🟡"; return "🔴"; }
function colorFor(f) { if (f >= 9) return "var(--success)"; if (f >= 7) return "var(--info)"; if (f >= 5) return "var(--warning)"; return "var(--danger)"; }
function pct(f) { return Math.round((f / 10) * 100); }

const deductionsRows = deductions.length
  ? deductions.map(d => `<tr class="border-t" style="border-color:var(--hairline)"><td class="px-3 py-2 font-mono text-xs">${d.category}</td><td class="px-3 py-2 text-xs"><span class="rounded-full px-2 py-0.5 text-[10px] ${d.severity==='Critical'?'bg-[var(--danger-soft)] text-[var(--danger)]': d.severity==='Major'?'bg-[var(--warning-soft)] text-[var(--warning)]':'bg-[var(--muted)]'}">${d.severity}</span></td><td class="px-3 py-2 font-mono text-xs">${d.rule}</td><td class="px-3 py-2 font-mono text-xs">${d.file}:${d.line}</td><td class="px-3 py-2 text-xs">${d.message}</td><td class="px-3 py-2 text-xs text-[var(--muted-foreground)]">${d.fix || ""}</td></tr>`).join("")
  : `<tr><td colspan="6" class="px-3 py-6 text-center text-sm text-[var(--faint)]">Sin deducciones — excelente. Mantené el estándar.</td></tr>`;

const historyBars = history.length
  ? history.map(h => `<div class="flex items-center gap-2 text-xs"><span class="w-20 font-mono text-[10px] text-[var(--faint)]">${new Date(h.timestamp).toLocaleDateString("es-AR")}</span><div class="h-2 flex-1 rounded-full bg-[var(--muted)]"><div class="h-2 rounded-full" style="width:${pct(h.final)}%; background:${colorFor(h.final)}"></div></div><span class="w-8 font-mono">${h.final}</span><span class="text-[10px]">${h.grade}</span></div>`).join("")
  : `<p class="text-xs text-[var(--faint)]">Sin historial aún. Corré <code class="font-mono">npm run edu:score -- --full --history</code> varias veces y aparecerá acá. Ver <code class="font-mono text-xs">docs/examples/crisol-history.sample.ndjson</code>.</p>`;

const html = `<!doctype html>
<html lang="es" class="dark">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Crisol Report — ${final}/10 ${grade} ${semaforo(final)}</title>
<link rel="stylesheet" href="../../site/tokens.css" onerror="this.href='../site/tokens.css'" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={darkMode:'class',theme:{extend:{fontFamily:{sans:['Inter','sans-serif'],display:['Poppins','sans-serif'],mono:['JetBrains Mono','monospace']},colors:{background:'var(--background)',foreground:'var(--foreground)',card:'var(--card)',border:'var(--border)',muted:'var(--muted)','muted-foreground':'var(--muted-foreground)'},boxShadow:{card:'var(--shadow-card)',glow:'var(--shadow-glow)'}}}}</script>
<style>body{background:var(--background);color:var(--foreground);font-family:Inter,sans-serif} .gradient-cosmic{background:var(--gradient-cosmic)} .text-gradient{background:var(--gradient-sequence);-webkit-background-clip:text;-webkit-text-fill-color:transparent} .hairline{border-color:var(--hairline)} .shadow-card{box-shadow:var(--shadow-card)}</style>
</head>
<body class="min-h-screen antialiased">
<header class="border-b hairline bg-[var(--hull)]/80 backdrop-blur">
  <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
    <div class="flex items-center gap-3">
      <div class="grid h-8 w-8 place-items-center rounded-lg gradient-cosmic text-xs font-bold text-[var(--cta-foreground)]">◆</div>
      <span class="font-display text-sm font-semibold">crisol-edu</span>
      <span class="rounded-full bg-[var(--cta-soft)] px-2 py-0.5 text-[10px] tracking-widest text-[var(--cta)]">${meta.mode || "full"}</span>
      <span class="text-xs text-[var(--faint)]">${new Date().toLocaleString("es-AR")}</span>
    </div>
    <span class="rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-[var(--primary-foreground)]">${semaforo(final)} ${final}/10 — ${grade}</span>
  </div>
</header>

<main class="mx-auto max-w-6xl px-6 py-8">
  <!-- Hero score -->
  <div class="rounded-2xl border hairline bg-[var(--card)] p-6 shadow-card">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="font-mono text-xs tracking-widest text-[var(--faint)]">FINAL</p>
        <p class="font-display text-5xl font-bold">${final}<span class="text-2xl text-[var(--muted-foreground)]">/10</span> <span class="text-2xl">${semaforo(final)}</span></p>
        <p class="text-sm text-[var(--muted-foreground)]">${grade} · (S+P+C+O)/4 · Fuente <a href="../../docs/edu-rubric.md" class="underline">docs/edu-rubric.md</a></p>
      </div>
      <div class="text-right">
        <p class="font-mono text-xs text-[var(--faint)]">MODO ${meta.mode || "full"} · PREFIJO edu-</p>
        <p class="font-mono text-xs text-[var(--faint)]">${inPath} → ${outPath}</p>
        <p class="mt-1 text-xs text-[var(--muted-foreground)]">${deductions.length} deducciones total</p>
      </div>
    </div>
    <div class="mt-6 grid gap-3 md:grid-cols-4">
      ${[["S",security,"Security","R1"],["P",performance,"Performance","R4"],["C",cleanCode,"Clean Code","R2"],["O",organization,"Organization","R2"]].map(([k,v,label,lens]) => `
      <div class="rounded-xl border hairline bg-[var(--muted)]/30 p-4">
        <p class="font-mono text-[10px] tracking-widest text-[var(--faint)]">${k} · ${lens}</p>
        <p class="font-display text-xl font-semibold">${v}<span class="text-sm text-[var(--muted-foreground)]">/10</span> <span>${semaforo(v)}</span></p>
        <div class="mt-2 h-1.5 rounded-full bg-[var(--muted)]"><div class="h-1.5 rounded-full" style="width:${pct(v)}%; background:${colorFor(v)}"></div></div>
        <p class="mt-1 text-xs text-[var(--muted-foreground)]">${label}</p>
      </div>`).join("")}
    </div>
  </div>

  <!-- Deducciones -->
  <div class="mt-6 rounded-2xl border hairline bg-[var(--card)] shadow-card overflow-hidden">
    <div class="border-b hairline px-6 py-4">
      <h2 class="font-semibold">Deducciones</h2>
      <p class="text-xs text-[var(--muted-foreground)]">Critical −3 · Major −1.5 · Minor −0.5 — cada fila trae <code class="font-mono text-xs">file:line</code> + fix. Ver <a href="../../docs/edu-rubric.md" class="underline">rubric</a>.</p>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-[var(--muted)]/40 text-xs tracking-widest text-[var(--faint)]"><tr><th class="px-3 py-2">Eje</th><th class="px-3 py-2">Sev</th><th class="px-3 py-2">Regla</th><th class="px-3 py-2">File:Line</th><th class="px-3 py-2">Mensaje</th><th class="px-3 py-2">Fix</th></tr></thead>
        <tbody>${deductionsRows}</tbody>
      </table>
    </div>
  </div>

  <!-- Historial -->
  <div class="mt-6 grid gap-4 md:grid-cols-2">
    <div class="rounded-2xl border hairline bg-[var(--card)] p-5 shadow-card">
      <h3 class="font-semibold text-sm">Historial (últimos 10)</h3>
      <p class="text-xs text-[var(--muted-foreground)]">De <code class="font-mono text-xs">.crisol/history/history.ndjson</code> — local-first, gitignored.</p>
      <div class="mt-3 space-y-1.5">${historyBars}</div>
    </div>
    <div class="rounded-2xl border hairline bg-[var(--card)] p-5 shadow-card">
      <h3 class="font-semibold text-sm">Glosario rápido</h3>
      <dl class="mt-2 space-y-2 text-xs">
        <div><dt class="font-mono font-semibold">/edu vs /edu --quick</dt><dd class="text-[var(--muted-foreground)]">Sin flag → full 0-10. Con <code class="font-mono text-xs">--quick</code> → semáforo + 1 tip por eje.</dd></div>
        <div><dt class="font-mono font-semibold">Conventional Commits</dt><dd class="text-[var(--muted-foreground)]"><code class="font-mono text-xs">feat(todo): ...</code> no <code class="font-mono text-xs">arreglado</code>. Un cambio lógico por commit.</dd></div>
        <div><dt class="font-mono font-semibold">C1 recomendación</dt><dd class="text-[var(--muted-foreground)]">Lógica en inglés obligatorio, datos de respuesta en español permitido sin deducción.</dd></div>
        <div><dt class="font-mono font-semibold">.crisol</dt><dd class="text-[var(--muted-foreground)]">Cache local — ver <code class="font-mono text-xs">.crisol/README.md</code>. CI sube artifact 14d.</dd></div>
      </dl>
      <p class="mt-3 text-xs"><a href="../../site/index.html" class="underline">Abrir landing con glosario completo →</a></p>
    </div>
  </div>

  <p class="mt-6 text-center font-mono text-xs text-[var(--faint)]">Generado por <code>edu-report.mjs</code> desde <code>${inPath}</code> · <a href="https://github.com/zeewspace/crisol-edu" class="underline">zeewspace/crisol-edu</a> · Advisory, nunca bloquea</p>
</main>
</body>
</html>`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, html);
console.log(`[edu-report] wrote ${outPath} (${final}/10 ${grade})`);
if (history.length) console.log(`  history: ${history.length} entries from ${historyPath}`);
