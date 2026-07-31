---
id: SP-000003
title: Sprint 2 Backlog — Lokale Suche mit Quellen
version: 1.0
status: REVIEW
author-agent: BA (Business Analyst) + FE + BE
date: 2026-07-31
project: second-brain
sprint: 2
based-on: REQ-000001, US-000012, UX-000001, ADR-000003, ADR-000004, DEBT-000001
supersedes: —
superseded-by: —
---

# Sprint 2 Backlog: Lokale Suche mit Quellen

## Sprint-Ziel

**In einem Satz:** Nutzer können den freigegebenen Vault lokal per Obsidian und Claude
Desktop durchsuchen, textbasierte Treffer mit überprüfbarer Fundstelle öffnen und erkennen
eindeutig, wenn semantische Suche oder Anhangsextraktion nicht verfügbar ist.

**Erfolgskriterium:** Alle fünf Szenarien aus US-000012 bestehen unter Windows; jeder
Texttreffer enthält Pfad, Fundstelle, Auszug und Match-Typ, alle Scope-Escape-Tests werden
abgelehnt, und Hash-Vergleiche bestätigen unveränderte Vault-Dateien.

## Sprint-Rahmen

| Eigenschaft | Wert |
|---|---|
| Sprint-Start | Nach PASS des in `/implement` integrierten Gate 5.5 |
| Sprint-Ende | Scope-basiert; keine Kalender-Timebox vorgegeben |
| Dauer | Nicht festgelegt |
| Kapazität FE | 5 SP Planbedarf |
| Kapazität BE | 16 SP Planbedarf |
| Gemeinsame/Qualität | 5 SP Planbedarf |
| Velocity (Referenz) | Sprint 1: 34 SP Planbedarf, 2/2 Stories geliefert |
| Schätzmethode | Fibonacci Story Points |

Die 26 SP sind Planbedarf, keine historische Kapazitätszusage. Eine Story wird nicht
teilweise als abgeschlossen erklärt.

## Stories im Sprint

### Commit-Stories (Must Deliver)

| US | Titel | Schätzung | Verantwortlich | Abhängigkeiten |
|---|---|---:|---|---|
| US-000012 | Volltextsuche mit überprüfbaren Quellen | 21 SP | BE+FE | US-000005, US-000011, ADR-000003, ADR-000004, UX-000001 |

**Gesamt Commit:** 21 Story Points.

### Querschnittliche Schuld

| ID | Aufgabe | Schätzung | Verantwortlich |
|---|---|---:|---|
| DEBT-000001 | Neutrale Handshake-Microcopy, operationsspezifische Timeout-/Cancel-Policy, vollständige öffentliche JSDoc und Entscheidung über `scanVault()` | 5 SP | FE+BE |

**Gesamter Planbedarf:** 26 Story Points.

### Stretch-Stories

Keine. Freie Kapazität dient Windows-Härtung, Accessibility und Retrieval-Regressionen.

### Explizit nicht im Sprint

- Abschluss der Umbrella-Story US-000002.
- Semantische Suche oder Auswahl eines Vector-Backends.
- OCR oder Inhaltsgewinnung aus PDF-, Bild- und Binäranhängen.
- US-000003 Mutationen, US-000004 Graph und US-000006 Wissenskompilierung.
- ChatGPT-, Mistral- oder Android-Erweiterungen.

## Subtasks

### US-000012: Volltextsuche mit überprüfbaren Quellen — 21 SP

| # | Subtask | Verantwortlich | Schätzung | Status |
|---|---|---|---:|---|
| 12.1 | Versionierte Search-, Read- und Citation-Verträge mit Laufzeitschemas und Fehlercodes definieren | BE | 2 SP | ⬜ |
| 12.2 | SQLite-Migration für FTS5, sichere Anhangsmetadaten und synchronisierte Indexzeilen implementieren | BE | 3 SP | ⬜ |
| 12.3 | Parametrisierte Volltextabfrage mit Ranking, Snippet und stabiler Fundstelle implementieren | BE | 3 SP | ⬜ |
| 12.4 | Read-only MCP-Tools für Suche und gezieltes Lesen mit Vault-Root-Policy anbieten | BE | 3 SP | ⬜ |
| 12.5 | Nicht extrahierbare Anhänge als reine Metadatentreffer mit Explizitstatus indexieren | BE | 2 SP | ⬜ |
| 12.6 | Search-View gemäß UX-000001 mit Empty/Loading/Results/No-results/Degraded/Error umsetzen | FE | 3 SP | ⬜ |
| 12.7 | Trefferöffnung an Quelle/Fundstelle, Tastaturpfad, Fokus und Live-Status umsetzen | FE | 2 SP | ⬜ |
| 12.8 | Unit-, Integrations-, Security- und headed E2E-Tests für alle fünf Szenarien erstellen | FE+BE | 3 SP | ⬜ |

