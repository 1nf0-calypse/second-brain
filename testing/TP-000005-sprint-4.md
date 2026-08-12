---
id: TP-000005
title: Testplan Second Brain Sprint 4
version: 1.0
status: APPROVED
author-agent: QA (QA Engineer)
date: 2026-07-31
project: second-brain
sprint: 4
based-on: US-000014, UX-000001, SP-000005, ADR-000004, CON-000001
supersedes: —
superseded-by: —
---

# Testplan: Second Brain — Sprint 4

## 1. Testumfang

**Getestetes Feature:** US-000014 — genau eine Markdown-Notiz kontrolliert erstellen oder
aktualisieren, vorab als Diff prüfen, ausdrücklich bestätigen, auditieren und einzeln
konfliktgeschützt rücksetzen.

**Explizit nicht getestet:**

- Direktes Löschen, Verschieben/Umbenennen und Mehrdatei-Mutationen — außerhalb des Sprints.
- Human-on-/out-of-the-Loop — Budgets und Freigabemodell sind ausdrücklich nicht enthalten.
- Wissenskompilierung, Android und externe KI-Anbieter — kein Bestandteil von US-000014.

| Akzeptanzszenario | Automatisierte Evidenz | Manuelle Evidenz |
|---|---|---|
| 1 Read-only Vorschau | `mutation-service.test.ts`, `mcp-mutations.test.ts`, `mutations.spec.ts` | TC-000401 |
| 2 Bestätigte Create/Update-Mutation | Service-, CLI-/Transport- und MCP-Integration | TC-000402, TC-000403 |
| 3 Konflikt, Ablauf und Replay | `mutation-service.test.ts`, `node-setup-transport.test.ts` | TC-000404, TC-000405 |
| 4 Rollback mit Hashschutz | `mutation-service.test.ts`, `mutations.spec.ts` | TC-000406, TC-000407 |
| 5 Scope und Inhalt erweitern keine Fähigkeit | Scope-/Junction-/Payload-Tests | TC-000408, SEC-000401–SEC-000408 |

## 2. Testumgebung

| Eigenschaft | Wert |
|---|---|
| Umgebung | Lokaler Windows-Worktree `.worktrees/sprint-4`, Branch `feature/sprint-4` |
| Runtime | Node.js ≥24; genaue Version im TR protokollieren |
| UI-Hosts | Echtes Obsidian Desktop und sichtbarer Chromium-Harness |
| MCP-Clients | SDK-Client über stdio automatisiert; Claude Desktop manuell |
| Test-Vault | `testing/system-vault/` oder frische Kopie; niemals persönlicher Vault |
| Datenbank | Lokales SQLite/WAL unter `<vault>/.second-brain/index.sqlite` |
| Umgebungsvariablen | `SECOND_BRAIN_VAULT_ROOT`, optional `SECOND_BRAIN_INDEX_PATH`; keine Secrets |
| Externe Dienste | Keine; Netzwerk für Kernabnahme nicht erforderlich |

Vor jedem mutierenden Systemtest wird ein SHA-256-Manifest aller Vault-Dateien erzeugt.
Danach muss ausschließlich die ausdrücklich bestätigte Zieldatei abweichen. Für Konflikt-,
Fehler- und Preview-Fälle darf das Manifest gar keine Abweichung zeigen.

## 3. Automatisierte Tests

### 3.1 Coverage-Ziele

| Ebene | Ziel | Planungsstand |
|---|---:|---|
| Gesamtprojekt | ≥80 % Branches | 84,28 % bei Implementierungsübergabe |
| Mutationsmodul | ≥90 % Branches | 90,00 % |
| Funktionen gesamt | ≥80 % | 95,23 % |
| E2E | Alle P0-Preview-/Confirm-/Rollback-Flows | 2 Mutationspfade vorhanden |

### 3.2 Ausführungsbefehle

```powershell
npm run lint
npm run build
npm test
npm run test:coverage
npm run test:e2e
```

`playwright.config.ts` startet Chromium sichtbar und schreibt den HTML-Bericht nach
`testing/playwright-report/`.

### 3.3 Testinventar

| Testdatei | Bereich | Status |
|---|---|---|
| `tests/unit/mutation-client.test.ts` | Laufzeitverträge, ungültige Antworten | vorhanden |
| `tests/integration/mutation-service.test.ts` | Preview, Create, Update, Konflikt, Replay, Rollback, Scope | vorhanden |
| `tests/integration/node-setup-transport.test.ts` | Tokenbindung über getrennte Sidecar-Prozesse | vorhanden |
| `tests/integration/mcp-mutations.test.ts` | Reales MCP/stdio Prepare/Confirm | vorhanden; Rollback wird ergänzt |
| `tests/e2e/mutations.spec.ts` | sichtbare separate Preview/Confirm-/Rollback-Aktionen | vorhanden; Fehler/A11y wird ergänzt |
| `tests/security/vault-root.test.ts` | Traversal, absolute Pfade, Symlink-Scope | Regression vorhanden |

