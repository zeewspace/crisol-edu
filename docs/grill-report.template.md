# Grill Report — Crisol EDU

> Generado vía `skill("grilling")` / `npm run edu:grill` → `.crisol/grill/<timestamp>-grill.md`

```
Fecha: __________
Autor: __________
Plan/Design grillado: __________
Versión rubric: __________
```

## 1. Escala / CI cost

- ¿Qué pasa con 100 estudiantes × 5 pushes? ¿CI local-first aguanta?
- ¿`concurrency` + `timeout` + `retention-days: 14` alcanzan?

**Hallazgo**: __________
**Mitigación**: __________

## 2. Falsos positivos → confianza

- ¿`C1` english marca `datosUsuario` como valor? ¿allowlist de dominio?
- ¿Umbral God component 50 líneas es justo tras 5 PRs?

**Hallazgo**: __________
**Mitigación**: __________

## 3. Gaming del score

- ¿`eslint-disable` / `--no-verify` / copiar fix sin entender?
- ¿Local `edu-score.json` editable vs CI artifact como fuente de verdad?

**Hallazgo**: __________
**Mitigación**: __________

## 4. Soporte

- ¿Quién triagea `false-positive` con 20 issues iguales?
- ¿Template `false-positive.yml` + label `edu: false-positive` ayuda?

**Hallazgo**: __________
**Mitigación**: __________

## 5. Gobernanza

- ¿Quién aprueba cambio de rubric? ¿CHANGELOG + Discussions + `proposal` label?
- ¿Versionado `docs/edu-rubric.md v1.x` rompe dashboards?

**Hallazgo**: __________
**Mitigación**: __________

## Veredicto

- [ ] Aprobado — sin cambios
- [ ] Aprobado con deuda — 1 fix por dilema antes del próximo release
- [ ] Requiere rework — bloquear publicación hasta mitigar

**Próximo paso**: __________
