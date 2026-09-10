# edu-scoring — Algoritmo y bandas

## Fórmula

```
score(eje) = 10 - (Critical × 3) - (Major × 1.5) - (Minor × 0.5)
  floor 0, cap 10, step 0.5

Final = (S + P + C + O) / 4   // pesos iguales, simple para principiantes
```

- **Critical**: explotable, roto, filtra secretos, rompe en prod → **-3**
- **Major**: mala práctica que será Critical al escalar → **-1.5**
- **Minor**: estilo/nit que suma deuda → **-0.5**

## Bandas (advisory — nunca bloquea)

| Final | Banda | Emoji | Qué significa |
|-------|-------|-------|---------------|
| 9.0 - 10 | **Excelente** | 🟢 | Referente, listo para prod |
| 7.0 - 8.5 | **Bueno** | 🔵 | Bien, deuda menor |
| 5.0 - 6.5 | **Aprobado con deuda** | 🟡 | Pasa, corregir pronto |
| 0 - 4.5 | **Reprobado** | 🔴 | Requiere rework — la skill explica cómo |

> Aunque sea <5, es **advisory**. No bloquea merge. El comentario lista 1 fix por eje (no 20 nits).

## Ejemplo de cálculo

PR con:
- S: 1 Major (S5) + 1 Minor → 10 -1.5 -0.5 = **8.0**
- P: 3 Major (P2,P3,P3) → 10 -4.5 = **5.5**
- C: 3 Major (C1,C2,C3) → **5.5**
- O: 1 Major + 3 Minor → 10 -1.5 -1.5 = **7.0**

Final = (8.0+5.5+5.5+7.0)/4 = **6.5 → Aprobado con deuda**

Ver `docs/examples/edu-score-04.md` para el caso real ~4.5.

## Salida JSON

`edu-score.json`:
```json
{
  "security": 8.0,
  "performance": 5.5,
  "cleanCode": 5.5,
  "organization": 7.0,
  "final": 6.5,
  "grade": "Aprobado con deuda",
  "deductions": [
    { "category": "S", "severity": "Major", "rule": "S5", "file": "server/routers/todo.ts", "line": 61, "message": "throw new Error instead of TRPCError" }
  ]
}
```

## Reglas de redondeo

- Step 0.5: `6.25 → 6.5`, `6.74 → 6.5`, `6.75 → 7.0`.
- Floor 0, cap 10.

## Calibración

- God component: 50 líneas warn, 80 error (medido en `Todo-List` 151 líneas).
- Tras 5 PRs, recalibrar umbrales si hay muchos falsos positivos.
