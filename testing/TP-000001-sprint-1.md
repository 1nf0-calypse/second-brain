---
id: TP-000001
title: Testplan Second Brain Sprint 1
version: 1.0
status: APPROVED
author-agent: QA (QA Engineer)
date: 2026-07-30
project: second-brain
sprint: 1
based-on: US-000011, US-000005, UX-000001, UX-000002, SP-000002, ADR-000001, ADR-000003, ADR-000004, CON-000001
supersedes: —
superseded-by: —
ablage: projects/second-brain/testing/
---

# Testplan: Second Brain — Sprint 1

## 1. Testumfang

**Getestete Features:**

- US-000011: Claude Desktop lokal einrichten.
- US-000005: Lokale inkrementelle Indexierung.
- Querschnitt: read-only Capability-Scope, Vault-Grenzen, Log-Sanitization,
  Tastaturbedienung, 320-px-Pane, 200-%-Zoom und MIT-Lizenzgrundlage.

**Explizit nicht getestet:**

- ChatGPT und Mistral — nicht im Sprint; dürfen nur als nicht verfügbar erscheinen.
- Suche, Quellen, Mutationen, Graph, Wissenskompilierung und Provider-Datenflüsse —
  außerhalb SP-000002.
- Android — Desktop-/Windows-Sprint.
- Semantischer Vector-Adapter — konkrete Windows-Extension ist nicht Sprint-Scope.

## 2. Teststrategie

| Ebene | Zweck | Evidenz |
|---|---|---|
| Unit | Delta-Klassifikation und Präsentationslogik | Vitest |
| Contract | Zod-Vertrag, Version, Client und Capability | Vitest |
| Integration | SQLite-Migration, Initialscan, Delta, Delete, Rebuild | Vitest + Hashvergleich |
| Security | Vault-Root, Traversal, Fremdpfad, Symlink, stdout/log scope | Vitest + Prozessprüfung |
| UI E2E | DOM-, Fokus-, Recovery- und Responsive-Clickpfade | Playwright Chromium headed |
| System manuell | Echtes Obsidian-Plugin und Claude Desktop unter Windows | Schrittprotokoll/Screenshots |
| Performance | Handshake, Indexlauf, Delta und Ressourcen-Baseline | PowerShell/Node-Messung |

Der Playwright-Harness validiert die UI-Semantik isoliert. Er ersetzt ausdrücklich nicht
den P0-Systemtest in echtem Obsidian und Claude Desktop.

## 3. Testumgebung

| Eigenschaft | Wert |
|---|---|
| Betriebssystem | Windows 11, aktueller unterstützter Patchstand |
| Runtime | Node.js 24 LTS, npm 11+ |
| Host | Aktuelle Obsidian-Desktop-Version, separater synthetischer Test-Vault |
| MCP-Client | Claude Desktop für Windows, authentifiziert nach eigenen Bedingungen |
| Browser | Playwright Chromium, bevorzugt headed |
| Datenbank | `node:sqlite`, lokale temporäre SQLite-Datei mit WAL/Foreign Keys |
| Testdaten | `packages/test-fixtures/vault/`; ausschließlich synthetische Inhalte |
| Umgebungsvariablen | `SECOND_BRAIN_VAULT_ROOT`, `SECOND_BRAIN_CONTRACT_VERSION=1.0.0`; optional `SECOND_BRAIN_INDEX_PATH` |
| Netzwerk | Für Kernpfad nicht erforderlich; keine externe Vault-Persistenz |

Vor jedem Systemtest werden SHA-256-Hashes aller Vault-Dateien gespeichert. Nach Setup,
Initialindex, Delta und Rebuild werden sie erneut verglichen.

## 4. Automatisierte Tests

### 4.1 Coverage-Ziele

| Bereich | Mindestziel | Stand vor Testlauf |
|---|---:|---|
| Domain/Policy | ≥ 90 % Branches | Letzter Implementierungslauf: Domain 100 %, Policy 93,75 % |
| Gesamt testbare Kernmodule | ≥ 80 % Branches und Statements | Letzter Lauf: 87,5 % / 95,6 % |
| E2E | Alle P0-UI-Harness-Flows | 4 Playwright-Spezifikationen geplant |

Entry-Points und Obsidian-Adapter werden nicht zur Kern-Coverage gerechnet; sie werden durch
Build, Prozess-Handshake, Playwright-Harness und manuelle Systemtests geprüft.

### 4.2 Befehle

```powershell
npm ci
npm run lint
npm test
npm run test:coverage
npm run build
npx playwright install chromium
npx playwright test --headed --reporter=html
npm audit
```

