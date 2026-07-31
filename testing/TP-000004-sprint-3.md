---
id: TP-000004
title: Testplan Second Brain Sprint 3
version: 1.0
status: APPROVED
author-agent: QA (QA Engineer)
date: 2026-07-31
project: second-brain
sprint: 3
based-on: US-000013, UX-000001, SP-000004, ADR-000003, ADR-000004, CON-000001
supersedes: —
superseded-by: —
---

# Testplan: Second Brain — Sprint 3

## 1. Testumfang

**Getestetes Feature:**

- US-000013: Direkte, belegte Beziehungen aus Wiki-Links, Backlinks, Tags und Properties
  lokal und read-only erkunden.

**Explizit nicht getestet:**

- Visueller Canvas-/Kraftgraph — außerhalb des Sprint-Scope.
- KI-abgeleitete Beziehungen und Mutationen — durch Story und Constitution ausgeschlossen.
- Android und vault-übergreifende Beziehungen — nicht Bestandteil von Sprint 3.

| Akzeptanzszenario | Automatisierte Evidenz | Manueller Test |
|---|---|---|
| 1 Belegbare Vault-Strukturen | `relationship-extraction.test.ts`, `relationships.test.ts` | TC-000301 |
| 2 Zugängliche Obsidian-Exploration | `relationships.spec.ts` | TC-000302, TC-000308 |
| 3 Lesender MCP-Zugriff | `node-setup-transport.test.ts`, `relationship-client.test.ts` | TC-000303 |
| 4 Inkrementelle Aktualisierung | `relationships.test.ts` | TC-000304 |
| 5 Unaufgelöste/unsichere Beziehungen | `relationships.test.ts`, `relationship-extraction.test.ts` | TC-000305 |

## 2. Testumgebung

| Eigenschaft | Wert |
|---|---|
| Umgebung | Lokaler Windows-Sprint-Worktree `feature/sprint-3` |
| Runtime | Node.js 24 LTS; tatsächliche Version im Testergebnis protokollieren |
| UI-Hosts | Echtes Obsidian Desktop und Chromium-Harness im headed Playwright-Modus |
| MCP-Client | Claude Desktop mit read-only stdio-Verbindung `second-brain` |
| Datenbank | SQLite-Datei mit FTS5 und `graph_edges`; zusätzlich `:memory:` |
| Testdaten | `tests/fixtures/relationships/` plus temporärer Vault für Delete/Delta/Scope |
| Umgebungsvariablen | Lokale Vault-/Indexpfade; keine Secrets oder externen API-Keys |
| Externe Dienste | Keine |

Vor und nach read-only Systemtests werden SHA-256-Hashes aller synthetischen Vault-Dateien
verglichen. Der echte persönliche Vault wird nicht als Testfixture verwendet.

## 3. Automatisierte Tests

### 3.1 Coverage-Ziele

| Ebene | Ziel | Planungsstand |
|---|---:|---|
| Gesamtprojekt | ≥ 80 % Branches | 81,69 % bei Implementierungsübergabe |
| Relationship-Extraktion | ≥ 90 % Lines, ≥ 80 % Branches | 100 % Lines, 87,50 % Branches |
| Funktionen gesamt | ≥ 80 % | 94,91 % |
| E2E | Alle Sprint-3-P0-UI-Flows | Relationship-Happy-Path vorhanden |

### 3.2 Ausführungsbefehle

```powershell
npm run lint
npm run build
npm test
npm run test:coverage
npm run test:e2e
```

`playwright.config.ts` führt Chromium sichtbar (`headless: false`) aus und schreibt den
HTML-Report nach `testing/playwright-report/`.

### 3.3 Testinventar

| Testdatei | Bereich | Status |
|---|---|---|
| `tests/unit/relationship-extraction.test.ts` | Wiki-Link-, Tag- und Property-Extraktion | vorhanden |
| `tests/unit/relationship-client.test.ts` | Laufzeitvertrag und read-only Marker | vorhanden |
| `tests/integration/relationships.test.ts` | Migration, Backlinks, Delta, Delete, Hashes | vorhanden |
| `tests/integration/node-setup-transport.test.ts` | Reale Sidecar-Relationship-Operation | vorhanden |
| `tests/e2e/relationships.spec.ts` | Tastatur, Fokus, Liste, Navigation, schmaler Viewport | vorhanden |
| `tests/security/vault-root.test.ts` | Traversal, Fremdpfad und Symlink-Scope | Regression vorhanden |

