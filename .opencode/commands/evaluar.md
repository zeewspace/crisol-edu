---
description: Alias de /edu — Evaluar con edu-code-review (S/P/C/O advisory)
agent: gentle-orchestrator
---

Alias de `/edu` en español. Carga la skill `edu-code-review` y ejecútala completa.

Si `$ARGUMENTS` contiene `--quick`, modo indicación (semáforo); si no, 0-10 completo en `.crisol/results/edu-score.json`.

Contexto:
- Workspace: !`git rev-parse --show-toplevel 2>/dev/null || pwd`
- Args: $ARGUMENTS

No resumas — ejecuta.
