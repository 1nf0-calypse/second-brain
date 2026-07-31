---
id: TR-000006
title: Testergebnis Second Brain Sprint 3
version: 1.1
status: CONDITIONAL
author-agent: QA (QA Engineer)
date: 2026-07-31
project: second-brain
sprint: 3
based-on: TP-000004, US-000013, SP-000004
supersedes: —
superseded-by: —
---

# Testergebnis: Second Brain — Sprint 3

## 1. Ergebnis

**Empfehlung:** `CONDITIONAL`

**Gate 7:** `CONDITIONAL` — Implementierung, Verträge, Security, Coverage, reale
Sidecar-Prozesse, headed Browserpfade und Performance-Baselines sind grün. Die native
Obsidian-/Claude-Desktop-Abnahme konnte wegen einer fehlenden Windows-Control-Pipe nicht
ausgeführt werden und bleibt als MAJOR-Testumgebungsrisiko offen.

## 2. Automatisierte Evidenz

| Prüfung | Ergebnis |
|---|---|
| Runtime | PASS — Node.js v24.15.0 |
| `npm run build` | PASS |
| `npm run lint` | PASS |
| `npm test` | PASS — 48/48 in 16,25 s |
| `npm run test:coverage` | PASS — 48/48 in 9,15 s |
| `npm run test:e2e` | PASS — 8/8 headed Chromium in 17,5 s |
| Relationship-Performance-Harness | PASS — 500 Notizen, 100 reale Abfragen |

### Coverage

| Metrik | Ergebnis | Ziel |
|---|---:|---:|
| Statements | 94,20 % | ≥ 80 % |
| Branches gesamt | 81,69 % | ≥ 80 % |
| Funktionen | 94,91 % | ≥ 80 % |
| Zeilen | 95,10 % | ≥ 80 % |
| Relationship-Extraktion Branches | 87,50 % | ≥ 80 % |
| Relationship-Extraktion Lines | 100 % | ≥ 90 % |

## 3. Akzeptanz- und Testfallstatus

| Testfall | Status | Evidenz |
|---|---|---|
| TC-000301 Typen/Quellen | ✅ BESTANDEN | Unit/Integration, headed Harness und native Obsidian-Abnahme grün |
| TC-000302 Navigation/Backlink | ✅ BESTANDEN | Headed Navigation und native aktive Notiz grün |
| TC-000303 Claude-MCP read-only | ⚠️ TEILWEISE | Realer Node-Kindprozess, Vertrag und Hash grün; Claude Desktop offen |
| TC-000304 Delta/Delete | ✅ BESTANDEN | Integration + Performance, `changedFiles: 1` |
| TC-000305 Unaufgelöst/untrusted | ✅ BESTANDEN | Unit/Integration; kein navigierbares erfundenes Ziel |
| TC-000306 UI-Zustände | ✅ BESTANDEN | Harness sowie nativer Fehler-, Leer- und Ergebniszustand geprüft |
| TC-000307 Vertragsgrenzen | ✅ BESTANDEN | Zod-Schemas und Integrationssuite |
| TC-000308 A11y/320 px/200 % | ⚠️ TEILWEISE | Headed 640 px als 200-%-Äquivalent; natives Obsidian offen |
| TC-000309 Unicode/Alias/Mehrdeutigkeit | ✅ BESTANDEN soweit automatisiert | Normalisierung, Alias und unaufgelöstes Ziel geprüft |
| TC-000310 Regression | ✅ BESTANDEN | Setup, Index, Search, Read und Relationship-Suite grün |

Alle fünf US-000013-Akzeptanzszenarien besitzen grüne automatisierte Evidenz. Der native
Host-Nachweis für Szenario 2 und der echte Claude-Client-Nachweis für Szenario 3 bleiben offen.

## 4. Security

SEC-000301 bis SEC-000307 sind durch Vertrags-, Vault-Policy-, Extraktions-,
Kindprozess- und Hashregressionen bestanden. Insbesondere:

- keine generische Datei- oder Prozessfähigkeit in den MCP-Tools,
- parametrisierte SQLite-Abfragen,
- unaufgelöste Ziele bleiben nicht navigierbar,
- Vault-Text erzeugt keine zusätzliche Berechtigung,
- Hashvergleich bestätigt unveränderte Originaldateien.

Keine neuen Produktfehler wurden gefunden; es wurde kein BUG-Artefakt angelegt.

## 5. Performance

Kein freigegebenes Produktbudget; folgende Windows-Baselines enthalten den Node-Prozessstart:

| ID | Ergebnis |
|---|---|
| PERF-000301 | 100 Relationship-Abfragen: p50 419,85 ms, p95 899,26 ms; kein 10-s-Timeout |
| PERF-000302 | Delta-Sync 653,21 ms; exakt eine geänderte Datei |
| PERF-000303 | Full Rebuild für 500 Notizen: 1.831,10 ms; 500 indexiert |
| PERF-000304 | Headed UI-Suite: 8 Tests in 17,5 s; Relationship-Flow bedienbar |
| PERF-000305 | Parent-RSS 48.095.232 → 48.300.032 Byte; Delta 204.800 Byte nach 100 Abfragen |

