---
id: TP-000003
title: Testplan Second Brain Sprint 2
version: 1.0
status: APPROVED
author-agent: QA (QA Engineer)
date: 2026-07-31
project: second-brain
sprint: 2
based-on: US-000012, UX-000001, SP-000003, ADR-000001, ADR-000003, ADR-000004, CON-000001
supersedes: —
superseded-by: —
ablage: projects/second-brain/testing/
---

# Testplan: Second Brain — Sprint 2

## 1. Testumfang

**Getestete Features:**

- US-000012: Lokale Volltextsuche mit überprüfbaren Quellen.
- Read-only Suche und Quellenlesen über Obsidian und Claude-Desktop-MCP.
- FTS5-Migration, Ranking, Fundzeile, Snippet und `full-text`-Match-Typ.
- Sichere Metadatentreffer für nicht extrahierbare Anhänge.
- Sichtbare Degradation ohne Vector-Adapter.
- Sprint-1-Regressionen sowie DEBT-000001: neutrale Handshake-Microcopy,
  operationsspezifische Timeouts, Abbruch und Transportverträge.

**Explizit nicht getestet:**

- Semantisches Ranking oder Vector-Backend — ausdrücklich außerhalb US-000012.
- OCR und Inhaltsgewinnung aus Binäranhängen — nur Metadaten sind Sprint-Scope.
- Graph, Mutationen, Wissenskompilierung, ChatGPT, Mistral und Android — außerhalb SP-000003.
- Abschluss der Umbrella-Story US-000002 — bleibt nach diesem Slice offen.

## 2. Teststrategie und Traceability

| Ebene | Zweck | Evidenz |
|---|---|---|
| Unit/Contract | Zod-Verträge, Plugin-Client, Eingabegrenzen | Vitest |
| Integration | FTS5, Migration, Delta, Read-only Hashes, Anhänge | Vitest + SQLite |
| Security | Traversal, absoluter Fremdpfad, Symlink, Query-Injection, Leakage | Vitest + manuell |
| UI E2E | Empty, Loading, Results, No-results, Degraded, Error, Fokus | Playwright Chromium headed |
| System | Echtes Obsidian-Pane und Claude-Desktop-MCP unter Windows | manuelles Schrittprotokoll |
| Performance | Such-, Lese-, UI- und Ressourcenbaseline | PowerShell/Node + Playwright |

| US-000012-Szenario | Automatisiert | Manuell |
|---|---|---|
| 1 Volltextsuche mit Quellen | `search-service.test.ts`, E2E-000201 | TC-000201 |
| 2 Lesender MCP-Zugriff | `node-setup-transport.test.ts`, `search-client.test.ts` | TC-000202 |
| 3 Scope-Grenze | `search-service.test.ts`, Security-Smokes | TC-000203 |
| 4 Nicht extrahierbarer Anhang | `search-service.test.ts` | TC-000204 |
| 5 Sichtbare Degradation | `setup.spec.ts` | TC-000205 |

## 3. Testumgebung

| Eigenschaft | Wert |
|---|---|
| Umgebung | Lokaler Sprint-Worktree `feature/sprint-2` unter Windows |
| Runtime | Node.js 24 LTS; tatsächliche Version im TR protokollieren |
| UI-Hosts | Echtes Obsidian Desktop sowie Chromium-Harness |
| MCP-Client | Claude Desktop, read-only stdio-Verbindung |
| Datenbank | Lokale SQLite-Datei mit FTS5; zusätzlich `:memory:` in Integrationstests |
| Testdaten | Synthetischer Vault mit `.obsidian`, Markdown/Text, Binäranhang, Unicode-Pfad, Symlink und Fremdpfad |
| Umgebungsvariablen | Keine verpflichtenden Secrets; Vault- und Indexpfade als lokale Testparameter |
| Externe Dienste | Keine |

Produktionsähnliche Tests verwenden ausschließlich synthetische Inhalte. Vor und nach jeder
Search-/Read-Serie werden SHA-256-Hashes sämtlicher Vault-Dateien verglichen.

## 4. Automatisierte Tests

### 4.1 Coverage-Ziele

| Ebene | Ziel | Planungsstand |
|---|---:|---|
| Gesamtprojekt | ≥ 80 % Branches | 81,69 % nach erweitertem Search-Coverage-Scope |
| Domain-/Policy-nahe Module | ≥ 90 % Branches | Vault-Policy 93,75 %; im TR erneut messen |
| Search-Service | ≥ 75 % Branches, 100 % Funktionen | 75 % / 100 % |
| E2E | Alle Sprint-2-P0-UI-Flows | Zwei Search-Flows vorhanden; echte Host-Flows manuell |

