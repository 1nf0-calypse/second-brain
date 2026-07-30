---
id: RV-000002
title: Re-Review Second Brain Sprint 1
version: 1.0
status: REJECTED
author-agent: RV (Code Reviewer)
date: 2026-07-30
project: second-brain
sprint: 1
reviewed-stories: US-000011, US-000005
qa-report: TR-000003
supersedes: RV-000001
superseded-by: —
---

# Re-Review: Second Brain — Sprint 1

## Review-Übersicht

| Eigenschaft | Wert |
|---|---|
| Branch | `feature/sprint-1` |
| Reviewed Commit | `d3dd392` |
| Reviewer-Agent | RV |
| QA-Freigabe | CONDITIONAL |
| Nutzerabnahme | **REJECTED** |
| Technischer Review | **REQUEST CHANGES** |
| Gesamtentscheidung | **REJECTED** |

## Teil 1: Nutzerabnahme

### Sprint-Übersicht

- US-000011 — Claude Desktop lokal einrichten.
- US-000005 — Lokale inkrementelle Indexierung.
- BUG-000001 — unvollständiges Plugin-Paket — VERIFIZIERT.
- BUG-000002 — ungültiger Node-Startpfad — VERIFIZIERT.
- RV-000001/T-002 — unlesbare Datei nicht getestet — automatisiert adressiert; echter
  Windows-Lock im Nachtest offen.

### Präsentierter Test-Guide

**US-000011:** Setup öffnen, Vault wählen, Merge-Hinweis und lokalen Dienst prüfen,
Konfiguration in Claude Desktop integrieren und Einrichtungsstatus abrufen.

**US-000005:** Index aktualisieren, Änderung und No-op prüfen, Index neu aufbauen sowie
Bedienbarkeit bei schmaler Seitenleiste und 200 % Zoom prüfen.

### Interview-Ergebnisse

| Feature | Funktioniert? | Nutzer-Befund | Anmerkungen |
|---|---|---|---|
| US-000011: Claude Desktop lokal einrichten | Ja | ACCEPTED | „Jetzt ist er klarer.“ Keine weiteren unerwarteten Verhaltensweisen |
| US-000005: Lokale inkrementelle Indexierung | Nein | REJECTED | „Ich sehe im Second Brain Setup kein ‘Update local Index’.“ |

### Nutzerabnahme-Entscheidung

**REJECTED**

US-000011 wurde akzeptiert. US-000005 kann nicht abgenommen werden, weil die zentrale
Indexaktion in der tatsächlich getesteten Obsidian-Ansicht nicht sichtbar war.

## Teil 2: Technisches Code Review

### Dimension 1: Korrektheit

| Kriterium | Status | Anmerkungen |
|---|---|---|
| Alle US-Akzeptanzkriterien implementiert und ausgeliefert | ❌ | Indexaktionen stehen im Quellcode, waren im Nutzer-Build aber nicht verfügbar |
| Laufzeitverträge eingehalten | ✅ | Antworten werden durch Zod validiert |
| Edge Cases und Fehlerbehandlung | ⚠️ | atomarer Rebuild behoben; Timeout großer Indexläufe offen |

| # | Kategorie | Datei:Zeile | Problem | Empfehlung |
|---|---|---|---|---|
| K-001 | MAJOR | `apps/sidecar/src/bootstrap/setup-service.ts:28` | Der lokale Kindprozess-Handshake liefert weiterhin „Claude Desktop connected“. Die Setup-View hängt diese Aussage vor „Local service ready“ an und behauptet eine nicht beobachtete Claude-Verbindung. | Lokalen Handshake neutral formulieren; nur echter MCP-Aufruf darf Claude-Verbindung bestätigen. Vollständigen dargestellten Text testen. |
| K-002 | MAJOR | ausgeliefertes Plugin / `apps/obsidian-plugin/src/ui/setup-view.ts:68` | Update/Rebuild sind im Quellcode und Bundle vorhanden, waren im echten Nutzerlauf aber nicht sichtbar. Lieferkette oder Reload-/Versionsführung ist damit nicht verlässlich. | Installations-/Reloadpfad reproduzierbar machen, sichtbare Buildversion anzeigen und echten Obsidian-Test gegen genau dieses Bundle bestehen lassen. |
| K-003 | MAJOR | `apps/obsidian-plugin/src/ipc/node-setup-transport.ts:8,39` | Handshake, Synchronisierung und Rebuild teilen denselben 5-s-Timeout. Ein legitimer großer Rebuild kann dadurch als Dienstfehler abbrechen. | Operationsspezifische Timeouts und sauberes Abbruchverhalten definieren; großen Vault testen. |

### Dimension 2: Sicherheit

| Kriterium | Status | Anmerkungen |
|---|---|---|
| Vault-Root-Validierung | ✅ | kanonischer Root am MCP-Einstieg |
| Secrets/Rohinhalte nicht geloggt | ✅ | keine neue Logging-Ausweitung |
| SQL-Injection-Schutz | ✅ | parametrisierte Statements |
| beliebige Code-/Shellausführung ausgeschlossen | ✅ | statische read-only Toolliste |
| Vault-Originale unverändert | ✅ | Hash- und Fehlerfalltests grün |

Keine neuen Sicherheitsbefunde.

### Dimension 3: ADR-Konformität

| ADR | Status | Anmerkungen |
|---|---|---|
| ADR-000001 | ✅ | TypeScript, Node, MCP und native Obsidian-UI |
| ADR-000002 | ✅ | Modulgrenzen eingehalten |
| ADR-000003 | ✅ | lokaler Index und atomarer Neuaufbau |
| ADR-000004 | ✅ | read-only Tools und Vault-Grenze |
| ADR-000005 | ✅ | Sprint-Worktree verwendet |

