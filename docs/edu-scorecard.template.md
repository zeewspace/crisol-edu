# edu-scorecard — Template

> Copiá este template en cada PR. Fuente: `docs/edu-rubric.md` · Skill: `edu-code-review` (`/edu-review`)

```
Student: __________  Reviewer: __________  Date: _______
PR: #___  Branch: __________  Commit: _______
```

| Eje | Score | Deducciones | Link rubric |
|-----|-------|-------------|-------------|
| **S Security** | __ /10 | Critical×__ Major×__ Minor×__ | `edu-rubric.md#s-security` |
| **P Performance** | __ /10 | Critical×__ Major×__ Minor×__ | `edu-rubric.md#p-performance` |
| **C Clean Code** | __ /10 | Critical×__ Major×__ Minor×__ | `edu-rubric.md#c-clean-code` |
| **O Organization** | __ /10 | Critical×__ Major×__ Minor×__ | `edu-rubric.md#o-organization` |
| **Final** | **__ /10** | `(S+P+C+O)/4` | Banda: __________ |

## Deducciones detalladas

| Eje | Sev | Regla | File:Line | Mensaje | Fix sugerido |
|-----|-----|-------|-----------|---------|--------------|
| S | Critical | S1 | `src/env.ts:3` | Secret hardcoded | move to `.env` + `.gitignore` |
| P | Major | P2 | `server/routers/todo.ts:28` | list without pagination | add cursor + limit |
| C | Major | C2 | `app/page.tsx:6` | God component 151 lines | split into TodoItem/TodoForm |
| O | Minor | O4 | `console.log(r.status:1` | stray file tracked | `git rm` + `git status` before add |

## Feedback (1 fuerza + 1 mejora por eje)

- **S**: Fuerza: __________ · Mejora: __________
- **P**: Fuerza: __________ · Mejora: __________
- **C**: Fuerza: __________ · Mejora: __________
- **O**: Fuerza: __________ · Mejora: __________

## Artefactos (local-first)

- Local: `.crisol/results/edu-score.json` (indicación semáforo con `edu:review`, 0-10 con `edu:score -- --full`)
- Historial local: `.crisol/history/history.ndjson` (append con `--history`, gitignored) — ver `.crisol/README.md`
- CI artifact (solo si se pide): `.crisol/results/edu-score.json` con `retention-days: 14`
- Workflows: `edu-ci.yml` (solo `main`) + `edu-review.yml` (`opened` + `/edu-review`)

---

### Cómo calcular

```
score = 10 - (Critical×3) - (Major×1.5) - (Minor×0.5)
Final = (S+P+C+O)/4
9-10 Excelente · 7-8.5 Bueno · 5-6.5 Aprobado con deuda · <5 Reprobado (advisory)
```