**Page Object:** `tests/e2e/pages/setup.page.ts` öffnet den isolierten Desktop-Harness.
Selektoren verwenden `data-testid` oder zugängliche Rollen; der echte Obsidian-Host bleibt
zusätzlich verpflichtender manueller Test.

### 3.4 E2E-Testfälle

| ID | Beschreibung | Typ | Priorität |
|---|---|---|---|
| E2E-000401 | Confirm ist vor Preview unsichtbar und erst danach aktiv | Human-in Happy Path | P0 |
| E2E-000402 | Rollback verlangt zweite Preview und zweite Bestätigung | Rollback | P0 |
| E2E-000403 | Konflikt entfernt veraltete Bestätigung und fokussiert Recovery | Fehlerfall | P0 |
| E2E-000404 | Pfad, Inhalt, Diff und Status besitzen zugängliche Namen | Accessibility | P1 |
| E2E-000405 | Tastaturpfad und 320-px-/200-%-Darstellung ohne Inhaltsverlust | A11y/Boundary | P1 |
| E2E-000406 | Sidecar-Fehler zeigt keine Erfolgssprache und bietet neuen Preview-Versuch | Error | P1 |

## 4. Manuelle Testfälle

### TC-000401: Update-Vorschau ist strikt read-only — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | `Alpha.md` existiert; SHA-256-Manifest erfasst; Mutationsansicht geöffnet |
| Testschritte | Inhalt ändern; `Prepare read-only preview` wählen; Diff, Pfad, Aktion, Hashes und Ablaufzeit prüfen; noch nicht bestätigen |
| Erwartetes Ergebnis | Verständlicher Text-Diff und read-only Hinweis; Datei und Manifest unverändert; Confirm ist eine separate Aktion |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000402: Genau eine bestehende Notiz bestätigen — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Gültige Update-Vorschau aus TC-000401 |
| Testschritte | Exakten Diff prüfen; bestätigen; Datei, Index, Audit-ID und Manifest prüfen |
| Erwartetes Ergebnis | Genau `Alpha.md` enthält vollständig den neuen Inhalt; Index findet ihn; Erfolg nennt eindeutige Audit-ID; keine weitere Datei weicht ab |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000403: Neue Markdown-Notiz erstellen — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Relativer Zielpfad `Created.md` existiert nicht; Manifest erfasst |
| Testschritte | Vollständigen Inhalt eingeben; Preview prüfen; bestätigen; Suche/Index prüfen |
| Erwartetes Ergebnis | Preview meldet `create`; erst Confirm erstellt genau `Created.md` atomar und auditierbar; Inhalt ist indexiert |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000404: Externe Änderung zwischen Preview und Confirm — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Update-Preview für `Alpha.md` liegt vor |
| Testschritte | `Alpha.md` außerhalb Second Brain ändern; altes Token bestätigen |
| Erwartetes Ergebnis | `MUTATION_CONFLICT`; externe Änderung bleibt exakt erhalten; neue Preview wird verlangt; kein Erfolg/Audit für den abgelehnten Commit |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000405: Ablauf und Replay — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Ein abgelaufenes Token und ein bereits erfolgreich verwendetes Token |
| Testschritte | Beide Tokens erneut bestätigen; parallel zwei Confirms desselben frischen Tokens auslösen |
| Erwartetes Ergebnis | Jedes Token bewirkt höchstens einen Commit; Ablauf/Replay liefern `CONFIRMATION_INVALID`; keine Teil- oder Doppelmutation |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000406: Update sicher rücksetzen — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | TC-000402 erfolgreich; Audit-ID vorhanden; Datei seitdem unverändert |
| Testschritte | Rollback vorbereiten; Rückwärts-Diff prüfen; separat bestätigen; Index und Manifest prüfen |
| Erwartetes Ergebnis | Erst Rollback-Confirm stellt den exakten Vorherzustand atomar wieder her; Ergebnis ist auditierbar und neu indexiert |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000407: Rollback überschreibt keine neuere Änderung — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Auditierter Commit; danach externe Änderung an derselben Datei |
| Testschritte | Rollback vorbereiten beziehungsweise vorhandene Rollback-Preview bestätigen |
| Erwartetes Ergebnis | Konflikt; externe Änderung bleibt exakt erhalten; kein automatischer Merge und keine irreführende Erfolgsmeldung |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000408: Untrusted Inhalt bleibt Daten — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Inhalt enthält Shell-, MCP-, Lösch- und Bestätigungsumgehungs-Anweisungen sowie HTML/Script |
| Testschritte | Inhalt als Notizänderung vorbereiten und bestätigen; Systemprozesse, Fremdpfade und gerenderten Text prüfen |
| Erwartetes Ergebnis | Inhalt wird ausschließlich als Markdown-Text gespeichert; keine Shell-/Toolausführung, Berechtigungserweiterung oder Script-Ausführung |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000409: Atomarer Write bei Windows-Lock/Abbruch — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Originaldatei und Manifest vorhanden; Datei-Handle oder Rename-Ziel reproduzierbar gesperrt |
| Testschritte | Confirm während Sperre auslösen; zusätzlich Sidecar beim Temp-/Rename-Fenster abbrechen; danach Original, Temp-Dateien und Audit prüfen |
| Erwartetes Ergebnis | Entweder vollständiger alter oder vollständiger neuer Zustand, niemals Teildatei; kein falscher Erfolg; Recovery-Hinweis; keine verwaiste bestätigte Mutation ohne Audit |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000410: Tastatur, Fokus, 320 px und 200 % — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Obsidian-Pane 320 px breit; Zoom 200 % |
| Testschritte | View per Command öffnen; Pfad/Inhalt/Preview/Confirm/Rollback nur per Tastatur bedienen; Diff lesen |
| Erwartetes Ergebnis | Logische Tab-Reihenfolge, sichtbarer Fokus, Live-Status und zugängliche Diff-Textansicht; keine abgeschnittene Sicherheitsinformation |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000411: MCP-Client-End-to-End — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Claude Desktop mit aktuellem `second-brain`-Server und synthetischem Vault verbunden |
| Testschritte | Prepare-Tool aufrufen; bestätigen lassen; Confirm-Tool aufrufen; Rollback vorbereiten und bestätigen |
| Erwartetes Ergebnis | Nur eng benannte vier Mutationswerkzeuge; Preview bleibt read-only; beide Schreibaktionen verlangen Token; relative Pfade/Audit-IDs stimmen |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000412: Sprint-1–3-Regression — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Setup, Suche, Quellen, Index und Relationships verfügbar |
| Testschritte | Handshake, Sync, Search/Read und Relationships vor und nach einer Mutation ausführen |
| Erwartetes Ergebnis | Bestehende read-only Pfade bleiben funktionsfähig; Schema-Migration bewahrt Index/Audit; Mutation erscheint nach Sync in Suche/Beziehungen |
| Tatsächliches Ergebnis | *(wird in `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

## 5. Sicherheits- und Boundary-Smoke-Tests

| ID | Test | Erwartetes Ergebnis |
|---|---|---|
| SEC-000401 | Absolute Pfade, `..`, Root und fremde Junction/Symlink | `PATH_OUTSIDE_VAULT`; keine Fremddatei verändert |
| SEC-000402 | `.obsidian`, `.second-brain`, Nicht-Markdown und Verzeichnis `.md` | blockiert |
| SEC-000403 | Leerer Inhalt, No-op, 2.000.000 und 2.000.001 Zeichen | leerer Inhalt gültige Mutation; No-op Konflikt; Vertragsgrenze exakt erzwungen |
| SEC-000404 | Ungültige/fehlende UUIDs, unbekannte Audit-ID, Zusatzfelder | Laufzeitvalidierung; keine Mutation |
| SEC-000405 | Prompt-/Tool-Injection, Shelltext und HTML/Script im Inhalt | reine Daten; keine Ausführung/Scope-Erweiterung |
| SEC-000406 | Token für anderen Pfad/Inhalt, Replay und paralleler Confirm | Bindung bleibt unveränderlich; genau ein Gewinner |
| SEC-000407 | Datei oder Rollback-Ziel nach Preview extern geändert | harter Hashkonflikt; neuere Daten bleiben erhalten |
| SEC-000408 | MCP-Werkzeuginventar | keine generische Datei-, Delete-, Move-, Shell- oder Prozessfähigkeit |

## 6. Performanztests

Es existiert kein freigegebenes Produkt-Performancebudget. Deshalb werden reproduzierbare
Ausgangsmessungen dokumentiert; das 60-s-Transportlimit ist kein Produktziel.

| ID | Bereich | Methode | Erwartetes Ergebnis |
|---|---|---|---|
| PERF-000401 | Preview | 30 Updates einer 2-MB-Notiz, p50/p95 | Dauer und Diff-Größe dokumentiert; kein 60-s-Timeout; Datei unverändert |
| PERF-000402 | Confirm + Reindex | 30 Create/Update-Läufe mit frischen Tokens | p50/p95 dokumentiert; jeder Lauf genau ein Audit und vollständiger Inhalt |
| PERF-000403 | Rollback | 30 Prepare-/Confirm-Rollbacks | p50/p95 dokumentiert; 100 % Vorherzustand wiederhergestellt |
| PERF-000404 | Token-/Audit-Speicher | 1.000 Preview-Einträge, danach neues Prepare/Confirm | Dauer und DB-Größe dokumentiert; kein ungebremster Prozess-RSS-Anstieg |
| PERF-000405 | UI-Reaktion | Playwright-Trace für Preview/Confirm/Rollback bei großem Diff | Ausgangsmessung; UI bleibt fokussier- und scrollbar |

## 7. Eintritts- und Austrittskriterien

**Eintritt:** Gate 6 PASS; Commit `b1e2810`; US-000014/SP-000005 `APPROVED`; keine offene
BLOCKER-/MAJOR-Frage in der FE/BE-Übergabe.

**Austritt zu Review:**

- TP-000005 `APPROVED`; Lint, Build, Vitest, Coverage und sichtbarer Playwright-Lauf grün.
- Alle manuellen P0-Fälle im echten Obsidian/Claude-Desktop-Testpfad bestanden.
- Mutationsmodul ≥90 % Branches, Gesamtprojekt ≥80 % Branches.
- 0 Datenverluste/stille Überschreibungen, 100 % bestätigte Mutationen auditierbar/rollbackfähig.
- Performance-Baselines vollständig; kein BLOCKER-Bug außer `VERIFIZIERT`.
- TR-000007 mit Empfehlung `APPROVED` oder `CONDITIONAL`.

## 8. Risiken und offene Punkte

| Risiko | Schwere | Behandlung |
|---|---|---|
| Browser-Harness ist nicht Obsidian | MAJOR | TC-000401–TC-000411 im echten Desktop-Host |
| Windows-Locks/Prozessabbruch sind timingabhängig | MAJOR | deterministische Lock-Fixture plus wiederholter Systemtest TC-000409 |
| Claude Desktop ist nicht Playwright-automatisierbar | MAJOR | verpflichtender manueller P0 TC-000411 |
| Einfacher Volltext-Diff kann bei 2 MB groß werden | MINOR | SEC-000403 und PERF-000401/405 |
| Kein Produkt-Performancebudget | MINOR | reproduzierbare Baselines statt erfundener Grenzwerte |

Keine offene Planungsfrage blockiert `/test-run`.

## 9. Definition-of-Done-Selbstprüfung

- [x] US-000014 besitzt positive, negative, Boundary- und Sicherheitstests.
- [x] Alle fünf Akzeptanzszenarien sind automatisiert und manuell abgedeckt.
- [x] Preview, Loading, Error, Success und Conflict sind eingeplant.
- [x] Browser-Harness und echte Obsidian-/MCP-Systemtests sind getrennt.
- [x] Windows-Lock, Prozessabbruch, Audit, Replay und TOCTOU sind explizit enthalten.
- [x] Accessibility, Tastatur, Fokus, 320 px und 200 % sind enthalten.
- [x] Performance-Baselines besitzen konkrete Methoden ohne erfundene Budgets.
- [x] Coverage-Ziele, Befehle, Testdaten und Manifestbeweis sind vollständig.
- [x] Keine offene Planungs-BLOCKER- oder MAJOR-Frage.
- [x] Constitution und Sprint-Nicht-Ziele bleiben eingehalten.
- [x] `testing/INDEX.md` und Projekt-`INDEX.md` werden aktualisiert.

---

## Übergabe: QA-Testplanung → QA-Testausführung

**Datum:** 2026-07-31
**Von:** QA Engineer (QA)
**An:** QA Engineer (QA)
**Nächster Befehl:** `/test-run second-brain 4`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| TP-000005 | APPROVED | `testing/TP-000005-sprint-4.md` | 12 manuelle, 8 Security- und 5 Performance-Fälle |
| Automatisierte Tests | bereit | `tests/` | Service, CLI, MCP und sichtbarer UI-Harness |
| Implementierung | committed | `apps/`, `packages/` | Commit `b1e2810` |

### Kritische Informationen für Empfänger

- Der Browser-Harness ersetzt weder echtes Obsidian noch Claude Desktop.
- TC-000401–TC-000409 und TC-000411 sind verpflichtende P0-Systemtests.
- Vorher-/Nachher-Manifeste müssen beweisen, dass nur bestätigte Ziele verändert wurden.
- TC-000409 benötigt echten Windows-Lock-/Abbruchnachweis.

### Offene Fragen (vererbt)

Keine BLOCKER- oder MAJOR-Planungsfrage.

### Nicht-Ziele

Delete/Move/Rename, Mehrdatei-Mutationen, höhere Autonomie, Android und externe Anbieter.

### Empfehlungen

Zuerst automatisierte Suite und Coverage, dann Security/Performance, anschließend echte
Obsidian- und Claude-Desktop-P0-Pfade einschließlich Lock und Rollback.

---

*Erstellt von: QA-Agent | Datum: 2026-07-31 | Version: 1.0*
