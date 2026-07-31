---
id: DOC-000003
title: Volltextsuche und Quellen verwenden
version: 1.0
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-07-31
project: second-brain
based-on: US-000012, UX-000001, RV-000003
supersedes: —
superseded-by: —
---

# Volltextsuche und Quellen verwenden

## Was dieses Feature tut

Du durchsuchst deinen freigegebenen Obsidian-Vault lokal und kannst jeden Treffer anhand
von Notizpfad, Fundzeile und Textauszug überprüfen.

## Voraussetzungen

- Second Brain MCP ist in Obsidian installiert und aktiviert.
- Der lokale Index wurde mindestens einmal aufgebaut.
- Für die Suche in Claude Desktop ist der Server `second-brain` verbunden.

Das Plugin ist noch nicht im öffentlichen Obsidian-Community-Katalog verfügbar. Installiere
es deshalb wie in [DOC-000001](DOC-000001-claude-desktop-setup.md) beschrieben aus dem
bereitgestellten Plugin-Paket.

## In Obsidian suchen

1. Öffne die Befehlspalette und wähle **Second Brain MCP: Search vault**.
   → Das Pane **Search Second Brain** erscheint.
2. Gib einen Begriff oder eine kurze Phrase aus deinen Notizen ein.
   → Die Schaltfläche **Search** wird verfügbar.
3. Wähle **Search**.
   → Treffer erscheinen nach Relevanz sortiert.
4. Prüfe bei einem Treffer den relativen Notizpfad, die Fundzeile und den Textauszug.
   → Du kannst nachvollziehen, warum der Treffer angezeigt wurde.
5. Öffne den Treffer.
   → Obsidian öffnet die zugehörige Notiz an der Fundstelle.

[SCREENSHOT: Search-Ansicht mit Suchfeld, Trefferpfad, Fundzeile und Textauszug]

## In Claude Desktop suchen

1. Bitte Claude, im Server **second-brain** nach einem Begriff zu suchen.
   → Claude zeigt passende Treffer mit Quelle und Fundzeile.
2. Bitte Claude, eine gefundene Textnotiz zu lesen.
   → Claude liest nur die angeforderte Notiz aus dem freigegebenen Vault.
3. Vergleiche Pfad, Zeile und Auszug mit der Notiz in Obsidian.
   → Die Antwort lässt sich an der Originalquelle überprüfen.

[SCREENSHOT: Claude-Desktop-Antwort mit Quelle, Zeile und Textauszug]

## Hinweise zu Suchergebnissen

- Die Suche verändert keine Originaldateien.
- Wenn keine semantische Suche verfügbar ist, bleibt die Volltextsuche nutzbar. Der Hinweis
  **Semantic search is unavailable. Showing full-text results only.** ist dann erwartet.
- Bilder, PDF-Dateien und andere nicht als Text lesbare Anhänge können über ihren Dateinamen
  erscheinen. Second Brain erfindet dafür keinen Inhalt oder Textauszug.
- Bei keiner Übereinstimmung kannst du eine kürzere Phrase versuchen oder den lokalen Index
  im Setup-Pane aktualisieren.

## Fehlerbehebung

**Problem: Ein bekannter Begriff liefert keinen Treffer.**
Öffne **Second Brain MCP: Open setup** und wähle **Update local index**. Falls der Index
beschädigt wirkt, wähle **Rebuild local index**. Suche danach erneut.

**Problem: Die Suche meldet, dass der lokale Dienst nicht verfügbar ist.**
Prüfe, ob Node.js 24 oder neuer installiert ist, und starte Obsidian nach einer
Plugin-Aktualisierung vollständig neu.

**Problem: Claude findet den Server `second-brain` nicht.**
Prüfe die Schritte und den Recovery-Pfad in
[DOC-000001](DOC-000001-claude-desktop-setup.md). Beende Claude Desktop anschließend
vollständig und starte es neu.

**Problem: Eine Datei außerhalb des Vaults lässt sich nicht lesen.**
Das ist beabsichtigt. Second Brain blockiert absolute Fremdpfade, `..`-Pfade und
Verknüpfungen, die den freigegebenen Vault verlassen.

---

## Übergabe: MW → ORCH

**Datum:** 2026-07-31
**Von:** Manual Writer (MW)
**An:** Orchestrator (ORCH)
**Nächster Befehl:** `/retro second-brain 2` (optional) oder `/refine second-brain 3`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| DOC-000003 | APPROVED | `docs/DOC-000003-volltextsuche-und-quellen.md` | Happy Path und vier Recovery-Fälle |

### Kritische Informationen für Empfänger

Zwei Screenshot-Platzhalter müssen vor einer öffentlichen Veröffentlichung ersetzt werden.

### Offene Fragen (vererbt)

Keine.

### Nicht-Ziele (explizit ausgeschlossen)

Keine Anleitung für semantische Suche, OCR oder Vault-übergreifende Suche.

### Empfehlungen

Die lokale Installationsgrenze bis zur Aufnahme in den Community-Katalog sichtbar halten.

---

*Erstellt von: MW-Agent | Datum: 2026-07-31 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-07-31 | Initiale Version für Volltextsuche und Quellen | MW |
