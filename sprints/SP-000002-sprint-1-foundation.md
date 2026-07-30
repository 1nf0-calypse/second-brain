---
id: SP-000002
title: Sprint 1 Backlog — Local Setup and Index Foundation
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst) + FE + BE
date: 2026-07-30
project: second-brain
sprint: 1
based-on: REQ-000001, US-000011, US-000005, UX-000001, UX-000002, ADR-000001, ADR-000002, ADR-000003, ADR-000004, STRUCTURE
supersedes: SP-000001
superseded-by: —
---

# Sprint 1 Backlog: Local Setup and Index Foundation

## 1. Anlass der Neufassung

SP-000002 ersetzt nach Freigabe SP-000001. Gate 5.5 hatte festgestellt, dass die
produktweite US-000001 nicht als abgeschlossen gelten kann, solange ChatGPT und Mistral
nicht geliefert sind. Der neue Backlog plant stattdessen den freigegebenen,
Claude-Desktop-spezifischen Delivery-Slice US-000011.

REQ-000001 F-002 und US-000001 bleiben unverändert verbindlich. Der Sprint schließt nur
US-000011 und US-000005 ab.

## 2. Sprint-Ziel

**In einem Satz:** Ein Windows-Nutzer kann Second Brain lokal einrichten, Claude Desktop
per MCP verbinden und einen bestehenden Obsidian-Vault ohne Mutation lokal und
inkrementell indexieren.

**Erfolgskriterium:** Der E2E-Pfad Vault auswählen → lokalen Sidecar prüfen →
Claude-Desktop-Handshake → Initialindex → inkrementelles Update → sicherer Rebuild besteht
unter Windows, ohne Originaldateien zu verändern, ohne zusätzlichen Plugin-LLM-API-Key und
ohne Zugriff außerhalb des freigegebenen Vault-Roots.

## 3. Scope

### Commit-Stories

| US | Titel | Schätzung | Verantwortlich | Abhängigkeiten |
|---|---|---:|---|---|
| US-000011 | Claude Desktop lokal einrichten | 13 SP | FE+BE | ADR-000001, ADR-000004, UX-000002 |
| US-000005 | Lokale inkrementelle Indexierung | 13 SP | BE+FE | US-000011, ADR-000003, UX-000001 |

**Gesamt Commit:** 26 Story Points.

### Querschnitt

| ID | Aufgabe | Bezug | Verantwortlich | Schätzung |
|---|---|---|---|---:|
| Q-01 | Read-only Capability-Scopes, Fehlercodes und Laufzeitschemas dokumentieren | ADR-000004, US-000007 | BE | 2 SP |
| Q-02 | Vault-/Provider-Text als tainted behandeln; keine Befehlsinterpretation | CON-000001, ADR-000004 | BE | 2 SP |
| Q-03 | Logs ohne Vault-Rohinhalt, Secrets oder MCP-stdout-Ausgabe | ADR-000001, ADR-000003 | BE | 1 SP |
| Q-04 | WCAG-2.2-AA-Tastaturpfade, Fokus, Live-Status und 320-px-Pane prüfen | UX-000001, UX-000002 | FE | 2 SP |
| Q-05 | MIT-Lizenz-Grunddatei ohne erfundenen Copyright Holder vorbereiten | CON-000001 | BA+BE | 1 SP |

**Gesamt Querschnitt:** 8 Story Points.  
**Gesamter Planbedarf:** 34 Story Points.

### Stretch-Stories

Keine. Verbleibende Kapazität dient Tests, Barrierefreiheit und Härtung.

### Explizit nicht im Sprint

- US-000001 als Umbrella-Story; sie bleibt für weitere Client-Slices offen.
- US-000002 Suche und Quellen.
- US-000003 Mutationen und Rollback.
- US-000004 Graph und Exploration.
- US-000006 Wissenskompilierung.
- Vollständige US-000007 Provider-/Consent-Story; nur notwendige Trust-Boundary-Grundlagen.
- US-000008–US-000010.
- ChatGPT- und Mistral-Kompatibilität.

## 4. Sprint-Rahmen

| Eigenschaft | Wert |
|---|---|
| Sprint-Start | Nach erneutem PASS von Gate 5.5 |
| Sprint-Ende | Scope-basiert; keine Kalender-Timebox vorgegeben |
| Dauer | Nicht festgelegt |
| Kapazität FE | 5 SP Planbedarf |
| Kapazität BE | 21 SP Planbedarf |
| Gemeinsame/QA-nahe Aufgaben | 8 SP Planbedarf |
| Velocity | Kein vorheriger Sprint |
| Schätzmethode | Fibonacci Story Points, relative Erstschätzung |

Die 34 SP sind Planbedarf, keine historische Kapazitätszusage. Bei Kapazitätskonflikt wird
keine Story halb geliefert.

## 5. Client- und Transportvertrag