### 4.2 Ausführungsbefehle

```powershell
npm run lint
npm run build
npm test
npm run test:coverage
npx playwright test --headed
```

Der HTML-Report liegt unter `testing/playwright-report/`. Ein zweiter identischer
Headless-Lauf ist nicht erforderlich.

### 4.3 Testinventar

| Testdatei | Bereich | Status |
|---|---|---|
| `tests/integration/search-service.test.ts` | FTS5, Quellen, Scope, Anhänge, Migration | vorhanden |
| `tests/integration/node-setup-transport.test.ts` | realer Prozess-/Transportpfad | vorhanden |
| `tests/unit/search-client.test.ts` | Plugin-Vertrag und Laufzeitvalidierung | durch QA ergänzt |
| `tests/e2e/setup.spec.ts` | Search-UI, A11y, 320 px und Regression | vorhanden |

Ein separates Page Object ist für den kleinen statischen Harness nicht erforderlich; die
Specs verwenden stabile `data-testid`- und ARIA-Selektoren. Der echte Obsidian-Systempfad
bleibt manuell, weil Playwright das native Obsidian-Plugin nicht repräsentiert.

### 4.4 E2E-Testfälle

| ID | Beschreibung | Typ | Priorität |
|---|---|---|---|
| E2E-000201 | Suchbegriff liefert Quelle, Zeile, Snippet und Degradationshinweis | Happy Path | P0 |
| E2E-000202 | Leere Suche und No-results zeigen konkrete Recovery | Error/Boundary | P1 |
| E2E-000203 | Live-Status erhält Fokus und Controls besitzen zugängliche Namen | Accessibility | P1 |
| E2E-000204 | 320-px-Pane und 200-%-Zoom ohne horizontalen Inhaltsverlust | Responsive/A11y | P1 |
| E2E-000205 | Abbruch deaktiviert laufende Suche und kündigt Zustand an | Cancellation | P1 |
| E2E-000206 | Transportfehler zeigt Error und Try-again/Index-Recovery | Error | P1 |

## 5. Manuelle Testfälle

