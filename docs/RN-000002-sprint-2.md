---
id: RN-000002
title: Release Notes — Sprint 2
version: 1.0
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-07-31
project: second-brain
based-on: RV-000003, US-000012
supersedes: —
superseded-by: —
---

# Release Notes — Sprint 2

## Neu

- **Lokale Volltextsuche** — Durchsuche den freigegebenen Vault direkt in Obsidian oder
  Claude Desktop. Siehe
  [DOC-000003](DOC-000003-volltextsuche-und-quellen.md).
- **Überprüfbare Quellen** — Texttreffer zeigen Notizpfad, Fundzeile und Auszug und lassen
  sich in Obsidian an der Fundstelle öffnen.
- **Sichere Anhangstreffer** — Nicht als Text lesbare Anhänge werden als solche
  gekennzeichnet; Second Brain erfindet keinen Inhalt.
- **FAQ für Suche und Verbindung** — Häufige Fragen aus der lokalen Einrichtung und
  Nutzerabnahme sind in [FAQ-000001](FAQ-000001-suche-und-verbindung.md) beantwortet.

## Geändert

- Die Suche weist sichtbar darauf hin, wenn nur Volltext- und noch keine semantische Suche
  verfügbar ist.
- Setup, Suche und Indexaufbau verwenden passende Zeitlimits und verständliche
  Abbruchmeldungen.
- Die lokale Dienstprüfung beschreibt nur noch den tatsächlich geprüften lokalen Zustand.

## Behoben

- Ein blockierter Zugriff außerhalb des Vaults wird jetzt eindeutig als unzulässiger
  Pfadzugriff gemeldet und nicht mehr als allgemeiner Dienstfehler.
- Abgebrochene Suchvorgänge lassen sich sauber beenden, ohne Vault-Dateien zu verändern.

## Bekannte Einschränkungen

- Das Plugin ist noch nicht im öffentlichen Obsidian-Community-Katalog verfügbar und muss
  aus dem bereitgestellten Paket installiert werden.
- Semantische Suche, OCR und Textextraktion aus Bildern oder PDF-Dateien sind noch nicht
  enthalten.
- Die Dokumentation enthält Screenshot-Platzhalter, die vor einer öffentlichen
  Veröffentlichung durch finale Produktaufnahmen ersetzt werden sollen.

---

## Übergabe: MW → ORCH (Sprint-Abschluss)

**Datum:** 2026-07-31
**Von:** Manual Writer (MW)
**An:** Orchestrator (ORCH)
**Nächster Befehl:** `/retro second-brain 2` (optional) oder `/refine second-brain 3`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| DOC-000003 | APPROVED | `docs/DOC-000003-volltextsuche-und-quellen.md` | Volltextsuche, Quellen und Recovery |
| FAQ-000001 | APPROVED | `docs/FAQ-000001-suche-und-verbindung.md` | Tatsächliche Einrichtungs- und Suchfragen |
| RN-000002 | APPROVED | `docs/RN-000002-sprint-2.md` | Nutzerorientierte Sprint-2-Änderungen |
| DOC-000001 | APPROVED v1.1 | `docs/DOC-000001-claude-desktop-setup.md` | Recovery für veralteten Serverpfad ergänzt |

### Kritische Informationen für Empfänger

- Fehlende neue Screenshots: 2 Platzhalter.
- Dokumentationsabdeckung: 1 von 1 Sprint-2-Story.
- Terminologieentscheidung: D-000007.

### Offene Fragen (vererbt)

Keine.

### Nicht-Ziele (explizit ausgeschlossen)

Keine Dokumentation für semantische Suche, OCR, Graph, Mutationen oder eine öffentliche
Katalogveröffentlichung.

### Empfehlungen

Vor einer öffentlichen Veröffentlichung sämtliche Screenshot-Platzhalter ersetzen und die
Installationsanleitung an den dann gültigen Vertriebskanal anpassen.

---

*Erstellt von: MW-Agent | Datum: 2026-07-31 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-07-31 | Initiale Release Notes für Sprint 2 | MW |
