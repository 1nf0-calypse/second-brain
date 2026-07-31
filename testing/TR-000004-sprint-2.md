---
id: TR-000004
title: Testergebnis Second Brain Sprint 2
version: 1.0
status: REJECTED
author-agent: QA (QA Engineer)
date: 2026-07-31
project: second-brain
sprint: 2
based-on: TP-000003, SP-000003, US-000012
supersedes: —
superseded-by: —
---

# Testergebnis: Second Brain — Sprint 2

## 1. Ergebnis

**Empfehlung:** `REJECTED`  
**Gate 7:** `FAIL` — BUG-000003 verletzt das P0-Scope-Fehlercode-Szenario. Die echten
Obsidian-/Claude-Desktop-P0-Pfade waren wegen fehlender Windows-Control-Pipe ebenfalls
nicht ausführbar.

## 2. Testumgebung

| Eigenschaft | Ist-Wert |
|---|---|
| Betriebssystem | Windows |
| Node.js | v24.15.0 |
| Branch | `feature/sprint-2` |
| Ausgangscommit | `1718e7a` |
| Browser | Playwright Chromium, headed |
| Vault | Synthetisch, 503 Dateien inklusive Text und Binäranhang |
| Externe Dienste | Keine |

## 3. Automatisierte Evidenz

| Prüfung | Ergebnis |
|---|---|
| `npm run lint` | PASS |
| `npm run build` | PASS |
| `npm test` | PASS — 35/35 |
| `npm run test:coverage` | PASS — 35/35 |
| `npx playwright test --headed` | PASS — 7/7 in 9,8 s |
| Search-/Read-Prozessbaseline | PASS — 30 Search-, 60 Read- und Delta-Läufe |
| Scope-Fehlervertrag | FAIL — generischer Fehlercode |

Der HTML-Report liegt unter `testing/playwright-report/`.

### Coverage

| Metrik | Ergebnis | Ziel |
|---|---:|---:|
| Statements | 93,95 % | ≥ 80 % |
| Branches gesamt | 81,69 % | ≥ 80 % |
| Funktionen | 93,18 % | ≥ 80 % |
| Zeilen | 93,67 % | ≥ 80 % |
| Vault-Policy Branches | 93,75 % | ≥ 90 % |
| Search-Service Funktionen | 100 % | 100 % |

## 4. Performance-Baselines

Es existiert kein freigegebenes Produktbudget. Werte sind Ausgangsmessungen inklusive
Node-Prozessstart, keine Produktzusage.

| ID | Ergebnis |
|---|---|
| PERF-000201 | Initialsync 503 Dateien: 5.014,21 ms; 30 Searches: p50 1.281,25 ms, p95 1.797,68 ms |
| PERF-000202 | 1 KiB Read: p50 975,14 ms, p95 1.189,70 ms; 1 MiB Read: p50 1.016,69 ms, p95 1.252,14 ms |
| PERF-000203 | Headed UI-Suite: 7 Tests in 9,8 s; Einzelinteraktionsmessung offen |
| PERF-000204 | Delta-Sync nach einer Änderung: 932,71 ms |
| PERF-000205 | RSS-Messung abgebrochen: Windows-Abfrage verfälschte den Lauf und überschritt zweimal 120 s |

Alle Search-/Read-Latenzen blieben unter der technischen 10-s-Abbruchgrenze. Hashvergleich
vor der absichtlichen Delta-Änderung bestätigte unveränderte Vault-Originale.

## 5. Testfallstatus

| Testfall | Status | Evidenz |
|---|---|---|
| TC-000201 Obsidian-Suche | ⚠️ BLOCKIERT | Native Windows-Control-Pipe nicht verfügbar |
| TC-000202 Claude-Desktop-MCP | ⚠️ BLOCKIERT | Control-Pipe fehlt; Transportintegration automatisiert grün |
| TC-000203 Scope/Symlink | ❌ FEHLGESCHLAGEN | BUG-000003; Zugriff blockiert, Fehlercode falsch |
| TC-000204 Anhang | ✅ BESTANDEN | Integrationstest |
| TC-000205 Degradation | ✅ BESTANDEN | Integration + headed Playwright |
| TC-000206 UI-Zustände | ⚠️ TEILWEISE | Empty/Results/No-results/Degraded grün; Cancel/Error nicht separat automatisiert |
| TC-000207 Query-/Limit-Grenzen | ✅ BESTANDEN | Zod-/Contract-Tests |
| TC-000208 A11y/320 px/200 % | ⚠️ TEILWEISE | Headed Harness 320 px grün; echtes Obsidian/200 % blockiert |
| TC-000209 Migration/Delta | ✅ BESTANDEN | Integrationstest + Baseline |
| TC-000210 Regression/Timeout | ✅ BESTANDEN soweit automatisiert | Setup/Index/Search-Verträge grün |