### TC-000201: Obsidian-Suche und Quellenöffnung — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Plugin aus aktuellem Build installiert; synthetischer Vault indexiert |
| Testschritte | 1. Search-View per Ribbon öffnen. 2. Phrase suchen. 3. ersten Texttreffer aktivieren. |
| Erwartetes Ergebnis | Treffer sind nach Relevanz sortiert und zeigen Pfad, Fundzeile, Snippet, `full-text` und `extracted`; die Notiz öffnet mit Cursor an der Fundzeile. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000202: Claude-Desktop-MCP Suche und Read — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Claude Desktop mit aktuellem Sidecar verbunden; Index aktuell |
| Testschritte | 1. `second_brain_search` mit Phrase aufrufen. 2. zitierten Pfad mit `second_brain_read_note` lesen. 3. Vault-Hashes vergleichen. |
| Erwartetes Ergebnis | Nur angefragte lokale Treffer/Inhalte samt Quellenmetadaten werden geliefert; alle Hashes bleiben unverändert. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000203: Vault-Scope und Symlink-Escape — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Fremddatei und Symlink vom Vault nach außen vorhanden |
| Testschritte | Traversal, absoluten Fremdpfad und Symlink-Ziel jeweils über Read-Vertrag anfragen. |
| Erwartetes Ergebnis | Jede Anfrage wird mit stabilem dokumentiertem Scope-Fehler abgelehnt; kein fremder Inhalt erscheint in Antwort, stdout oder Logs. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000204: Nicht extrahierbarer Anhang — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | `diagram.png` ist indexiert und Dateiname passt zur Suche |
| Testschritte | 1. Nach `diagram` suchen. 2. Treffer prüfen. 3. Inhaltslesen versuchen. |
| Erwartetes Ergebnis | Reiner Metadatentreffer mit leerem Snippet und `not_extracted`; Lesen wird abgelehnt, kein Inhalt erfunden. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000205: Semantische Degradation — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Kein Vector-Adapter installiert |
| Testschritte | Suche in Obsidian und über MCP ausführen. |
| Erwartetes Ergebnis | Volltexttreffer bleiben nutzbar; exakt `Semantic search is unavailable. Showing full-text results only.` ist sichtbar. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000206: Empty, Loading, Cancel, No-results und Error — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Search-View geöffnet; kontrollierbar langsamer bzw. fehlschlagender Transport |
| Testschritte | Leere Query senden; gültige Suche starten/abbrechen; fehlende Phrase suchen; Transportfehler auslösen. |
| Erwartetes Ergebnis | Jeder Zustand besitzt eindeutigen Live-Text und Recovery; alte Treffer sind nicht irreführend aktiv; Cancel ist nur während laufender Suche aktiv. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000207: Query- und Limit-Grenzen — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Search-Vertrag erreichbar |
| Testschritte | Leerraum, 1/500/501 Zeichen sowie Limits 0/1/50/51 und unbekannte Felder senden. |
| Erwartetes Ergebnis | 1–500 Zeichen und Limits 1–50 werden akzeptiert; alle anderen Eingaben ohne Query-Ausführung vertragskonform abgelehnt. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000208: Tastatur, Fokus, 320 px und 200 % Zoom — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Obsidian-Pane auf 320 px; Zoom 200 % |
| Testschritte | Gesamten Suchablauf nur mit Tastatur bedienen; Fokusreihenfolge, Live-Status und Ergebnisöffnung prüfen. |
| Erwartetes Ergebnis | Kein Inhaltsverlust oder horizontales Seiten-Scrolling; sichtbarer Fokus; alle Controls erreichbar und benannt. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000209: Migration und Delta-Reindex — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Kopie eines Sprint-1-Indexes und indexierte Textnotiz |
| Testschritte | 1. Mit Sprint-2-Version öffnen. 2. suchen. 3. Text ändern und synchronisieren. 4. alte/neue Begriffe suchen. |
| Erwartetes Ergebnis | Migration ist verlustfrei; alter Treffer verschwindet, neuer Treffer erscheint mit aktualisierter Fundstelle. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000210: Sprint-1-Regression und Timeout-Policy — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Setup-, Index-, Rebuild- und Search-Pfade verfügbar |
| Testschritte | Setup-Handshake, Index und Rebuild ausführen; Timeout-/Cancel-Verhalten beobachten. |
| Erwartetes Ergebnis | Setup bleibt neutral formuliert; Setup 5 s, Search/Read 10 s, Index/Rebuild 60 s; Sprint-1-Setup und Index funktionieren unverändert. |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

## 6. Sicherheits-Smoke-Tests

