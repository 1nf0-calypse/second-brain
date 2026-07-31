---
id: TR-000005
title: Testergebnis Second Brain Sprint 2 Nachtest
version: 1.0
status: CONDITIONAL
author-agent: QA (QA Engineer)
date: 2026-07-31
project: second-brain
sprint: 2
based-on: TP-000003, TR-000004, BUG-000003, US-000012
supersedes: —
superseded-by: —
---

# Testergebnis: Second Brain — Sprint 2 Nachtest

## 1. Ergebnis

**Empfehlung:** `CONDITIONAL`  
**Gate 7:** `CONDITIONAL` — BUG-000003 ist verifiziert, alle automatisierten Gates und
headed Browserpfade sind grün. Die echte Obsidian-/Claude-Desktop-P0-Abnahme bleibt wegen
der nicht verfügbaren Windows-Control-Pipe offen und ist vor uneingeschränkter Freigabe
nachzuholen.

## 2. Bug-Verifikation

| Prüfung | Ergebnis |
|---|---|
| Root-Cause vollständig | PASS |
| Fix-Ansatz und Regressionsrisiko vollständig | PASS |
| CLI-Reproduktion | PASS — Exit 1, stdout leer, `PATH_OUTSIDE_VAULT` |
| Plugin-Kindprozess-Regressionsfall | PASS |
| MCP-Fehlerabbildung | PASS |
| Leakage | PASS — kein Fremd- oder Vault-Inhalt ausgegeben |
| BUG-000003 | `VERIFIZIERT` |

## 3. Automatisierte Evidenz

| Prüfung | Ergebnis |
|---|---|
| `npm run lint` | PASS |
| `npm run build` | PASS |
| `npm test` | PASS — 40/40 |
| `npm run test:coverage` | PASS — 40/40 |
| `npx playwright test --headed` | PASS — 7/7 in 7,2 s |
| Performance-Harness | PASS — 30 Search-, 60 Read- und Delta-Läufe |

### Coverage

| Metrik | Ergebnis | Ziel |
|---|---:|---:|
| Statements | 94,21 % | ≥ 80 % |
| Branches gesamt | 82,66 % | ≥ 80 % |
| Funktionen | 93,47 % | ≥ 80 % |
| Zeilen | 93,95 % | ≥ 80 % |
| Vault-Policy Branches | 93,75 % | ≥ 90 % |

## 4. Performance-Nachlauf

Kein freigegebenes Produktbudget; die Werte sind Baselines inklusive Node-Prozessstart.

| ID | Ergebnis |
|---|---|
| PERF-000201 | Initialsync 503 Dateien: 895,51 ms; Search p50 824,00 ms, p95 1.192,26 ms |
| PERF-000202 | 1 KiB Read p50 872,05 ms, p95 1.283,93 ms; 1 MiB Read p50 769,15 ms, p95 835,49 ms |
| PERF-000203 | Headed UI-Suite: 7 Tests in 7,2 s |
| PERF-000204 | Delta-Sync: 842,99 ms |
| PERF-000205 | Beobachtete Parent-Working-Set-Stichprobe: 46.628.864 Byte (44,47 MiB); kein Abbruch oder Timeout |

Vault-Hash nach allen Search-/Read-Läufen unverändert. Scope-Test: Exit 1, stdout leer,
`PATH_OUTSIDE_VAULT`.

## 5. Testfallstatus

