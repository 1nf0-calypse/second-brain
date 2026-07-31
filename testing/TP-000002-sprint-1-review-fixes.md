---
id: TP-000002
title: Testplan Second Brain Sprint 1 Review-Korrekturen
version: 1.0
status: APPROVED
author-agent: QA (QA Engineer)
date: 2026-07-30
project: second-brain
sprint: 1
based-on: RV-000001, US-000011, US-000005, UX-000001, UX-000002, TP-000001, SP-000002
supersedes: —
superseded-by: —
ablage: projects/second-brain/testing/
---

# Testplan: Second Brain — Sprint 1 Review-Korrekturen

## 1. Testumfang

Dieser Nachtest prüft die mit Commit `389015f` umgesetzten Gate-8-Korrekturen:

- lokale Sidecar-Prüfung wird nicht als bestätigte Claude-Desktop-Verbindung dargestellt;
- bestehende `claude_desktop_config.json` wird als ein JSON-Objekt sicher ergänzt;
- Indexstatus, Aktualisierung und Neuaufbau sind in Obsidian bedienbar;
- No-op-Synchronisierung liest unveränderte Dateiinhalte nicht erneut;
- fehlgeschlagener Rebuild erhält den letzten gültigen Index;
- gesperrte/unlesbare Dateien führen zu einem sicheren, wiederholbaren Fehler;
- generierte Plugin-Dateien im Test-Vault brechen den Lint-Lauf nicht.

Alle übrigen Fälle aus `TP-000001` bleiben Regressionstestbasis. ChatGPT, Mistral, Suche,
Mutationen, Graph und Android bleiben außerhalb des Sprint-1-Scopes.

## 2. Testumgebung

| Eigenschaft | Wert |
|---|---|
| Betriebssystem | Windows 11 |
| Runtime | Node.js 24 LTS, npm 11+ |
| Host | Aktuelle Obsidian-Desktop-Version; separater synthetischer Test-Vault |
| MCP-Client | Claude Desktop für Windows |
| Testdaten | ausschließlich `packages/test-fixtures/` und `testing/system-vault/` |
| Index | lokale SQLite-Datei unter `.second-brain/` |
| Variablen | `SECOND_BRAIN_VAULT_ROOT`, `SECOND_BRAIN_CONTRACT_VERSION=1.0.0` |

Vor manuellen Indexfällen wird ein SHA-256-Manifest der Originalnotizen erstellt. Die
vorhandenen nutzereigenen Dateien im Test-Vault werden weder bereinigt noch überschrieben.

## 3. Automatisierte Tests

### 3.1 Qualitätsziele und Befehle

| Ebene | Ziel |
|---|---|
| Vitest | alle Unit-, Contract-, Security- und Integrationstests grün |
| Kern-Coverage | Statements und Branches jeweils mindestens 80 % |
| Playwright | alle kritischen Setup-/Index-Clickpfade grün |
| Build/Lint | keine Fehler, auch mit installiertem Test-Vault-Plugin |

```powershell
npm run build
npm run lint
npm test
npm run test:coverage
npm run test:e2e
npm audit
```

### 3.2 Inventar und Review-Zuordnung

| Review-Fund | Automatisierter Nachweis | Manueller Nachweis |
|---|---|---|
| K-001 | lokaler Erfolgstext nennt separate Claude-Verifikation | TC-000013 |
| K-002 / Q-002 | Buttons, zugängliche Namen und Statusformat | TC-000015 |
| K-003 / T-001 | fehlgeschlagener Rebuild, danach No-op mit bestehendem Index | TC-000017 |
| Q-001 | `npm run lint` mit installiertem Test-Vault-Paket | TC-000019 |
| T-002 | injizierter Lesefehler und erfolgreicher Retry | TC-000018 |
| P-001 | Read-Spy ergibt beim No-op exakt 0 Inhaltslesevorgänge | TC-000016 |
| Setup-Merge | sichtbarer Warnhinweis gegen zweites JSON-Objekt | TC-000014 |

## 4. Manuelle Testfälle

### TC-000013: Lokale Prüfung und Claude-Verbindung korrekt unterscheiden — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Plugin aktiv, Setup über Befehlspalette geöffnet, gültiger Test-Vault gewählt |
| Testschritte | 1. `Test local service` wählen. 2. Erfolgstext lesen. 3. Claude Desktop noch nicht starten. |
| Erwartetes Ergebnis | Erfolg bestätigt nur den lokalen Dienst und fordert zur separaten Verifikation in Claude Desktop auf; keine Behauptung einer bereits bestehenden Claude-Verbindung. |
| Tatsächliches Ergebnis | Playwright-Harness bestanden; echte Obsidian-View offen. |
| Status | ⚠️ Automatisiert bestanden, manuell offen |

