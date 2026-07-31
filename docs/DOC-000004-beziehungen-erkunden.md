---
id: DOC-000004
title: Direkte Beziehungen erkunden
version: 1.0
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-07-31
project: second-brain
based-on: US-000013, UX-000001, RV-000004
supersedes: —
superseded-by: —
---

# Direkte Beziehungen erkunden

## Was dieses Feature tut

Du siehst belegbare Verbindungen einer Notiz—Links, Rückverweise, Tags und Eigenschaften—
direkt in Obsidian oder über Claude Desktop, ohne deine Notizen zu verändern.

## Voraussetzungen

- Second Brain MCP ist im verwendeten Vault installiert und aktiviert.
- Der lokale Index wurde mindestens einmal aufgebaut.
- Claude Desktop und Obsidian verwenden denselben Vault.
- Nach einem Plugin-Update wurden Obsidian und anschließend Claude Desktop vollständig
  beendet und neu gestartet.

## Beziehungen in Obsidian anzeigen

1. Öffne die Notiz, deren Verbindungen du untersuchen möchtest.
   → Die Notiz ist die aktive Notiz in Obsidian.
2. Öffne die Befehlspalette und wähle
   **Second Brain MCP: Explore active note relationships**.
   → Das Pane **Relationships** erscheint.
3. Wähle **Refresh active note**.
   → Der lokale Index wird aktualisiert und die direkten Beziehungen erscheinen.
4. Prüfe bei jedem Eintrag Typ, Richtung, Ziel und Quelle.
   → Du kannst nachvollziehen, aus welcher Notiz und Fundstelle die Verbindung stammt.
5. Wähle bei einem vorhandenen Notizziel **Open note**.
   → Obsidian öffnet die verbundene Notiz.

[SCREENSHOT: Aktive Notiz und Relationships-Pane mit Link, Tag, Richtung und Quelle]

## Beziehungen in Claude Desktop abfragen

1. Bitte Claude, mit **second-brain** die direkten Beziehungen einer Notiz anzuzeigen.
   Verwende den Pfad relativ zum Vault, zum Beispiel `Projekte/Alpha.md`.
   → Claude nennt belegte Beziehungen mit Typ, Richtung, Ziel und Quelle.
2. Bitte Claude anschließend um die Details einer verbundenen Notiz.
   → Claude nennt den Notiznamen und die Anzahl eingehender und ausgehender Beziehungen.
3. Vergleiche die relativen Pfade mit der Ordnerstruktur in Obsidian.
   → Du erkennst, dass Claude denselben Vault verwendet.

[SCREENSHOT: Claude-Desktop-Antwort mit direkten Beziehungen und Knotendetails]

## Tipps und Grenzen

- Second Brain zeigt nur ausdrücklich vorhandene Links, Rückverweise, Tags und
  Eigenschaften. Es erfindet keine Verbindung aus dem Textinhalt.
- Ein Link ohne eindeutiges vorhandenes Ziel bleibt sichtbar, lässt sich aber nicht als
  vorhandene Notiz öffnen.
- Verwende in Claude keine vollständige Windows-Adresse für eine Notiz. `Alpha.md` oder
  `Ordner/Alpha.md` ist korrekt; der Pfad beginnt immer innerhalb des freigegebenen Vaults.
- Eine Aktualisierung verändert nur den lokalen Index, nicht deine Vault-Dateien.
- Eine visuelle Graphdarstellung ist in diesem Stand noch nicht enthalten.

## Fehlerbehebung

**Problem: Die Ansicht meldet, dass keine Beziehungen vorhanden sind.**
Prüfe, ob die aktive Notiz tatsächlich einen Link, Tag oder eine Eigenschaft enthält, und
wähle erneut **Refresh active note**. Nach einem Plugin-Update beende Obsidian vollständig
und starte es neu; `Strg+R` lädt Plugin und lokalen Dienst nicht in jeder Umgebung neu.

**Problem: Claude meldet `SIDECAR_OFFLINE`.**
Beende Claude Desktop vollständig und starte es neu. Bleibt der Fehler bestehen, prüfe in
der Second-Brain-Konfiguration, ob der Pfad des lokalen Dienstes zur Plugin-Installation im
aktuell verwendeten Vault gehört.

**Problem: Claude meldet `PATH_OUTSIDE_VAULT`.**
Prüfe zuerst, ob Claude und Obsidian denselben Vault verwenden. Gib anschließend nur den
relativen Notizpfad an, beispielsweise `Alpha.md` statt einer vollständigen Windows-Adresse.

**Problem: Eine neue oder geänderte Verbindung fehlt.**
Wähle in der Relationship-Ansicht **Refresh active note**. Falls das nicht hilft, öffne
**Second Brain MCP: Open setup** und wähle **Rebuild local index**.

---

## Übergabe: MW → ORCH

**Datum:** 2026-07-31
**Von:** Manual Writer (MW)
**An:** Orchestrator (ORCH)
**Nächster Befehl:** `/retro second-brain 3` (optional) oder `/refine second-brain 4`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| DOC-000004 | APPROVED | `docs/DOC-000004-beziehungen-erkunden.md` | Obsidian, Claude und Recovery |

### Kritische Informationen für Empfänger

Zwei Screenshot-Platzhalter müssen vor einer öffentlichen Veröffentlichung ersetzt werden.

### Offene Fragen (vererbt)

Keine.

### Nicht-Ziele

Keine visuelle Graphdarstellung, automatisch abgeleitete Beziehungen oder Änderungen an
Notizen.

### Empfehlungen

Bei zukünftiger deutscher Produktoberfläche die derzeit englischen sichtbaren Befehle im
Guide entsprechend aktualisieren.

---

*Erstellt von: MW-Agent | Datum: 2026-07-31 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-07-31 | Initiale Anleitung für direkte Beziehungen | MW |
