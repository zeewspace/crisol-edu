# edu-rubric — Fuente de verdad del scoring

> Dominio `edu-` · Skill `edu-code-review` · Comando `/edu-review` · Este archivo es la **única fuente de verdad**. La skill, los templates y los workflows lo referencian.

## Cómo se puntúa

Cada PR se evalúa en 4 ejes, cada uno **0-10**:

| Eje | Qué mide | Lens 4R |
|-----|----------|---------|
| **S Security** | ¿Puede romperse / filtrar datos / ser explotado? | R1 Risk |
| **P Performance** | ¿Escala y responde rápido con muchos datos/usuarios? | R4 Resilience |
| **C Clean Code** | ¿Se entiende en 5 segundos y se puede cambiar sin miedo? | R2 Readability |
| **O Organization** | ¿Está ordenado y es fácil navegar/extender? | R2 Readability |

### Fórmula (igual para los 4 ejes)

```
score = 10 - (Critical × 3) - (Major × 1.5) - (Minor × 0.5)
floor 0, cap 10, step 0.5
Final = (S + P + C + O) / 4   (pesos iguales)
```

| Severidad | Cuándo | Deducción |
|-----------|--------|-----------|
| **Critical** | Explotable, roto, filtra secretos, rompe en prod | **-3** |
| **Major** | Mala práctica que será Critical al escalar | **-1.5** |
| **Minor** | Estilo/nit que suma deuda | **-0.5** |

### Bandas (advisory — nunca bloquea)

| Final | Banda | Qué significa |
|-------|-------|---------------|
| **9-10** | Excelente | Listo para prod, referente |
| **7-8.5** | Bueno | Bien, con deuda menor |
| **5-6.5** | Aprobado con deuda | Pasa, pero hay que corregir pronto |
| **<5** | Reprobado | Requiere rework — la skill explica cómo |

> Modo **solo advisory siempre**: aunque sea <5, educa y no bloquea merge.

---

## S — Security (0-10)

| # | Criterio | Severidad | Qué buscar | Auto-check |
|---|----------|-----------|------------|------------|
| S1 | **No secretos en repo** | Critical | `.env`, `API_KEY="sk-..."`, `password = "..."` commiteado | `gitleaks`, `.gitignore` + `.gitleaks.toml` |
| S2 | **No env expuesto al cliente** | Critical | `NEXT_PUBLIC_SECRET_KEY`, `VITE_API_SECRET` | `grep NEXT_PUBLIC_` |
| S3 | **No injection** | Critical | `` `SELECT * WHERE id=${id}` ``, `prisma.$queryRaw` con string, `{ $where: input }` | `eslint-plugin-security` |
| S4 | **No XSS** | Critical | `dangerouslySetInnerHTML={userInput}`, `innerHTML = req.body`, `v-html` sin sanitizar | `grep dangerouslySetInnerHTML` |
| S5 | **Validación en boundaries** | Major | `req.body` directo a DB, sin `zod`/`valibot` | buscar `zod`, `parse`, `safeParse` en API/forms |
| S6 | **Auth server-side** | Critical | `if (user) showAdmin` solo en cliente, JWT en `localStorage` sin `HttpOnly`, sin `middleware.ts` guard | revisión manual `middleware.ts`, `server/` |

**Anclas:**
- **10**: sin secretos, todo input validado, queries parametrizadas, sin XSS, auth en server, env bien scopeado.
- **7-8**: un Major (ej. falta validación en una ruta) sin Critical.
- **4-6**: un Critical o 2 Majors.
- **0-3**: múltiples Criticals.

**Ejemplo real:** `D:\CODE\reviews\Todo-List-con-TRPC\server\routers\todo.ts:61,78` usa `throw new Error("Todo no encontrado")` → sale como 500 genérico. Mejor `TRPCError({ code: "NOT_FOUND" })` (tipado y con código semántico). No es Critical, pero es Major en S5/C.

---

## P — Performance (0-10)

| # | Criterio | Severidad | Qué buscar | Auto-check |
|---|----------|-----------|------------|------------|
| P1 | **No N+1** | Major→Critical | `users.map(u => fetchPosts(u.id))` en loop, Prisma sin `include`, resolver por fila | review + loop-fetch pattern |
| P2 | **Paginación en listas** | Major | `findMany()` sin `take/skip`, `SELECT *` sin límite | `grep findMany\(\)` |
| P3 | **Batching + staleTime** | Minor→Major | `httpLink` en vez de `httpBatchLink`/`httpBatchStreamLink`, `staleTime: 0` o `Infinity` | `grep httpLink\|staleTime` |
| P4 | **Componentes chicos** | Major | archivo >250 líneas, God component con 10 `useState` | `wc -l`, `grep useState` |
| P5 | **Re-renders / bundle** | Minor | `() => {}` inline como prop, falta `key`, importar `lodash` entero, sin `next/image` | `bundle-analyzer` |