Die `computer-use`-Initialisierung scheiterte mit `Computer Use native pipe is unavailable
... Das System kann die angegebene Datei nicht finden`. Dies ist eine Testumgebungsgrenze,
kein Produkt-Bug.

## 6. Security

| ID | Ergebnis |
|---|---|
| SEC-000201 | PASS — parametrisierte FTS-Verarbeitung |
| SEC-000202 | FAIL Vertrag / PASS Enforcement — BUG-000003 |
| SEC-000203 | PASS Enforcement in Vault-Policy-Suite; nativer Systempfad offen |
| SEC-000204 | PASS im Browser-Harness; native Hostprüfung offen |
| SEC-000205 | PASS — Laufzeitschemas lehnen Grenzverletzungen ab |
| SEC-000206 | PASS — stdout leer; stderr enthält keinen Fremdinhalt |
| SEC-000207 | PASS — Vault-Hash vor/nach Search/Read unverändert |

## 7. Fehler

| ID | Schwere | Status | Kurzbeschreibung |
|---|---|---|---|
| BUG-000003 | BLOCKER | OFFEN | Scope-Verletzung liefert generischen Fehlercode |

## 8. Definition-of-Done-Selbstprüfung

- [x] TP-000003 ist APPROVED.
- [x] Lint, Build, Unit/Integration, Coverage und headed Playwright ausgeführt.
- [x] Browser-Clickpfade im headed Modus geprüft.
- [x] Performance-Baselines und Ist-Werte dokumentiert.
- [x] Coverage-Bericht erstellt; Ziele erreicht.
- [x] Fehler nach Template erfasst; Root-Cause bewusst offen.
- [ ] Echte Obsidian-/Claude-Desktop-P0-Pfade ausgeführt.
- [ ] Alle P0-Testfälle bestanden.
- [ ] Ressourcenbaseline ohne Messverfälschung abgeschlossen.
- [ ] Keine offenen BLOCKER.
- [ ] Gate 7 bestanden.

## 9. Freigabe-Empfehlung

**Empfehlung:** `REJECTED`

BE muss BUG-000003 zuerst mit dokumentierter Root-Cause und Regressionstests beheben.
Danach ist `/test-run second-brain 2` vollständig zu wiederholen.

---

## Übergabe: QA → BE

**Datum:** 2026-07-31  
**Von:** QA Engineer (QA)  
**An:** Backend Developer (BE)  
**Nächster Befehl:** `/implement be second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| TP-000003 | APPROVED | `testing/TP-000003-sprint-2.md` | Verbindliche Testbasis |
| TR-000004 | REJECTED | `testing/TR-000004-sprint-2.md` | Gate 7 FAIL |
| BUG-000003 | OFFEN | `testing/BUG-000003-scope-error-code-generic.md` | P0-Vertragsfehler |

### Kritische Informationen für Empfänger

- Die Vault-Security-Grenze hält; zu korrigieren ist die typisierte Fehlerabbildung.
- CLI und MCP benötigen Regressionstests.
- Native Desktop-P0-Tests bleiben nach dem Fix offen.

### Offene Fragen (vererbt)

Keine Reproduktionsfrage. Die Windows-Control-Pipe muss vor der nächsten vollständigen
Desktop-Abnahme verfügbar sein.

### Nicht-Ziele

Semantische Suche, OCR, Graph, Mutationen, zusätzliche MCP-Clients und Android.

### Empfehlungen

Zuerst Root-Cause dokumentieren, dann zentrale Fehlerabbildung und Regressionstests.

---

*Erstellt von: QA-Agent | Datum: 2026-07-31 | Version: 1.0*