| ID | Test | Erwartetes Ergebnis |
|---|---|---|
| SEC-000201 | FTS-Eingaben `' OR '1'='1`, `"`, `*`, `%`, `_` | Parametrisierte Verarbeitung; kein SQL-Fehler oder Datenleck |
| SEC-000202 | Traversal mit `/`, `\`, `..`, absolutem Pfad und Unicode-Varianten | Scope-Fehler, kein Fremdinhalt |
| SEC-000203 | Symlink auf Datei/Ordner außerhalb Root | Zugriff blockiert |
| SEC-000204 | HTML/Script in Query, Dateiname und Notiz | Nur Textdarstellung, keine Script-Ausführung |
| SEC-000205 | 501-Zeichen-Query, Limit 51, zusätzliche Vertragsfelder | Vor Ausführung abgelehnt |
| SEC-000206 | Suchbegriff, Vault-Rohinhalt und Fremdinhalt in Logs/stdout suchen | Keine Leakage; MCP-stdout bleibt protokollrein |
| SEC-000207 | Hashvergleich vor/nach Search und Read | 0 veränderte Originaldateien |

## 7. Performanztests

Es existiert kein freigegebenes Produkt-Performancebudget. Deshalb werden verbindlich
Ausgangsmessungen dokumentiert; es werden keine nachträglichen Produktzusagen erfunden.
Die Transport-Timeouts sind technische Abbruchgrenzen und keine Latenzziele.

| ID | Bereich | Methode | Erwartetes Ergebnis |
|---|---|---|---|
| PERF-000201 | FTS-Suche | 30 Läufe auf synthetischem 500-Dateien-Vault, p50/p95 | p50/p95 und Trefferzahl im TR dokumentiert; kein Timeout |
| PERF-000202 | Read | 30 Läufe für 1-KiB- und 1-MiB-Textnote | p50/p95 im TR dokumentiert; unter 10-s-Transportgrenze |
| PERF-000203 | UI-Reaktion | Playwright-Trace von Submit bis Live-Status/Ergebnis | Ausgangsmessung dokumentiert; UI bleibt bedienbar |
| PERF-000204 | Delta-Reindex | Eine Datei in 500-Dateien-Vault ändern | Dauer und verarbeitete Dateizahl dokumentiert; kein Vollverlust |
| PERF-000205 | Ressourcen | Prozess-RSS vor/nach 100 Suchläufen | Minimum, Maximum und Delta dokumentiert; kein stetiges ungebremstes Wachstum |

## 8. Eintritts- und Austrittskriterien

**Eintritt:**

- Gate 6 PASS; Implementierungscommit `8c9c58d` im Sprint-Worktree.
- US-000012 und SP-000003 `APPROVED`.
- FE/BE-Übergabe ohne BLOCKER/MAJOR.

**Austritt zu Review:**

- TP-000003 `APPROVED`.
- Lint, Build, Vitest, Coverage und headed Playwright grün.
- Alle P0-Fälle bestanden.
- Echte Obsidian- und Claude-Desktop-Systempfade dokumentiert.
- Performance-Ausgangsmessungen vollständig.
- Kein BLOCKER-Bug in einem Status außer `VERIFIZIERT`.
- TR-000004 mit Empfehlung `APPROVED` oder `CONDITIONAL`.

## 9. Risiken und offene Punkte

| Risiko | Schwere | Behandlung |
|---|---|---|
| Browser-Harness ist nicht die echte Obsidian-Laufzeit | MAJOR | TC-000201 und TC-000208 im echten Host |
| Claude Desktop kann nicht zuverlässig browserautomatisiert werden | MAJOR | Verpflichtender manueller P0 TC-000202 |
| Kein Produkt-Performancebudget | MINOR | Reproduzierbare Baselines im TR |
| Plattformabhängige Symlink-Rechte unter Windows | MINOR | Testlauf mit dokumentierter Berechtigung; keine stille Auslassung |

Keine offene Frage blockiert die Testplanung.

## 10. Definition-of-Done-Selbstprüfung

- [x] US-000012 besitzt positive, negative und Boundary-Tests.
- [x] Jedes Akzeptanzszenario ist automatisiert und manuell abgedeckt.
- [x] Empty, Loading, Results, No-results, Degraded und Error sind eingeplant.
- [x] Browser-Clickpfade und echte Desktop-Systemtests sind getrennt.
- [x] Security-, Datenintegritäts- und Leakage-Tests sind definiert.
- [x] Performance-Baselines besitzen Methoden ohne Zielplatzhalter.
- [x] Coverage umfasst die neue Search-Schicht.
- [x] Testumgebung und Befehle sind vollständig.
- [x] Keine offenen Planungs-BLOCKER.
- [x] Constitution und Sprint-Nicht-Ziele bleiben eingehalten.
- [x] `testing/INDEX.md` und Projekt-`INDEX.md` werden aktualisiert.

---

## Übergabe: QA-Testplanung → QA-Testausführung

**Datum:** 2026-07-31
**Von:** QA Engineer (QA)
**An:** QA Engineer (QA)
**Nächster Befehl:** `/test-run second-brain 2`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| TP-000003 | APPROVED | `testing/TP-000003-sprint-2.md` | 10 manuelle, 7 Security- und 5 Performance-Fälle |
| Automatisierte Tests | bereit | `tests/` | Search-Client-Vertrag durch QA ergänzt |
| Playwright | bereit | `playwright.config.ts`, `tests/e2e/` | Chromium headed; HTML-Report im Testing-Ordner |
| Implementierung | committed | `apps/`, `packages/` | Commit `8c9c58d` |

### Kritische Informationen für Empfänger

- Der Browser-Harness ersetzt weder echtes Obsidian noch Claude Desktop.
- TC-000201 bis TC-000203 und TC-000205 sind verpflichtende P0-Systemtests.
- Kein Produkt-Performancebudget existiert; reproduzierbare Baselines sind verpflichtend.
- Semantische Suche und Anhangsextraktion dürfen nicht als fehlgeschlagene Sprint-Funktionen
  bewertet werden.

### Offene Fragen (vererbt)

Keine BLOCKER- oder MAJOR-Planungsfrage.

### Nicht-Ziele

Semantische Suche, OCR, Graph, Mutationen, zusätzliche MCP-Clients und Android.

### Empfehlungen

Zuerst Coverage und Security-Smokes, dann headed Playwright, anschließend die echten
Obsidian-/Claude-Desktop-P0-Pfade und zuletzt die Performance-Baselines ausführen.

---

*Erstellt von: QA-Agent | Datum: 2026-07-31 | Version: 1.0*
