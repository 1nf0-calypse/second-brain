# Second Brain — Index

Letzte Aktualisierung: 2026-07-31 | Phase: TESTING

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
| `requirements/US-000012-full-text-search-and-citations.md` | US-000012 | 1.0 | APPROVED | BA | Lieferbarer Volltext- und Quellen-Slice für Sprint 2 |
| `requirements/US-000013-local-relationship-exploration.md` | US-000013 | 1.0 | APPROVED | BA | Lieferbarer read-only Relationship-Slice für Sprint 3 |
| `architecture/ADR-000001-tech-stack.md` | ADR-000001 | 1.0 | APPROVED | AR | Tech-Stack, Systemdesign und NFR-Abdeckung |
| `architecture/ADR-000002-modular-monolith.md` | ADR-000002 | 1.0 | APPROVED | AR | Prozess- und Modulgrenzen |
| `architecture/ADR-000003-local-storage-and-retrieval.md` | ADR-000003 | 1.0 | APPROVED | AR | Lokale Datenhaltung und hybride Suche |
| `architecture/ADR-000004-security-and-mutations.md` | ADR-000004 | 1.0 | APPROVED | AR | Sicherheits- und Mutationsmodell |
| `architecture/ADR-000005-branching-strategy.md` | ADR-000005 | 1.0 | APPROVED | AR | Branching- und Release-Strategie |
| `architecture/STRUCTURE.md` | STRUCTURE | 1.0 | APPROVED | AR | Verbindliche Projektstruktur |
| `ux/UX-000001-mvp-interaction-design.md` | UX-000001 | 1.0 | APPROVED | UX | Journeys, Zustände, Microcopy und WCAG 2.2 AA |
| `ux/UX-000002-claude-desktop-setup-slice.md` | UX-000002 | 1.0 | APPROVED | UX | Expliziter Claude-Desktop-Setup-Flow für US-000011 |
| `sprints/SP-000002-sprint-1-foundation.md` | SP-000002 | 1.0 | APPROVED | BA+FE+BE | Verbindlicher Sprint-1-Backlog mit US-000011 und US-000005 |
| `sprints/SP-000003-sprint-2-search.md` | SP-000003 | 1.0 | APPROVED | BA+FE+BE | Sprint-2-Backlog für Volltextsuche, Quellen und Sprint-1-Schuld |
| `sprints/SP-000004-sprint-3-relationships.md` | SP-000004 | 1.0 | APPROVED | BA+FE+BE | Sprint-3-Backlog für lokale Relationship-Exploration |
| `testing/TP-000001-sprint-1.md` | TP-000001 | 1.0 | APPROVED | QA | Testplan für Setup, Index, Security, UI und Performance |
| `testing/TP-000002-sprint-1-review-fixes.md` | TP-000002 | 1.0 | APPROVED | QA | Nachtestplan für die Gate-8-Review-Korrekturen |
| `testing/TP-000003-sprint-2.md` | TP-000003 | 1.0 | APPROVED | QA | Sprint-2-Testplan für lokale Suche, Quellen, Scope und Degradation |
| `testing/TP-000004-sprint-3.md` | TP-000004 | 1.0 | APPROVED | QA | Sprint-3-Testplan für Relationship-Exploration |
| `testing/TR-000006-sprint-3.md` | TR-000006 | 1.0 | CONDITIONAL | QA | Sprint-3-Testlauf mit offener nativer Desktop-Evidenz |
| `testing/BUG-000004-relationship-index-stale.md` | BUG-000004 | 1.0 | BEHOBEN | RV+FE+BE | Relationship-Refresh synchronisiert vor der Abfrage |
| `testing/TR-000001-sprint-1.md` | TR-000001 | 1.0 | REJECTED | QA | Sprint-1-Testlauf; Gate 7 wegen zwei BLOCKERN fehlgeschlagen |
| `testing/TR-000002-sprint-1.md` | TR-000002 | 1.0 | APPROVED | QA | Bugfixes und echter Desktop-P0-Pfad verifiziert; Gate 7 PASS |
| `testing/TR-000003-sprint-1-review-fixes.md` | TR-000003 | 1.0 | CONDITIONAL | QA | Review-Regressionen grün; erneuter Desktop-Systemtest offen |
| `testing/TR-000004-sprint-2.md` | TR-000004 | 1.0 | REJECTED | QA | Sprint-2-Testlauf; Gate 7 wegen BUG-000003 und offener Desktop-P0-Pfade fehlgeschlagen |
| `testing/TR-000005-sprint-2-retest.md` | TR-000005 | 1.0 | CONDITIONAL | QA | BUG-000003 verifiziert; automatisiert grün, native Desktop-Abnahme offen |
| `testing/BUG-000001-plugin-package-incomplete.md` | BUG-000001 | 1.0 | VERIFIZIERT | QA | Vollständiges Plugin-Paket bestätigt |
| `testing/BUG-000002-native-node-launch-invalid.md` | BUG-000002 | 1.0 | VERIFIZIERT | QA | Node-Runtime und realer Sidecar-Pfad bestätigt |
| `testing/BUG-000003-scope-error-code-generic.md` | BUG-000003 | 1.2 | VERIFIZIERT | QA | Scope-Verletzung wird über CLI, MCP und Plugin stabil typisiert |
| `reviews/RV-000001-sprint-1.md` | RV-000001 | 1.0 | REQUEST_CHANGES | RV | Nutzerabnahme conditional; acht MAJOR-Funde vor Merge |
| `reviews/RV-000002-sprint-1-rereview.md` | RV-000002 | 1.0 | APPROVED | RV | Beide Stories nach Plugin-Neustart akzeptiert; Merge freigegeben |
| `reviews/RV-000003-sprint-2.md` | RV-000003 | 1.0 | APPROVED | RV | Volltextsuche, Quellen und Scope-Schutz nativ abgenommen; Merge freigegeben |
| `docs/DOC-000001-claude-desktop-setup.md` | DOC-000001 | 1.1 | APPROVED | MW | Claude Desktop lokal verbinden und veralteten Serverpfad ersetzen |
| `docs/DOC-000002-local-index.md` | DOC-000002 | 1.0 | APPROVED | MW | Lokalen Index aktualisieren und sicher neu aufbauen |
| `docs/DOC-000003-volltextsuche-und-quellen.md` | DOC-000003 | 1.0 | APPROVED | MW | Volltextsuche, Quellenprüfung und Recovery |
| `docs/GS-000001.md` | GS-000001 | 1.0 | APPROVED | MW | Einstieg in Installation, Verbindung und Index |
| `docs/RN-000001-sprint-1.md` | RN-000001 | 1.0 | APPROVED | MW | Nutzerorientierte Release Notes für Sprint 1 |
| `docs/RN-000002-sprint-2.md` | RN-000002 | 1.0 | APPROVED | MW | Nutzerorientierte Release Notes für Sprint 2 |
| `docs/FAQ-000001-suche-und-verbindung.md` | FAQ-000001 | 1.0 | APPROVED | MW | Häufige Fragen zu Installation, Verbindung und Suche |
| `retros/RETRO-000001-sprint-1.md` | RETRO-000001 | 1.0 | REVIEW | AC | Sprint-1-Retrospektive |
| `retros/PC-000001-implicit-approval-integrated-analysis.md` | PC-000001 | 1.1 | ACTIVE | AC | Implizite Freigabe und integrierte Analyse, umgesetzt in Tool Chain v2.11 |

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
| 2026-07-30 | Gate 7 (Testing → Review) | FAIL | 2 | 0 | 0 |
| 2026-07-30 | Gate 7 (Bugfix-Rücklauf) | CONDITIONAL / TESTING | 0 | 1 | 0 |
| 2026-07-30 | Gate 7 (Desktop-P0-Nachlauf) | PASS | 0 | 0 | 0 |
| 2026-07-30 | Gate 8 (Review) | REQUEST_CHANGES | 0 | 8 | 1 |
| 2026-07-30 | Gate 8 (Re-Review) | REJECTED | 0 | 4 | 2 |
| 2026-07-30 | Gate 8 (korrigierte Nutzerabnahme) | PASS | 0 | 0 | 0 |
| 2026-07-31 | Gate 9 (Documentation → Done) | PASS | 0 | 0 | 1 |
| 2026-07-31 | Gate 10 (Release → Released) | PASS | 0 | 0 | 0 |
| 2026-07-31 | Gate 5 (Sprint 2 Refinement → Implementation) | PASS | 0 | 0 | 0 |
| 2026-07-31 | Gate 5.5 (`/implement`-Preflight, SP-000003) | PASS | 0 | 0 | 0 |
| 2026-07-31 | Gate 6 (Sprint 2 Implementation → Testing) | PASS | 0 | 0 | 0 |
| 2026-07-31 | Gate 7 (Sprint 2 Testing → Review) | FAIL | 1 | 0 | 0 |
| 2026-07-31 | Gate 7 (Sprint 2 Bugfix-Nachlauf) | CONDITIONAL / REVIEW | 0 | 2 | 0 |
| 2026-07-31 | Gate 8 (Sprint 2 Review) | PASS | 0 | 0 | 0 |
| 2026-07-31 | Gate 9 (Sprint 2 Documentation → Done) | PASS | 0 | 0 | 0 |
| 2026-07-31 | Gate 10 (Sprint 2 Release → Released) | PASS | 0 | 0 | 0 |
| 2026-07-31 | Gate 5 (Sprint 3 Refinement → Implementation-ready) | PASS | 0 | 0 | 0 |
| 2026-07-31 | Gate 5.5 (`/implement`-Preflight, SP-000004) | PASS | 0 | 0 | 0 |
| 2026-07-31 | Gate 6 (Sprint 3 Implementation → Testing) | PASS | 0 | 0 | 0 |
| 2026-07-31 | Gate 7 (Sprint 3 Testing → Review) | CONDITIONAL | 0 | 1 | 0 |