| Client | Sprint-1-Status | Vertrag |
|---|---|---|
| Claude Desktop für Windows | Commit via US-000011 | lokaler MCP-Server über `stdio`; versionierter read-only Setup-Handshake |
| ChatGPT | Nicht im Sprint | bleibt Teil von REQ F-002 und US-000001; eigener Delivery-Slice erforderlich |
| Mistral | Nicht im Sprint | bleibt Teil von REQ F-002 und US-000001; eigener Delivery-Slice erforderlich |

Sprint 1 darf nur `Claude Desktop connected` anzeigen. Für ChatGPT und Mistral gilt
verbindlich die UX-000002-Microcopy `Not included in this Sprint 1 setup`.

## 6. Subtasks

### US-000011: Claude Desktop lokal einrichten — 13 SP

| # | Subtask | Verantwortlich | Schätzung | Status |
|---|---|---|---:|---|
| 11.1 | npm-Workspace, TypeScript strict, esbuild, Vitest und gemeinsame Config gemäß STRUCTURE anlegen | BE | 2 SP | ⬜ |
| 11.2 | Versionierte IPC-/MCP-Schemas und read-only Setup-Handshake definieren | BE | 2 SP | ⬜ |
| 11.3 | Sidecar-Bootstrap mit MCP-stdout und strukturiertem stderr-Logging implementieren | BE | 2 SP | ⬜ |
| 11.4 | Vault-Root validieren; Traversal, Symlink-Escape und unlesbare Pfade blockieren | BE | 2 SP | ⬜ |
| 11.5 | Setup-View gemäß UX-000002 mit Empty/Loading/Success/Error/Offline implementieren | FE | 2 SP | ⬜ |
| 11.6 | Claude-Desktop-`stdio`-Konfiguration, Kopierstatus und aktiven Verbindungstest umsetzen | FE+BE | 1 SP | ⬜ |
| 11.7 | Windows-E2E für Installation, Vertrag, Timeout und Scope-Grenzen erstellen | FE+BE | 2 SP | ⬜ |

**Akzeptanznachweis:** Alle vier Szenarien aus US-000011 sowie Journey, Zustände und
Microcopy aus UX-000002 werden nachgewiesen.

### US-000005: Lokale inkrementelle Indexierung — 13 SP

| # | Subtask | Verantwortlich | Schätzung | Status |
|---|---|---|---:|---|
| 5.1 | SQLite-Schema für Dateien, Fingerprints, Chunks und Index-Metadaten definieren | BE | 2 SP | ⬜ |
| 5.2 | Versionierte reversible Initialmigration mit Foreign Keys und WAL erstellen | BE | 2 SP | ⬜ |
| 5.3 | Initialscan innerhalb des freigegebenen Roots implementieren | BE | 2 SP | ⬜ |
| 5.4 | Hash-/Metadaten-basierte Delta-Erkennung für create/change/delete implementieren | BE | 3 SP | ⬜ |
| 5.5 | Sicheren Index-Rebuild ohne Vault-Mutation implementieren | BE | 1 SP | ⬜ |
| 5.6 | Indexstatus, Fortschritt, Fehler und `original files unchanged` gemäß UX-000001 darstellen | FE | 1 SP | ⬜ |
| 5.7 | Tests für Initiallauf, Delta, beschädigten Index, gesperrte Datei und Symlink-Escape erstellen | BE | 2 SP | ⬜ |

**Akzeptanznachweis:** Alle drei Szenarien aus US-000005; Hash-Vergleiche belegen
unveränderte Originaldateien.

## 7. Technische Voraussetzungen

| # | Voraussetzung | Verantwortlich | Status |
|---|---|---|---|
| 1 | ADR-000001–ADR-000005 und STRUCTURE APPROVED | AR | ✅ |
| 2 | US-000011 und US-000005 APPROVED | BA | ✅ |
| 3 | UX-000001 und UX-000002 APPROVED | UX | ✅ |
| 4 | Node.js 24 LTS und npm lokal verfügbar | BE | Vor Implementierung verifizieren |
| 5 | Synthetischer Windows-Test-Vault | QA/BE | Im Sprint unter `packages/test-fixtures` anzulegen |
| 6 | Claude Desktop als lokaler Testclient | Stakeholder/QA | ✅ Verbindlicher Sprint-1-Client |
| 7 | `feature/sprint-1`-Worktree | ORCH | Erst nach Gate 5.5 anlegen |

Punkte 4, 5 und 7 sind geplante Start-/Sprintaufgaben, keine ungeklärten externen
Technologieentscheidungen.

## 8. Definition of Ready

| Kriterium | US-000011 | US-000005 |
|---|:---:|:---:|
| Story APPROVED | ✅ | ✅ |
| Mindestens drei Akzeptanzszenarien | ✅ | ✅ |
| Explizite UX-Abdeckung | UX-000002 ✅ | UX-000001 ✅ |
| ADR-/Constitution-Bezug geklärt | ✅ | ✅ |
| Abhängigkeiten und Reihenfolge geklärt | ✅ | ✅ |
| Schätzung vorhanden | 13 SP | 13 SP |
| Testbarer Akzeptanznachweis definiert | ✅ | ✅ |

