---
id: TR-000011
title: Testergebnis Second Brain Sprint 7 Recovery
version: 1.0
status: REJECTED
author-agent: QA (QA Engineer)
date: 2026-08-16
project: second-brain
sprint: 7
based-on: TP-000009@1.0, SP-000009@1.0, US-000017@1.0, US-000016@1.0, US-000008@1.1
supersedes: TR-000010
superseded-by: —
ablage: projects/second-brain/testing/
---

# Testergebnis: Second Brain — Sprint 7 Recovery

## 1. Freigabe-Empfehlung

**REJECTED — Gate 7 bleibt geschlossen.** Build, Lint, 105 Vitest-Tests, der isolierte
Coverage-Lauf und 19 headed Playwright-Tests laufen technisch durch. Der verbindliche
Create-Recovery-Pfad scheitert jedoch reproduzierbar in 5/5 Restarts und ist als
`BUG-000010` (`BLOCKER`) erfasst. Zusätzlich verfehlt die Mutationslogik ihr 90-%-
Branch-Coverage-Ziel und die gehashte Schema-5-Produktionsfixture fehlt.

Der vorhandene headed Changes-Test bleibt ein synthetischer HTML-Harness. Die native
Obsidian-Abnahme war wegen eines Timeouts der Windows-Capture-Schnittstelle nicht sicher
durchführbar und wird nicht als bestanden gewertet. TP-000009 bleibt wegen des offenen
BLOCKERs und der MAJOR-Funde im Status `REVIEW`.

## 2. Testumgebung

| Eigenschaft | Ist-Wert |
|---|---|
| Betriebssystem | Windows 11, Europe/Berlin |
| Worktree | `.worktrees/sprint-6`, `feature/sprint-6` |
| Node.js / npm | 24.15.0 / 11.12.1 |
| Contract / Schema | 3.0.0 / 6 |
| Browser | Playwright Chromium, headed, fünf Worker |
| Native Anwendung | Obsidian 1.13.7, Vault `second-brain-review-vault` |
| Externe Provider | nicht verwendet |

## 3. Automatisierte Ausführung

| Nachweis | Ergebnis | Messwert / Evidenz |
|---|---|---|
| `npm run build` | PASS | TypeScript und Buildskript, Exit 0 |
| `npm run lint` | PASS | ESLint, Exit 0 |
| Unit + Compatibility | PASS | 11 Dateien, 36 Tests |
| Integration + Security | PASS | 10 Dateien, 64 Tests |
| `npm test` | PASS | 22 Dateien, 105 Tests, 14,36 s |
| `npm run test:coverage` | COMMAND PASS / GATE MAJOR | 22 Dateien, 105 Tests, 18,12 s; Mutations-Branches unter Ziel |
| Headed Playwright | PASS | 19/19 Tests, 50,2 s; keine Skips |
| Compilation-Baseline | FAIL | PERF-000906: 5/5 Restarts mit `COMPILATION_INVALID_TARGET` |

Der erste Coverage-Versuch wurde nicht gewertet, weil er versehentlich parallel zu einer
zweiten Vitest-Instanz lief und dadurch zwei 5-s-Timeouts sowie eine temporäre SQLite-
Sperre erzeugte. Beide Befehle wurden anschließend einzeln wiederholt und bestanden stabil.

## 4. Coverage

| Bereich | Statements | Branches | Functions | Lines | Bewertung |
|---|---:|---:|---:|---:|---|
| Gesamtprojekt | 91,04 % | 81,91 % | 89,51 % | 92,69 % | Gesamt-Statementziel ≥80 % erfüllt |
| `mutation-service.ts` | 89,37 % | 82,17 % | 100 % | 92,67 % | **MAJOR: Ziel ≥90 % Branches verfehlt** |
| Policy `vault-root.ts` | 100 % | 93,75 % | 100 % | 100 % | Ziel erfüllt |
| Contract `compilation.ts` | 95,00 % | 50,00 % | 100 % | 94,73 % | zusätzliche Negativzweige sinnvoll |

Siehe `BUG-000011`. Der Coverage-Report liegt im generierten Ordner `coverage/`.

## 5. Playwright und UI-Nachweise