**Page Object:** `tests/e2e/pages/setup.page.ts` öffnet den isolierten Desktop-UI-Harness.
Stabile `data-testid`- und ARIA-Selektoren werden verwendet.

### 3.4 E2E-Testfälle

| ID | Beschreibung | Typ | Priorität |
|---|---|---|---|
| E2E-000301 | Liste zeigt eingehenden/ausgehenden Link, Tag und Property | Happy Path | P0 |
| E2E-000302 | `Open note` öffnet ein aufgelöstes Ziel und fokussiert Status | Navigation | P0 |
| E2E-000303 | Refresh und Navigation vollständig per Tastatur | Accessibility | P0 |
| E2E-000304 | 320 px bei 200 % Zoom ohne Inhaltsverlust | Responsive/A11y | P1 |
| E2E-000305 | Empty- und Error-Zustand mit konkreter Recovery | Error/Empty | P1 |
| E2E-000306 | Unaufgelöstes Ziel bietet keine irreführende Öffnen-Aktion | Boundary | P1 |

## 4. Manuelle Testfälle

### TC-000301: Explizite Relationship-Typen und Quellen — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Fixture-Vault indexiert; `Alpha.md` enthält Alias-Link, fehlendes Ziel, Tag und Property |
| Testschritte | 1. `Alpha.md` öffnen. 2. Relationship-View öffnen. 3. alle Listeneinträge prüfen. |
| Erwartetes Ergebnis | Jede Kante nennt Richtung, Typ, Label, relativen Quellpfad und Zeile; keine zusätzliche inferierte Kante erscheint. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000302: Obsidian-Navigation und Backlink — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | `Alpha.md` verlinkt `Beta.md`; beide indexiert |
| Testschritte | 1. Aus `Alpha.md` `Beta` öffnen. 2. `Beta.md` aktivieren und aktualisieren. 3. eingehenden Link öffnen. |
| Erwartetes Ergebnis | Zielnotiz und anschließend Quellnotiz öffnen sich im Workspace; Richtung wechselt korrekt von outgoing zu incoming. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000303: Claude-Desktop-MCP read-only — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Claude Desktop ist mit aktuellem Sidecar verbunden; Vault-Hashes erfasst |
| Testschritte | 1. `second_brain_relationships` für `Alpha.md` aufrufen. 2. `second_brain_node_detail` aufrufen. 3. Hashes vergleichen. |
| Erwartetes Ergebnis | Nur belegte relative Beziehungen und Knotenzahlen werden geliefert; `readOnly: true`; kein Vault-Hash ändert sich. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000304: Inkrementeller Ersatz und Delete — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Drei indexierte Notizen mit unabhängigen Beziehungen |
| Testschritte | 1. Link/Tag/Property nur in einer Notiz ändern. 2. synchronisieren. 3. diese Notiz löschen und erneut synchronisieren. |
| Erwartetes Ergebnis | Nur ihre Kanten werden ersetzt bzw. entfernt; Beziehungen der anderen Notizen bleiben unverändert; Originaldateien werden nicht umgeschrieben. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000305: Unaufgelöste Links und untrusted Text — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Notiz enthält `[[Missing]]` sowie Text, der das System zum Erfinden einer Beziehung auffordert |
| Testschritte | Index aktualisieren; Relationship-View und MCP-Antwort prüfen. |
| Erwartetes Ergebnis | `Missing.md` bleibt ohne navigierbaren relativen Zielpfad sichtbar; Anweisungstext erzeugt weder Kante noch Berechtigung. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000306: Empty-, Loading- und Error-Zustände — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Notiz ohne Beziehungen; zusätzlich offline/inkompatibler Sidecar simulierbar |
| Testschritte | Leere Notiz öffnen und aktualisieren; danach Sidecar stoppen und erneut aktualisieren. |
| Erwartetes Ergebnis | Empty-Text bzw. konkrete Index-Recovery erscheinen im Live-Status; keine alte Liste bleibt irreführend sichtbar. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000307: Vertragsgrenzen — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | MCP-Tools erreichbar |
| Testschritte | Leeren Pfad, unbekannte Felder sowie Limits 0/1/200/201 senden; unbekannte Notiz anfragen. |
| Erwartetes Ergebnis | Nur Pfad ≥1 Zeichen und Limits 1–200 werden akzeptiert; ungültige Eingaben werden vor Abfrage abgelehnt; unbekannte Notiz liefert sicheren Fehler. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000308: Tastatur, Fokus, 320 px und 200 % Zoom — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Obsidian-Pane 320 px breit; Zoom 200 % |
| Testschritte | Relationship-View nur mit Tastatur öffnen, aktualisieren, alle Einträge lesen und eine Notiz öffnen. |
| Erwartetes Ergebnis | Sinnvolle Fokusreihenfolge und sichtbarer Fokus; Status wird angekündigt; kein horizontales Seiten-Scrolling oder abgeschnittener Inhalt. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000309: Unicode, Alias und gleichnamige Ziele — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Unicode-Pfade, Alias-Link und zwei gleichnamige Notizen in verschiedenen Ordnern |
| Testschritte | Indexieren; Beziehungen aus Quellnotiz abfragen und navigieren. |
| Erwartetes Ergebnis | Pfade bleiben korrekt kodiert; Alias wird als Label gezeigt; mehrdeutiges oder fehlendes Ziel wird nicht auf eine falsche Notiz aufgelöst. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000310: Sprint-1/2-Regression — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Setup-, Search-, Read-, Index- und Relationship-Pfade verfügbar |
| Testschritte | Setup-Handshake, Sync, Volltextsuche, Quellenlesen und Relationship-Abfrage nacheinander ausführen. |
| Erwartetes Ergebnis | Bestehende Setup-/Search-Funktionen bleiben unverändert; Migration auf Schema 3 ist verlustfrei. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