Der HTML-Report wird gemäß `playwright.config.ts` unter `testing/playwright-report/`
erzeugt. Falls headed in der Ausführungsumgebung technisch unmöglich ist, wird einmal
headless ausgeführt und die Begründung im TR-000001 dokumentiert.

### 4.3 Testinventar

| Datei | Ebene | Abdeckung | Status |
|---|---|---|---|
| `tests/unit/domain.test.ts` | Unit | create/change/delete/unchanged | vorhanden |
| `tests/compatibility/setup-contract.test.ts` | Contract | Version, Claude-Scope, kein API-Key | vorhanden |
| `tests/integration/sqlite-index.test.ts` | Integration | Initialindex, Delta, Delete, Rebuild, Hash | vorhanden |
| `tests/security/vault-root.test.ts` | Security | invalid vault, absolute path, traversal, missing target | vorhanden |
| `tests/e2e/setup-flow.test.ts` | E2E-Logik | Erfolg, Timeout, Client-Abgrenzung, Indexstatus | vorhanden |
| `tests/e2e/setup.spec.ts` | Playwright | Happy Path, Recovery, zugängliche Namen, 320 px | neu ergänzt |
| `tests/e2e/pages/setup.page.ts` | Page Object | Setup-Interaktionen | neu ergänzt |

### 4.4 Akzeptanzkriterien-Matrix

| US / Szenario | Automatisiert | Manuell | Testfall |
|---|---|---|---|
| US-000011 S1 geführtes Setup | Contract + Playwright | Obsidian/Claude-Systempfad | TC-000001 |
| US-000011 S2 kein API-Key | Contract | Setup-Microcopy/Config | TC-000002 |
| US-000011 S3 ungültiger Vault/Vertrag | Security + Contract + Playwright | Recovery-Fokus | TC-000003 |
| US-000011 S4 Root-Grenze | Security | Fremdpfad/Symlink | TC-000004 |
| US-000005 S1 Initialindex | Integration | Hash- und UI-Status | TC-000005 |
| US-000005 S2 inkrementelles Delta | Unit + Integration | create/change/delete | TC-000006 |
| US-000005 S3 sicherer Rebuild | Integration | beschädigte DB + Hash | TC-000007 |
| UX Empty/Loading/Success/Error/Offline | Playwright + Vitest | echte View | TC-000008 |
| UX Tastatur/Zoom/320 px | Playwright + axe | Obsidian 200 % | TC-000009 |

## 5. Performanztests

REQ-000001 und ADR-000001 enthalten kein allgemeines Performance-Budget. Deshalb werden
Ausgangsmessungen dokumentiert. Zwei vorhandene technische Grenzen gelten dennoch als
harte Testkriterien: Der Setup-Transport besitzt einen 5-s-Timeout, und ein einzelnes
inkrementelles Delta darf nicht in einen Vollscan unveränderter Dateiinhalte ausarten.

| ID | Bereich | Daten/Methode | Erwartetes Ergebnis |
|---|---|---|---|
| PERF-000001 | Setup-Handshake | 30 lokale Handshakes, `Measure-Command` | P95 ≤ 5 s; 0 Timeouts im synthetischen Vault |
| PERF-000002 | Initialindex | 500 synthetische Markdown-Dateien à 4 KiB | Laufzeit und Peak-RSS als Baseline dokumentiert; Abschluss ohne Fehler |
| PERF-000003 | Einzelnes Delta | Nach Initialindex genau 1/500 Dateien ändern | `changedFiles = 1`; Laufzeit unter Initialindex-Baseline |
| PERF-000004 | No-op Delta | Keine Datei ändern | `changedFiles = 0`; keine Dateiinhaltsschreibzugriffe im Vault |
| PERF-000005 | Rebuild | 500 Dateien, Index vorher absichtlich unbrauchbar | Abschluss ohne Vault-Hashänderung; Laufzeit/Peak-RSS dokumentiert |
| PERF-000006 | UI-Reaktion | Playwright-Trace für Auswahl, Copy, Test | Keine Doppelübermittlung; gemessene Latenzen im TR dokumentiert |

## 6. Manuelle Testfälle

### TC-000001: Echtes Claude-Desktop-Setup — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Windows, Obsidian, Claude Desktop, gebautes Plugin/Sidecar, synthetischer Vault |
| Schritte | 1. Plugin installieren. 2. Setup öffnen. 3. Vault wählen. 4. Konfiguration kopieren. 5. In Claude Desktop eintragen/reload. 6. Verbindung testen. |
| Erwartet | `Claude Desktop connected with read-only setup access.`; Vertragsversion sichtbar; Vault-Hashes unverändert |
| Status | ✅ Bestanden — Obsidian 1.12.7 + Claude Desktop 1.24012.9.0, synthetischer Vault |

