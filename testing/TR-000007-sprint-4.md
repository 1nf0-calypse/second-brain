---
id: TR-000007
title: Testergebnis Second Brain Sprint 4
version: 1.1
status: REJECTED
author-agent: QA (QA Engineer)
date: 2026-07-31
project: second-brain
sprint: 4
based-on: TP-000005, US-000014, SP-000005
supersedes: —
superseded-by: —
---

# Testergebnis: Second Brain — Sprint 4

## 1. Ergebnis

**Empfehlung:** `REJECTED`

**Gate 7:** `FAIL` — Build, Lint, automatisierte Tests, sichtbare Browserpfade, Atomizität
und der Speicherfix sind grün. BUG-000005 besteht an der realen Windows-Prozessgrenze
weiterhin; zusätzlich unterschreitet das Mutationsmodul mit 89,23 % sein 90-%-Branchziel.

## 2. Automatisierte Evidenz

| Prüfung | Ergebnis |
|---|---|
| Runtime | PASS — Node.js v24.15.0 |
| `npm run build` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS — 66/66 |
| `npm run test:coverage` | PASS — 66/66; Mutationsziel verfehlt |
| `npx playwright test --reporter=html` | PASS — 11/11 sichtbares Chromium, 16,6 s |
| Mutations-Performance-Harness | PASS — Speichergrenze stabil, BUG-000006 verifiziert |
| Windows-Lock-Systemtest | Atomizität PASS, Fehlersemantik erneut FAIL |

Der erste kombinierte Qualitätslauf überschritt wegen paralleler, projektfremder
Playwright-/Next-Prozesse das 120-s-Kommandolimit. Die Stufen wurden danach einzeln
vollständig und erfolgreich ausgeführt; es wurde kein Testergebnis übersprungen.

### Coverage

| Metrik | Ergebnis | Ziel |
|---|---:|---:|
| Statements | 93,35 % | ≥80 % |
| Branches gesamt | 84,65 % | ≥80 % |
| Funktionen | 95,34 % | ≥80 % |
| Zeilen | 94,08 % | ≥80 % |
| Mutationsmodul Branches | 89,23 % | ≥90 % — FAIL |

## 3. Akzeptanz- und Testfallstatus

| Testfall | Status | Evidenz |
|---|---|---|
| TC-000401 Preview read-only | ✅ BESTANDEN automatisiert | Service, MCP und sichtbarer UI-Harness; große Preview änderte Datei nicht |
| TC-000402 Update bestätigen | ✅ BESTANDEN automatisiert | Service, CLI/Transport und MCP; Audit-ID und Reindex |
| TC-000403 Create | ✅ BESTANDEN automatisiert | Create plus bestätigter Rollback |
| TC-000404 externer Konflikt | ✅ BESTANDEN automatisiert | Hashkonflikt, externe Daten erhalten |
| TC-000405 Ablauf/Replay/Parallelität | ✅ BESTANDEN | Abgelaufen/Replay blockiert; genau ein Gewinner |
| TC-000406 Update-Rollback | ✅ BESTANDEN automatisiert | 30/30 Performance-Rollbacks plus Integration |
| TC-000407 neuerer Rollback-Zustand | ✅ BESTANDEN automatisiert | Rollback-Prepare blockiert externe Änderung |
| TC-000408 untrusted Inhalt | ✅ BESTANDEN soweit automatisiert | keine generische Shell-/Prozessfähigkeit; Text bleibt Payload |
| TC-000409 Windows-Lock/Abbruch | ❌ FEHLGESCHLAGEN | Fix-Nachtest: Original intakt, 0 Temp-Dateien; weiterhin `SIDECAR_OFFLINE`, BUG-000005 |
| TC-000410 Tastatur/Fokus/320 px | ⚠️ TEILWEISE | sichtbarer Harness grün; native Bedienung unterbrochen |
| TC-000411 MCP-End-to-End | ✅ BESTANDEN automatisiert | reales SDK-MCP/stdio Prepare/Confirm/Rollback; Claude-UI noch offen |
| TC-000412 Sprint-1–3-Regression | ✅ BESTANDEN automatisiert | gesamte Suite grün |

Alle fünf US-000014-Szenarien besitzen automatisierte Evidenz; die geforderte native
Endabnahme wird erst nach Behebung der MAJOR-Bugs wiederholt.

## 4. Security und Datenintegrität

SEC-000401, 402, 404, 406, 407 und 408 sind durch Vault-, Vertrags-, Service- und
MCP-Integration bestanden. Insbesondere werden absolute/relative Escapes, reservierte
Ordner, Nicht-Markdown-Ziele, Junction-Escapes, Replay und externe Hashänderungen blockiert.

SEC-000403 wurde an der gültigen 2-MB-Grenze durch die Performance-Baseline belegt; der
Schema-Maximalwert ist laufzeitvalidiert. SEC-000405 speichert Prompt-/Tool-/HTML-Text nur
als Inhalt; es existiert keine generische Systemfähigkeit.

Der Windows-Lock-Test bewies: `content: before`, `tempFiles: 0`, Exitcode 1. Es gab keinen
Datenverlust und keine Teildatei. Die falsche öffentliche Fehlersemantik ist BUG-000005.

## 5. Performance

Kein freigegebenes Produktbudget; gemessen wurden reproduzierbare Windows-Baselines:

| ID | Ergebnis |
|---|---|
| PERF-000401 | 30 Previews à 2 MB: p50 342,56 ms, p95 623,56 ms; Quelle unverändert |
| PERF-000402 | 30 Confirms: p50 7,08 ms, p95 24,53 ms |
| PERF-000403 | 30 Rollbacks: p50 6,74 ms, p95 9,35 ms; 30/30 wiederhergestellt |
| PERF-000404 | Zwei große Batches stabil bei 160.194.560 Byte; 1.000 kleine Previews in 9.562,95 ms; 19 aktiv; RSS +7.168.000 Byte |
| PERF-000405 | sichtbare 11-Test-UI-Suite in 16,6 s; Preview/Confirm/Rollback bedienbar |

Einzeloperationen liegen deutlich unter dem technischen 60-s-Timeout. Die Datenbank wuchs
nach Erreichen der 20-Zeilen-Grenze im zweiten großen Batch nicht weiter; BUG-000006 ist
damit unabhängig verifiziert.

## 6. Native Desktop-Evidenz

Das aktuelle Pluginpaket wurde in den synthetischen Review-Vault installiert und Obsidian
1.13.4 frisch gestartet. Die aktuelle Ribbon-Aktion `Review a Second Brain note change`
und der registrierte Command waren sichtbar. Vor der ersten Texteingabe erkannte die
Windows-App-Steuerung jedoch gleichzeitige Nutzereingabe und brach gemäß Schutzrichtlinie ab.

Deshalb werden weder Obsidian-Confirm/Rollback noch Claude-Desktop-UI als bestanden
behauptet. Der reale MCP/stdio-Pfad ist automatisiert vollständig grün. Native Tests folgen
nach Bugfix und ruhigem Desktop erneut.

## 7. Gefundene Bugs

| ID | Schwere | Status | Befund |
|---|---|---|---|
| BUG-000005 | MAJOR | OFFEN | Reale Windows-Dateisperre wird weiterhin als Sidecar offline gemeldet |
| BUG-000006 | MAJOR | VERIFIZIERT | Preview-Payloads bleiben nach Erreichen der Grenze stabil |

Keine neuen BLOCKER; der wieder offene MAJOR BUG-000005 verhindert die Sprintfreigabe.

## 8. Gate-7-Prüfung

| Kriterium | Ergebnis |
|---|---|
| TP-000005 `APPROVED` | PASS |
| Offene BLOCKER-Bugs | PASS — keine |
| Build/Lint/automatisierte Tests | PASS |
| Browser-Clickpfade sichtbar | PASS |
| Coverage-Ziele | FAIL — Mutationsmodul 89,23 % statt ≥90 % |
| Performance-Istwerte | PASS — BUG-000006 verifiziert |
| Windows-Lock-Recovery | FAIL — BUG-000005 |
| Native Desktop-P0-Pfade | OFFEN — nach Fix erneut auszuführen |

## 9. Definition-of-Done-Selbstprüfung

- [x] TP-000005 ist `APPROVED`; positive und negative US-Tests existieren.
- [x] Build, Lint, Vitest und sichtbares Playwright sind grün.
- [x] Security-, Atomizitäts- und Performance-Evidenz ist gemessen.
- [x] Neue Bugs nutzen das Template; Root-Cause bleibt bewusst für BE offen.
- [x] Testergebnis und Freigabeempfehlung sind dokumentiert.
- [x] Indizes und Phase werden aktualisiert.
- [x] BUG-000006 ist unabhängig verifiziert.
- [ ] BUG-000005 besteht am realen Windows-Dateilock fort.
- [ ] Mutationsmodul erreicht das verbindliche 90-%-Branchziel.
- [ ] Native Obsidian-/Claude-Desktop-P0-Abnahme ist noch nicht vollständig.

## 10. Freigabe-Empfehlung

`REJECTED`: Rücksprung zu BE. Der reale Lock scheitert bereits beim erneuten Lesen vor dem
atomaren Write und umgeht dadurch die neue Write-Fehlerübersetzung. Dieser Pfad benötigt
eine Regression; anschließend ist `/test-run` erneut auszuführen.

---

## Übergabe: QA → BE

**Datum:** 2026-07-31
**Von:** QA Engineer (QA)
**An:** Backend Developer (BE)
**Nächster Befehl:** `/implement be second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| TP-000005 | APPROVED | `testing/TP-000005-sprint-4.md` | Verbindliche Testbasis |
| TR-000007 | REJECTED | `testing/TR-000007-sprint-4.md` | v1.1: Lock-Nachtest fehlgeschlagen, Coverageziel verfehlt |
| BUG-000005 | OFFEN | `testing/BUG-000005-lock-error-reported-offline.md` | reale Pre-Write-Sperre bleibt untypisiert |
| BUG-000006 | VERIFIZIERT | `testing/BUG-000006-preview-storage-unbounded.md` | begrenzter Preview-Cleanup bestätigt |
| Performance-Harness | bestanden mit Befund | `tests/performance/mutations-baseline.ts` | reproduziert Latenz und Speicherwachstum |

### Kritische Informationen für Empfänger

- BUG-000005 muss auch den gesperrten `readExisting()`-Pfad typisieren, nicht nur Write/Delete.
- Original-/Temp-Sicherheit und Tokenverhalten müssen regressionssicher erhalten bleiben.
- Der ergänzte Regressionstest soll zugleich das Mutations-Branchziel wieder auf ≥90 % heben.

### Offene Fragen (vererbt)

Keine Reproduktionsfrage; native Desktop-Endabnahme folgt nach Fix.

### Nicht-Ziele

Delete/Move/Rename, Mehrdatei-Mutationen, höhere Autonomie und externe Anbieter.

### Empfehlungen

Zuerst Speicherlebenszyklus und öffentliche Write-Fehler typisieren, dann beide
Regressionstests ergänzen und `/test-run second-brain 4` wiederholen.

---

*Erstellt von: QA-Agent | Datum: 2026-07-31 | Version: 1.1*
