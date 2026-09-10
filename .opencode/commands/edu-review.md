---
description: Alias of /edu — Run edu-code-review (S/P/C/O advisory)
agent: gentle-orchestrator
---

Alias of `/edu`. Load skill `edu-code-review` via the skill tool immediately and execute it fully. Same as `/edu`.

If `$ARGUMENTS` contains `--quick`, use indication mode; otherwise full 0-10.

Context:
- Workspace: !`git rev-parse --show-toplevel 2>/dev/null || pwd`
- Args: $ARGUMENTS

Do not summarize — execute.