## 9. Qualitäts- und Abnahmekriterien

- API-/MCP-Vertrag wird vor Code erstellt und laufzeitvalidiert.
- Domain und Contracts importieren weder Obsidian, MCP SDK, SQLite noch Node APIs.
- Domain/Policy-nahe Module erreichen ≥ 90 % Branch Coverage; Gesamtprojekt ≥ 80 %.
- Keine MCP-Funktion bietet Shell-, Prozess- oder Codeausführung.
- Jeder Setup-/Index-Pfad erzwingt den freigegebenen Vault-Root.
- Originaldatei-Hashes bleiben in Setup-, Index- und Rebuild-Tests unverändert.
- UI-Zustände aus UX-000001/UX-000002 sind bei 320 px, 200 % Zoom und per Tastatur nutzbar.
- ChatGPT und Mistral werden nicht als verfügbar oder abgeschlossen dargestellt.
- US-000001 und REQ F-002 werden nach Sprint 1 nicht als vollständig umgesetzt markiert.

## 10. Risiken und Unsicherheiten

| Risiko | Schwere | Status | Mitigation |
|---|---|---|---|
| Node-/SQLite-Windows-Binary inkompatibel | MAJOR | ADRESSIERT | Adaptergrenze; FTS5-Verfügbarkeit früh prüfen |
| Claude-Desktop-Konfigurationsweg ändert sich | MAJOR | ADRESSIERT | Vertrag von datierter Anleitung trennen; Fixture-Test |
| 34 SP übersteigt reale Kapazität | MAJOR | ADRESSIERT | Keine halbe Story; neu planen statt Teilabschluss |
| Client-Scope wird erneut als F-002-Abschluss interpretiert | BLOCKER | GESCHLOSSEN | US-000011/UX-000002 und explizites Abnahmekriterium |
| Private Daten gelangen in Fixtures oder Logs | BLOCKER | GESCHLOSSEN | Nur synthetische Fixtures, Log-Sanitization, Secret-Scan |
| Autonomiebudgets oder Provider-Retention | — | NICHT ANWENDBAR | Betroffene Stories nicht im Sprint |

**Selbstauskunft BA+FE+BE:** Keine offenen technischen `BLOCKER` für den Commit-Scope.

## 11. Technische Schulden

Keine aus vorherigem Sprint; dies ist Sprint 1.

## 12. Definition-of-Done-Selbstprüfung

- [x] Gate-5.5-Fund durch lieferbaren US-000011-Slice adressiert.
- [x] Sprint-Ziel und messbares Erfolgskriterium definiert.
- [x] Beide Commit-Stories geschätzt.
- [x] Subtasks, Verantwortliche und Schätzungen vollständig.
- [x] Technische Voraussetzungen gelistet.
- [x] Definition of Ready für beide Stories erfüllt.
- [x] Risiken und Mitigationen dokumentiert.
- [x] Keine offenen technischen Blocker.
- [x] Constitution, ADRs, UX-000001 und UX-000002 eingehalten.
- [x] `sprints/INDEX.md` und Projekt-`INDEX.md` aktualisiert.
- [x] Stakeholder-Freigabe am 2026-07-30 erteilt; Status ist `APPROVED`.

---

## Übergabe: Refinement → ORCH

**Datum:** 2026-07-30  
**Von:** Business Analyst, Frontend Developer und Backend Developer (BA+FE+BE)  
**An:** Orchestrator (ORCH)  
**Nächster Befehl:** `/analyze second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| SP-000002 | APPROVED | `sprints/SP-000002-sprint-1-foundation.md` | Verbindlicher Ersatz für SP-000001; US-000011 + US-000005 |
| US-000011 | APPROVED | `requirements/US-000011-claude-desktop-local-setup.md` | Enger Claude-Desktop-Slice |
| UX-000002 | APPROVED | `ux/UX-000002-claude-desktop-setup-slice.md` | Explizite UX-Abdeckung |

### Kritische Informationen für Empfänger

- SP-000001 ist durch SP-000002 `SUPERSEDED`.
- US-000001 und REQ F-002 bleiben nach Sprint 1 offen.
- Kein Worktree vor erneutem Gate-5.5-PASS.

### Offene Fragen (vererbt)

Keine BLOCKER-Frage für den Sprint-1-Commit-Scope.

| # | Frage | Ursprung | Kritikalität | An wen |
|---|---|---|---|---|
| 1 | Reale Kapazität gegenüber 34 SP Planbedarf | SP-000002 §10 | MAJOR | Stakeholder / ORCH |
| 2 | Spätere ChatGPT-/Mistral-Slices | REQ F-002 | MAJOR | BA / AR / Stakeholder |

### Nicht-Ziele

Keine Suche, Mutationen, Graphvisualisierung, Wissenskompilierung oder zusätzlichen Clients.

### Empfehlungen

Gate 5.5 ausschließlich gegen SP-000002 erneut ausführen.
