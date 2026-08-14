---
id: TR-000009
title: Testergebnis Second Brain Sprint 6
version: 1.3
status: CONDITIONAL
author-agent: QA (QA Engineer)
date: 2026-08-13
project: second-brain
sprint: 6
based-on: TP-000007@1.0, US-000003@1.1, SP-000007@1.0
supersedes: —
superseded-by: —
ablage: projects/second-brain/testing/
---

# Testergebnis: Second Brain — Sprint 6

## Ergebnis

**Empfehlung:** `CONDITIONAL`

**Gate 7:** `PASS (CONDITIONAL)`. Der dritte Nachtest zu RV-000007 bestätigt zusätzlich die
Recovery verwaister Einzel-Claims nach einem Sidecar-Abbruch. Aktivierungsperiode, wartende
Pause über bereits beanspruchte Writes, automatischer Create/Update-Pfad, Budgetgrenze,
Ablauf, Audit-/Rollback-Regression und die bestehende headed Browser-Suite bestehen. Die
neue Autonomieansicht hat weiterhin keinen dedizierten
Playwright-Harness-Clickpfad und wurde nicht im echten Obsidian-Desktop-Host abgenommen.
Das sind zwei MAJOR-Auflagen, keine behaupteten PASS-Ergebnisse.

## Automatisierte Evidenz

| Prüfung | Ergebnis |
|---|---|
| `npm run build` | PASS |
| `npm run lint -- --max-warnings=0` | PASS |
| `npm test` | PASS — 86/86 Tests, 17 Dateien, 11,83 s |
| `npm run test:coverage` | PASS — 86/86 Tests, 11,49 s |
| headed `npm run test:e2e` | PASS — 16/16 Playwright-Fälle, 43,1 s |

| Metrik | Ergebnis | Ziel |
|---|---:|---:|
| Statements | 91,36 % | >=80 % — PASS |
| Branches | 84,36 % | >=80 % — PASS |
| Funktionen | 91,66 % | >=80 % — PASS |
| Zeilen | 92,27 % | >=80 % — PASS |

`mutation-service.ts` erreicht 89,03 % Statements, 86,32 % Branches, 100 % Funktionen
und 90,23 % Zeilen. Die geringere IPC-Client-Abdeckung macht den fehlenden Autonomie-
Clickpfad sichtbar, verletzt aber kein globales Coverage-Gate.

## Testfallstatus

| Bereich | Status | Evidenz |
|---|---|---|
| TC-000601 Human-on aktivieren | ⚠️ BLOCKIERT | Server-Contract und nativer Transport getestet; native Ansicht offen. |
| TC-000602 Human-out aktivieren | ⚠️ BLOCKIERT | Server-Contract und nativer Transport getestet; native Ansicht offen. |
| TC-000603 Pause | ✅ BESTANDEN, native UI offen | Pause sperrt neue Claims und wartet über bereits beanspruchte Writes. |
| TC-000604 Budgetgrenze und Ablauf | ✅ BESTANDEN | 60 parallele Creates, 61. Write, Budgetende, Ablauf und Reaktivierungsversuch deterministisch getestet. |
| TC-000605 verbotene Aktionen | ✅ BESTANDEN auf Contract-Ebene | Nur Markdown-Create/Update erreichen den Autonomiepfad; Scope-Regressionen grün. |
| TC-000606 Audit, Konflikt, Rollback | ✅ BESTANDEN | Audit-/Rollback-Suite und Vorher-Hash-Check bestehen. |
| TC-000607 Tastatur und schmaler Pane | ⚠️ BLOCKIERT | Bestehende Harness-A11y deckt die neue Autonomie-UI nicht ab. |

## Retest RV-000007

