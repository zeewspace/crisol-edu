---
description: Alias de /edu — Revisar con edu-code-review (S/P/C/O advisory)
agent: gentle-orchestrator
---

Alias de `/edu`. Carga la skill `edu-code-review` y ejecútala completa.

Si `$ARGUMENTS` contiene `--quick`, modo indicación; si no, 0-10 completo.

Contexto:
- Workspace: !`git rev-parse --show-toplevel 2>/dev/null || pwd`
- Args: $ARGUMENTS

No resumas — ejecuta.
