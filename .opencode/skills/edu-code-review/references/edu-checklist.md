# edu-checklist — Checklist por eje

> Fuente: `docs/edu-rubric.md`. Cada check mapea a una regla con severidad. El agente marca deducción por cada violación.

## S — Security (R1 Risk)

| ID | Check | Severidad | Cómo detectar | Fix |
|----|-------|-----------|---------------|-----|
| S1 | No secretos en repo | Critical | `gitleaks detect`, `.env` en `git ls-files`, `grep -r "sk-\|apiKey"` | mover a `.env` + `.gitignore`, rotar secreto |
| S2 | No env expuesto al cliente | Critical | `grep -r "NEXT_PUBLIC_.*SECRET\|VITE_.*SECRET"` | quitar prefijo público, usar server-only `env.ts` |
| S3 | No injection | Critical | `` grep -E "query.*\\+|\\$\\{.*\\}.*SELECT" ``, `prisma.$queryRaw` con string | queries parametrizadas, ORM safe |
| S4 | No XSS | Critical | `grep dangerouslySetInnerHTML`, `innerHTML`, `v-html` | sanitizar, usar `textContent` |
| S5 | Validación en boundaries | Major | API/form sin `zod`/`valibot`, `req.body` directo a DB | `z.object({...}).parse(req.body)` |
| S6 | Auth server-side | Critical | `if (user)` solo en cliente, sin `middleware.ts`, JWT en `localStorage` | guard en server, `HttpOnly` cookie, `middleware.ts` |

## P — Performance (R4 Resilience)

| ID | Check | Severidad | Cómo detectar | Fix |
|----|-------|-----------|---------------|-----|
| P1 | No N+1 | Major→Critical | `users.map(u => fetch(...))` en loop, Prisma sin `include` | batch, `include`, `Promise.all` |
| P2 | Paginación en listas | Major | `findMany()` sin `take/skip`, `SELECT *` sin `limit` | cursor + `limit`, `useInfiniteQuery` |
| P3 | Batching + staleTime | Minor→Major | `httpLink` sin batch, `new QueryClient()` sin `defaultOptions` | `httpBatchLink`/`httpBatchStreamLink`, `staleTime: 30000` |
| P4 | Componentes chicos | Major | `wc -l >250`, God component con >5 `useState` | split por feature, extraer hook |
| P5 | Re-renders / bundle | Minor | `() => {}` inline como prop, falta `key`, `import lodash` entero | `memo`, `key`, `dynamic()`, `next/image` |

## C — Clean Code (R2 Readability)

| ID | Check | Severidad | Cómo detectar | Fix |
|----|-------|-----------|---------------|-----|
| C1 | Naming inglés | Major | `obtenerUsuario`, `datosUsuario`, `funcion1`, `temp`, `x` | `getUserById`, `isValidEmail` |
| C2 | Función pequeña + SRP | Major | `max-lines-per-function >50`, `complexity >10`, hace 3 cosas | split en `validate`/`save`/`notify` |
| C3 | Archivo pequeño | Major | `max-lines 250` | extraer componente/hook/servicio |
| C4 | DRY | Major | mismo fetch/validación 3× | extraer función/hook |
| C5 | Magic numbers/strings | Minor | `> 86400`, `=== 2` sin const | `const MAX_RETRIES = 3` |
| C6 | Comentarios y muertos | Minor | código comentado, `// loop array` | borrar muerto, comentar *por qué* |

## O — Organization (R2 Readability)

| ID | Check | Severidad | Cómo detectar | Fix |
|----|-------|-----------|---------------|-----|
| O1 | Estructura por feature | Major | `src/components/` plano 40 archivos | `features/todo/{...}` |
| O2 | Screaming Architecture | Major | `src/api`, `src/hooks` por tipo | por dominio, no por tipo |
| O3 | Naming consistente | Minor | `UserCard.tsx` + `user-card.tsx` mezclados | `kebab-case` archivos, `PascalCase` componentes |
| O4 | Atomicidad | Major | PR 500 líneas mezcla feat+fix, commit `fix` vago | 1 cambio lógico por commit/PR |
| O5 | Boundaries | Major | UI → `prisma` directo | capa servicio/hook |
| O6 | Docs | Minor | sin `README`, sin `.env.example` | agregar ambos |

## Cómo usar en review

1. Por cada violación, anotar `file:line` + ID (ej. `C2 Major`).
2. Sumar por eje: `Critical×3 + Major×1.5 + Minor×0.5`.
3. Publicar en `edu-comment.md.hbs` con link a `docs/edu-rubric.md`.