### DEBT-000001: Sprint-1-Folgearbeiten — 5 SP

| # | Subtask | Verantwortlich | Schätzung | Status |
|---|---|---|---:|---|
| D1 | Lokalen Handshake neutral formulieren; echte Client-Verbindung weiterhin separat ausweisen | FE+BE | 1 SP | ⬜ |
| D2 | Setup-, Search-, Index- und Rebuild-Timeouts trennen und abbrechbare lange Operationen definieren | FE+BE | 2 SP | ⬜ |
| D3 | Öffentliche Transportfunktionen vollständig nach Projektstandard dokumentieren | FE+BE | 1 SP | ⬜ |
| D4 | `scanVault()` intern machen/entfernen oder durch einen getesteten Vertrag rechtfertigen | BE | 1 SP | ⬜ |

## Technische Voraussetzungen

| # | Voraussetzung | Verantwortlich | Status |
|---|---|---|---|
| 1 | US-000012 und SP-000003 durch `/implement` bestätigt | ORCH | ⬜ Übergangsaktion |
| 2 | ADR-000001–ADR-000005 und STRUCTURE APPROVED | AR | ✅ |
| 3 | UX-000001 APPROVED und Search-States vollständig | UX | ✅ |
| 4 | Sprint-1-Index und lokaler Claude-Desktop-Pfad auf `main` | FE+BE | ✅ |
| 5 | SQLite-FTS5 in der festgelegten Node.js-24-Windows-Laufzeit | BE | Im Implementierungs-Preflight per ausführbarem Smoke-Test verifizieren |
| 6 | Synthetische Text-, Metadaten-, Anhangs- und Scope-Escape-Fixtures | QA/BE | Im Sprint erweitern |
| 7 | `feature/sprint-2`-Worktree | ORCH | Erst nach Gate-5.5-PASS anlegen |

Punkt 5 ist eine verifizierbare Laufzeiteigenschaft der bereits freigegebenen Architektur,
keine offene Technologieentscheidung. Bei Fehlschlag stoppt `/implement` vor Produktcode
und meldet einen Architektur-BLOCKER.

## Definition of Ready

| Kriterium | US-000012 |
|---|:---:|
| Story eindeutig Sprint 2 zugeordnet | ✅ |
| Status durch Folge-Command bestätigbar | REVIEW ✅ |
| Mindestens drei Akzeptanzszenarien | 5 ✅ |
| UX-Abdeckung | UX-000001 ✅ |
| ADR-/Constitution-Bezug geklärt | ✅ |
| Keine ungeklärte fachliche Abhängigkeit | ✅ |
| Schätzung vorhanden | 21 SP ✅ |
| Testbarer Akzeptanznachweis definiert | ✅ |

## Qualitäts- und Abnahmekriterien

- MCP-Verträge werden vor den Handlern versioniert und laufzeitvalidiert.
- Jede Search-/Read-Funktion besitzt dokumentierten Scope; keine Mutation und keine
  beliebige Shell-, Prozess- oder Codeausführung.
- Alle Pfade durchlaufen die kanonische Vault-Root-Policy; Traversal und Symlink-Escape
  liefern stabile Fehlercodes.
- FTS-Abfragen sind parametrisiert; Vault-Rohinhalt, Suchbegriffe und Secrets erscheinen
  nicht in Logs.
- Jeder Texttreffer enthält relativen Pfad, Fundstelle, Auszug, Match-Typ und
  Extraktionsstatus; Anhangsmetadaten erfinden keinen Text.
- Domain-/Policy-nahe Module erreichen ≥ 90 % Branch Coverage; Gesamtprojekt ≥ 80 %.
- Headed Windows-E2E prüft Obsidian-Suche, Trefferöffnung und Claude-Desktop-MCP-Suche.
- Search-UI ist bei 320 px, 200 % Zoom und vollständig per Tastatur nutzbar.
- Vorher-/Nachher-Hashes beweisen, dass Suche und Lesen keine Originaldatei verändern.
- US-000002 und REQ F-005 werden nach Sprint 2 nicht als vollständig umgesetzt markiert.

## Risiken und Unsicherheiten