### Dimension 4: Code-Qualität

| Kriterium | Status | Anmerkungen |
|---|---|---|
| Datei-Header | ✅ | vorhanden |
| öffentliche Funktionen vollständig dokumentiert | ❌ | neue Kurzkommentare unterschreiten den JSDoc-Standard |
| kein toter Code | ❌ | exportiertes `scanVault()` ohne Aufrufer |
| keine `any`-Typen | ✅ | keine neuen `any` |
| Lint | ✅ | grün |

| # | Kategorie | Datei:Zeile | Problem | Empfehlung |
|---|---|---|---|---|
| Q-001 | MINOR | `setup-client.ts:32,40`; `node-setup-transport.ts:27,32` | Öffentliche Funktionen dokumentieren Parameter, Rückgabe, Fehler und Seiteneffekte nicht vollständig. | JSDoc gemäß Projektstandard ergänzen. |
| Q-002 | MINOR | `sqlite-index.ts:206` | `scanVault()` ist exportiert, aber ungenutzt. | Entfernen oder als unterstützte API testen und dokumentieren. |

### Dimension 5: Testabdeckung

| Kriterium | Status | Anmerkungen |
|---|---|---|
| Kernfunktionen automatisiert | ✅ | 22/22 Vitest |
| Happy Path und Fehlerfall | ✅ | atomarer Fehlerfall und Retry |
| Playwright kritische Flows | ⚠️ | 5/5 Harness; echte Obsidian-View wich ab |
| Coverage-Ziel | ✅ | 88,46 % Statements, 88,09 % Branches |
| echter Desktop-Nachtest | ❌ | QA CONDITIONAL; Nutzer fand fehlende Indexaktion |

| # | Kategorie | Bereich | Problem | Empfehlung |
|---|---|---|---|---|
| T-001 | MAJOR | Paket-/Obsidian-Systemtest | Der HTML-Harness bewies vorhandene Buttons, erkannte aber nicht, dass sie im Nutzerlauf fehlten. | Installierte Bundle-Version und sichtbare Aktionen im echten Obsidian-Pfad verifizieren. |

### Dimension 6: Performance und Wartbarkeit

| Kriterium | Status | Anmerkungen |
|---|---|---|
| No-op ohne Inhaltsreads | ✅ | 0 Reads nachgewiesen |
| Rebuild atomar | ✅ | Snapshot vor Transaktion, Rollbacktest |
| 500-Dateien-Baseline | ✅ | Initial 453 ms, No-op 234 ms, Rebuild 431 ms |
| Skalierung über 5 Sekunden | ❌ | gemeinsamer Transporttimeout |
| Komplexität | ✅ | Indexfluss verständlich |

## Zusammenfassung

| Schweregrad | Anzahl |
|---|---:|
| BLOCKER | 0 |
| MAJOR | 4 |
| MINOR | 2 |
| SUGGESTION | 0 |

Atomarer Rebuild, No-op-Inkrementalität, Lint-Ignores und automatisierter Lesefehler sind
behoben. Der lokale/Claude-Text ist nur teilweise korrigiert; der Indexbedienpfad wurde im
echten Nutzerlauf nicht ausgeliefert.

### Gesamtentscheidung

**REJECTED**

US-000005 war für den Nutzer nicht bedienbar. Zusätzlich bleiben vier MAJOR- und zwei
MINOR-Befunde. Ein Merge ist nicht freigegeben.

### Technische Schulden

Keine akzeptierte technische Schuld; alle Befunde gehören zum Sprint-Scope.

## Definition-of-Done-Selbstprüfung

- [x] Sprint-Übersicht und Test-Guide präsentiert.
- [x] Nutzerinterview für beide Features abgeschlossen.
- [x] Nutzerbefund pro Feature dokumentiert.
- [x] Alle sechs technischen Dimensionen geprüft.
- [x] Jeder Befund besitzt Kategorie und Empfehlung.
- [x] Gesamtentscheidung abgeleitet.
- [x] Constitution geprüft; keine Ausnahme erforderlich.
- [x] Indizes aktualisiert.

---

## Übergabe: RV → BA

**Datum:** 2026-07-30
**Von:** Code Reviewer (RV)
**An:** Business Analyst (BA)
**Nächster Befehl:** `/ba second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| RV-000002 | REJECTED | `reviews/RV-000002-sprint-1-rereview.md` | US-000005 nicht bedienbar; 4 MAJOR |
| TR-000003 | CONDITIONAL | `testing/TR-000003-sprint-1-review-fixes.md` | Automatisierte Regressionen grün |

### Kritische Informationen für Empfänger

- US-000011 wurde akzeptiert; der Flow ist klarer.
- US-000005 wurde wegen fehlender Indexaktion abgelehnt.
- Packaging/Reload/Versionierung muss vor neuer Implementierung reproduziert werden.

### Offene Fragen

| # | Frage | Ursprung | Kritikalität | An wen |
|---|---|---|---|---|
| 1 | Warum lädt Obsidian eine View ohne Indexaktionen, obwohl das Bundle sie enthält? | K-002 | MAJOR | BA+FE |
| 2 | Welches Timeout-/Abbruchverhalten gilt für große Indexläufe? | K-003 | MAJOR | BA+AR+BE |

### Nicht-Ziele

Keine Erweiterung auf weitere Clients oder spätere Produktstories.

### Empfehlungen

Den ausgelieferten Desktop-Pfad zuerst reproduzieren und den beobachtbaren Buildstand
eindeutig machen.
