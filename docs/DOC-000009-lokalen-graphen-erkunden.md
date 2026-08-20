---
id: DOC-000009
title: Lokalen Graphen erkunden
version: 1.0
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-08-20
project: second-brain
based-on: US-000004@1.0, US-000013@1.0, UX-000005@1.0, RV-000012@1.0
supersedes: —
superseded-by: —
---

# Lokalen Graphen erkunden

## Was dieses Feature tut

Der **Local graph** zeigt die direkten, belegbaren Links, Rückverweise, Tags und Eigenschaften
der aktuell geöffneten Notiz. Du kannst Beziehungen prüfen und vorhandene Zielnotizen öffnen,
ohne dass Second Brain deine Notizen verändert.

## Voraussetzungen

Öffne eine bereits indexierte Notiz in Obsidian. Für Beziehungen muss der lokale Dienst
erreichbar sein. Eine Notiz ohne Links, Tags, Eigenschaften oder Rückverweise kann trotzdem
geöffnet werden; sie zeigt dann einen erklärenden Leerzustand.

## Graph öffnen und eine Notiz erkunden

1. Öffne in Obsidian eine Notiz. → Sie wird zum Ausgangspunkt der Ansicht.
2. Wähle in der Befehlspalette **Second Brain MCP: Open local graph**. → Der Bereich **Local graph** öffnet sich und aktualisiert seine Daten.
3. Prüfe den Titel und die Liste unter **Direct relationships**. → Jeder Eintrag nennt Richtung, Beziehungstyp, Ziel und Quelle mit Zeile oder Eigenschaft.
4. Wähle bei einem vorhandenen Ziel **Open note**. → Die zugehörige Notiz öffnet sich in Obsidian.
5. Bei einem Eintrag **Unresolved link** wähle keine Zielaktion. → Das Ziel fehlt im Vault oder ist nicht eindeutig; die Beziehung bleibt nur als Hinweis sichtbar.

[SCREENSHOT: Local graph mit Fokusnotiz, Canvas, Relationship list und einem geöffneten Ziel]

## Beziehungen filtern und Quellen prüfen

1. Öffne **Relationship types**. → Checkboxen für Wiki links, Backlinks, Tags und Properties erscheinen.
2. Deaktiviere einen Typ. → Canvas und Liste zeigen dieselbe gefilterte Auswahl.
3. Lies bei einem Listeneintrag die Zeile **Source**. → Sie zeigt den relativen Notizpfad und, soweit vorhanden, die Fundzeile oder Eigenschaft.
4. Wähle **Clear filters**. → Alle direkten Beziehungen erscheinen wieder.

Der Canvas ist eine Übersicht. Bei vielen Beziehungen steht direkt darunter, wie viele davon
sichtbar gezeichnet sind, zum Beispiel „12 of 18“. Die vollständige Auswahl steht immer in
der Liste und bleibt per Tastatur nutzbar.

## Aktualisieren und sichere Zustände

- Wähle **Refresh graph**, nachdem du Links, Tags oder Eigenschaften geändert hast. Der lokale
  Graph wird aktualisiert; deine Vault-Dateien werden dabei nicht geschrieben.
- Erscheint **No indexed relationships are available for this note yet.**, hat die Notiz zurzeit
  keine direkten indexierten Beziehungen. Du kannst später erneut aktualisieren.
- Erscheint **No relationships match these filters.**, ändere die Filter oder wähle
  **Clear filters**.
- Erscheint **The local graph is unavailable while the local service is offline.**, starte den
  lokalen Dienst wieder und wähle **Refresh graph** erneut.
- Bei Anhängen zeigt Second Brain nur **Not extracted**. Es liest oder erfindet keinen
  Anhangstext für diese Ansicht.

## Tipps und Hinweise

- Die Liste ist die vollständige Alternative zum Canvas, besonders bei schmalem Fenster oder
  hoher Zoomstufe.
- Du kannst den Canvas über **Hide graph canvas** ausblenden und später wieder anzeigen.
- In der bestehenden Relationship-Ansicht führt **Show in graph** direkt zur passenden
  Fokusnotiz im Local graph.

## Häufige Fragen zu diesem Feature

**Erzeugt der Graph neue Beziehungen?**

Nein. Er zeigt nur bereits belegte lokale Strukturen aus deinem Vault. Es gibt keine
automatisch abgeleiteten oder semantischen Verbindungen.

**Warum sehe ich eine Beziehung, kann aber keine Notiz öffnen?**

Ein **Unresolved link** hat kein vorhandenes oder eindeutiges Ziel im Vault. Prüfe den Link in
der Quellnotiz.

Weitere Antworten stehen in [FAQ-000001](FAQ-000001-suche-und-verbindung.md).

---

*Erstellt von: MW-Agent | Datum: 2026-08-20 | Version: 1.0*

---

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-08-20 | Initiale Anleitung für den lokalen Graphen | MW |
