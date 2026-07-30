# Second Brain — Index

Letzte Aktualisierung: 2026-07-30 | Phase: TESTING

## Aktive Artefakte

| Datei | ID | Version | Status | Agent | Beschreibung |
|-------|-----|---------|--------|-------|-------------|
| `discovery/SB-000001-second-brain.md` | SB-000001 | 1.0 | APPROVED | PM | Stakeholder Brief mit Produktvision, MVP und MoSCoW |
| `discovery/CON-000001-second-brain.md` | CON-000001 | 1.0 | APPROVED | PM | Bindende Projekt-Constitution |
| `discovery/DECISIONS.md` | DECISIONS | 1.0 | ACTIVE | PM | Entscheidungsprotokoll |
| `requirements/REQ-000001-product-requirements.md` | REQ-000001 | 1.0 | APPROVED | BA | Produktanforderungen, NFRs und Story Map |
| `requirements/US-000001-installation-and-mcp-setup.md` | US-000001 | 1.0 | APPROVED | BA | Installation, Vault-Auswahl und MCP-Einrichtung |
| `requirements/US-000002-read-search-and-citations.md` | US-000002 | 1.0 | APPROVED | BA | Lesen, Suche, Quellen und Anhänge |
| `requirements/US-000003-controlled-mutations.md` | US-000003 | 1.0 | APPROVED | BA | Kontrollierte Mutationen und Rollback |
| `requirements/US-000004-knowledge-graph-exploration.md` | US-000004 | 1.0 | APPROVED | BA | Knowledge Graph und Exploration |
| `requirements/US-000005-incremental-local-index.md` | US-000005 | 1.0 | APPROVED | BA | Lokale inkrementelle Indexierung |
| `requirements/US-000006-knowledge-compilation.md` | US-000006 | 1.0 | APPROVED | BA | Wissenskompilierung und Vorlagen |
| `requirements/US-000007-security-and-data-flow.md` | US-000007 | 1.0 | APPROVED | BA | Injection-Schutz und Datenflusstransparenz |
| `requirements/US-000008-change-history.md` | US-000008 | 1.0 | APPROVED | BA | Änderungsverlauf und Release-Sicht |
| `requirements/US-000009-campaignworld-boundary.md` | US-000009 | 1.0 | APPROVED | BA | campaignworld-Integrationsgrenze |
| `requirements/US-000010-android-use.md` | US-000010 | 1.0 | APPROVED | BA | Android-Nutzung nach Desktop-MVP |
| `requirements/US-000011-claude-desktop-local-setup.md` | US-000011 | 1.0 | APPROVED | BA | Lieferbarer lokaler Claude-Desktop-Slice für Sprint 1 |
| `architecture/ADR-000001-tech-stack.md` | ADR-000001 | 1.0 | APPROVED | AR | Tech-Stack, Systemdesign und NFR-Abdeckung |
| `architecture/ADR-000002-modular-monolith.md` | ADR-000002 | 1.0 | APPROVED | AR | Prozess- und Modulgrenzen |
| `architecture/ADR-000003-local-storage-and-retrieval.md` | ADR-000003 | 1.0 | APPROVED | AR | Lokale Datenhaltung und hybride Suche |
| `architecture/ADR-000004-security-and-mutations.md` | ADR-000004 | 1.0 | APPROVED | AR | Sicherheits- und Mutationsmodell |
| `architecture/ADR-000005-branching-strategy.md` | ADR-000005 | 1.0 | APPROVED | AR | Branching- und Release-Strategie |
| `architecture/STRUCTURE.md` | STRUCTURE | 1.0 | APPROVED | AR | Verbindliche Projektstruktur |
| `ux/UX-000001-mvp-interaction-design.md` | UX-000001 | 1.0 | APPROVED | UX | Journeys, Zustände, Microcopy und WCAG 2.2 AA |
| `ux/UX-000002-claude-desktop-setup-slice.md` | UX-000002 | 1.0 | APPROVED | UX | Expliziter Claude-Desktop-Setup-Flow für US-000011 |
| `sprints/SP-000002-sprint-1-foundation.md` | SP-000002 | 1.0 | APPROVED | BA+FE+BE | Verbindlicher Sprint-1-Backlog mit US-000011 und US-000005 |

## Gate-History

| Datum | Gate | Ergebnis | Blocker | Major | Minor |
|-------|------|----------|---------|-------|-------|
| 2026-07-30 | Gate 1 (Discovery → Requirements) | PASS | 0 | 0 | 0 |
| 2026-07-30 | Gate 2 (Requirements → Architecture) | PASS | 0 | 0 | 0 |
| 2026-07-30 | Gate 3 (Architecture → UX) | PASS | 0 | 0 | 0 |
| 2026-07-30 | Gate 4 (UX → Refinement) | PASS | 0 | 0 | 0 |
| 2026-07-30 | Gate 5 (Refinement → Analysis) | PASS | 0 | 0 | 0 |
| 2026-07-30 | Gate 5.5 (Cross-Artefakt-Analyse) | FAIL | 1 | 0 | 0 |
| 2026-07-30 | Gate 5 (Re-Refinement mit SP-000002) | PASS | 0 | 0 | 0 |
| 2026-07-30 | Gate 5.5 (Cross-Artefakt-Analyse, SP-000002) | PASS | 0 | 0 | 0 |
| 2026-07-30 | Gate 6 (Implementation → Testing) | PASS | 0 | 0 | 0 |

## In Bearbeitung

| Datei | ID | Status | Warten auf |
|-------|-----|--------|-----------|
| `sprints/SP-000002-sprint-1-foundation.md` | SP-000002 | APPROVED | QA-Testplanung für Sprint 1 |

## Archiv

| Datei | ID | Status | Archiviert |
|-------|-----|--------|-----------|
| `sprints/SP-000001-sprint-1-foundation.md` | SP-000001 | SUPERSEDED | 2026-07-30 |

---

## Übergabe: FE/BE → QA

**Datum:** 2026-07-30  
**Von:** Frontend Developer und Backend Developer (FE/BE)  
**An:** QA Engineer (QA)  
**Nächster Befehl:** `/test-plan second-brain 1`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| US-000011 | implementiert | `apps/sidecar/`, `apps/obsidian-plugin/` | Read-only Setup, Vertrag, UI-Zustände und sichere Root-Prüfung |
| US-000005 | implementiert | `apps/sidecar/src/indexing/` | Initialindex, Delta, Delete und sicherer Rebuild |
| Tests | bestanden | `tests/` | Unit, Security, Integration, Compatibility und E2E |

### Kritische Informationen für Empfänger

- Claude Desktop ist der einzige implementierte Sprint-1-Client.
- SQLite stammt aus `node:sqlite` in Node.js 24; kein separates natives Paket.
- Vault-Inhalte werden nicht geloggt; MCP-stdout bleibt protokollrein.

### Offene Fragen (vererbt)

Keine offenen Implementierungs-BLOCKER.

### Nicht-Ziele

ChatGPT, Mistral, Suche, Mutationen, Graph und Provider-Datenflüsse sind nicht implementiert.

### Empfehlungen

QA soll insbesondere echte Obsidian-/Claude-Desktop-Clickpfade unter Windows, 200 % Zoom,
320 px Pane-Breite und Dateihashes vor/nach Index-Rebuild prüfen.

---

*Erstellt von: Orchestrator | Datum: 2026-07-30*