| Risiko | Wahrscheinlichkeit | Impact | Status | Mitigationsstrategie |
|---|---|---|---|---|
| FTS5 fehlt in der ausgelieferten Windows-Laufzeit | Niedrig | Hoch | ADRESSIERT | Smoke-Test vor Produktcode; bei Fehlschlag Hard-Stop zu AR |
| Fundstellen driften nach inkrementeller Änderung | Mittel | Hoch | ADRESSIERT | stabile Zeilen-/Offset-Regel, Reindex- und Änderungsregressionen |
| Anhangsmetadaten werden als extrahierter Inhalt missverstanden | Mittel | Mittel | ADRESSIERT | expliziter `not extracted`-Status in Vertrag und UI |
| MCP-Antworten geben zu viel Vault-Inhalt zurück | Mittel | Hoch | ADRESSIERT | begrenzte Snippets, gezielter Read-Vertrag, Scope-/Leakage-Tests |
| Search-UI und MCP-Ranking divergieren | Mittel | Mittel | ADRESSIERT | gemeinsamer Application-Service und Vertragsfixtures |
| Vector-Backend bleibt unentschieden | — | — | NICHT BLOCKIEREND | semantische Suche ist explizites Nicht-Ziel und sichtbar degradiert |

**Selbstauskunft BA+FE+BE:** Keine offene technische oder fachliche BLOCKER-Frage für den
Commit-Scope. Der FTS5-Smoke-Test ist eine explizite Preflight-Prüfung mit definiertem
Rollback zu AR, kein still akzeptiertes Risiko.

## Technische Schulden aus letztem Sprint

| DEBT-ID | Beschreibung | Priorität | Adressiert in diesem Sprint? |
|---|---|---|---|
| DEBT-000001 | Transport-, Timeout- und Codehygiene-Folgearbeiten | Mittel | Ja, vollständig als 5-SP-Querschnitt |

## Definition of Done

- [x] Sprint-Ziel und messbares Erfolgskriterium definiert.
- [x] Commit-Story geschätzt und in lieferbare Subtasks zerlegt.
- [x] Technische Voraussetzungen und Preflight-Abbruchbedingung gelistet.
- [x] UX-, Architektur-, Security- und Qualitätsanforderungen referenziert.
- [x] Sprint-1-Schuld eingeplant.
- [x] Risiken enthalten keine offenen BLOCKER.
- [x] Umbrella-Story US-000002 bleibt korrekt offen.
- [x] `requirements/INDEX.md`, `sprints/INDEX.md` und Projekt-`INDEX.md` aktualisiert.
- [x] Gate 5 ist inhaltlich PASS; formale Freigabe erfolgt durch `/implement`.

---

## Übergabe: Refinement → ORCH/FE/BE

**Datum:** 2026-07-31  
**Von:** Business Analyst, Frontend Developer und Backend Developer (BA+FE+BE)  
**An:** Orchestrator, Frontend Developer und Backend Developer (ORCH/FE/BE)  
**Nächster Befehl:** `/implement all second-brain`

### Übergebene Artefakte

| Artefakt-ID | Version | Status | Pfad | Hinweise |
|---|---:|---|---|---|
| US-000012 | 1.0 | REVIEW | `requirements/US-000012-full-text-search-and-citations.md` | Lieferbarer Volltext-/Quellen-Slice |
| SP-000003 | 1.0 | REVIEW | `sprints/SP-000003-sprint-2-search.md` | Sprint-2-Backlog, 26 SP Planbedarf |

### Kritische Informationen für Empfänger

- Der `/implement`-Aufruf bestätigt US-000012 und SP-000003 bei bestandenem Gate 5/5.5.
- Vor Produktcode muss FTS5 in der realen Node.js-24-Windows-Laufzeit ausführbar geprüft
  werden.
- US-000002 bleibt offen; semantische Suche und Anhangsextraktion sind nicht enthalten.
- DEBT-000001 wird vor weiterer Transport- oder Vault-Skalierung vollständig adressiert.

### Offene Fragen (vererbt)

Keine offene BLOCKER- oder MAJOR-Frage.

### Nicht-Ziele

Semantische Suche, OCR, Graph, Mutationen, zusätzliche MCP-Clients und Android.

### Empfehlungen

Backend zuerst: Vertrag → FTS-Migration/Smoke-Test → gemeinsamer Search-Service → MCP.
Frontend baut anschließend auf demselben Vertrag und Service auf.

---

*Erstellt von: BA+FE+BE (Refinement) | Datum: 2026-07-31 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-07-31 | Sprint-2-Backlog für Volltextsuche, Quellen und Sprint-1-Schuld | BA+FE+BE |