## 5. Sicherheits-Smoke-Tests

| ID | Test | Erwartetes Ergebnis |
|---|---|---|
| SEC-000301 | Traversal/absoluter Fremdpfad als `relativePath` | Ablehnung; kein Fremdinhalt |
| SEC-000302 | Symlink-Ziel außerhalb des Vaults | Keine Navigation oder Offenlegung außerhalb Root |
| SEC-000303 | HTML/Script in Linklabel, Tag oder Property | Reine Textdarstellung; keine Ausführung |
| SEC-000304 | SQL-Metazeichen in Pfad, Tag und Property | Parametrisierte DB-Abfrage; kein SQL-Fehler/Datenleck |
| SEC-000305 | Unbekannte MCP-Werkzeuge oder Zusatzfelder | Abgelehnt; keine generische Datei-/Prozessfähigkeit |
| SEC-000306 | Prompt-Injection-artiger Vault-Text | Bleibt Nutzerdaten; keine zusätzliche Kante/Berechtigung |
| SEC-000307 | Hashvergleich vor/nach View und MCP-Abfragen | Null veränderte Originaldateien |

## 6. Performanztests

Es existiert kein freigegebenes Produkt-Performancebudget. Daher werden reproduzierbare
Ausgangsmessungen dokumentiert; die 10-s-Transportgrenze ist nur ein technischer Timeout.

| ID | Bereich | Methode | Erwartetes Ergebnis |
|---|---|---|---|
| PERF-000301 | Graphabfrage | 30 Läufe auf 500 Notizen, p50/p95 | Werte und Kantenanzahl im TR; kein 10-s-Timeout |
| PERF-000302 | Delta-Sync | Eine Notiz in 500-Notizen-Vault ändern | Dauer dokumentiert; `changedFiles: 1` |
| PERF-000303 | Full Rebuild | 500 Notizen mit Links/Tags/Properties | Dauer, Kanten- und Dateizahl dokumentiert; kein Datenverlust |
| PERF-000304 | UI-Reaktion | Playwright-Trace Refresh bis Live-Status/Liste | Ausgangsmessung dokumentiert; UI bleibt bedienbar |
| PERF-000305 | Ressourcen | RSS vor/nach 100 Relationship-Abfragen | Min/Max/Delta dokumentiert; kein stetiges ungebremstes Wachstum |

