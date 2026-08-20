---
id: RN-000008
title: Release Notes — Sprint 8
version: 1.0
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-08-20
project: second-brain
based-on: RV-000012@1.0, US-000004@1.0, US-000013@1.0
supersedes: —
superseded-by: —
---

# Release Notes — Sprint 8

## Neu

- **Lokaler Graph** — Direkte Beziehungen einer geöffneten Notiz lassen sich jetzt als Übersicht und vollständige Liste erkunden. Siehe [Lokalen Graphen erkunden](DOC-000009-lokalen-graphen-erkunden.md).
- **Quellen direkt prüfen** — Jede Beziehung nennt ihren Quellpfad sowie die Fundzeile oder Eigenschaft.

## Geändert

- Die Relationship-Ansicht kann mit **Show in graph** zur passenden Notiz im Local graph wechseln.
- Bei vielen Beziehungen erklärt der Canvas, wie viele Verbindungen er zeigt. Die vollständige Auswahl bleibt in der Liste verfügbar.

## Bekannte Einschränkungen

- Der Graph zeigt nur direkte, belegte lokale Beziehungen. Er leitet keine neuen Zusammenhänge ab.
- Anhänge erscheinen gegebenenfalls als **Not extracted**; ihr Inhalt wird nicht für den Graphen gelesen.
- Ist der lokale Dienst offline, bleibt der Graph nicht verfügbar, bis du ihn wieder startest und aktualisierst.

---

*Erstellt von: MW-Agent | Datum: 2026-08-20 | Version: 1.0*

---

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-08-20 | Release Notes für den lokalen Graphen | MW |

---

## Übergabe: MW → ORCH

**Datum:** 2026-08-20  
**Von:** Manual Writer (MW)  
**An:** Orchestrator (ORCH)  
**Nächster Befehl:** `/retro second-brain 8` (optional) oder `/refine second-brain 9`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| DOC-000009 | APPROVED | `docs/DOC-000009-lokalen-graphen-erkunden.md` | Anleitung für den lokalen Graphen |
| RN-000008 | APPROVED | `docs/RN-000008-sprint-8.md` | Sprint-8-Release-Notes |
| FAQ-000001@1.4 | APPROVED | `docs/FAQ-000001-suche-und-verbindung.md` | Graph-FAQ ergänzt |

### Kritische Informationen für Empfänger

- Der Canvas ist nur eine Übersicht; die Liste ist immer die vollständige Alternative.
- Semantik und Anhangsextraktion sind nicht Teil dieses Releases.

### Offene Fragen (vererbt)

Keine.

### Nicht-Ziele (explizit ausgeschlossen)

Keine automatische Inferenz, Anhangsextraktion oder Vault-Mutation.
