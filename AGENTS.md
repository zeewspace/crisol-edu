<!-- gentle-ai:codegraph-guidance -->
## CodeGraph

When answering structural or codebase questions, use CodeGraph before broad filesystem searches. This is a hard ordering rule for repo maps, architecture, call flow, dependencies, symbol references, impact analysis, and "how does X work" questions.

CodeGraph-aware worktree placement:
- Create Git worktrees that may need CodeGraph under the user's home directory, preferably as a sibling such as `<repo-parent>/<repo-name>-worktrees/<worktree-name>`. Never place a CodeGraph-dependent worktree under `/tmp`, `/var/tmp`, or `/tmp/opencode`.
- Every worktree needs its own `.codegraph/` index. Never copy, symlink, or reuse another checkout's index.

CodeGraph intelligence surface:
- Prefer the `codegraph_explore` MCP tool when available.
- If unavailable, use `codegraph status`, `codegraph query`, `codegraph explore`, `codegraph node`, `codegraph files`, `codegraph callers`, `codegraph callees`, `codegraph impact`, `codegraph affected`.
- Never run `codegraph uninit`, `codegraph install`, `codegraph uninstall`, `codegraph upgrade`.

Required order:
1. `git rev-parse --show-toplevel || pwd`
2. Confirm real project/workspace.
3. Check `<project-root>/.codegraph/` before broad exploration.
4. If missing, run `gentle-ai codegraph init --cwd <project-root>` once.
5. Use `codegraph_explore` after init.
<!-- /gentle-ai:codegraph-guidance -->

# AGENTS — Estudiantes

> **Prefijo del dominio: `edu-`**
> Todo lo de este agente/skills/comandos usa prefijo `edu-` para diferenciarse de skills existentes.
> - Skill principal: `edu-code-review` → `skill("edu-code-review")` | comando `/edu-review` | `skill("grilling")` para grill-me
> - Rubric fuente de verdad: `docs/edu-rubric.md` (versionado, ver `CHANGELOG.md`)
> - Scorecard template: `docs/edu-scorecard.template.md`
> - Workflows: `.github/workflows/edu-ci.yml` (solo `main`), `.github/workflows/edu-review.yml` (`opened` + `/edu-review`)
> - Scripts npm: `edu:lint`, `edu:review` (indicación 🟢/🟡/🔴), `edu:score -- --full`, `edu:grill`
> - Templates: `edu-comment.md.hbs`, `edu-score.json.hbs`
> - Resultados: `.crisol/` (local-first, gitignored, ver `.crisol/README.md`)
> Alias útiles: `work-unit-commits` = `strategic-commit`; `edu-code-review` es el único revisor con scoring 0-10 para este dominio.

## Rules

- Never add "Co-Authored-By" or AI attribution to commits. Use conventional commits only.
- Response-length: short by default, expand only when asked or task requires it.
- Ask at most one question at a time.
- Never agree without verification. Check code/docs first.
- Propose alternatives with tradeoffs.
- Verify technical claims before stating them.

## Persona Scope (CRITICAL)

Persona tone governs ONLY your reply text, not artifacts:

- Code, comments, UI copy, commits, docs, tests → default **English**.
- Never inject Rioplatense slang into artifacts.
- Spanish artifacts only if explicitly requested → neutral/professional Spanish.

## Language Contract

- **Code identifiers, functions, variables, types, files → English always (lógica).**
  - Good: `getUserById`, `createTodo`, `isValidEmail`
  - Bad: `obtenerUsuario`, `funcion1`, `temp`, `x`
  - **Excepción recomendada (no penaliza):** datos de respuesta / strings user-facing en español ✅: `return { mensaje: "Todo creado" }`, `datosUsuario` como *valor* de API ✅ — solo se penaliza si es **lógica** (`function datosUsuario()` ❌). Ver `docs/edu-rubric.md#C1`.
- **Comments → English** (explain *why*, not *what*). Spanish only if domain term requires it and is explicitly requested.
- **UI copy** → English by default; si el proyecto es hispanohablante, mantené consistencia pero no mezcles en el mismo módulo (`<html lang="en">` con contenido español es bug). Datos de respuesta en español no penalizan.
- **Docs/README** → English unless project explicitly targets Spanish audience (then neutral Spanish). Este proyecto (`crisol-edu`) usa español en README por comunidad.

