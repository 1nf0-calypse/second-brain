---
id: SP-000001
title: Sprint 1 Backlog — Local Knowledge Access Foundation
version: 1.0
status: SUPERSEDED
author-agent: BA (Business Analyst) + FE + BE
date: 2026-07-30
project: second-brain
sprint: 1
based-on: REQ-000001, US-000001, US-000005, UX-000001, ADR-000001, ADR-000002, ADR-000003, ADR-000004, STRUCTURE
supersedes: —
superseded-by: SP-000002
---

> **SUPERSEDED:** Dieses Backlog wurde durch SP-000002 ersetzt und ist nicht mehr
> Grundlage für Sprint 1 oder Gate 5.5.

# Sprint 1 Backlog: Local Knowledge Access Foundation

## 1. Sprint-Ziel

**In einem Satz:** Ein Windows-Nutzer kann Second Brain lokal einrichten, Claude Desktop
über MCP verbinden und einen bestehenden Obsidian-Vault ohne Mutation lokal und
inkrementell indexieren.

**Erfolgskriterium:** Der vollständige E2E-Pfad Setup → lokaler MCP-Handshake →
Initialindex → inkrementelles Update → sicherer Rebuild besteht unter Windows, ohne
Originaldateien zu verändern, ohne zusätzlichen LLM-API-Key und ohne Zugriff außerhalb des
freigegebenen Vault-Roots.

## 2. Scope-Entscheidung

### Commit-Scope

- US-000001: Installation, Vault-Auswahl und MCP-Einrichtung.
- US-000005: Lokale inkrementelle Indexierung.

### Nicht im Commit-Scope

- US-000003 Mutationen und Rollback: separater sicherheitskritischer Vertikalschnitt.
- US-000002 Lesen, Volltext-/semantische Suche und Quellen: folgt nach Auswahl und
  Packaging-Nachweis des Windows-kompatiblen Vector-Backends, damit die Story nicht
  unvollständig geliefert wird.
- US-000004 Graphvisualisierung: Beziehungsliste/Graph folgt auf stabilen Index.
- US-000006 Wissenskompilierung: benötigt Mutationsvertrag.
- US-000007 vollständiger Provider-/Consent-Flow: Trust-Boundary-Grundlagen sind
  Querschnittsaufgaben dieses Sprints, die vollständige Story folgt vor Release.
- US-000008–US-000010: spätere Sprints.

Der Sprint schafft die Indexbasis, behauptet aber weder Volltext- noch semantische Suche als
fertige Nutzerfunktion.

## 3. Sprint-Rahmen

| Eigenschaft | Wert |
|---|---|
| Sprint-Start | Nach PASS von Gate 5.5 |
| Sprint-Ende | Scope-basiert; keine Kalender-Timebox vorgegeben |
| Dauer | Nicht festgelegt |
| Kapazität FE | 5 SP Planbedarf |
| Kapazität BE | 21 SP Planbedarf |
| Gemeinsame/QA-nahe Aufgaben | 8 SP Planbedarf |
| Velocity (Referenz) | Kein vorheriger Sprint |
| Schätzmethode | Fibonacci Story Points, relative Erstschätzung |

Die Zahlen sind ein Planbedarf, keine historische Kapazitätszusage. Bei Kapazitätskonflikt
wird keine Commit-Story halb geliefert; der Sprint wird neu geplant.

## 4. Stories im Sprint

### Commit-Stories

| US | Titel | Schätzung | Verantwortlich | Abhängigkeiten |
|---|---|---:|---|---|
| US-000001 | Installation, Vault-Auswahl und MCP-Einrichtung | 13 SP | FE+BE | ADR-000001, UX-000001 |
| US-000005 | Lokale inkrementelle Indexierung | 13 SP | BE | US-000001 |

**Gesamt Commit:** 26 Story Points.

### Stretch-Stories

Keine. Sicherheits- oder Suchfunktionen werden nicht als ungeplanter Stretch-Scope
begonnen. Verbleibende Kapazität fließt in Tests, Barrierefreiheit und Härtung.

## 5. Verbindlicher Client- und Transport-Schnitt

