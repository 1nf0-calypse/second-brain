---
id: TP-000007
title: Testplan Second Brain Sprint 6
version: 1.0
status: APPROVED
author-agent: QA (QA Engineer)
date: 2026-08-13
project: second-brain
sprint: 6
based-on: US-000003@1.1, SP-000007@1.0, UX-000001, ADR-000004, CON-000001
supersedes: —
superseded-by: —
ablage: projects/second-brain/testing/
---

# Testplan: Second Brain — Sprint 6

## 1. Testumfang

**Getestetes Feature:**
- US-000003: Aktivierbare Human-on- und Human-out-Autonomie für Markdown-Erstellen und
  -Aktualisieren mit 60 Mutationen in 60 Minuten, fester einstündiger Laufzeit, Pause,
  Audit und Einzelrollback.

**Explizit nicht getestet:**
- Automatisches Löschen, Verschieben, Umbenennen, Mehrdatei-Pakete und Konflikt-Merges,
  weil sie ausdrücklich nicht implementiert sind.
- Wissenskompilierung und externe Provider, weil sie nicht zu Sprint 6 gehören.

## 2. Testumgebung

| Eigenschaft | Wert |
|---|---|
| Umgebung | Lokaler Windows-Sprint-6-Worktree |
| Produktpfad | `apps/sidecar`, `apps/obsidian-plugin`, `packages/contracts` |
| Testdaten | Temporäre Obsidian-Vault-Fixtures mit `.obsidian` und `.second-brain` |
| Laufzeit | Node.js 24, SQLite über `node:sqlite` |
| Browser | Playwright Chromium, headed gemäß `playwright.config.ts` |
| Externe Dienste | Keine; Autonomie ist vollständig lokal |

## 3. Automatisierte Tests

### 3.1 Ausführungsbefehle

```powershell
npm run build
npm run lint -- --max-warnings=0
npm test
npm run test:coverage
npm run test:e2e
```

### 3.2 Testinventar

| Datei | Schwerpunkt | Sprint-6-Nachweis |
|---|---|---|
| `tests/integration/mutation-service.test.ts` | Policy, atomarer Claim, Ablauf, Pause, Audit, Konflikt und Rollback | vorhanden; Sprint-6-Kernnachweis |
| `tests/integration/mcp-mutations.test.ts` | Angebotsene MCP-Capabilities und Mutation-Contract | Regression; um Autonomie-Tools ergänzen |
| `tests/integration/node-setup-transport.test.ts` | Echte getrennte Node-Kindprozesse | Autonomie-Aktivierung, Status und Pause ergänzen |
| `tests/unit/mutation-client.test.ts` | Plugin-Transport und Laufzeitschemas | Autonomie-Responses und fehlerhafte Responses ergänzen |
| `tests/e2e/mutations.spec.ts` | Browser-Clickpfad Vorschau, Bestätigung, Rollback | Autonomie-Aktivierung, Warnung, Restbudget und Pause ergänzen |

### 3.3 Performance und Stabilität

Es gibt kein freigegebenes globales Latenz- oder Ressourcenbudget. Der Testlauf dokumentiert
reproduzierbare Ausgangsmessungen statt erfundener Grenzwerte.

| ID | Messung | Methode | Erwartetes Ergebnis |
|---|---|---|---|
| PERF-000601 | 60 parallele automatische Create/Update-Anfragen | Deterministische Integration-Fixture | Genau 60 erfolgreiche Claims, kein 61. Write |
| PERF-000602 | Policy-Aktivierung, Status und Pause | 100 lokale Sidecar-Aufrufe; p50/p95/max | Baseline dokumentiert; keine Hänger oder inkonsistente Policy |
| PERF-000603 | Aktivierung und Pause im Obsidian-Pane | Headed Playwright-Trace bei 320 px/200 % | Keine Doppelaktion, Fokus und Status bleiben responsiv |
| PERF-000604 | Lokaler Policy-Speicher nach Aktivierung/Pause/Ablauf | SQLite-Inspektion und Prozess-RSS | Eine aktive Policy, kein unbeschränktes Zeilenwachstum |

## 4. Manuelle Testfälle