| Testfall | Status | Evidenz |
|---|---|---|
| TC-000201 Obsidian-Suche | ⚠️ OFFEN | Native Control-Pipe fehlt |
| TC-000202 Claude-Desktop-MCP | ⚠️ OFFEN | Native Control-Pipe fehlt; Prozess-/Vertragspfad automatisiert grün |
| TC-000203 Scope/Symlink | ✅ BESTANDEN | BUG-000003 verifiziert |
| TC-000204 Anhang | ✅ BESTANDEN | Integration |
| TC-000205 Degradation | ✅ BESTANDEN | Integration + headed Browser |
| TC-000206 UI-Zustände | ⚠️ TEILWEISE | Empty/Results/No-results/Degraded grün; native Cancel/Error offen |
| TC-000207 Query-/Limit-Grenzen | ✅ BESTANDEN | Contract-Tests |
| TC-000208 A11y/320 px/200 % | ⚠️ TEILWEISE | Headed 320 px grün; native 200-%-Prüfung offen |
| TC-000209 Migration/Delta | ✅ BESTANDEN | Integration + Performance-Harness |
| TC-000210 Regression/Timeout | ✅ BESTANDEN soweit automatisiert | Alle Regressionen grün |

Die erneute `computer-use`-Initialisierung scheiterte mit `Computer Use native pipe is
unavailable ... Das System kann die angegebene Datei nicht finden`. Die Einschränkung ist
eine Testumgebungsgrenze, kein Produktfehler.

## 6. Security

SEC-000201 bis SEC-000207 sind automatisiert bestanden. Insbesondere wird jede geprüfte
Scope-Verletzung stabil typisiert, stdout bleibt protokollrein und Hashvergleiche bestätigen
read-only Verhalten.

## 7. Fehlerstatus

| ID | Schwere | Status | Ergebnis |
|---|---|---|---|
| BUG-000003 | BLOCKER | VERIFIZIERT | Behoben; kein offener Produkt-BLOCKER |

## 8. Definition-of-Done-Selbstprüfung

- [x] TP-000003 APPROVED.
- [x] BUG-000003 Root-Cause und Regression vollständig verifiziert.
- [x] Lint, Build, Tests, Coverage und headed Playwright grün.
- [x] Performance-Nachlauf mit Ist-Werten abgeschlossen.
- [x] Keine offenen Produkt-BLOCKER.
- [x] Testergebnis und Empfehlung dokumentiert.
- [x] Indizes und Phase aktualisiert.
- [ ] Echte Obsidian-/Claude-Desktop-P0-Abnahme — Control-Pipe nicht verfügbar.
- [ ] Native 200-%-Zoom- und Cancel/Error-Prüfung.

## 9. Freigabe-Empfehlung

`CONDITIONAL`: Code Review kann beginnen. Eine uneingeschränkte Nutzerabnahme darf erst
nach erfolgreichem nativen Desktop-Nachlauf erfolgen.

---

## Übergabe: QA → RV

**Datum:** 2026-07-31
**Von:** QA Engineer (QA)
**An:** Code Reviewer (RV)
**Nächster Befehl:** `/review second-brain 2`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| TP-000003 | APPROVED | `testing/TP-000003-sprint-2.md` | Verbindliche Testbasis |
| TR-000005 | CONDITIONAL | `testing/TR-000005-sprint-2-retest.md` | Automatisiert grün; native Abnahme offen |
| BUG-000003 | VERIFIZIERT | `testing/BUG-000003-scope-error-code-generic.md` | Öffentlicher Fehlervertrag repariert |

### Kritische Informationen für Empfänger

- Keine offenen Produkt-BLOCKER.
- Reviewer muss die offene native Desktop-Abnahme als Conditional-Risiko bewerten.
- Search-/Read-Sicherheits- und Performancepfade sind automatisiert belegt.

### Offene Fragen (vererbt)

| # | Frage | Ursprung | Kritikalität | An wen |
|---|---|---|---|---|
| 1 | Wann steht die Windows-Control-Pipe für Obsidian-/Claude-Desktop-P0 bereit? | Testumgebung | MAJOR | Nutzer / QA |

### Nicht-Ziele

Semantische Suche, OCR, Graph, Mutationen, zusätzliche MCP-Clients und Android.

### Empfehlungen

Code Review durchführen; vor uneingeschränktem Gate-8-PASS den nativen Desktop-Nachlauf
einfordern oder die Einschränkung ausdrücklich akzeptieren.

---

*Erstellt von: QA-Agent | Datum: 2026-07-31 | Version: 1.0*
