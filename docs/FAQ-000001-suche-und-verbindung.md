---
id: FAQ-000001
title: FAQ — Suche und Verbindung
version: 1.0
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-07-31
project: second-brain
based-on: DOC-000001, DOC-000003, RV-000003
supersedes: —
superseded-by: —
---

# FAQ: Suche und Verbindung

## Installation und Verbindung

### Warum finde ich Second Brain MCP nicht im Obsidian-Community-Katalog?

Das Plugin ist dort noch nicht veröffentlicht. Installiere das bereitgestellte Paket
manuell in deinem Vault und aktiviere es anschließend unter **Community plugins**.

*Mehr Details: siehe [DOC-000001](DOC-000001-claude-desktop-setup.md).*

### Warum sieht Claude Desktop den Server `second-brain` nicht?

Claude Desktop hat die Konfiguration möglicherweise noch nicht geladen oder der gespeicherte
Pfad verweist auf eine alte Plugin-Installation. Ersetze den vorhandenen
`second-brain`-Eintrag durch die aktuell in Obsidian angezeigte Konfiguration und starte
Claude Desktop vollständig neu.

### Muss Obsidian während der Suche in Claude Desktop geöffnet bleiben?

Nein. Claude Desktop startet den mit dem Plugin installierten lokalen Dienst selbst. Die
installierten Plugin-Dateien und der konfigurierte Vault müssen jedoch weiterhin vorhanden
sein.

## Suche und Quellen

### Warum erscheint ein Hinweis, dass die semantische Suche nicht verfügbar ist?

Sprint 2 liefert eine lokale Volltextsuche. Eine semantische Ähnlichkeitssuche ist noch
nicht enthalten. Die Volltextsuche funktioniert trotz dieses Hinweises weiter.

### Warum findet die Suche einen Begriff nicht, obwohl er in einer Notiz steht?

Der lokale Index kann veraltet sein. Öffne das Setup-Pane und wähle zuerst
**Update local index**. Verwende **Rebuild local index**, wenn eine normale Aktualisierung
nicht hilft.

### Warum hat ein Bild oder eine PDF-Datei keinen Textauszug?

Second Brain extrahiert in diesem Stand keinen Inhalt aus Bildern, PDF-Dateien oder anderen
Binäranhängen. Solche Dateien können als Metadatentreffer erscheinen, ohne dass Inhalt
erfunden wird.

### Kann Claude Dateien außerhalb meines Vaults lesen?

Nein. Absolute Fremdpfade, Pfadwechsel mit `..` und Verknüpfungen nach außerhalb werden
blockiert.

*Mehr Details: siehe
[DOC-000003](DOC-000003-volltextsuche-und-quellen.md).*

---

## Übergabe: MW → ORCH

**Datum:** 2026-07-31
**Von:** Manual Writer (MW)
**An:** Orchestrator (ORCH)
**Nächster Befehl:** `/retro second-brain 2` (optional) oder `/refine second-brain 3`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| FAQ-000001 | APPROVED | `docs/FAQ-000001-suche-und-verbindung.md` | Installation, Verbindung, Suche und Grenzen |

### Kritische Informationen für Empfänger

Die FAQ bildet die tatsächlich im Sprint-2-Review aufgetretenen Einrichtungsfragen ab.

### Offene Fragen (vererbt)

Keine.

### Nicht-Ziele (explizit ausgeschlossen)

Keine Zusage eines Veröffentlichungsdatums für den Community-Katalog.

### Empfehlungen

Nach einer öffentlichen Plugin-Veröffentlichung die Antwort zur manuellen Installation
aktualisieren.

---

*Erstellt von: MW-Agent | Datum: 2026-07-31 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-07-31 | Initiale FAQ aus Sprint-2-Nutzerfragen | MW |
