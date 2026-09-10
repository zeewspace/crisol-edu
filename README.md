# Crisol EDU — Forja de código para estudiantes

> **Revisar código no debería doler.** Este repo te da un sistema *advisory* (nunca bloquea) para que **profesores evalúen en 2 minutos** y **estudiantes sepan exactamente qué mejorar** — sin 30 comentarios sueltos.

[![edu-code-review](https://img.shields.io/badge/skill-edu--code--review-blue)](./.opencode/skills/edu-code-review/SKILL.md) [![rubric](https://img.shields.io/badge/rubric-edu--rubric-green)](./docs/edu-rubric.md) [![advisory](https://img.shields.io/badge/mode-advisory-yellow)](./docs/edu-rubric.md) [![prefijo](https://img.shields.io/badge/prefijo-edu--lightgrey)](#prefijo-edu-)

**Para la comunidad Zeew Space:** si das clases, mentoreás o entregás TPs, este es tu atajo. Un mismo checklist, un mismo puntaje, un mismo idioma.

---

## ¿Para quién es?

| Sos... | Esto te resuelve |
|--------|------------------|
| **Profesor / reviewer** | Dejás de escribir 20 comentarios a mano. Corrés `/edu-review` y tenés una scorecard lista con `file:line` + fix sugerido. Copiás 1 fuerza + 1 mejora por eje y listo. |
| **Estudiante (principiante)** | Sabés *antes* de entregar si tu PR está en 4 o en 9. No hay sorpresas, no hay "arreglado". Tenés ejemplos 10 vs 4 del mismo proyecto. |
| **Equipo** | Todos hablan el mismo estándar: commits atómicos, funciones en inglés, archivos chicos. El rubric es la fuente de verdad. |

---

## Cómo evalúa un profesor — en 60 segundos

```bash
# En el PR del estudiante, comentá:
/edu-review
```

Eso dispara `.github/workflows/edu-review.yml` → corre `edu-code-review` → postea esto:

| Eje | Score |
|-----|-------|
| **S Security** | 8.5 /10 |
| **P Performance** | 7.0 /10 |
| **C Clean Code** | 8.5 /10 |
| **O Organization** | 9.5 /10 |
| **Final** | **8.5 /10 — Bueno** |

Debajo: tabla con cada deducción `S5 Major server/routers/todo.ts:61 — throw new Error → usa TRPCError` + link a `docs/edu-rubric.md`.

**Tu trabajo:** elegí **1 mejora por eje** (la de mayor deducción) y dale al estudiante el snippet *antes/después* del `edu-rubric`. Listo. Sin bloquear merge — es advisory.

> Tip: si querés revisar local sin esperar CI: `skill("edu-code-review")` en opencode.

---

## Cómo entrega bien un estudiante — checklist de 5 puntos

Antes de `git push`, corre esto mental (o `npm run edu:review`):

1. **Commits:** ¿Cada commit hace UNA cosa y se entiende en 5 seg? `feat(todo): add TodoItem with a11y` ✅ vs `arreglado` ❌
2. **Inglés:** ¿Funciones/variables en inglés? `getUserById` ✅ vs `obtenerUsuario` ❌
3. **Pequeño:** ¿Función ≤50 líneas, archivo ≤250? Si hace scroll, partila.
4. **Sin secretos:** ¿`.env` no está trackeado? `git status` limpio, sin `console.log(r.status`.
5. **Probado:** ¿Cada `fix/feat` con test o `createCaller`?

Si pasás `npm run edu:lint` y `gitleaks` local, arrancás en **6/10** antes de que el profe mire.

**Ejemplo de commit que aprueba:**

```bash
git add src/features/todo/TodoItem.tsx
git commit -m "feat(todo): add TodoItem with a11y label

Extract item rendering from God component to enable
reuse and reduce page.tsx from 151 to 40 lines."
```

**Anti-ejemplo que reprueba (real: `Todo-List-con-TRPC`):**

```bash
git commit -m "este es el primer commit"  # + archivo basura console.log(r.status
```

Ver `docs/examples/edu-score-10.md` (10/10) vs `edu-score-04.md` (~4/10) — mismo Todo, lado a lado. Historial local en `.crisol/history/history.ndjson` (ver `docs/examples/crisol-history.sample.ndjson`).

---

## Qué se evalúa — 4 ejes, 0-10

Fuente: `docs/edu-rubric.md` · Fórmula por eje: `10 - (Critical×3) - (Major×1.5) - (Minor×0.5)` · Final `(S+P+C+O)/4`

| Eje | Pregunta que responde | Si fallás, qué pasa en prod |
|-----|------------------------|------------------------------|
| **S Security** | ¿Se puede romper/filtrar? | Secret filtrado, XSS, injection |
| **P Performance** | ¿Escala con datos/usuarios? | N+1, listas sin paginar, bundle 1MB |
| **C Clean Code** | ¿Se entiende en 5 seg? | `funcion1`, 150 líneas, magic `86400` |
| **O Organization** | ¿Se navega fácil? | `components/` con 40 archivos, PR 500 líneas |

**Bandas (advisory):** `9-10 Excelente` · `7-8.5 Bueno` · `5-6.5 Aprobado con deuda` · `<5 Reprobado` (educa, no bloquea).

Cada deducción trae `file:line`, severidad y fix. Ej: `P2 Major server/routers/todo.ts:28 — list sin paginación → agrega cursor+limit`.

---

## Instalación — para estudiantes y profes

### Opción A — Clonar y usar (30 seg, recomendada)

```bash
git clone https://github.com/zeewspace/crisol-edu.git
cd crisol-edu
npm install
npx lefthook install   # hooks: commitlint + eslint + gitleaks (opcional, CI es fuente de verdad)
npm run edu:lint       # debe pasar verde
npm run edu:review     # indicación 🟢/🟡/🔴 + 1 tip por eje (local, 2 seg)
npm run edu:score -- --full   # 0-10 completo en .crisol/results/edu-score.json
```

La skill `edu-code-review` ya viene en `.opencode/skills/edu-code-review` — opencode la detecta como *project skill* sin instalar nada global.

### Opción B — Llevar la skill a tu opencode global

```bash
# Windows
xcopy /E /I .opencode\skills\edu-code-review %USERPROFILE%\.config\opencode\skills\edu-code-review
# Mac/Linux
cp -r .opencode/skills/edu-code-review ~/.config/opencode/skills/edu-code-review
```

Verificá: `ls ~/.config/opencode/skills | grep edu` → `edu-code-review`. Ver índice: `cat .atl/skill-registry.md | grep edu`.

### Opción C — Solo el rubric (sin opencode)

Copiá `docs/edu-rubric.md` + `docs/edu-scorecard.template.md` a tu repo y usá la tabla a mano. El cálculo es el mismo.

---

## Stack y estándares (resumen)

- **Commits:** Conventional Commits, atómicos, en inglés. Regex `^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([a-z0-9\._-]+\))?!?: .+`
- **Código:** `strict:true`, sin `any`, `zod` en boundaries, `TRPCError` no `throw new Error`, sin `console.log` en prod
- **Estructura:** Screaming Architecture por feature (`features/todo/{TodoList, TodoItem, useTodos, todo.schema.ts}`), alias `@/* → ./src/*`, `kebab-case` archivos / `PascalCase` componentes / `camelCase` hooks

Detalle completo: `AGENTS.md`.

---

## Prefijo `edu-`

Todo lo de este dominio usa **`edu-`** para no pisar skills que ya tenés:

| Qué | Nombre | Dónde |
|-----|--------|-------|
| Skill | `edu-code-review` | `skill("edu-code-review")` |
| Comando PR | `/edu-review` | comentario en PR |
| Rubric | `docs/edu-rubric.md` | fuente de verdad |
| Workflows | `edu-ci.yml`, `edu-review.yml` | `.github/workflows/` |
| Scripts | `edu:lint`, `edu:review`, `edu:score` | `package.json` |
| Templates | `edu-comment.md.hbs`, `edu-score.json.hbs` | skill |

Alias: `work-unit-commits` = `strategic-commit`.

---

## Workflows (local-first)

- **`edu-ci.yml`**: solo en `push` a `main` corre `edu:lint` + `gitleaks` + `commitlint`. Advisory. Local es primario.
- **`edu-review.yml`**: solo en `opened` + `/edu-review` (no en cada push) corre la skill si sos OWNER/MEMBER/COLLABORATOR, postea comentario y sube `.crisol/results/edu-score.json` (14 días).

Resultados locales en `.crisol/` (ver `.crisol/README.md`), no en `main`.

---

## Para profes: cómo dar feedback que enseña

No listes 20 nits. Usá el template `docs/edu-scorecard.template.md`:

> **S:** Fuerza: validaste con zod en 3 rutas. Mejora: en `todo.ts:61` usá `TRPCError({code:"NOT_FOUND"})` — así el cliente ve 404 tipado, no 500.
>
> **P:** Fuerza: componentes chicos. Mejora: cambiá `httpLink` → `httpBatchLink` en `providers.tsx:18` y agregá paginación en `list`.

Un fix por eje por PR → de 4 a 6.5 en un sprint. Medí progreso sprint a sprint, no perfección en el primero.

---

## Troubleshooting

- `/edu-review` no dispara: el PR debe ser a `main`/`develop` y `edu-review.yml` debe estar en `main`.
- `lefthook` no corre: `npm run prepare` o `npx lefthook install`.
- `gitleaks` no instalado: CI lo corre igual; local hace `skip` si no está.
- Skill no aparece: `cat .atl/skill-registry.md | grep edu` debe listar `edu-code-review`. Si no, borrá `.atl/` y reabrí opencode.

---

## Comunidad Zeew Space

Este repo es de la comunidad, para la comunidad. Si sos profe, usalo para evaluar más cómodo y rápido. Si sos estudiante, usalo para entregar con estándar profesional desde el día 1. PRs, issues y ejemplos 10/4 son bienvenidos.

Fuente de verdad: `docs/edu-rubric.md` · Contrato: `AGENTS.md` · Skill: `.opencode/skills/edu-code-review/SKILL.md`
