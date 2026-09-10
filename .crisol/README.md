# .crisol — Resultados locales de Crisol EDU

Este directorio es **cache local** para resultados de `edu-code-review`. Es **local-first**: la mayoría del uso es local, CI solo cuando se pide.

## Qué va dónde

| Path | Qué es | ¿Se commitea? | Retention |
|------|--------|---------------|-----------|
| `.crisol/results/edu-score.json` | Último score (salida de `npm run edu:review`) | **No** (gitignored) | local, sobrescrito cada run |
| `.crisol/history/history.ndjson` | Historial sprint a sprint (append, 1 línea = 1 run) | **No** (gitignored) | local, crece sin límite — borrá a mano si pesa |
| `.crisol/grill/*.md` | Reportes de `grill-me` (dilemas públicos) | **No** (gitignored) | local |
| `.crisol/cache/`, `tmp/` | Caché temporal, locks | **No** | efímero |
| `.crisol/config.example.json` | Ejemplo de config | **Sí** | — |
| `*.gitkeep` | Skeleton para que `git clone` cree carpetas vacías | **Sí** | — |

## Config

Copia `config.example.json` → `config.json` (gitignored) y ajusta:

```json
{
  "retentionDays": 14,
  "historyMode": "local",
  "historySample": "docs/examples/crisol-history.sample.ndjson"
}
```

## Retention / Privacidad

- **Local:** todo `.crisol/` es gitignored excepto `*.gitkeep` + `config.example.json` + este README. No se pushea historial con PII.
- **CI artifact:** `edu-review.yml` sube `edu-score.json` con `retention-days: 14` (no a `main`). Expira solo.
- **Muestra committeada:** `docs/examples/crisol-history.sample.ndjson` (5 filas sintéticas, anonimizada) sí se commitea para documentar schema sin filtrar datos reales.

## Uso

```bash
# indicación rápida local (semáforo, no 0-10)
npm run edu:review

# scoring completo + append a historial
npm run edu:score -- --full --history

# ver historial
cat .crisol/history/history.ndjson

# grill-me (deja reporte en .crisol/grill/)
npm run edu:grill
```

## Migración `.edu` → `.crisol`

`.edu/` queda en `.gitignore` por compatibilidad pero ya no se usa. Borralo local si existe: `rm -rf .edu`.
