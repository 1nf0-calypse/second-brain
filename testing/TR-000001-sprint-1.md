---
id: TR-000001
title: Testergebnis Second Brain Sprint 1
version: 1.0
status: REJECTED
author-agent: QA (QA Engineer)
date: 2026-07-30
project: second-brain
sprint: 1
based-on: TP-000001, SP-000002, US-000011, US-000005
supersedes: —
superseded-by: —
---

# Testergebnis: Second Brain — Sprint 1

## Ergebnis

**Empfehlung:** `REJECTED`  
**Gate 7:** `FAIL` — zwei offene BLOCKER verhindern den nativen P0-Systempfad.

## Automatisierte Evidenz

| Prüfung | Ergebnis |
|---|---|
| `npm ci` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS — 18/18 |
| `npm run test:coverage` | PASS |
| `npm run build` | PASS |
| `npx playwright test --headed` | PASS — 4/4 |
| `npm audit --audit-level=low` | PASS — 0 Schwachstellen |

Coverage: 95,60 % Statements, 87,50 % Branches, 100 % Funktionen und 95,45 % Zeilen.
Der HTML-Report liegt unter `testing/playwright-report/`.

## Performance

| ID | Ergebnis |
|---|---|
| PERF-000001 | 30 erfolgreiche Handshakes; P95 635,49 ms; Max 764,70 ms; 0 Timeouts |
| PERF-000002 | 500 × 4 KiB: 1.913,19 ms; Peak RSS 106.127.360 Byte |
| PERF-000003 | Ein Delta: 949,64 ms; `changedFiles=1`; schneller als Initiallauf |
| PERF-000004 | No-op: 2.028,83 ms; `changedFiles=0` |
| PERF-000005 | Rebuild: 1.961,96 ms; Vault-Hashes unverändert |
| PERF-000006 | Headed UI-Suite 4 Tests in 6,4 s; keine Doppelübermittlung beobachtet |

Hinweis: Der No-op-Lauf liest wegen des aktuellen Fingerprint-Verfahrens weiterhin alle
Dateiinhalte und war in dieser Einzelmessung langsamer als der Initiallauf. Dafür existiert
noch kein freigegebenes hartes Budget; der Wert ist Baseline.

## Testfallstatus

| Testfälle | Status | Evidenz |
|---|---|---|
| TC-000002–TC-000008, TC-000010, TC-000012 | PASS soweit automatisiert | Vitest, Playwright, Prozess- und Quellprüfung |
| TC-000005–TC-000007 | PASS | 500-Dateien-Messung und Hashvergleich |
| TC-000009 | TEILWEISE | 320 px und Tastatur im headed Harness; echtes Obsidian/200 % nicht ausführbar |
| TC-000011 | NICHT AUSGEFÜHRT | Windows-Dateisperre nicht automatisiert |
| TC-000001 | FAIL | Installierbares Paket fehlt; nativer Startpfad ungültig |

Die Windows-Desktop-Steuerung war in dieser Sitzung nicht verfügbar
(`native pipe ... Datei nicht finden`). Unabhängig davon scheitert TC-000001 bereits
deterministisch an den erzeugten Artefakten und dem Prozessstartvertrag.

## Security

SEC-000001 bis SEC-000007 sind durch Contract-/Policy-Tests, parametrisierte SQLite-Zugriffe,
Symlink-Abweisung, protokollreinen erfolgreichen Handshake und `npm audit` abgedeckt.
Kein Vault-Rohinhalt oder API-Key wurde ausgegeben.

## Fehler

| ID | Schwere | Status | Kurzbeschreibung |
|---|---|---|---|
| BUG-000001 | BLOCKER | OFFEN | Plugin-Paket enthält nicht alle installierbaren Artefakte |
| BUG-000002 | BLOCKER | OFFEN | Electron-Prozesspfad und kopierte Sidecar-Konfiguration sind ungültig |

## Definition of Done / Handoff

- [x] TP-000001 ist APPROVED.
- [x] Automatisierte Tests, Build, Lint, Coverage und Audit ausgeführt.
- [x] Headed Playwright-Clickpfade ausgeführt.
- [x] Performance-Baselines dokumentiert.
- [x] Funde als BUG-Artefakte erfasst.
- [ ] Alle P0-Testfälle bestanden.
- [ ] Keine offenen BLOCKER.
- [ ] Gate 7 bestanden.

**Von:** QA  
**An:** FE+BE  
**Nächster Befehl:** `/implement all second-brain`

FE/BE füllen vor dem Fix in beiden BUG-Artefakten die Root-Cause aus, ergänzen
Regressionstests und übergeben danach erneut an `/test-run second-brain 1`.