### TC-000014: Bestehende Claude-Konfiguration sicher zusammenführen — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Gültige `claude_desktop_config.json` mit bestehenden Top-Level-Einstellungen sichern |
| Testschritte | 1. Setup-Anleitung lesen. 2. `Copy configuration` wählen. 3. Den `second-brain`-Eintrag in das vorhandene `mcpServers`-Objekt integrieren. 4. Datei mit JSON-Parser validieren. 5. Claude Desktop neu starten. 6. `second_brain_setup_status` aufrufen. |
| Erwartetes Ergebnis | Genau ein gültiges Top-Level-JSON-Objekt; bestehende Einstellungen bleiben erhalten; Anleitung warnt ausdrücklich vor einem zweiten JSON-Objekt; MCP-Werkzeug antwortet erfolgreich. |
| Tatsächliches Ergebnis | Merge-Warnhinweis im Playwright-Harness bestanden; echter Claude-Aufruf offen. |
| Status | ⚠️ Automatisiert bestanden, manuell offen |

### TC-000015: Index in Obsidian aktualisieren und neu aufbauen — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Setup-View geöffnet, Vault gewählt, Hashmanifest vorhanden |
| Testschritte | 1. `Update local index` wählen. 2. Statuszahlen prüfen. 3. Notiz hinzufügen. 4. erneut aktualisieren. 5. `Rebuild local index` wählen. |
| Erwartetes Ergebnis | Aktionen sind direkt bedienbar; Loading und Ergebnis werden live angekündigt; Delta ist nachvollziehbar; Rebuild meldet unveränderte Originaldateien; Hashmanifest bleibt identisch, abgesehen von der bewusst neu erstellten Notiz. |
| Tatsächliches Ergebnis | Update-/Rebuild-Clickpfad im Playwright-Harness bestanden; echte Obsidian-View offen. |
| Status | ⚠️ Automatisiert bestanden, manuell offen |

### TC-000016: No-op verarbeitet unveränderte Inhalte nicht vollständig neu — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Erfolgreicher Initialindex mit mindestens 500 synthetischen Dateien |
| Testschritte | 1. Keine Vault-Datei ändern. 2. Read-Spy aktivieren. 3. Index aktualisieren. |
| Erwartetes Ergebnis | `changedFiles = 0`; exakt 0 Inhaltslesevorgänge für unveränderte Dateien; Originalhashes unverändert. |
| Tatsächliches Ergebnis | Vitest-Read-Spy: 0 Inhaltsreads; `changedFiles = 0`. |
| Status | ✅ Bestanden |

### TC-000017: Fehlgeschlagener Rebuild erhält letzten gültigen Index — P0

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Gültiger Index vorhanden; ein reproduzierbarer Lesefehler ist vorbereitet |
| Testschritte | 1. Rebuild starten und den Lesefehler auslösen. 2. Fehlermeldung prüfen. 3. Fehlerursache entfernen. 4. normale Synchronisierung ausführen. |
| Erwartetes Ergebnis | Rebuild schlägt sicher fehl; vorheriger Index bleibt gültig; anschließende Synchronisierung meldet bei unverändertem Vault `changedFiles = 0`; keine Originaldatei wurde verändert. |
| Tatsächliches Ergebnis | Erzwungener Lesefehler ließ bestehenden Index intakt; anschließender Lauf meldete `changedFiles = 0`. |
| Status | ✅ Bestanden |

### TC-000018: Gesperrte oder unlesbare Datei und Retry — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Vault mit Datei, deren Lesen reproduzierbar verweigert wird |
| Testschritte | 1. Rebuild starten. 2. Fehler und Recovery-Hinweis prüfen. 3. Zugriff wieder erlauben. 4. Rebuild erneut starten. |
| Erwartetes Ergebnis | Erster Lauf meldet sicheren Fehler und bewahrt vorherigen Index sowie Vault; zweiter Lauf ist erfolgreich. |
| Tatsächliches Ergebnis | Injizierte Dateizugriffsverweigerung und anschließender erfolgreicher Retry bestanden. |
| Status | ✅ Bestanden (automatisiert); echter Windows-Lock offen |

### TC-000019: Installierter Test-Vault bleibt lintbar — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | gebautes Plugin liegt unter `testing/system-vault/.obsidian/plugins/second-brain/` |
| Testschritte | `npm run lint` im Sprint-Worktree ausführen |
| Erwartetes Ergebnis | Exitcode 0; generierte Bundles werden nicht als Quellcode gelintet; echte Projektquellen bleiben vollständig geprüft. |
| Tatsächliches Ergebnis | Lint Exitcode 0 bei installiertem Plugin-Paket im Test-Vault. |
| Status | ✅ Bestanden |

### TC-000020: Bediengrenzen und Accessibility-Regression — P1

