---
id: RN-000003
title: Release Notes — Sprint 3
version: 1.0
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-07-31
project: second-brain
based-on: RV-000004, US-000013
supersedes: —
superseded-by: —
---

# Release Notes — Sprint 3

## Neu

- **Direkte Beziehungen in Obsidian** — Zeige Links, Rückverweise, Tags und Eigenschaften
  der aktiven Notiz als nachvollziehbare Liste an. Siehe
  [DOC-000004](DOC-000004-beziehungen-erkunden.md).
- **Beziehungen in Claude Desktop** — Frage direkte Beziehungen und die Anzahl ein- und
  ausgehender Verbindungen einer Notiz über den lokalen Server ab.
- **Sichere Navigation** — Öffne vorhandene verknüpfte Notizen; unaufgelöste Ziele bleiben
  erkennbar und führen nicht zu einer erfundenen Notiz.

## Geändert

- Die Relationship-Ansicht aktualisiert vor jeder Abfrage automatisch den lokalen Index.
- Bereits indexierte Vaults ergänzen die neuen Beziehungsdaten beim ersten Lauf
  automatisch, ohne Originalnotizen zu verändern.
- Die FAQ erklärt nun den gemeinsamen Vault-Pfad, relative Notizpfade und den Neustart des
  lokalen Dienstes.

## Behoben

- Ein vorhandener Index bleibt nach einem Upgrade nicht mehr ohne Beziehungsdaten.
- Die Relationship-Ansicht meldet einen erreichbaren lokalen Dienst nicht mehr irrtümlich
  als offline, nur weil Beziehungsdaten nachgetragen werden müssen.

## Bekannte Einschränkungen

- Das Plugin ist noch nicht im öffentlichen Obsidian-Community-Katalog verfügbar.
- Eine visuelle Graphdarstellung und automatisch aus Text abgeleitete Beziehungen sind
  noch nicht enthalten.
- Nach Plugin-Updates ist ein vollständiger Obsidian-Neustart erforderlich; `Strg+R` ist
  nicht in jeder Umgebung ausreichend.
- Die Dokumentation enthält Screenshot-Platzhalter für spätere finale Produktaufnahmen.

---

## Übergabe: MW → ORCH (Sprint-Abschluss)

**Datum:** 2026-07-31
**Von:** Manual Writer (MW)
**An:** Orchestrator (ORCH)
**Nächster Befehl:** `/retro second-brain 3` (optional) oder `/refine second-brain 4`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| DOC-000004 | APPROVED | `docs/DOC-000004-beziehungen-erkunden.md` | Relationship-Guide und Recovery |
| FAQ-000001@1.1 | APPROVED | `docs/FAQ-000001-suche-und-verbindung.md` | Beziehungsfragen ergänzt |
| RN-000003 | APPROVED | `docs/RN-000003-sprint-3.md` | Nutzerorientierte Sprint-3-Änderungen |

### Kritische Informationen für Empfänger

- Fehlende neue Screenshots: zwei Platzhalter.
- Dokumentationsabdeckung: eine von einer Sprint-3-Story.
- Terminologieentscheidung: D-000008.

### Offene Fragen (vererbt)

Keine.

### Nicht-Ziele

Keine Dokumentation für visuelle Graphen, KI-Inferenz, Mutationen, Android oder
vault-übergreifende Beziehungen.

### Empfehlungen

Vor einer öffentlichen Veröffentlichung Screenshot-Platzhalter ersetzen und die Anleitung
an den dann gültigen Installationskanal anpassen.

---

*Erstellt von: MW-Agent | Datum: 2026-07-31 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-07-31 | Initiale Release Notes für Sprint 3 | MW |