## In Bearbeitung

Sprint 3 ist vollständig implementiert und an QA übergeben.
TR-000006 ist `CONDITIONAL`: automatisiert vollständig grün; native Obsidian-/Claude-
Desktop-Evidenz bleibt als MAJOR-Testumgebungsrisiko für den Review offen.

## Übergabe: FE/BE → QA — Sprint 3

**Datum:** 2026-07-31
**Nächster Befehl:** `/test-plan second-brain 3`

- US-000013: Verträge, SQLite-Kanten, Extraktion, MCP und Obsidian-Relationship-Liste implementiert.
- Qualität: Build und Lint sauber; 48 Vitest- sowie 8 headed Playwright-Tests bestanden.
- Coverage: Statements 94,20 %, Branches 81,69 %, Functions 94,91 %, Lines 95,10 %.
- Scope: ausschließlich explizite, lokale, read-only Beziehungen; keine Inferenz oder Mutation.

| Datei | ID | Status | Warten auf |
|-------|-----|--------|-----------|
| Screenshot-Aufnahmen | — | MINOR | 8 markierte Produktaufnahmen vor öffentlicher Veröffentlichung |

## Archiv

| Datei | ID | Status | Archiviert |
|-------|-----|--------|-----------|
| `sprints/SP-000001-sprint-1-foundation.md` | SP-000001 | SUPERSEDED | 2026-07-30 |
| `retros/DEBT-000001-sprint-1-review-followups.md` | DEBT-000001 | ARCHIVED | 2026-07-31 |

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

