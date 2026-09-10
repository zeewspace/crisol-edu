# Ejemplo 10/10 — edu-score

> Mismo Todo List, pero **todo corregido**. Cada deducción del ejemplo 4/10 aquí está resuelta. Úsalo como referente.

## Commits (atómicos, conventional, inglés)

```bash
feat(todo): add zod schema for title with trim validation
feat(todo): create TodoItem and TodoForm components
refactor(trpc): use TRPCError with NOT_FOUND code
perf(api): replace httpLink with httpBatchLink
docs(edu-rubric): add 10 vs 4 scoring examples
```

Cada commit: 1 cambio lógico, <72 chars, imperativo, con body cuando necesita contexto. `git log --oneline --grep=feat` es buscable.

## S Security — 10/10

- `src/env.ts` valida con `zod`, secretos solo server-side, nunca `NEXT_PUBLIC_SECRET_KEY`.
- `server/routers/todo.ts` usa `TRPCError({ code: "NOT_FOUND" })`, no `throw new Error`.
- Inputs validados: `z.object({ title: z.string().trim().min(1) })`.
- `.env` ignorado, `.env.example` commiteado sin secretos. `gitleaks` clean.

## P Performance — 10/10

- `utils/providers.tsx` usa `httpBatchLink` con `maxURLLength: 2083`.
- `QueryClient` con `staleTime: 30_000` + `refetchOnWindowFocus: false`.
- `server/routers/todo.ts:list` con paginación cursor (`limit`, `cursor`) y `useInfiniteQuery` en el cliente.
- Mutaciones con optimistic update: `onMutate` + `setData` + rollback en `onError`, sin `invalidate()` global.
- `app/page.tsx` 40 líneas (delega a `TodoList`/`TodoItem`).

## C Clean Code — 10/10

- Identificadores en inglés: `getTodoById`, `isTitleValid`, `TodoItem`, `useTodos`.
- Funciones ≤30 líneas, SRP: `validateTodo`, `saveTodo`, `notifyTodoCreated`.
- `prefer-const`, sin `any`, sin `console.log` en prod, sin código comentado.
- Comentarios solo *por qué*: `// rollback because Vercel cold start may race`.
- `const MAX_TITLE_LENGTH = 100`.

## O Organization — 10/10

- Estructura por feature:
  ```
  src/features/todo/{TodoList.tsx, TodoItem.tsx, TodoForm.tsx, useTodos.ts, todo.schema.ts}
  src/features/auth/{...}
  src/lib/env.ts, src/server/trpc.ts
  ```
- `kebab-case` archivos, `PascalCase` componentes, `camelCase` hooks. Alias `@/* -> ./src/*`.
- PR atómico <200 líneas, README real, `NEXT_PUBLIC_*` solo para lo público.

## Scorecard

| Eje | Score |
|-----|-------|
| S | 10 /10 |
| P | 10 /10 |
| C | 10 /10 |
| O | 10 /10 |
| **Final** | **10 /10 — Excelente** |

> Deducciones: 0 Critical, 0 Major, 0 Minor.