| Client | Sprint-1-Status | Transport/Packaging | Begründung |
|---|---|---|---|
| Claude Desktop für Windows | Commit | lokaler MCP-Server über `stdio`; manuelle Entwicklungskonfiguration, DXT-Eignung dokumentieren | Lokale MCP-Server und Desktop Extensions werden offiziell unterstützt |
| ChatGPT | Nicht im Commit | kein direkter lokaler Anschluss; Secure MCP Tunnel wäre gesonderter Integrationspfad | ChatGPT verbindet laut aktueller Dokumentation nicht direkt zu lokalen MCP-Servern |
| Mistral | Nicht im Commit | Kompatibilitäts-Spike vor Planung | Kein freigegebener Sprint-1-Vertrag |

Quellen, geprüft am 2026-07-30:

- Anthropic: https://support.anthropic.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop
- OpenAI: https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta

Diese Eingrenzung ändert nicht den Produktscope aus REQ-000001. Sie legt nur die
Implementierungsreihenfolge fest.

## 6. Subtasks

### US-000001: Installation, Vault-Auswahl und MCP-Einrichtung — 13 SP

| # | Subtask | Verantwortlich | Schätzung | Status |
|---|---|---|---:|---|
| 1.1 | npm-Workspace, TypeScript strict, esbuild, Vitest und gemeinsame Config gemäß STRUCTURE anlegen | BE | 2 SP | ⬜ |
| 1.2 | Versionierte IPC-/MCP-Vertragsschemas und Handshake definieren | BE | 2 SP | ⬜ |
| 1.3 | Sidecar-Bootstrap mit stdout-Protokolldisziplin und stderr-Logging implementieren | BE | 2 SP | ⬜ |
| 1.4 | Vault-Root validieren; Traversal, Symlink-Escape und unlesbare Pfade blockieren | BE | 2 SP | ⬜ |
| 1.5 | Obsidian-Setup-View mit Empty/Loading/Success/Error/Offline-Zuständen umsetzen | FE | 2 SP | ⬜ |
| 1.6 | Claude-Desktop-`stdio`-Konfiguration und read-only Verbindungstest bereitstellen | FE+BE | 1 SP | ⬜ |
| 1.7 | Windows-Installations-, Vertragsversions- und Scope-E2E-Tests erstellen | FE+BE | 2 SP | ⬜ |

**Akzeptanznachweis:** Alle drei Szenarien aus US-000001 plus UX-000001 Journey 1 werden
automatisiert oder, wo Client-UI zwingend ist, reproduzierbar manuell nachgewiesen.

### US-000005: Lokale inkrementelle Indexierung — 13 SP

| # | Subtask | Verantwortlich | Schätzung | Status |
|---|---|---|---:|---|
| 5.1 | SQLite-Schema für Dateien, Fingerprints, Chunks und Index-Metadaten definieren | BE | 2 SP | ⬜ |
| 5.2 | Versionierte, reversible Initialmigration mit Foreign Keys und WAL erstellen | BE | 2 SP | ⬜ |
| 5.3 | Initialscan innerhalb des freigegebenen Roots implementieren | BE | 2 SP | ⬜ |
| 5.4 | Hash-/Metadaten-basierte Delta-Erkennung für create/change/delete implementieren | BE | 3 SP | ⬜ |
| 5.5 | Sicheren Index-Rebuild ohne Vault-Mutation implementieren | BE | 1 SP | ⬜ |
| 5.6 | Indexstatus, Fortschritt, Fehler und `original files unchanged` in der UI darstellen | FE | 1 SP | ⬜ |
| 5.7 | Fixtures für Initiallauf, Delta, beschädigten Index, gesperrte Datei und Symlink-Escape testen | BE | 2 SP | ⬜ |

**Akzeptanznachweis:** Initialindex, einzelnes Delta und sicherer Rebuild erfüllen
US-000005; Test-Hashes belegen, dass Originaldateien unverändert bleiben.

## 7. Querschnittsaufgaben

