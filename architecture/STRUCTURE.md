---
id: STRUCTURE
title: Verbindliche Projektstruktur
version: 1.0
status: APPROVED
author-agent: AR (Software Architect)
date: 2026-07-30
project: second-brain
based-on: ADR-000001, ADR-000002, ADR-000003, ADR-000004
supersedes: —
superseded-by: —
---

# Projektstruktur: Second Brain

```text
/
├─ apps/
│  ├─ obsidian-plugin/
│  │  ├─ src/{ui,commands,settings,ipc}/
│  │  ├─ manifest.json
│  │  └─ styles.css
│  └─ sidecar/
│     └─ src/{bootstrap,mcp-gateway,policy,vault,indexing,retrieval,graph,
│             mutations,audit,providers}/
├─ packages/
│  ├─ contracts/
│  ├─ domain/
│  ├─ test-fixtures/
│  └─ config/
├─ tests/{integration,security,compatibility,e2e}/
├─ scripts/
├─ docs/
├─ package.json
├─ package-lock.json
├─ tsconfig.base.json
└─ eslint.config.js
```

## Abhängigkeitsrichtung

`UI/MCP adapters → application modules → domain/contracts`; Infrastruktur implementiert
Domain-Ports. Domain/Contracts importieren weder Obsidian, MCP SDK, SQLite noch Node APIs.

## Coding- und Qualitätsstandards

- TypeScript strict, ESM, zwei Leerzeichen, einfache Quotes, keine impliziten `any`.
- Öffentliche Funktionen: JSDoc mit Parametern, Rückgabe, Fehlern und Seiteneffekten.
- Datei-Header und TODO-Format aus `CLAUDE.md`.
- Prozessgrenzen-Schemas dienen Laufzeitvalidierung und Typgenerierung.
- Coverage: Domain/Policy/Mutations ≥ 90 % Branches, Gesamtprojekt ≥ 80 %.
- Kein Netzwerkzugriff aus Domain-Modulen; keine Vault-Inhalte in Standardlogs.

## Definition of Done

- [x] Struktur, Abhängigkeitsrichtung, Standards und Testbereiche definiert.
- [x] Status `APPROVED` durch Stakeholder-Freigabe erteilt.

---

## Übergabe: AR → FE/BE

**Nächster Befehl:** `/refine second-brain 1`.
