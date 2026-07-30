---
id: DOC-000002
title: Lokalen Index aktualisieren und neu aufbauen
version: 1.0
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-07-31
project: second-brain
based-on: US-000005, UX-000001, RV-000002
supersedes: —
superseded-by: —
---

# Lokalen Index aktualisieren und neu aufbauen

## Was dieses Feature tut

Der lokale Index erfasst neue, geänderte und entfernte Vault-Dateien, ohne deine
Originalnotizen umzuschreiben. Unveränderte Dateien werden bei späteren Aktualisierungen
nicht erneut vollständig verarbeitet.

## Voraussetzungen

Second Brain MCP ist installiert und der Vault wurde im Setup ausgewählt. Siehe
[Claude Desktop lokal verbinden](DOC-000001-claude-desktop-setup.md).

## Index erstmals erstellen oder aktualisieren

1. Öffne die Befehlspalette und wähle **Second Brain MCP: Open setup**.
2. Prüfe den Pfad unter **Obsidian vault folder**.
3. Wähle **Update local index**.
   → Während des Laufs erscheint `Updating local index…`.
4. Warte auf die Ergebniszeile.
   → Sie zeigt, wie viele Dateien indexiert, geändert und entfernt wurden, und bestätigt
   `Original files unchanged.`

[SCREENSHOT: Setup-Pane mit erfolgreichem Ergebnis von „Update local index“]

## Index sicher neu aufbauen

Verwende den Neuaufbau nur, wenn der Index beschädigt oder offensichtlich unvollständig ist.

1. Öffne das Setup-Pane und prüfe den Vault-Pfad.
2. Wähle **Rebuild local index**.
   → `Rebuilding local index…` erscheint.
3. Warte auf die Ergebniszeile.
   → Der abgeleitete Index wurde ersetzt; deine Originaldateien blieben unverändert.

Der bisherige gültige Index bleibt erhalten, falls der Neuaufbau fehlschlägt.

[SCREENSHOT: Erfolgreicher Neuaufbau mit Dateizahlen und Unchanged-Hinweis]

## Tipps und Hinweise

- **Update local index** ist die normale Aktion nach Änderungen im Vault.
- Ein Lauf ohne Änderungen darf `0 changed` und `0 removed` anzeigen.
- Der Index liegt lokal im Vault unter `.second-brain/index.sqlite`.
- Für große Vaults kann die Laufzeit variieren. Schließe Obsidian nicht, solange der Status
  einen laufenden Indexvorgang zeigt.

## Fehlerbehebung

**Problem: `The local index is not available.`**
Prüfe zuerst den Vault-Pfad und den lokalen Dienst. Versuche danach **Update local index**
erneut. Der vorherige Index und die Originaldateien bleiben erhalten.

**Problem: Der Index wirkt unvollständig.**
Wähle **Rebuild local index**. Tritt der Fehler erneut auf, prüfe, ob Dateien gesperrt oder
nicht lesbar sind und ob auf dem Datenträger ausreichend Platz vorhanden ist.

**Problem: Eine gelöschte Notiz erscheint weiterhin im Index.**
Führe **Update local index** aus. Die Ergebniszeile sollte die Datei unter `removed`
berücksichtigen.

---

## Übergabe: MW → ORCH

**Datum:** 2026-07-31
**Von:** Manual Writer (MW)
**An:** Orchestrator (ORCH)
**Nächster Befehl:** `/retro second-brain 1` (optional) oder `/refine second-brain 2`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| DOC-000002 | APPROVED | `docs/DOC-000002-local-index.md` | Update, Rebuild und Recovery |

### Kritische Informationen für Empfänger

Das offene Timeout-/Abbruchverhalten großer Vaults wird nicht als bereits gelöst dargestellt.

### Offene Fragen (vererbt)

| # | Frage | Ursprung | Kritikalität | An wen |
|---|---|---|---|---|
| 1 | Verbindliches Timeout-/Abbruchverhalten für große Indexläufe | DEBT-000001 | MINOR | AR+BE |

### Nicht-Ziele (explizit ausgeschlossen)

Suche, Wissensgraph und externe Indexspeicherung.

### Empfehlungen

Die markierten Screenshots vor einer öffentlichen Veröffentlichung ergänzen.

---

*Erstellt von: MW-Agent | Datum: 2026-07-31 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-07-31 | Initiale, Gate-9-geprüfte Version | MW |