| ID | Aufgabe | Artefaktbezug | Verantwortlich | Schätzung |
|---|---|---|---|---:|
| Q-01 | Capability-Namen, read-only Scopes und Fehlercodes im API-Vertrag dokumentieren | ADR-000004, US-000007 | BE | 2 SP |
| Q-02 | Vault-/Provider-Text als tainted behandeln; keine Befehlsinterpretation | CON-000001, ADR-000004 | BE | 2 SP |
| Q-03 | Strukturierte Logs ohne Vault-Rohinhalt, Secrets oder MCP-stdout-Ausgabe | ADR-000001, ADR-000003 | BE | 1 SP |
| Q-04 | WCAG-2.2-AA-Tastaturpfade, Fokus, Live-Status und 320-px-Pane prüfen | UX-000001 | FE | 2 SP |
| Q-05 | MIT-Lizenz-Grunddatei mit Platzhalter-Hinweis für noch offenen Copyright Holder vorbereiten; keine Veröffentlichung | CON-000001 | BA+BE | 1 SP |

**Gesamt Querschnitt:** 8 Story Points.  
**Gesamter Planbedarf:** 34 Story Points.

## 8. Technische Voraussetzungen

| # | Voraussetzung | Verantwortlich | Status |
|---|---|---|---|
| 1 | ADR-000001–ADR-000005 und STRUCTURE sind APPROVED | AR | ✅ Erfüllt |
| 2 | UX-000001 ist APPROVED | UX | ✅ Erfüllt |
| 3 | Node.js 24 LTS und npm sind auf der Entwicklungsmaschine verfügbar | BE | ✅ Durch freigegebenen Stack festgelegt; vor Implementierung lokal verifizieren |
| 4 | Windows-Test-Vault mit versionierten Fixtures und ohne private Nutzerdaten | QA/BE | ✅ Im Sprint als `packages/test-fixtures` anzulegen |
| 5 | Claude Desktop als erster lokaler Testclient | Stakeholder/QA | ✅ Verbindlicher Sprint-1-Client |
| 6 | Git-Repository besitzt vor Phase 6 einen isolierten `feature/sprint-1`-Worktree | ORCH | ⬜ Wird erst nach Gate 5.5 angelegt |

Voraussetzung 6 ist kein Tech-Blocker im Refinement, sondern der vorgeschriebene
Phasenübergang aus WF-FULL-SPRINT.

## 9. Definition of Ready

| Kriterium | US-000001 | US-000005 |
|---|:---:|:---:|
| Story `APPROVED` | ✅ | ✅ |
| Mindestens drei Akzeptanzszenarien | ✅ | ✅ |
| UX-000001 referenziert | ✅ | ✅ |
| ADR-/Constitution-Bezug geklärt | ✅ | ✅ |
| Abhängigkeiten und Reihenfolge geklärt | ✅ | ✅ |
| Story-Point-Schätzung vorhanden | ✅ | ✅ |
| Testbarer Akzeptanznachweis definiert | ✅ | ✅ |

## 10. Qualitäts- und Abnahmekriterien

- Alle Code- und Testdateien folgen STRUCTURE.md und den Header-/Kommentarregeln.
- API-Vertrag wird vor Implementierung erstellt und laufzeitvalidiert.
- Domain und Contracts importieren weder Obsidian, MCP SDK, SQLite noch Node APIs.
- Domain/Policy-nahe Module erreichen mindestens 90 % Branch Coverage; Gesamtprojekt
  mindestens 80 %.
- Keine MCP-Funktion bietet Shell-, Prozess- oder Codeausführung.
- Jeder Setup-/Index-Pfad erzwingt den freigegebenen Vault-Root.
- Originaldatei-Hashes bleiben in allen Index- und Rebuild-Tests unverändert.
- Alle UX-Zustände der zwei Commit-Stories sind implementiert.
- MVP-Kernpfade sind bei 320 px Pane-Breite, 200 % Zoom und ausschließlich per Tastatur nutzbar.
- Suche, ChatGPT und Mistral werden nicht als Sprint-1-fertig dargestellt.

## 11. Risiken und Unsicherheiten