| Feld | Inhalt |
|---|---|
| Vorbedingungen | Setup-View in Obsidian |
| Testschritte | 1. Setup über Befehlspalette öffnen. 2. Nur Tastatur verwenden. 3. Pane auf 320 px setzen. 4. Zoom auf 200 % setzen. 5. alle vier Aktionen erreichen. |
| Erwartetes Ergebnis | Logische Fokusreihenfolge, zugängliche Namen, Live-Status, kein Aktionsverlust und kein horizontales Abschneiden. |
| Tatsächliches Ergebnis | *(wird bei `/test-run` befüllt)* |
| Status | ⬜ Nicht getestet |

## 5. Sicherheits- und Performanztests

| ID | Bereich | Methode | Erwartetes Ergebnis |
|---|---|---|---|
| SEC-000008 | Vault-Unveränderlichkeit | Hashvergleich vor/nach Update, Fehler und Rebuild | keine unbeabsichtigte Änderung |
| SEC-000009 | Konfigurationsschutz | bestehende JSON-Felder vor/nach Merge vergleichen | keine fremde Einstellung verloren |
| SEC-000010 | Prozessgrenze | lokale Prüfung ohne Claude Desktop ausführen | keine falsche Verbindungsbehauptung |
| PERF-000007 | No-op-Index | 500 Dateien, Read-Spy und Laufzeitmessung | 0 Inhaltsreads; Baseline dokumentiert |
| PERF-000008 | Rebuild | 500 Dateien, Erfolg und erzwungener Fehler | Laufzeit/Peak-RSS dokumentiert; Fehler atomar |

Ein allgemeines Produkt-Performancebudget ist weiterhin nicht definiert. Deshalb werden
Ausgangswerte dokumentiert; die funktionale Grenze von 0 Inhaltsreads beim No-op ist
verbindlich.

## 6. Ein- und Austrittskriterien

**Eintritt:**

- [x] Review `RV-000001` fordert Änderungen an.
- [x] Root-Cause-Analyse ist im Review dokumentiert.
- [x] Korrekturcommit `389015f` ist vorhanden.
- [x] FE/BE-Implementierung wurde im Sprint-Worktree ausgeführt.

**Austritt:**

- alle automatisierten Tests, Build, Lint und Audit grün;
- TC-000013 bis TC-000017 bestanden;
- TC-000018 entweder real unter Windows oder durch reproduzierbare Dateizugriffsverweigerung
  einschließlich Retry nachgewiesen;
- keine offenen BLOCKER;
- Testbericht `TR-000003` enthält Coverage, Performance-Baselines und Freigabeempfehlung.

## 7. Risiken und Definition of Done

| Risiko | Schwere | Behandlung |
|---|---|---|
| Claude Desktop kann nicht aus Playwright heraus geprüft werden | MAJOR | TC-000014 als echter manueller Systemtest |
| Windows-Dateisperren sind nicht auf jedem Dateisystem gleich erzwingbar | MINOR | injizierbarer Lesefehler plus manueller Windows-Versuch |
| UI-Harness ist nicht die echte Obsidian-Laufzeit | MAJOR | TC-000015 und TC-000020 in Obsidian |

- [x] Beide Sprint-US besitzen positive und negative Fälle.
- [x] Jedes Gate-8-Review-Finding ist einem Test zugeordnet.
- [x] UX-Erfolg, Loading, Fehler, Recovery und Accessibility sind geplant.
- [x] Sicherheits- und Performanzfälle enthalten erwartete Ergebnisse.
- [x] Testumgebung und Ausführungsbefehle sind definiert.
- [x] Keine Planungs-BLOCKER.
- [x] Constitution-Prinzipien zu Lokalität und Datenintegrität sind eingehalten.
- [x] Stakeholder-Freigabe am 2026-07-30 erteilt.

---

## Übergabe: QA-Testplanung → QA-Testausführung

**Datum:** 2026-07-30
**Von:** QA Engineer (QA)
**An:** QA Engineer (QA)
**Nächster Befehl:** `/test-run second-brain 1`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| TP-000002 | APPROVED | `testing/TP-000002-sprint-1-review-fixes.md` | Nachtest für alle Gate-8-Korrekturen |
| RV-000001 | REQUEST_CHANGES | `reviews/RV-000001-sprint-1.md` | Quelle der Regressionen |
| Implementierung | committed | Commit `389015f` | FE/BE-Korrekturen |

### Kritische Informationen für Empfänger

- Der lokale Test beweist ausdrücklich nicht die Claude-Desktop-Registrierung.
- Der echte Konfigurations-Merge und MCP-Aufruf bleiben manueller P0-Systemtest.
- Nutzerdateien im Test-Vault sind zu erhalten.

### Offene Fragen (vererbt)

Keine BLOCKER-Frage.

### Nicht-Ziele

Keine erneute Abnahme von Funktionen außerhalb US-000011 und US-000005.

### Empfehlungen

Zuerst automatisierte Regressionen, danach die echten Obsidian-/Claude-Desktop-Fälle
TC-000013 bis TC-000015 ausführen.