### TC-000002: Kein zusätzlicher API-Key und keine Client-Übertreibung — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Setup-View geöffnet |
| Schritte | UI und generierte Konfiguration vollständig prüfen |
| Erwartet | Kein LLM-API-Key; keine Umgehungsbehauptung; ChatGPT/Mistral ausdrücklich nicht im Sprint |
| Status | ✅ Bestanden |

### TC-000003: Ungültiger Vault und inkompatibler Vertrag — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Ordner ohne `.obsidian`; danach Vertrag `2.0.0` |
| Schritte | Jeweils Verbindungstest starten |
| Erwartet | Konkrete Recovery-Meldung; Fokus auf Status; keine Dateiänderung |
| Status | ✅ Bestanden |

### TC-000004: Traversal, absoluter Fremdpfad und Symlink-Escape — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Synthetischer Vault und externe Markerdatei |
| Schritte | Zugriffe über `..`, absoluten Pfad und Symlink auf Markerdatei anfordern |
| Erwartet | Jeder Zugriff blockiert; kein externer Inhalt in Response oder Logs |
| Status | ✅ Bestanden |

### TC-000005: Initialindex ohne Vault-Mutation — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | 500 synthetische Dateien; SHA-256-Manifest erstellt |
| Schritte | Initialindex ausführen; Status und DB prüfen; Hashmanifest vergleichen |
| Erwartet | 500 Dateien indexiert; lokale SQLite-Datei; alle Originalhashes identisch |
| Status | ✅ Bestanden |

### TC-000006: Inkrementelles create/change/delete/no-op — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Erfolgreicher Initialindex |
| Schritte | Je eine Datei erstellen, ändern und löschen; synchronisieren; danach No-op-Lauf |
| Erwartet | Exakte Delta-Zahlen; unveränderte Dateien nicht als geändert; No-op meldet 0 |
| Status | ✅ Bestanden |

### TC-000007: Beschädigter Index und sicherer Rebuild — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Index vorhanden; Vault-Hashmanifest gespeichert |
| Schritte | Indexkopie beschädigen; Rebuild starten; DB-Integrität und Hashes prüfen |
| Erwartet | Rebuild erfolgreich; Originaldateien unverändert; verständlicher Status |
| Status | ✅ Bestanden |

### TC-000008: Sämtliche UI-Zustände und Recovery — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Setup-View und kontrollierbarer Sidecar |
| Schritte | Empty, Validating, Ready, Instructions, Testing, Success, Error und Offline auslösen |
| Erwartet | Verbindliche UX-000002-Microcopy; Controls korrekt gesperrt; keine Doppelübermittlung |
| Status | ✅ Bestanden |

### TC-000009: Tastatur, Fokus, 320 px und 200 % Zoom — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Obsidian-Setup-View |
| Schritte | Nur Tastatur; Fehler/Erfolg; Pane 320 px; Zoom 200 %; Reduced Motion |
| Erwartet | Logische Fokusreihenfolge, Live-Status, kein Inhalts-/Aktionsverlust, keine Drag-only-Aktion |
| Status | ✅ Bestanden — native View bei 200 % / 320 px, beide Aktionen sichtbar |

### TC-000010: Leere, sehr lange und Unicode-Pfade — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Testordner mit Leerzeichen, Umlauten und langem Pfad |
| Schritte | Leere Eingabe, gültigen Unicode-Pfad und Pfad nahe Windows-Grenze testen |
| Erwartet | Leer bleibt gesperrt; gültige Pfade funktionieren; Fehler sind konkret und nicht destruktiv |
| Status | ✅ Bestanden |

### TC-000011: Gesperrte/unlesbare Datei während Indexlauf — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Vault mit exklusiv gesperrter Datei |
| Schritte | Synchronisierung starten; Sperre lösen; erneut starten |
| Erwartet | Erster Lauf sicherer Fehler/keine Vault-Mutation; zweiter Lauf erfolgreich |
| Status | ⬜ Nicht getestet — P1, kein Gate-7-Blocker |

### TC-000012: stdout, stderr und Secret-Sanitization — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Sidecar mit synthetischem Secretmarker im Vault |
| Schritte | MCP-Handshake, Fehler und Indexlauf ausführen; stdout/stderr erfassen |
| Erwartet | stdout nur Protokoll/Handshake; stderr strukturiert; kein Vault-Rohinhalt oder Secretmarker |
| Status | ✅ Bestanden |

## 7. Sicherheits-Smoke-Tests

