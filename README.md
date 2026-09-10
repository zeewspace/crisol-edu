# Estudiantes — Dominio `edu-`

Repositorio base para proyectos de estudiantes con estándares profesionales y review automático **advisory** (no bloquea).

## Prefijo del dominio

Todo lo de este dominio usa **`edu-`** para diferenciarse de skills existentes:

| Qué | Nombre | Uso |
|-----|--------|-----|
| Skill principal | `edu-code-review` | `skill("edu-code-review")` |
| Comando PR | `/edu-review` | comentario en PR |
| Rubric | `docs/edu-rubric.md` | fuente de verdad |
| Workflows | `edu-ci.yml`, `edu-review.yml` | `.github/workflows/` |
| Scripts npm | `edu:lint`, `edu:review`, `edu:score` | `npm run edu:lint` |
| Templates | `edu-comment.md.hbs`, `edu-score.json.hbs` | skill templates |

## Stack y estándares

- **Commits**: Conventional Commits, atómicos, en inglés. Regex: `^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([a-z0-9\._-]+\))?!?: .+`
- **Código**: inglés en identificadores/funciones, funciones ≤50 líneas, SRP, archivos ≤250 líneas, `strict:true`, sin `any`
- **Estructura**: Screaming Architecture por feature (`features/todo/`), no por tipo. Alias `@/* -> ./src/*`
- **Review**: 4 ejes 0-10 — **S**ecurity, **P**erformance, **C**lean Code, **O**rganization → `Final = (S+P+C+O)/4`

Ver `AGENTS.md` para contrato completo y `docs/edu-rubric.md` para rubric detallado.

## Quickstart

```bash
npm install
npx lefthook install   # hooks: commitlint + eslint + gitleaks

# Lint
npm run edu:lint

# Review local (genera edu-score.json)
npm run edu:review

# Commit (ejemplo bueno)
git add src/features/todo/TodoItem.tsx
git commit -m "feat(todo): add TodoItem with a11y label

Extract item rendering from God component to enable
reuse and reduce page.tsx from 151 to 40 lines."
```

## Scoring (advisory)

Cada PR recibe comentario con tabla S/P/C/O:

```
10 - (Critical×3) - (Major×1.5) - (Minor×0.5)
9-10 Excelente · 7-8.5 Bueno · 5-6.5 Aprobado con deuda · <5 Reprobado (advisory)
```

Ejemplos: `docs/examples/edu-score-10.md` (10) y `docs/examples/edu-score-04.md` (~4, basado en `Todo-List-con-TRPC`).

## Workflows

- `edu-ci.yml`: `edu:lint` + `gitleaks` + `commitlint` en PR
- `edu-review.yml`: corre `edu-code-review` y postea `edu-score.json` + comentario

Ambos son **advisory** — nunca bloquean merge, solo educan.

## Skills relevantes

Ver `.atl/skill-registry.md` para índice completo. Para este dominio:

- `edu-code-review` — revisor principal (este repo)
- `work-unit-commits` (= `strategic-commit`) — commits atómicos
- `branch-pr` / `chained-pr` — PRs
- `cognitive-doc-design` — docs

## Instalación para estudiantes (opencode o sistema)

**Opción A — Clonar y usar directo (recomendado, 30 segundos):**

```bash
git clone https://github.com/zeewspace/crisol-edu.git
cd crisol-edu
npm install
npx lefthook install
# ya tenés AGENTS.md, edu-rubric y la skill en .opencode/skills/edu-code-review
# opencode la detecta automáticamente como project skill
```

Usá en opencode: `skill("edu-code-review")` o en un PR comentá `/edu-review`.

**Opción B — Instalar la skill global en tu opencode:**

```bash
# copia la skill a tu config global (Windows)
xcopy /E /I .opencode\skills\edu-code-review %USERPROFILE%\.config\opencode\skills\edu-code-review

# Linux/Mac
cp -r .opencode/skills/edu-code-review ~/.config/opencode/skills/edu-code-review

# regenera el índice
# (opencode lo hace solo, o corrí skill-registry)
```

Verificá: `ls ~/.config/opencode/skills/ | grep edu` debe mostrar `edu-code-review`.

**Opción C — Solo el rubric sin opencode:**

Copiá `docs/edu-rubric.md` y `docs/edu-scorecard.template.md` a tu repo y usá la tabla a mano. El scoring es `10-(C×3+M×1.5+m×0.5)` por eje.

## Troubleshooting

- `/edu-review` no dispara: verifica que el PR sea de `main`/`develop` y que `edu-review.yml` esté en `main`.
- `lefthook` no corre: `npm run prepare` o `npx lefthook install`.
- `gitleaks` no instalado: CI lo corre igual; local es opcional (`skip` si no está).
- Skill no aparece: `cat .atl/skill-registry.md | grep edu` — debe listar `edu-code-review`. Si no, borrá `.atl/` y reabrí opencode.