| Risiko/Unsicherheit | Schwere | Status | Mitigation |
|---|---|---|---|
| Node-/SQLite-Windows-Binary inkompatibel | MAJOR | ADRESSIERT | Native Abhängigkeit hinter Adapter; FTS5-Verfügbarkeit im ersten Implementierungsschritt prüfen |
| Claude-Desktop-Installationsweg ändert sich | MAJOR | ADRESSIERT | Kompatibilitätsfixture und datierte offizielle Quelle; Anleitung getrennt vom Vertrag |
| 34 SP übersteigt reale Kapazität | MAJOR | ADRESSIERT | Keine halbe Story; vor Implementierung Kapazität prüfen und notfalls Sprint neu planen |
| Suche wird fälschlich als fertig verstanden | MAJOR | ADRESSIERT | US-000002 liegt vollständig außerhalb des Commit-Scope |
| Private Daten gelangen in Fixtures oder Logs | BLOCKER | GESCHLOSSEN | Nur synthetische Fixtures; Log-Sanitization und Secret-Scan |
| Offene Autonomiebudgets blockieren Sprint | — | NICHT ANWENDBAR | US-000003 ist nicht im Sprint |
| Provider-Retention-Hinweise blockieren Sprint | — | NICHT ANWENDBAR | Kein externer Provider-Datenfluss im Sprint |

**Selbstauskunft BA+FE+BE:** Es bestehen keine offenen technischen `BLOCKER` für den
definierten Commit-Scope. Die MAJOR-Risiken haben konkrete Mitigationen und werden in
Gate 5.5 erneut auf Artefaktkonsistenz geprüft.

## 12. Technische Schulden aus letztem Sprint

Keine; dies ist Sprint 1.

## 13. Definition-of-Done-Selbstprüfung

- [x] Sprint-Ziel und messbares Erfolgskriterium definiert.
- [x] Alle Sprint-Stories geschätzt.
- [x] Subtasks, Verantwortliche und Schätzungen vollständig.
- [x] Technische Voraussetzungen gelistet.
- [x] Definition of Ready für jede Commit-Story erfüllt.
- [x] Risiken, Mitigationen und Nicht-Anwendbarkeit offener Folgefragen dokumentiert.
- [x] Keine ungelösten technischen Blocker im Commit-Scope.
- [x] Constitution, ADRs und UX-000001 eingehalten.
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
| SP-000001 | APPROVED | `sprints/SP-000001-sprint-1-foundation.md` | 2 Commit-Stories, 34 SP Gesamtbedarf, kein Stretch-Scope |
| UX-000001 | APPROVED | `ux/UX-000001-mvp-interaction-design.md` | Verbindlicher Interaktionsvertrag |
| ADR-000001–ADR-000005 | APPROVED | `architecture/` | Verbindliche Architektur |

### Kritische Informationen für Empfänger

- Sprint 1 unterstützt Claude Desktop lokal; ChatGPT und Mistral werden nicht als kompatibel
  behauptet.
- Suche ist noch keine fertige Nutzerfunktion; US-000002 folgt vollständig in einem späteren Sprint.
- US-000003 und die vollständige US-000007 liegen bewusst außerhalb des Commit-Scope.
- Der Worktree wird erst nach PASS von Gate 5.5 angelegt.

### Offene Fragen (vererbt)

Keine `BLOCKER`-Frage für den Sprint-1-Commit-Scope.

| # | Frage | Ursprung | Kritikalität | An wen |
|---|---|---|---|---|
| 1 | Reale Teamkapazität gegenüber 34 SP Planbedarf | SP-000001 §11 | MAJOR | Stakeholder / ORCH |
| 2 | Windows-kompatible Vector-Extension | ADR-000003 | MAJOR | AR, späterer Spike |
| 3 | ChatGPT-/Mistral-Integrationspfad | REQ-000001 | MAJOR | AR, späterer Sprint |

### Nicht-Ziele

Keine Mutationen, Graphvisualisierung, Wissenskompilierung, Android- oder
campaignworld-Integration in Sprint 1.

### Empfehlungen

Gate 5.5 soll besonders prüfen, ob US-000007 als Querschnitt ausreichend berücksichtigt
wird, ohne die Story fälschlich als abgeschlossen zu markieren.
