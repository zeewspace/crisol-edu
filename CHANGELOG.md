# Changelog — crisol-edu

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) + [SemVer](https://semver.org/lang/es/).

## [1.1.0] - 2026-09-10

### Added
- `.crisol/` local-first: `results/`, `history/`, `grill/`, `cache/`, `tmp/` con `README.md` y `config.example.json` (gitignored excepto `.gitkeep`)
- `scripts/edu-score.mjs` flag `--history` (append a `.crisol/history/history.ndjson`) y modo indicación 🟢/🟡/🔴 vs `--full` para 0-10
- `package.json` scripts `edu:score:full` y `edu:grill`
- `.github/dependabot.yml` para `github-actions`
- `docs/grill-report.template.md` + `docs/examples/crisol-history.sample.ndjson`
- `CHANGELOG.md` versionado para propuestas comunitarias

### Changed
- **Language Contract**: lógica en inglés obligatorio, datos de respuesta / strings user-facing en español permitido sin deducción (`docs/edu-rubric.md#C1`)
- `package.json:prepare` tolerante (`|| true`)
- `lefthook.yml` documentado como opcional (CI es fuente de verdad)
- Workflows hardenizados (SHA-pin, `permissions: read-all`, `concurrency`, `timeout`, `persist-credentials: false`, `author_association` check) y **local-first**: `edu-ci` solo en `push: main`, `edu-review` solo en `opened` + `/edu-review`
- `docs/edu-rubric.md` flujo local-first + `docs/edu-scorecard.template.md` paths `.crisol/`
- `AGENTS.md` prefijo `edu-` actualizado con `CHANGELOG.md` y `.crisol/`
- Sanitizado: removidos paths absolutos `D:\CODE\...`, `C:\Users\...` de trackeados

## [1.0.0] - 2026-09-10

### Added
- Bootstrap inicial: `AGENTS.md`, `docs/edu-rubric.md`, `edu-scorecard.template.md`, ejemplos 10/4, `eslint/commitlint/lefthook/gitleaks`, workflows `edu-ci/review`, skill `edu-code-review` (`edu-` prefix), `scripts/edu-score.mjs`, `.atl/skill-registry.md`

[1.1.0]: https://github.com/zeewspace/crisol-edu/releases/tag/v1.1.0
[1.0.0]: https://github.com/zeewspace/crisol-edu/releases/tag/v1.0.0
