---
id: US-000012
title: Volltextsuche mit überprüfbaren Quellen
version: 1.0
status: REVIEW
author-agent: BA (Business Analyst)
date: 2026-07-31
project: second-brain
based-on: REQ-000001 F-004, F-005, F-006, F-007; US-000002
epic: Einstieg und Zugriff
priority: Must
sprint: 2
supersedes: —
superseded-by: —
---

# US-000012: Volltextsuche mit überprüfbaren Quellen

## User Story

**Als** Wissensarbeiter  
**möchte ich** meinen freigegebenen Vault lokal per Volltext durchsuchen und Treffer mit
Fundstelle öffnen  
**damit** ich relevante Inhalte prüfen kann, ohne einer unbelegten Antwort vertrauen zu
müssen.

## Akzeptanzkriterien

### Szenario 1: Volltextsuche mit Quellen

```text
GEGEBEN ein aktueller lokaler Index für den freigegebenen Vault ist verfügbar
WENN ich nach einem Begriff oder einer Phrase suche
DANN erhalte ich nach Relevanz sortierte Treffer mit relativem Vault-Pfad, Fundstelle,
     Textauszug und Match-Typ "full-text"
```

### Szenario 2: Lesender MCP-Zugriff

```text
GEGEBEN ein Suchtreffer liegt innerhalb des freigegebenen Vault-Roots
WENN ein berechtigter MCP-Client den Treffer oder die zugehörige Textnotiz liest
DANN liefert das System ausschließlich den angefragten lokalen Inhalt samt Quellenmetadaten
     und verändert keine Vault-Datei
```

### Szenario 3: Scope-Grenze

```text
GEGEBEN eine Such- oder Leseanfrage referenziert einen absoluten Pfad, Traversal oder
        symbolischen Link außerhalb des freigegebenen Vault-Kontexts
WENN die Anfrage ausgeführt wird
DANN wird sie mit einem dokumentierten Fehlercode abgelehnt und kein externer Inhalt
     offengelegt
```

### Szenario 4: Nicht extrahierbarer Anhang

```text
GEGEBEN ein Vault-Anhang ist nicht als Text indexierbar
WENN sein Dateiname oder sichere Metadaten zur Suche passen
DANN erscheint er als Metadatentreffer mit Extraktionsstatus "not extracted"
     und das System erfindet keinen Inhalt oder Textauszug
```

### Szenario 5: Sichtbar degradierte semantische Suche

```text
GEGEBEN kein freigegebener kompatibler lokaler Vector-Adapter ist installiert
WENN Suche über MCP oder Obsidian ausgeführt wird
DANN bleibt die Volltextsuche nutzbar und der Zustand lautet eindeutig
     "Semantic search is unavailable. Showing full-text results only."
```

## Nicht-Ziele

- Semantisches Ranking oder Auswahl eines konkreten Vector-Backends.
- OCR oder Volltextextraktion aus PDF-, Bild- und Binäranhängen.
- Knowledge-Graph-Exploration.
- Suche über Vault-Grenzen oder externe Suchdienste.

## Abhängigkeiten

- Erfüllt durch Sprint 1: US-000005 und US-000011.
- Verbindlich: ADR-000003, ADR-000004 und UX-000001.
- US-000002 bleibt als Umbrella-Story offen, bis semantische Suche und der vereinbarte
  Anhangsumfang separat geliefert sind.

## Definition of Ready

- [x] Mindestens drei testbare Akzeptanzszenarien.
- [x] UX-000001 deckt Search-States, Quellen, Fundstellen und Degradation ab.
- [x] Keine neue Technologieentscheidung erforderlich.
- [x] Scope- und Datenlokalitätsgrenzen sind durch CON-000001 und ADR-000004 geklärt.
- [x] Lieferumfang ist unabhängig test- und dokumentierbar.

---

## Übergabe: BA → Refinement

**Datum:** 2026-07-31  
**Von:** Business Analyst (BA)  
**An:** Business Analyst, Frontend Developer und Backend Developer (BA+FE+BE)  
**Nächster Befehl:** `/refine second-brain 2`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| US-000012 | REVIEW | `requirements/US-000012-full-text-search-and-citations.md` | Lieferbarer Sprint-2-Slice aus US-000002 |

### Kritische Informationen für Empfänger

Der Slice beansprucht nicht, US-000002 oder REQ F-005 vollständig abzuschließen.
Semantische Suche bleibt sichtbar degradiert, bis ein kompatibler lokaler Vector-Adapter
architektonisch und für Windows-Packaging freigegeben ist.

### Offene Fragen (vererbt)

Keine BLOCKER- oder MAJOR-Frage für diesen Slice.

### Nicht-Ziele

Semantische Suche, OCR, Graph und externe Suche.

---

*Erstellt von: BA-Agent | Datum: 2026-07-31 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-07-31 | Lieferbaren Volltext- und Quellen-Slice aus US-000002 abgeleitet | BA |