**Anclas:**
- **10**: listas paginadas, links batch, `staleTime` 30s-5min según dato, componentes <250 líneas, sin N+1, bundle <200kb.
- **7-8**: un Major (ej. una lista sin paginar) lo demás bien.
- **4-6**: N+1 + sin paginación.
- **0-3**: N+1 + sin paginación + God component 800 líneas + bundle >1MB.

**Ejemplo real:** `utils/providers.tsx:18` usa `httpLink` (1 request por procedure). En `app/page.tsx:8-20` cada mutación hace `utils.todo.list.invalidate()` → refetch completo. La skill sugiere `httpBatchLink` (o `httpBatchStreamLink`) y updates optimistas con `setData` + rollback.

---

## C — Clean Code (0-10)

| # | Criterio | Severidad | Qué buscar |
|---|----------|-----------|------------|
| C1 | **Naming inglés** | Major | `obtenerUsuario`, `datosUsuario`, `funcion1`, `temp`, `x` → debe ser `getUserById`, `isValidEmail` |
| C2 | **Función pequeña + SRP** | Major | >50 líneas, >3 params, >2 niveles anidación, hace 3 cosas (`validate+save+notify`) |
| C3 | **Archivo pequeño** | Major | >250 líneas, sin separación UI/lógica |
| C4 | **DRY** | Major | mismo fetch/validación copiado 3× |
| C5 | **Magic numbers/strings** | Minor | `if (x > 86400)`, `status === 2` → `MAX_RETRIES = 3` |
| C6 | **Comentarios y muertos** | Minor | código comentado, `// loop array`, falta `// why` en lógica tricky |

**Anclas:**
- **10**: inglés, nombres con intención, funciones <30 líneas single-purpose, DRY, constantes con nombre, comentarios explican *por qué*.
- **7-8**: un Major + resto limpio.
- **4-6**: mix idiomas + God function + magics.
- **0-3**: ilegible, 500 líneas, todo mezclado.

**Ejemplo real:** `app/page.tsx:7,93` comentarios `// Leer la lista` y `{/* Este es el Checkbox */}` explican *qué* (obvio). Mejor borrar o explicar *por qué*: `// optimistic update: rollback on error`.

---

## O — Organization (0-10)

| # | Criterio | Severidad | Qué buscar |
|---|----------|-----------|------------|
| O1 | **Estructura por feature** | Major | `components/` plano con 40 archivos, `utils/misc` basurero → `features/todo/{TodoList, TodoItem, useTodos, schema}` |
| O2 | **Screaming Architecture** | Major | `src/api`, `src/hooks` por tipo en vez de por dominio |
| O3 | **Naming consistente** | Minor | `UserCard.tsx` + `user-card.tsx` + `userCard.js` mezclados → `kebab-case` archivos, `PascalCase` componentes, `camelCase` hooks |
| O4 | **Atomicidad** | Major | PR 500 líneas mezcla `feat+refactor+fix`, commit `fix` vago |
| O5 | **Boundaries** | Major | UI llama directo a `prisma`/`fetch` sin capa servicio/hook |
| O6 | **Docs** | Minor | sin `README`, sin `.env.example`, sin `docs/` |

**Anclas:**
- **10**: `features/` por dominio, `kebab`/`Pascal`/`camel` consistente, PRs atómicos <250 líneas, capas separadas, README + `.env.example`.
- **7-8**: un slip estructural pero navegable.
- **4-6**: folders por tipo + PR grande + naming mezclado.
- **0-3**: todo en una carpeta, innavegable.

**Ejemplo real:** `console.log(r.status` en la raíz (0 bytes, trackeado) → `git add .` sin revisar `git status`. La skill lo marca como O4 Minor.

---

## Ejemplos

- **10/10** → `docs/examples/edu-score-10.md` — mismo Todo, pero con todo corregido, anotado deducción por deducción.
- **~4/10** → `docs/examples/edu-score-04.md` — el repo real `Todo-List-con-TRPC` con deducciones que lo llevan a ~4.

## Flujo para el estudiante

1. **Automático primero**: `npm run edu:lint` + `gitleaks` → si está en verde, base 6/10 antes de review humano.
2. **Checklist humano**: contar deducciones, aplicar fórmula — sin "feeling".
3. **1 fix por eje**: no 20 nits; el de mayor impacto con snippet *antes/después*.
4. **Progreso**: comparar sprint a sprint; al inicio pesa más C+O (aprender), luego S.