| Bereich | Ergebnis | Einordnung |
|---|---|---|
| Changes Inbox, Confirm/Reject, Templates, History | PASS | drei headed Tests über Page Object und synthetischen HTML-Harness |
| Setup, Suche, Beziehungen, Mutationen, Remote Consent | PASS | 16 headed Regressionstests |
| HTML-Report | PASS | `testing/playwright-report/index.html` |
| E2E-000908 echter MCP→Restart→Plugin→Decision→History | **NICHT BESTANDEN** | Service-/Kindprozessanteile vorhanden, aber kein durchgängiger gebauter Plugin-Pfad |
| Native Obsidian P0 | **BLOCKIERT** | Windows Capture: `no screenshot targets`, danach `FrameArrived timed out`; keine Blindinteraktion |

Obsidian war als genau ein Fenster mit Titel `Sprint-7-Test - second-brain-review-vault -
Obsidian 1.13.7` sichtbar. Der Accessibility-Baum enthielt nur generische Regionen ohne
bedienbare Plugin-Elemente. Die native Prüfung wird deshalb ausdrücklich nicht durch den
synthetischen Harness ersetzt.

## 6. Performance- und Ressourcenwerte

### Sprint-7-Compilation-Baseline

| ID | Messung | Ist-Wert | Ergebnis |
|---|---|---|---|
| PERF-000901 | sichtbares Polling | Unit-Nachweis für 2-s-Intervall; native Latenz blockiert | PARTIAL |
| PERF-000902 | Hintergrund-Polling | Unit-Nachweis für 15 s, Single-flight und Stop | PASS automatisiert |
| PERF-000903 | 50 Pending, 30 Läufe | Summary p50/p95/max 0,30/0,42/0,96 ms; List 1,71/3,02/3,36 ms; Detail 6,79/10,51/12,14 ms | BASELINE PASS |
| PERF-000904 | 2.000.000 Zeichen, 20 Quellen | 161,22 ms; DB 4.059.136 Byte | BASELINE PASS |
| PERF-000905 | aktives 64-MiB-Budget | 33 große Payloads angenommen; danach `PENDING_CAPACITY_REACHED`; 12.745,34 ms; DB 132.272.128 Byte | PASS |
| PERF-000906 | 50 Pending + APPLYING, fünf Restarts | 7,09–10,09 ms; 5/5 Fehler, kein terminaler Zustand | **FAIL** |

RSS des Compilation-Baseline-Prozesses: 101.601.280 → 130.359.296 Byte,
Delta 28.758.016 Byte. Für PERF-000903/904/906 ist kein separates Latenz- oder RSS-Budget
definiert; die Werte sind die geforderte Ausgangsmessung.

Die vorhandenen älteren Performance-Regressionsskripte wurden in einem gemeinsamen
sequentiellen Aufruf gestartet, erreichten aber das 360-s-Kommandolimit. Da sie nicht die
Sprint-7-Compilation-Budgets messen, wird dieser abgebrochene Lauf nicht als Sprint-7-
Ergebnis oder Produktfehler gewertet.

## 7. Story- und P0-Bewertung

| Story / Bereich | Ergebnis | Begründung |
|---|---|---|
| US-000017 Submit/Status/Scope | PASS automatisiert | MCP- und Kindprozessgrenzen, Idempotenz, Capacity und feldbezogene Fehler grün |
| US-000017 Confirm/Reject/Drift | PARTIAL | Servicepfade grün; native Plugin-only P0-Kette nicht vollständig nachgewiesen |
| US-000017 Restart/Recovery | **FAIL** | Create-Ziel vor Write bleibt durch BUG-000010 unrecovered |
| US-000017 Schema-5→6 | **BLOCKIERT** | synthetische Minimalmigration grün; Produktionsfixture fehlt, BUG-000012 |
| US-000016 Templates | PARTIAL | immutable Version, Race und Registry automatisiert; native Review-before-save offen |
| US-000008 History | PARTIAL | Success/Reject/Rollback automatisiert; echter Plugin-Recovery-Verlauf nicht bestanden |
| Security SEC-000901–909 | PARTIAL/PASS automatisiert | Decision-Grenze, Scope, Limits, Replay und Drift abgedeckt; Crash-Fall 909 schlägt fehl |
| Accessibility / Microcopy | PARTIAL | headed Harness grün; native Fokus-/Modal-/Live-Region-Abnahme blockiert |

P0-Testfälle sind nicht vollständig `✅ Bestanden`; insbesondere TC-000905, TC-000908 und
E2E-000908 verhindern Gate 7.

## 8. Neue Fehler