| Befund | Ergebnis | Nachweis |
|---|---|---|
| R6-001 Reaktivierung setzt Budget zurück | **BEHOBEN** | Reaktivierung innerhalb der laufenden Periode behält Zähler und Ablauf; der Test weist den 61. Write auch nach Reaktivierung ab. |
| R6-002 Pause nach Claim erlaubt Write | **BEHOBEN** | Die Pause sperrt neue Claims und antwortet erst nach jeder bereits beanspruchten Mutation; ein Zwei-Service-Race-Test beweist die Reihenfolge. |
| R6-003 Nativer automatischer Pfad fehlt | **BEHOBEN auf Transport-/Code-Ebene** | `MutationTransport`, Node-Transport und Ansicht rufen den budgetierten automatischen Create/Update-Endpunkt auf. Die native UI-Abnahme bleibt offen. |
| R6-004 Verwaister In-flight-Claim blockiert Pause | **BEHOBEN** | Persistierte Claim-ID mit Prozessinhaber wird bei fehlendem Prozess bereinigt; das Budget bleibt fail-closed verbraucht. |

## Security und Integrität

Aktivierung ohne `reviewed: true` wird durch das Schema abgewiesen. Modus, Laufzeit und
Restbudget stammen ausschließlich aus SQLite. Der Claim erfolgt transaktional vor dem
Write und begrenzt parallele Anfragen auf 60. Delete, Move, Rename, Mehrdatei, Traversal,
Nicht-Markdown und externe Änderungen erweitern keine Berechtigung; der erneute
Hashvergleich unmittelbar vor dem automatischen Write verhindert stilles Überschreiben.

Ein echter Prozessgrenzen-Test für gleichzeitig Aktivierung, Status und Pause bleibt offen.

## Performance und Stabilität

Es gibt kein freigegebenes Produktbudget. Die parallele 60-Write-Integration bestand ohne
Budgetüberschreitung. Eine 100-Prozess-p50/p95/max-Messung für Aktivierung/Status/Pause und
ein Autonomie-UI-Trace wurden noch nicht durchgeführt.

## Gate-7-Prüfung

| Kriterium | Ergebnis |
|---|---|
| TP-000007 APPROVED | PASS |
| Build, Lint, Vitest, Coverage | PASS |
| headed Playwright-Regression | PASS — bestehender Harness |
| 60/60-, Ablauf-, Pause- und Hashkonflikt-Regression | PASS |
| offene BLOCKER | PASS — 0 |
| Autonomie-UI im Harness und echten Obsidian | CONDITIONAL — zwei MAJOR-Auflagen |

## Freigabe-Empfehlung

`CONDITIONAL`: Übergabe an Review ist möglich, aber keine uneingeschränkte produktive
Freigabe. Vor einer finalen Review-Entscheidung sind der dedizierte Autonomie-Clickpfad und
die native Obsidian-Abnahme nachzuweisen.

---

## Übergabe: QA → RV

**Datum:** 2026-08-13
**Von:** QA Engineer (QA)
**An:** Review-Agent (RV)
**Nächster Befehl:** `/review second-brain 6`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| TP-000007 | APPROVED | `testing/TP-000007-sprint-6.md` | Testbasis für Autonomie und 60/60-Budget |
| TR-000009 | CONDITIONAL | `testing/TR-000009-sprint-6.md` | 0 BLOCKER, zwei MAJOR-Auflagen |

### Offene Fragen

| # | Frage | Ursprung | Kritikalität | An wen |
|---:|---|---|---|---|
| 1 | Aktivierung, Restbudget und Pause im echten Obsidian-Host nachvollziehen | TC-000601/602/607 | MAJOR | Nutzer/QA |
| 2 | Dedizierte Autonomie-Harness-Spec und Prozess-Performance-Baseline ergänzen | TP-000007 | MAJOR | FE+QA |

### Nicht-Ziele

Automatisches Delete/Move/Rename, Mehrdatei-Pakete, Konflikt-Merges, Wissenskompilierung und externe Provider.

---

*Erstellt von: QA-Agent | Datum: 2026-08-14 | Version: 1.3*