---

## Übergabe: FE/BE → QA — Gate-7-Bugfix

**Datum:** 2026-07-30
**Von:** Frontend Developer und Backend Developer (FE/BE)
**An:** QA Engineer (QA)
**Nächster Befehl:** `/test-run second-brain 1`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| BUG-000001 | BEHOBEN | `testing/BUG-000001-plugin-package-incomplete.md` | Vollständiges installierbares Paket + Regressionstest |
| BUG-000002 | BEHOBEN | `testing/BUG-000002-native-node-launch-invalid.md` | Explizite Node-Runtime + realer Sidecar-Pfad |

### Kritische Informationen für Empfänger

- `npm run build` erzeugt das installierbare Paket unter `dist/obsidian-plugin/`.
- 20 Vitest- und 4 headed Playwright-Tests sind grün.
- Nur QA setzt die BUG-Status nach unabhängiger Reproduktion auf `VERIFIZIERT`.

### Offene Fragen

Keine Implementierungs-BLOCKER; der echte Obsidian-/Claude-Desktop-P0-Pfad bleibt QA-Aufgabe.

### Nicht-Ziele

Keine Erweiterung auf ChatGPT, Mistral, Suche oder Mutationen.

---

## Übergabe: FE/BE → QA — Sprint 2

**Datum:** 2026-07-31
**Von:** Frontend Developer und Backend Developer (FE/BE)
**An:** QA Engineer (QA)
**Nächster Befehl:** `/test-plan second-brain 2`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| US-000012 | implementiert | `apps/sidecar/src/search/`, `apps/obsidian-plugin/src/ui/search-view.ts` | Volltext, Quellen, Scope und sichtbare Degradation |
| API-Vertrag | fertig | `packages/contracts/src/index.ts` | Search-, Result-, Citation- und Read-Laufzeitschemas |
| DEBT-000001 | ARCHIVED | `retros/DEBT-000001-sprint-1-review-followups.md` | Alle vier Sprint-1-Folgearbeiten gelöst |
| Tests | bestanden | `tests/` | 32 Vitest- und 7 headed Playwright-Tests |

### Kritische Informationen für Empfänger

- FTS5 wurde unter Node.js 24.15.0 auf Windows ausführbar verifiziert.
- Semantische Suche ist absichtlich nicht enthalten und erscheint als degradierter Zustand.
- Binäranhänge liefern nur sichere Metadaten mit `not_extracted`, niemals erfundenen Inhalt.
- Suche und Lesen sind read-only und erzwingen die kanonische Vault-Root-Policy.

### Offene Fragen (vererbt)

Keine offenen Implementierungs-BLOCKER oder MAJOR-Fragen.

### Nicht-Ziele

Semantische Suche, OCR, Graph, Mutationen, zusätzliche MCP-Clients und Android.

### Empfehlungen

QA soll echte Obsidian- und Claude-Desktop-Pfade, Quellenöffnung, 320 px/200 % Zoom,
Abbruch/Timeout sowie Vault-Hashes vor und nach Suche prüfen.