| ID | Schwere | Status | Kurzbeschreibung |
|---|---|---|---|
| BUG-000010 | BLOCKER | OFFEN | APPLYING-Recovery für noch nicht existierendes Create-Ziel scheitert bei jedem Restart |
| BUG-000011 | MAJOR | OFFEN | Mutations-Branch-Coverage 82,17 % statt ≥90 % |
| BUG-000012 | MAJOR | OFFEN | gehashte Schema-5-Produktionsfixture fehlt |

Kein bestehender Bug stand im Status `BEHOBEN`; es war daher keine Wiedervorlage zu
verifizieren. BUG-000001 bis BUG-000009 bleiben `VERIFIZIERT`.

## 9. Code-Graph- und Dead-Code-Prüfung

Der Code-Graph zeigt Inbox-, Template-, Pending-Review-, Poller- und History-Symbole als
verbundene Module. Niedrige Eingangsgrade exportierter Laufzeitschemas werden nicht als
Dead-Code-Beweis gewertet. Der Coverage-Report konkretisiert die verbleibenden ungetesteten
Zweige; besonders auffällig sind Mutations- und Compilation-Contract-Branches.

## 10. Gate-7-Prüfung

- [ ] TP-000009 `APPROVED` — wegen BLOCKER/MAJOR-Funden nicht implizit freigegeben.
- [ ] Keine offenen BLOCKER — BUG-000010 ist OFFEN.
- [x] Automatisierte Standardsuite grün — 105/105.
- [x] Headed Browser-Clickpfade ausgeführt — 19/19, HTML-Report vorhanden.
- [ ] Echter System-E2E und native Obsidian-P0 vollständig bestanden.
- [x] Sprint-7-Performancewerte ausgeführt und dokumentiert.
- [ ] Coverage-Ziel vollständig erreicht — Mutations-Branches unter 90 %.
- [ ] Alle P0-Testfälle bestanden — Recovery und Migration nicht bestanden/blockiert.
- [x] Neue Bugs nach Template erfasst; Root-Cause bewusst offen.
- [x] Constitution geprüft — kein neuer Netzwerkpfad und keine von QA ausgeführte Vault-Mutation.

**Gate 7: FAIL — 1 BLOCKER, 2 MAJOR, native P0-Evidenz offen.** `.phase` bleibt
`TESTING`; kein Übergang zu `REVIEW`.

---

## Übergabe: QA → BE

**Datum:** 2026-08-16
**Von:** QA Engineer (QA)
**An:** Backend Developer (BE)
**Nächster Befehl:** `/implement be second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| TP-000009 | REVIEW | `testing/TP-000009-sprint-7-recovery.md` | nicht freigegeben; Gate 7 fehlgeschlagen |
| TR-000011 | REJECTED | `testing/TR-000011-sprint-7-recovery.md` | unabhängiger Recovery-Testlauf |
| BUG-000010 | OFFEN | `testing/BUG-000010-applying-create-recovery-invalid-target.md` | BLOCKER; zuerst beheben |
| BUG-000011 | OFFEN | `testing/BUG-000011-mutation-branch-coverage-below-gate.md` | MAJOR Coverage |
| BUG-000012 | OFFEN | `testing/BUG-000012-schema-5-production-fixture-missing.md` | MAJOR Fixture-Lücke |

### Kritische Informationen für Empfänger

- Root-Cause in jedem Bug vor Code- oder Teständerung vollständig ausfüllen.
- BUG-000010 braucht einen Regressionstest für ein Create-Ziel, das beim APPLYING-Crash
  noch nicht existiert; der bereits geschriebene After-Hash-Fall muss grün bleiben.
- Nach dem Fix sind echter MCP→Restart→gebautes Plugin→Decision→History und die native
  Obsidian-Abnahme erneut P0.

### Offene Fragen (vererbt)

Keine externe Produktentscheidung erforderlich.

### Nicht-Ziele

QA hat keinen Produktcode geändert und keine Root-Cause vorweggenommen. Externe Provider,
Android, Mehrdatei-Mutation und Template-Sync bleiben außerhalb des Sprint-Scope.

### Empfehlungen

Zuerst BUG-000010 beheben, danach Fixture und fachlich gezielte Coverage-Tests ergänzen.
Anschließend `/test-run second-brain 7` vollständig wiederholen.

---

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-08-16 | Unabhängiger Sprint-7-Recovery-Testlauf; Gate 7 abgelehnt | QA |