### TC-000601: Human-on bewusst aktivieren — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Aktueller Obsidian-Vault geöffnet; Second Brain Sprint-6-Build installiert; Human-in ist aktiv. |
| Testschritte | 1. **Review note change** öffnen. 2. Bereich **Automation mode** lesen. 3. `Human-on-the-loop` wählen. 4. Warn-Checkbox setzen. 5. **Activate automation** wählen. |
| Erwartetes Ergebnis | Vor der Checkbox bleibt Aktivierung gesperrt. Danach zeigt die Ansicht Human-on, 60 verbleibende Mutationen und eine Ablaufzeit höchstens eine Stunde in der Zukunft. Die Löschsperre ist sichtbar. |
| Tatsächliches Ergebnis | *(wird in TR-000009 befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000602: Human-out bewusst aktivieren — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Wie TC-000601. |
| Testschritte | 1. `Human-out-of-the-loop` wählen. 2. Warnung und 60/60-Rahmen lesen. 3. Checkbox setzen. 4. Aktivieren. |
| Erwartetes Ergebnis | Der Modus wird nur nach Checkbox aktiv; die Darstellung nennt Restbudget und maximale einstündige Laufzeit. |
| Tatsächliches Ergebnis | *(wird in TR-000009 befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000603: Pause sperrt sofort — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Einer der automatischen Modi ist aktiv. |
| Testschritte | 1. **Pause automation** wählen. 2. Im MCP-Client eine automatische Create- oder Update-Anfrage auslösen. 3. Im selben Client eine Human-in-Vorschau anfordern. |
| Erwartetes Ergebnis | Die automatische Anfrage wird ohne Vault-Änderung als nicht aktiv abgelehnt. Der Human-in-Preview-Flow bleibt verfügbar. |
| Tatsächliches Ergebnis | *(wird in TR-000009 befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000604: Budgetgrenze und Ablauf — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Aktiver automatischer Modus mit synthetischem Test-Vault. |
| Testschritte | 1. 60 erlaubte Markdown-Create/Update-Anfragen ausführen. 2. Eine 61. Anfrage auslösen. 3. Mit deterministischer Uhr oder nach Ablauf von 60 Minuten erneut anfragen. |
| Erwartetes Ergebnis | Höchstens 60 Änderungen erhalten Audit-Einträge. Die 61. Anfrage sowie jede Anfrage nach Ablauf ändern keine Datei; Status zeigt Budgetende bzw. Ablauf und Pause. |
| Tatsächliches Ergebnis | *(wird in TR-000009 befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000605: Verbotene Aktionen bleiben ausgeschlossen — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Human-on oder Human-out aktiv. |
| Testschritte | 1. Delete-, Move-, Rename-, Mehrdatei-, absolute-Pfad-, Traversal- und Nicht-Markdown-Anfrage senden. 2. Vault-Manifest und Audit vergleichen. |
| Erwartetes Ergebnis | Keine Anfrage verändert Vault-Dateien. Nur zulässige Markdown-Create/Update-Operationen können den automatischen Pfad erreichen; die Ablehnung offenbart keine Daten außerhalb des Vaults. |
| Tatsächliches Ergebnis | *(wird in TR-000009 befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000606: Audit, Konflikt und Einzelrollback — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Eine automatische Create- und eine Update-Mutation wurden erfolgreich ausgeführt. |
| Testschritte | 1. Audit-IDs notieren. 2. Für jede Mutation Rollback-Vorschau erstellen und bestätigen. 3. Für eine weitere Mutation die Datei extern verändern und Rollback versuchen. |
| Erwartetes Ergebnis | Jede erfolgreiche Mutation ist einzeln rücksetzbar. Externe Änderungen führen zu Konflikt ohne Überschreiben. |
| Tatsächliches Ergebnis | *(wird in TR-000009 befüllt)* |
| Status | ⬜ Nicht getestet |

### TC-000607: Tastatur und schmaler Pane — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Obsidian bei 320 px Pane-Breite und 200 % Zoom. |
| Testschritte | 1. Nur mit Tab/Shift+Tab Modus, Warnung, Checkbox, Aktivierung und Pause bedienen. 2. Statusmeldungen beobachten. |
| Erwartetes Ergebnis | Logische Fokusfolge, sichtbarer Fokus, verständliche `aria-live`-Meldungen; keine verdeckte Pflichtaktion oder überlappender Text. |
| Tatsächliches Ergebnis | *(wird in TR-000009 befüllt)* |
| Status | ⬜ Nicht getestet |

## 5. Security- und Integritätsmatrix

| ID | Boundary | Erwartetes Ergebnis |
|---|---|---|
| SEC-000601 | Aktivierung ohne `reviewed: true` | Schema verweigert Aktivierung; kein Policy-Datensatz. |
| SEC-000602 | Client behauptet Modus, Restbudget oder längere Laufzeit | Server verwendet ausschließlich gespeicherte Policy. |
| SEC-000603 | 61 parallele automatische Anfragen | Atomarer Claim begrenzt auf 60 erfolgreiche Writes. |
| SEC-000604 | Pause/Ablauf zwischen Client-Anfrage und Write | Neuer Claim wird verweigert; kein neuer automatischer Write. |
| SEC-000605 | Delete/Move/Rename/Mehrdatei/Pfad-Escape | Kein entsprechendes Autonomie-Tool oder Contract; keine Vault-Änderung. |
| SEC-000606 | Externe Dateiveränderung vor automatischem Write | Vorher-Hash-Konflikt; Original bleibt erhalten. |
| SEC-000607 | Auditfehler nach automatischem Write | Datei wird wiederhergestellt; kein Erfolg ohne Audit. |
| SEC-000608 | Replay oder parallele Policy-Aktivierung | Eine persistierte aktive Policy; Status bleibt konsistent. |

## 6. Freigaberegel

Gate 7 kann nur passieren, wenn alle P0-Fälle bestehen, automatisierte Build-/Lint-/Unit-/
Integration-/headed-Playwright-Läufe grün sind, 60/60-Parallelnachweis und Hashkonflikt
reproduzierbar sind sowie kein BLOCKER offen bleibt. Die native Obsidian-Abnahme für
Aktivierung, Pause und Löschsperre ist ein P0-Nachweis und darf nicht durch den Browser-
Harness ersetzt werden.

## 7. Definition-of-Done-Selbstprüfung

- [x] Jede Akzeptanzbedingung aus US-000003 besitzt positive, negative oder Boundary-Fälle.
- [x] Aktivierung, Human-on, Human-out, Budgetende, Ablauf, Pause, Fehler und Recovery sind abgebildet.
- [x] Audit, Rollback, Konflikt, Scope und Dateiintegrität sind P0.
- [x] Browser-Harness und echte Obsidian-Abnahme sind getrennt dokumentiert.
- [x] Accessibility sowie 320 px/200 % sind als P1 enthalten.
- [x] Performance-Baselines verwenden Methoden statt erfundener Budgets.
- [x] Keine offene Testplanungsfrage blockiert `/test-run`.

---

## Übergabe: QA-Testplanung → QA-Testausführung

**Datum:** 2026-08-13
**Von:** QA Engineer (QA)
**An:** QA Engineer (QA)
**Nächster Befehl:** `/test-run second-brain 6`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| TP-000007 | APPROVED | `testing/TP-000007-sprint-6.md` | 7 manuelle, 8 Security- und 4 Performance-Fälle |
| US-000003 | APPROVED | `requirements/US-000003-controlled-mutations.md` | Verbindliche 60/60-Policy |
| SP-000007 | APPROVED | `sprints/SP-000007-sprint-6-autonomie-budgets.md` | Implementierter Commit-Scope |

### Kritische Informationen für Empfänger

- Der Sidecar besitzt die maßgebliche Policy; UI und MCP-Client dürfen nicht als Budgetautorität behandelt werden.
- Die bestehende Browser-Harness deckt die Human-in-Mutation ab, nicht automatisch die echte native Autonomieansicht.
- Für den Budgetnachweis sind deterministische Uhr und parallele Anfragen Pflicht.

### Offene Fragen

Keine BLOCKER- oder MAJOR-Testplanungsfrage.

### Nicht-Ziele

Automatisches Delete/Move/Rename, Mehrdatei-Pakete, Konflikt-Merges, Wissenskompilierung und externe Provider.

---

*Erstellt von: QA-Agent | Datum: 2026-08-13 | Version: 1.0*