## Commit Rules — Atomic & Conventional

**Formato obligatorio:**
```
<type>(<scope>): <subject>  // < 72 chars, inglés, imperativo, minúsculas

[body: qué y por qué, no solo qué]

[footer: Closes #N, BREAKING CHANGE:]
```
Regex enforced: `^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([a-z0-9\._-]+\))?!?: .+`

**Types:**
- `feat`: nueva feature
- `fix`: bugfix
- `docs`: documentación
- `style`: formato (espacios, comas) sin cambio lógico
- `refactor`: refactor sin cambio de comportamiento
- `perf`: mejora de performance
- `test`: tests
- `build`, `ci`, `chore`, `revert`

**Reglas de oro:**
- **Atómico**: 1 cambio lógico por commit. No mezcles `feat + fix + refactor` en un commit. Si tu `git diff --stat` muestra 8 archivos de dominios distintos, son 2-3 commits.
- **Mensaje simple y rápido**: debe explicar el cambio en <5 segundos. Sujeto en imperativo presente: `add`, `fix`, `remove`, no `added`, `fixes`, `arreglado`.
- **Nunca**: `arreglado`, `fix`, `primer commit`, `este es el primer commit`, `update`, `wip`, `asdf`. Cada mensaje debe ser buscable con `git log --oneline --grep=feat`.
- **Body** cuando el `subject` no alcanza: explica contexto y razón, no repitas el diff.
- **Workflow**: `git status` → `git diff` → `git add` selectivo (nunca `git add .` a ciegas) → `git commit` → `git log --oneline -3` verifica.

**Ejemplos:**
```bash
# Mal
git commit -m "arreglado"
git commit -m "este es el primer commit"
git commit -m "fix bug"

# Bien
git commit -m "feat(todo): add optimistic toggle with rollback"
git commit -m "fix(auth): reject expired tokens with 401"
git commit -m "refactor(todos): split God component into TodoItem and TodoForm"
git commit -m "docs(edu-rubric): add scoring examples for 10 and 4"

# Commit con body
git commit -m "perf(api): batch tRPC queries with httpBatchLink

Replace httpLink with httpBatchLink to group concurrent
queries into one HTTP request, reducing round-trips on
dashboard mount. Measured -40% TTFB on /dashboard.

Closes #12"
```

## Structure & Order

### Funciones
- **Pequeñas**: ≤50 líneas (warn), ≤80 líneas (error). Si necesitas scroll, es muy grande.
- **Single Responsibility**: hace UNA cosa. Si tu función se llama `handleData` y hace `fetch + validate + save + notify`, son 4 funciones.
  - Mal: `function processTodo(todo) { validate(); saveToDB(); sendEmail(); updateUI(); }`
  - Bien: `validateTodo()`, `saveTodo()`, `notifyTodoCreated()`
- **Nombre revela intención**: `isEmailValid`, `calculateTotalPrice`, no `doStuff`, `handleThing`.
- **Parámetros**: ≤3. Si necesitas 5, usa objeto `options`.
- **Complejidad**: ≤10 (eslint `complexity`). No más de 2 niveles de anidación.
- **Inglés**: todo identificador en inglés.

### Archivos y Carpetas
- **Archivo ≤250 líneas**. Si supera, extrae componente/hook/servicio.
- **Screaming Architecture**: organiza por *feature*, no por *tipo*.
  - Mal: `src/components/`, `src/hooks/`, `src/utils/` con 40 archivos mezclados.
  - Bien: `features/todo/{TodoList.tsx, TodoItem.tsx, useTodos.ts, todo.schema.ts}`, `features/auth/{...}`
- **Naming consistente**: archivos `kebab-case` (`todo-item.tsx`), componentes `PascalCase` (`TodoItem`), hooks `camelCase` (`useTodos`).
- **Alias**: `@/*` → `./src/*` (no `./*`). Configurado en `tsconfig.json`.
- **Sin archivos basura**: verifica `git status` antes de `git add`. Nunca commitees `console.log(r.status`, `.env`, `node_modules`.

