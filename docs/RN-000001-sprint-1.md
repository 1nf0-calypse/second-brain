---
id: RN-000001
title: Release Notes — Sprint 1
version: 1.0
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-07-31
project: second-brain
based-on: RV-000002, US-000005, US-000011
supersedes: —
superseded-by: —
---

# Release Notes — Sprint 1

## Neu

- **Lokale Claude-Desktop-Verbindung** — Ein bestehender Obsidian-Vault kann ohne
  zusätzlichen KI-Anbieter-Schlüssel lokal mit Claude Desktop verbunden werden. Siehe
  [DOC-000001](DOC-000001-claude-desktop-setup.md).
- **Lokaler inkrementeller Index** — Der Index verarbeitet bei Aktualisierungen nur neue,
  geänderte oder entfernte Dateien. Siehe [DOC-000002](DOC-000002-local-index.md).
- **Sicherer Neuaufbau** — Ein beschädigter Index kann neu aufgebaut werden; bei einem Fehler
  bleibt der vorherige gültige Index erhalten.

## Geändert

- Das Plugin heißt **Second Brain MCP** und verwendet die eigenständige Plugin-ID
  `second-brain-mcp`. Das ursprüngliche Community Plugin bleibt davon unberührt.
- Das installierbare Paket enthält den benötigten lokalen Dienst vollständig.

## Behoben

- Die Installation liefert nun alle Dateien, die Obsidian zum Laden des Plugins benötigt.
- Der lokale Dienst wird über die installierte Node.js-Laufzeit korrekt gestartet.
- Nach einem Plugin-Neustart sind Setup- und Indexaktionen zuverlässig sichtbar.

## Bekannte Einschränkungen

- Sprint 1 unterstützt ausschließlich Windows, Obsidian Desktop und Claude Desktop.
- ChatGPT, Mistral, Suche, Wissensgraph und kontrollierte Änderungen am Vault sind noch nicht
  enthalten.
- Für sehr große Vaults ist das endgültige Timeout- und Abbruchverhalten noch als
  Folgearbeit erfasst.
- Die Dokumentation enthält Screenshot-Platzhalter, die vor öffentlicher Veröffentlichung
  mit finalen Produktaufnahmen ersetzt werden sollen.

---

## Übergabe: MW → ORCH (Sprint-Abschluss)

**Datum:** 2026-07-31
**Von:** Manual Writer (MW)
**An:** Orchestrator (ORCH)
**Nächster Befehl:** `/retro second-brain 1` (optional) oder `/refine second-brain 2`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| DOC-000001 | APPROVED | `docs/DOC-000001-claude-desktop-setup.md` | Setup und Recovery |
| DOC-000002 | APPROVED | `docs/DOC-000002-local-index.md` | Index-Update und Rebuild |
| GS-000001 | APPROVED | `docs/GS-000001.md` | Einstieg für neue Nutzer |
| RN-000001 | APPROVED | `docs/RN-000001-sprint-1.md` | Nutzerorientierte Release Notes |

### Kritische Informationen für Empfänger

- Fehlende Screenshots: 6 Platzhalter.
- Dokumentationsabdeckung: 2 von 2 Sprint-Stories.
- Terminologieentscheidung: D-000006.

### Offene Fragen (vererbt)

| # | Frage | Ursprung | Kritikalität | An wen |
|---|---|---|---|---|
| 1 | Verbindliches Timeout-/Abbruchverhalten für große Indexläufe | DEBT-000001 | MINOR | AR+BE |

### Nicht-Ziele (explizit ausgeschlossen)

Keine Dokumentation für ChatGPT, Mistral, Suche, Graph oder Mutationen, da diese Funktionen
in Sprint 1 nicht ausgeliefert wurden.

### Empfehlungen

Screenshots ergänzen; danach Release-Protokoll nach ADR-000005 durchführen.

---

*Erstellt von: MW-Agent | Datum: 2026-07-31 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-07-31 | Initiale, Gate-9-geprüfte Version | MW |
