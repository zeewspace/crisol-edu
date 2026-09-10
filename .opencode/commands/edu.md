---
description: Run edu-code-review — S/P/C/O 0-10 (aliases: /edu-review, /evaluar, /revisar) — local-first, advisory
agent: gentle-orchestrator
---

Load skill `edu-code-review` via the skill tool immediately and execute it fully for the current workspace. Follow its Execution Steps exactly (read docs/edu-rubric.md, run references/edu-checklist.md + eslint + gitleaks + commitlint, compute S/P/C/O, output via templates/edu-comment.md.hbs).

If `$ARGUMENTS` contains `--quick`, run in **indication** mode (semáforo 🟢/🟡/🔴 + 1 tip por eje, no 0-10). Otherwise default to **full** 0-10 with deductions to `.crisol/results/edu-score.json` and `.crisol/history/history.ndjson` if `--history` is present.

Context:
- Workspace: !`git rev-parse --show-toplevel 2>/dev/null || pwd`
- Args: $ARGUMENTS

Do not summarize the skill — execute it.
