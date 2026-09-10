---
name: edu-code-review
description: "Teachable AI review [edu-] — Security, Performance, Clean Code, Organization 0-10. Trigger: /edu-review, skill('edu-code-review'), or pull_request via edu-review.yml. Advisory, never blocks."
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0.0"
  domain: estudiantes
  prefix: edu-
---

# edu-code-review — Revisor para estudiantes (advisory)

> **Prefijo `edu-`**: todo lo de este dominio usa `edu-` para no colisionar con `work-unit-commits`, `branch-pr`, `chained-pr`.
> Fuente de verdad: `docs/edu-rubric.md` (en la raíz del repo).

## Cuándo se activa

- Explícito: `skill("edu-code-review")`
- Comando en PR/issue: `/edu-review`
- Automático: `pull_request` (`opened`, `reopened`) vía `.github/workflows/edu-review.yml` (local-first, no `synchronize`) + `/edu-review`
- Manual local: `npm run edu:review` (indicación 🟢/🟡/🔴) / `npm run edu:score -- --full` (0-10) / `npm run edu:grill`

## Qué hace (advisory, nunca bloquea)

1. Lee `docs/edu-rubric.md` (única fuente de verdad).
2. Corre checklist `references/edu-checklist.md` + `eslint` (`eslint.config.mjs`) + `gitleaks` + `commitlint`.
3. Calcula scoring `references/edu-scoring.md`: `10 - (Critical×3) - (Major×1.5) - (Minor×0.5)` por eje, `Final = (S+P+C+O)/4`.
4. Publica comentario con `templates/edu-comment.md.hbs` (tabla S/P/C/O, deducciones `file:line` + fix + link a rubric).
5. Sube `.crisol/results/edu-score.json` con `templates/edu-score.json.hbs` como artifact (14 días, ver `.crisol/README.md`).

## Cómo invocar

```bash
# En chat del agente
skill("edu-code-review")

# En PR (comentario)
/edu-review

# Local
npm run edu:lint
npm run edu:review
```

## Ejes y severidades

| Eje | Lens | Severidad → deducción |
|-----|------|----------------------|
| S Security | R1 Risk | Critical -3, Major -1.5, Minor -0.5 |
| P Performance | R4 Resilience | igual |
| C Clean Code | R2 Readability | igual |
| O Organization | R2 Readability | igual |

Ver `docs/edu-rubric.md` y `references/edu-checklist.md`.

## Alias y relación con skills existentes

- `work-unit-commits` = `strategic-commit` (commits atómicos). Esta skill no lo reemplaza, lo complementa: `edu-code-review` evalúa atomicidad (O4).
- `branch-pr` valida PRs (regex, labels). `edu-review.yml` es el workflow espejo con prefijo `edu-`.
- Si ves `skill not found: code-review`, usa `edu-code-review`.

## Salidas

- **Markdown**: `templates/edu-comment.md.hbs` → comentario en PR.
- **JSON**: `templates/edu-score.json.hbs` / `scripts/edu-score.mjs` → `.crisol/results/edu-score.json` + `.crisol/history/history.ndjson` (`--history`) `{security, performance, cleanCode, organization, final, grade, deductions[]}`.

## Modo advisory

Aunque `Final < 5` (Reprobado), **solo educa**. No bloquea merge. Bandas: `9-10 Excelente`, `7-8.5 Bueno`, `5-6.5 Aprobado con deuda`, `<5 Reprobado`.

## Referencias

- `references/edu-checklist.md` — checklist por eje
- `references/edu-scoring.md` — algoritmo y bandas
- `templates/edu-comment.md.hbs` — template comentario
- `templates/edu-score.json.hbs` — template JSON
- `scripts/edu-score.mjs` — scorer helper