## 7. Eintritts- und Austrittskriterien

**Eintritt:**

- Gate 6 PASS; Implementierungscommit `553d0a0`.
- US-000013 und SP-000004 sind `APPROVED`.
- FE/BE-Übergabe enthält keine BLOCKER- oder MAJOR-Frage.

**Austritt zu Review:**

- TP-000004 `APPROVED`.
- Lint, Build, Vitest, Coverage und headed Playwright grün.
- Alle manuellen P0-Fälle bestanden, einschließlich echtem Obsidian und Claude Desktop.
- Performance-Ausgangsmessungen vollständig.
- Kein BLOCKER-Bug außer im Status `VERIFIZIERT`.
- TR-000006 mit Empfehlung `APPROVED` oder `CONDITIONAL`.

## 8. Risiken und offene Punkte

| Risiko | Schwere | Behandlung |
|---|---|---|
| Browser-Harness ist nicht die echte Obsidian-Laufzeit | MAJOR | TC-000301, TC-000302 und TC-000308 im echten Host |
| Claude Desktop ist nicht browserautomatisierbar | MAJOR | Verpflichtender manueller P0 TC-000303 |
| Gleichnamige Obsidian-Links können mehrdeutig sein | MAJOR | TC-000309; niemals stillschweigend falsch auflösen |
| Kein Produkt-Performancebudget | MINOR | Reproduzierbare Baselines in TR-000006 |

Keine offene Frage blockiert die Testausführung.

## 9. Definition-of-Done-Selbstprüfung

- [x] US-000013 besitzt positive, negative und Boundary-Tests.
- [x] Alle fünf Akzeptanzszenarien sind automatisiert und manuell abgedeckt.
- [x] Loading, Error, Empty und Success sind eingeplant.
- [x] Browser-Harness und echte Desktop-Systemtests sind getrennt.
- [x] Security-, Hash- und Prompt-Injection-Smokes sind definiert.
- [x] Performance-Baselines enthalten Methoden ohne Zielplatzhalter.
- [x] Coverage-Ziele und Ausführungsbefehle sind vollständig.
- [x] Keine offenen Planungs-BLOCKER.
- [x] Constitution und Sprint-Nicht-Ziele bleiben eingehalten.
- [x] `testing/INDEX.md` und Projekt-`INDEX.md` werden aktualisiert.

---

## Übergabe: QA-Testplanung → QA-Testausführung

**Datum:** 2026-07-31
**Von:** QA Engineer (QA)
**An:** QA Engineer (QA)
**Nächster Befehl:** `/test-run second-brain 3`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| TP-000004 | APPROVED | `testing/TP-000004-sprint-3.md` | 10 manuelle, 7 Security- und 5 Performance-Fälle |
| Automatisierte Tests | bereit | `tests/` | 48 Vitest- und 8 headed Playwright-Tests bei Übergabe |
| Implementierung | committed | `apps/`, `packages/` | Commit `553d0a0` |

### Kritische Informationen für Empfänger

- Der Browser-Harness ersetzt weder echtes Obsidian noch Claude Desktop.
- TC-000301 bis TC-000305 sind verpflichtende P0-Systemtests.
- Unaufgelöste und mehrdeutige Ziele dürfen nie irreführend navigierbar werden.
- Es gibt kein Produkt-Performancebudget; Baselines bleiben dennoch Pflicht.

### Offene Fragen (vererbt)

Keine BLOCKER- oder MAJOR-Planungsfrage.

### Nicht-Ziele

Visueller Graph, KI-Inferenz, Mutationen, Android und vault-übergreifende Beziehungen.

### Empfehlungen

Zuerst automatisierte Suite und Coverage, danach Security/Performance, anschließend die
echten Obsidian- und Claude-Desktop-P0-Pfade ausführen.

---

*Erstellt von: QA-Agent | Datum: 2026-07-31 | Version: 1.0*
