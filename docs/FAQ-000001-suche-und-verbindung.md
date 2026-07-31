---
id: FAQ-000001
title: FAQ — Suche, Verbindung und Beziehungen
version: 1.1
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-07-31
project: second-brain
based-on: DOC-000001, DOC-000003, DOC-000004, RV-000004
supersedes: —
superseded-by: —
---

# FAQ: Suche, Verbindung und Beziehungen

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

## Beziehungen

### Warum zeigt Obsidian keine Beziehungen, obwohl die Notiz einen Link enthält?

Wähle in der Relationship-Ansicht **Refresh active note**. Wenn du das Plugin gerade
aktualisiert hast, beende Obsidian vollständig und starte es neu. `Strg+R` startet den
lokalen Dienst nicht in jeder Umgebung zuverlässig neu.

### Warum funktionieren Suche und Indexaufbau in Claude, aber Beziehungen melden `SIDECAR_OFFLINE`?

Claude kann noch einen älteren lokalen Dienst verwenden. Beende Claude Desktop vollständig
und starte es neu. Prüfe außerdem, ob Claudes Serverkonfiguration auf die Plugin-Installation
im selben Vault verweist, den du gerade in Obsidian geöffnet hast.

### Welchen Pfad muss ich Claude für eine Notiz geben?

Verwende den Pfad innerhalb des freigegebenen Vaults, zum Beispiel `Alpha.md` für eine
Notiz in der Wurzel oder `Projekte/Alpha.md` für eine Notiz im Ordner `Projekte`. Verwende
keine vollständige Windows-Adresse.

### Warum meldet Claude `PATH_OUTSIDE_VAULT`?

Der angegebene Pfad liegt aus Sicht des konfigurierten Vaults außerhalb des erlaubten
Bereichs. Prüfe, ob Claude und Obsidian denselben Vault verwenden, und gib danach nur den
relativen Notizpfad an.

### Verändert das Erkunden von Beziehungen meine Notizen?

Nein. Second Brain aktualisiert ausschließlich den abgeleiteten lokalen Index. Die
Originalnotizen bleiben unverändert.

*Mehr Details: siehe [DOC-000004](DOC-000004-beziehungen-erkunden.md).*

---

## Übergabe: MW → ORCH

**Datum:** 2026-07-31
**Von:** Manual Writer (MW)
**An:** Orchestrator (ORCH)
**Nächster Befehl:** `/retro second-brain 3` (optional) oder `/refine second-brain 4`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| FAQ-000001@1.1 | APPROVED | `docs/FAQ-000001-suche-und-verbindung.md` | Installation, Suche, Beziehungen und Grenzen |

### Kritische Informationen für Empfänger

Die FAQ bildet die tatsächlich in den Sprint-2- und Sprint-3-Reviews aufgetretenen
Einrichtungs-, Vault- und Neustartfragen ab.

### Offene Fragen (vererbt)

Keine.

### Nicht-Ziele (explizit ausgeschlossen)

Keine Zusage eines Veröffentlichungsdatums für den Community-Katalog.

### Empfehlungen

Nach einer öffentlichen Plugin-Veröffentlichung die Antwort zur manuellen Installation
aktualisieren.

---

*Erstellt von: MW-Agent | Datum: 2026-07-31 | Version: 1.1*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.1 | 2026-07-31 | Vault-Pfade, Sidecar-Neustart und Relationship-Fehler ergänzt | MW |
| 1.0 | 2026-07-31 | Initiale FAQ aus Sprint-2-Nutzerfragen | MW |
