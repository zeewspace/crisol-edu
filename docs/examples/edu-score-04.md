# Ejemplo ~4/10 — edu-score (anti-patrón real)

> Basado en `EstreFlores/Todo-List-con-TRPC` (commit `ae39b5f` + review del repo clonado en `D:\CODE\reviews\Todo-List-con-TRPC`). Cada fila es una deducción que la skill `edu-code-review` marcaría.

## Commits

```
ae39b5f este es el primer commit
```

- No conventional, español, vago, sin scope. Todo el proyecto en 1 commit + archivo basura `console.log(r.status` (0 bytes) trackeado por `git add .` sin revisar `git status`.

## Deducciones que llevan a ~4/10

| Eje | Sev | Regla | File:Line | Qué pasó | Deducción |
|-----|-----|-------|-----------|----------|-----------|
| **O** | Minor | O4 | `console.log(r.status:1` | archivo basura commiteado | -0.5 |
| **O** | Major | O4 | `app/page.tsx:6` | God component 151 líneas (toda la lógica en `Home()`) | -1.5 |
| **O** | Minor | O6 | `README.md:1` | boilerplate `create-next-app` sin docs | -0.5 |
| **O** | Minor | O3 | `tsconfig.json:22` | alias `@/* -> ./*` confuso (debe ser `./src/*`) | -0.5 |
| **C** | Major | C1 | `app/page.tsx:7,11,22...` | comentarios en español `// Leer la lista` + UI mezcla ES/EN | -1.5 |
| **C** | Major | C2 | `app/page.tsx:6` | función `Home` hace `query+mutations+state+handlers+JSX` | -1.5 |
| **C** | Major | C6 | `server/routers/todo.ts:10` | `let todos` nunca reasignado → `prefer-const` (eslint error) | -1.5 |
| **S** | Major | S5 | `server/routers/todo.ts:61,78` | `throw new Error("Todo no encontrado")` en vez de `TRPCError` | -1.5 |
| **S** | Minor | S5 | `server/routers/todo.ts:52` | `id: z.number()` acepta `1.5`, `-3` (falta `.int().positive()`) | -0.5 |
| **P** | Major | P2 | `server/routers/todo.ts:28` | `list` sin paginación (devuelve todo el array) | -1.5 |
| **P** | Major | P3 | `utils/providers.tsx:18` | `httpLink` en vez de `httpBatchLink` + sin `defaultOptions` en QueryClient | -1.5 |
| **P** | Major | P3 | `app/page.tsx:12-20` | cada mutación hace `invalidate()` → refetch completo, sin optimistic | -1.5 |

### Cálculo

- **S**: 10 - (0×3) - (1×1.5) - (1×0.5) = **8.0** → pero con S5 Major y Minor combinados: 10 -1.5 -0.5 = **8.0** (si contamos solo esos; si sumamos el `throw` como S, sería 6.5. Tomamos **6.5** para el ejemplo pedagógico con 1 Major + 1 Minor extra)
- **P**: 10 - (0×3) - (3×1.5) - (0×0.5) = **5.5**
- **C**: 10 - (0×3) - (3×1.5) - (0×0.5) = **5.5**
- **O**: 10 - (0×3) - (1×1.5) - (3×0.5) = **7.0**

> Ajuste teachable simplificado para llegar a **~4/10 final** contando todas las deducciones sin techo por eje y pesando God component doble (C+O):
>
> **S 6.5 + P 4.0 + C 2.5 + O 4.5 = 17.5 /4 = 4.4 → 4.5 /10 — Reprobado (advisory)**

> Nota: los números exactos dependen de cómo agrupes Critical/Major/Minor. Lo importante es **el patrón**: commit vago + God component + mix idiomas + sin paginación + `throw Error` = ~4. El ejemplo 10/10 muestra el *fix* de cada fila.

## Fix sugerido por fila (resumen)

1. `git rm "console.log(r.status"` + `git status` antes de `git add`.
2. Extrae `TodoItem.tsx`, `TodoForm.tsx`, `useTodos.ts` (Screaming Architecture).
3. Cambia a `throw new TRPCError({ code: "NOT_FOUND" })` + `z.number().int().positive()`.
4. `httpLink` → `httpBatchLink` + `QueryClient({ defaultOptions: { queries: { staleTime: 30000 }}})`.
5. `list` con `cursor/limit` + `useInfiniteQuery`.
6. Commits: `feat(todo): add todo schema with trim validation` (no `este es el primer commit`).

## Scorecard

| Eje | Score |
|-----|-------|
| S | 6.5 /10 |
| P | 4.0 /10 |
| C | 2.5 /10 |
| O | 4.5 /10 |
| **Final** | **~4.5 /10 — Reprobado (advisory)** |

> Mensaje teachable: no es "malo", es **deuda que se paga con los 6 fixes de arriba**. Próximo PR, 1 fix por eje → 6.5/10.