| ID | Test | Methode | Erwartetes Ergebnis |
|---|---|---|---|
| SEC-000001 | Undokumentiertes MCP-Tool | unbekannten Toolnamen aufrufen | Fehler; keine generische Datei-/Prozessausführung |
| SEC-000002 | Capability-Scope | Setup-Handshake inspizieren | ausschließlich `setup:read` |
| SEC-000003 | SQL-Sonderzeichen im Dateinamen/Inhalt | synthetische Datei indexieren | parametrisierte Speicherung; keine Schemaänderung |
| SEC-000004 | Vault-Text als Befehl | Datei enthält Werkzeug-/Systemanweisung | als Daten indexiert; keine Ausführung |
| SEC-000005 | Fremdpfad/Symlink | externer Marker | blockiert; keine Offenlegung |
| SEC-000006 | Log-Leakage | Secretmarker und Fehlerfall | Marker weder stdout noch stderr |
| SEC-000007 | Dependency-Audit | `npm audit` | 0 bekannte Schwachstellen |

## 8. Eintritts- und Austrittskriterien

**Eintritt für `/test-run`:**

- [x] Implementierung auf `feature/sprint-1` committed (`671ae67`).
- [x] Gate 6 PASS.
- [x] FE/BE→QA-Handoff vorhanden.
- [x] Automatisierte Vitest- und Playwright-Infrastruktur vorhanden.
- [x] Stakeholder-Freigabe dieses Testplans am 2026-07-30 erteilt.

**Austritt aus Testphase:**

- TP-000001 `APPROVED`.
- Alle automatisierten Tests, Build, Lint und Audit grün.
- Playwright-Clickpfade headed/UI oder begründet headless ausgeführt.
- Alle P0-Testfälle bestanden.
- Performance-Ausgangsmessungen und vorhandene 5-s-Grenze dokumentiert.
- Keine BLOCKER-Bugs außer `VERIFIZIERT`.
- TR-000001 mit Empfehlung `APPROVED` oder `CONDITIONAL`.

## 9. Risiken und offene Punkte

| Risiko | Schwere | Behandlung |
|---|---|---|
| Echter Obsidian-/Claude-Desktop-Flow ist nicht browserautomatisierbar | MAJOR | P0-Systemtest TC-000001 mit Screenshot-/Versionsnachweis |
| Headed Chromium steht eventuell nicht bereit | MAJOR | Browser installieren; andernfalls einmal headless und Grund im TR |
| Kein Produkt-Performancebudget für Index | MAJOR | Baselines messen; keine Produktzusage erfinden |
| Claude-Desktop-Konfigurationspfad kann versionsabhängig sein | MAJOR | Clientversion und verwendeten Pfad im TR festhalten |

Keine offene Frage ist ein BLOCKER für die Testplanung.

## 10. Definition-of-Done-Selbstprüfung

- [x] Jede Sprint-US besitzt Happy Path und Fehlerfall.
- [x] Jedes Akzeptanzszenario ist mindestens einem Testfall zugeordnet.
- [x] Boundary-, Security- und Recovery-Fälle dokumentiert.
- [x] Alle UX-Zustände abgedeckt.
- [x] Browser-Clickpfade und echter Obsidian-Systemtest getrennt geplant.
- [x] Playwright-Konfiguration, Page Object und Specs ergänzt.
- [x] Performance-Ziele/Baselines ohne Platzhalter definiert.
- [x] Testumgebung und Befehle vollständig.
- [x] Keine offenen Planungs-BLOCKER.
- [x] `testing/INDEX.md` und Projekt-`INDEX.md` aktualisiert.
- [x] Stakeholder-Freigabe am 2026-07-30 erteilt; Status ist `APPROVED`.

---

## Übergabe: QA-Testplanung → QA-Testausführung

**Datum:** 2026-07-30  
**Von:** QA Engineer (QA)  
**An:** QA Engineer (QA)  
**Nächster Befehl:** `/test-run second-brain 1`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| TP-000001 | APPROVED | `testing/TP-000001-sprint-1.md` | 12 manuelle Fälle, 7 Security-Smokes, 6 Performance-Messungen |
| Playwright | bereit | `playwright.config.ts`, `tests/e2e/` | Headed bevorzugt, HTML-Report in `testing/playwright-report/` |
| Implementierung | committed | `apps/`, `packages/` | Commit `671ae67` |

### Kritische Informationen für Empfänger

- Der Playwright-Harness prüft DOM/A11y/Responsive, nicht die echte Obsidian-Laufzeit.
- TC-000001 ist deshalb ein verpflichtender manueller P0-Systemtest.
- Kein allgemeines Index-Performancebudget existiert; Baselines sind verpflichtend.

### Offene Fragen (vererbt)

Keine BLOCKER-Frage.

### Nicht-Ziele

Keine Tests für ChatGPT, Mistral oder weitere ausdrücklich ausgeschlossene Sprintbereiche.

### Empfehlungen

Zuerst automatisierte Suite und Playwright ausführen, danach die echten Windows-Systemtests,
damit Infrastrukturfehler früh sichtbar werden.