### Código Limpio — Estándares para principiantes
1. **Imports ordenados**: externos → internos → relativos. Sin imports no usados.
2. **Types estrictos**: `strict:true`, sin `any`. Usa `zod`/`valibot` en boundaries (API, forms).
3. **Errores**: en tRPC usa `TRPCError({ code: "NOT_FOUND" })`, no `throw new Error`. En APIs, usa códigos semánticos.
4. **No `console.log` en producción**: usa logger estructurado. `no-console` en eslint.
5. **No código comentado**: bórralo, git lo guarda. Comentarios explican *por qué*, no *qué* (`// retry because Vercel cold start`, no `// loop array`).
6. **DRY**: si copias 3 veces el mismo fetch/validación, extrae función/hook.
7. **Magic numbers/strings**: `const MAX_RETRIES = 3`, no `if (x > 86400)`.
8. **Tests**: cada fix/feature con test. Usa `createCaller` para tRPC sin HTTP.
9. **Docs**: cada proyecto necesita `README.md` (qué hace, cómo correr, stack) + `.env.example` (sin secretos).
10. **Env**: nunca `NEXT_PUBLIC_SECRET_KEY`. Secretos solo server-side, validados con `zod` en `env.ts`.

## Review Workflow — `edu-code-review` (local-first)

Cada PR recibe review **advisory** (nunca bloquea merge) con 4 ejes 0-10:
- **S Security** (R1 Risk)
- **P Performance** (R4 Resilience)
- **C Clean Code** (R2 Readability)
- **O Organization** (R2 Readability)

**Cómo funciona (local-first):**
1. Local: `npm run edu:review` → **indicación** 🟢/🟡/🔴 + 1 tip por eje en 2 seg (sin 0-10). Rápido para el día a día. Detalle completo en `.crisol/results/edu-score.json`.
2. Score completo: `npm run edu:score -- --full` → 0-10 + deducciones. Con `--history` hace append a `.crisol/history/history.ndjson`.
3. PR: `edu-review.yml` solo en `opened` + `/edu-review` (no en cada push) dispara `skill("edu-code-review")` si sos OWNER/MEMBER/COLLABORATOR.
4. El agente corre `references/edu-checklist.md` + `eslint` + `gitleaks` + `commitlint`.
5. Publica comentario `edu-comment.md.hbs` con tabla S/P/C/O, deducciones `file:line` + fix sugerido + link a `docs/edu-rubric.md`.
6. Sube `.crisol/results/edu-score.json` como artifact (14 días) — ver `.crisol/README.md`.

**Scoring (ver `docs/edu-rubric.md`):**
```
10 - (Critical×3) - (Major×1.5) - (Minor×0.5) → floor 0, step 0.5
Final = (S+P+C+O)/4  (pesos iguales)
Bandas: 9-10 Excelente, 7-8.5 Bueno, 5-6.5 Aprobado con deuda, <5 Reprobado
```
Modo advisory: aunque sea <5, solo educa. No bloquea.
Propuestas de cambio de rubric → `CHANGELOG.md` + `docs/edu-rubric.md` versionado, decisión comunitaria.

## Contextual Skill Loading (MANDATORY)

Self-check BEFORE every response: ¿match con `<available_skills>`? Si sí, lee `SKILL.md` antes de responder.
- Para este dominio: `edu-code-review` es la skill canónica. Usa `work-unit-commits` para commits estratégicos, `branch-pr` para PRs.

<!-- gentle-ai:engram-protocol -->
## Engram Persistent Memory

Call `mem_save` IMMEDIATELY after: decision, bugfix, discovery, pattern, config, preference.
Format: **What** / **Why** / **Where** / **Learned**. Use `topic_key` for evolving topics.
Search with `mem_context` / `mem_search` / `mem_get_observation` when user says "remember" or references past work.
Before session close, call `mem_session_summary` with Goal/Instructions/Discoveries/Accomplished/Next Steps/Relevant Files.
<!-- /gentle-ai:engram-protocol -->
