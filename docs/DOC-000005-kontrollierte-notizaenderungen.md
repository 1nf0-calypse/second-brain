---
id: DOC-000005
title: Kontrollierte Notizänderungen
version: 1.0
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-08-12
project: second-brain
based-on: US-000014, UX-000001, RV-000005
supersedes: —
superseded-by: —
ablage: projects/second-brain/docs/
---

# Notizänderungen sicher prüfen und zurücksetzen

## Was dieses Feature tut

Du kannst eine Änderung an genau einer Markdown-Notiz erst als Vorschau ansehen und sie nur
danach ausdrücklich bestätigen. Jede bestätigte Änderung kann einzeln wieder zurückgesetzt
werden, solange die Notiz seitdem nicht anderweitig geändert wurde.

## Voraussetzungen

- Öffne einen lokalen Obsidian-Vault auf dem Desktop.
- Verwende einen Pfad innerhalb dieses Vaults, zum Beispiel `Testnotiz.md` oder
  `Projekte/Testnotiz.md`.
- Für den Test empfiehlt sich eine unkritische Notiz.

Obsidian Sync muss dafür nicht eingerichtet sein. Der Ablauf arbeitet lokal in deinem
freigegebenen Vault.

## Eine Änderung prüfen und bestätigen

1. Öffne in Obsidian **Review and confirm a note change**.
   → Die Ansicht **Review note change** öffnet sich.

2. Gib unter **Vault-relative Markdown path** den Pfad der Notiz innerhalb deines Vaults ein,
   zum Beispiel `Testnotiz.md`. Gib unter **Complete proposed note content** den vollständigen
   gewünschten Inhalt ein.
   → Der Pfad ist keine vollständige Windows-Adresse; er beginnt direkt mit dem Namen eines
   Ordners oder einer Notiz im Vault.

3. Wähle **Prepare read-only preview**.
   → Du siehst die geplanten entfernten und hinzugefügten Zeilen. Die Originalnotiz bleibt
   unverändert.

4. Vergleiche die Vorschau mit dem gewünschten Ergebnis. Wähle erst dann
   **Confirm this exact change**.
   → Genau diese eine Notiz wird aktualisiert oder erstellt. Die Ansicht zeigt eine Bestätigung
   mit einer Audit-ID an.

[SCREENSHOT: Ansicht „Review note change“ mit vault-relativem Pfad, Textvorschau und aktivem Button „Confirm this exact change“.]

## Eine bestätigte Änderung zurücksetzen

1. Nachdem eine Änderung bestätigt wurde, wähle **Prepare rollback**.
   → Zuerst erscheint eine Rücksetzvorschau. Die Notiz ist noch unverändert.

2. Prüfe die Vorschau und wähle **Confirm this exact rollback**.
   → Der vorherige Inhalt wird wiederhergestellt.

[SCREENSHOT: Rücksetzvorschau mit aktivem Button „Confirm this exact rollback“.]

## Konflikte und Fehler beheben

### Die Bestätigung verlangt eine neue Vorschau

Die Notiz wurde nach der Vorschau geändert oder die Vorschau ist nicht mehr gültig. Die
neuere Version wird nie still überschrieben. Öffne eine frische Vorschau und prüfe sie erneut.

### `PATH_OUTSIDE_VAULT` wird angezeigt

Der Pfad ist leer, vollständig angegeben oder liegt außerhalb des geöffneten Vaults. Gib
stattdessen nur einen relativen Markdown-Pfad ein, zum Beispiel `Testnotiz.md`. Pfade wie
`C:\\Users\\...` sowie `..` werden aus Sicherheitsgründen blockiert.

### Die Notiz kann nicht ersetzt werden

Schließe Programme, die die Notiz möglicherweise exklusiv geöffnet haben, und erzeuge danach
eine neue Vorschau. Dein bisheriger Inhalt bleibt bei diesem Fehler erhalten.

## Grenzen dieses Stands

Du kannst keine Dateien löschen, verschieben oder umbenennen. Mehrere Notizen lassen sich
nicht gemeinsam bestätigen. Automatische Änderungen ohne deine Bestätigung sind ebenfalls
nicht enthalten.

---

## Übergabe: MW → ORCH

**Datum:** 2026-08-12
**Von:** Manual Writer (MW)
**An:** Orchestrator (ORCH)
**Nächster Befehl:** `/retro second-brain 4` (optional) oder `/refine second-brain 5`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| DOC-000005 | APPROVED | `docs/DOC-000005-kontrollierte-notizaenderungen.md` | Anleitung für Preview, Confirm, Konflikt und Rollback |
| RN-000004 | APPROVED | `docs/RN-000004-sprint-4.md` | Nutzerorientierte Sprint-4-Release-Notes |
| FAQ-000001@1.2 | APPROVED | `docs/FAQ-000001-suche-und-verbindung.md` | Mutation- und Sync-Fragen ergänzt |

### Kritische Informationen für Empfänger

- Zwei Screenshot-Platzhalter warten auf Produktaufnahmen.
- US-000014 ist vollständig dokumentiert.

### Offene Fragen

Keine.

### Nicht-Ziele

Keine Dokumentation für Löschen, Mehrdatei-Mutationen oder höhere Autonomie, weil diese
Funktionen nicht ausgeliefert wurden.

### Empfehlungen

Für den nächsten Sprint die nicht blockierende Verbesserung prüfen, den Pfad der zuvor
aktiven Notiz beim Öffnen der Ansicht vorzubelegen.

---

*Erstellt von: MW-Agent | Datum: 2026-08-12 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-08-12 | Initialer Guide für kontrollierte Ein-Datei-Mutationen | MW |