Die Baseline liegt deutlich unter der technischen 10-s-Abbruchgrenze. Aus den Messungen
wird mangels freigegebenem Budget keine neue Produktzusage abgeleitet.

## 6. Native Desktop-Evidenz

Die Nutzerabnahme in Obsidian bestand mit einem synthetischen Vault: `Alpha` enthielt
einen Link auf `Beta` und den Tag `#alpha`; die Relationship-Ansicht zeigte beide nach der
automatischen Migration eines vorhandenen Indexes. BUG-000004 ist damit `VERIFIZIERT`.
Ein vollständiger Obsidian-Neustart war erforderlich; `Strg+R` ersetzte den laufenden
Plugin-Kindprozess in dieser Umgebung nicht zuverlässig.

Die automatisierte Windows-App-Steuerung blieb unabhängig davon nicht verfügbar:

Die Initialisierung der Windows-App-Steuerung scheiterte vor jeder UI-Aktion mit:

```text
Computer Use native pipe is unavailable: failed to connect native pipe:
Das System kann die angegebene Datei nicht finden. (os error 2)
```

Das ist eine Einschränkung der QA-Umgebung, kein beobachteter Produktfehler. Der Browserlauf
war tatsächlich headed; echte Obsidian- und Claude-Desktop-Aktionen wurden nicht behauptet.

## 7. Gate-7-Prüfung

| Kriterium | Ergebnis |
|---|---|
| TP-000004 `APPROVED` | PASS |
| Offene BLOCKER-Bugs | PASS — keine |
| Build/Lint/automatisierte Tests | PASS |
| Browser-Clickpfade dokumentiert und headed | PASS |
| Performance-Istwerte vollständig | PASS |
| Coverage-Ziele | PASS |
| P0 automatisiert | PASS |
| P0 native Desktop-Systempfade | CONDITIONAL — Control-Pipe fehlt |

## 8. Definition-of-Done-Selbstprüfung

- [x] TP-000004 ist `APPROVED`.
- [x] Build, Lint, Vitest, Coverage und headed Playwright sind grün.
- [x] Security- und Datenintegritätsregressionen sind grün.
- [x] Performance-Baselines besitzen gemessene Istwerte.
- [x] Keine offenen Produkt-BLOCKER.
- [x] Testergebnis und Freigabeempfehlung dokumentiert.
- [x] Indizes und Phase werden aktualisiert.
- [x] Echte Obsidian-Relationship-Abnahme — durch Nutzer im aktiven Review-Vault bestanden.
- [ ] Echte Claude-Desktop-Abfrage der zwei neuen Tools — Windows-Control-Pipe nicht verfügbar.

## 9. Freigabe-Empfehlung

`CONDITIONAL`: Code Review kann beginnen. Eine uneingeschränkte Freigabe erfordert entweder
den nativen Desktop-Nachlauf oder die ausdrückliche Akzeptanz dieses Restrisikos im Review.

---

## Übergabe: QA → RV

**Datum:** 2026-07-31
**Von:** QA Engineer (QA)
**An:** Code Reviewer (RV)
**Nächster Befehl:** `/review second-brain 3`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| TP-000004 | APPROVED | `testing/TP-000004-sprint-3.md` | Verbindliche Testbasis |
| TR-000006 | CONDITIONAL | `testing/TR-000006-sprint-3.md` | Automatisiert grün; native Desktop-Evidenz offen |
| Performance-Harness | bestanden | `tests/performance/relationships-baseline.mjs` | Reproduzierbare 500-Notizen-Baseline |

### Kritische Informationen für Empfänger

- Es gibt keine offenen Produkt-BLOCKER und keinen neuen BUG.
- Reviewer muss die fehlende native Obsidian-/Claude-Evidenz als MAJOR-Risiko bewerten.
- Browser, Sidecar, Verträge, Graphmigration, Security und Performance sind belegt.

### Offene Fragen (vererbt)

| # | Frage | Ursprung | Kritikalität | An wen |
|---|---|---|---|---|
| 1 | Wann kann der native Obsidian-/Claude-Desktop-Nachlauf erfolgen? | QA-Umgebung | MAJOR | Nutzer / QA |

### Nicht-Ziele

Visueller Graph, KI-Inferenz, Mutationen, Android und vault-übergreifende Beziehungen.

### Empfehlungen

Code Review durchführen und vor uneingeschränkter Gate-8-Freigabe die Desktop-Evidenz
nachholen oder das verbleibende Risiko ausdrücklich dokumentieren.

---

*Erstellt von: QA-Agent | Datum: 2026-07-31 | Version: 1.1*
