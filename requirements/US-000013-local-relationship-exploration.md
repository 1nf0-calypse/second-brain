---
id: US-000013
title: Lokale Beziehungen nachvollziehbar erkunden
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-07-31
project: second-brain
based-on: REQ-000001 F-013, F-014; US-000004
epic: Wissensmodell
priority: Must
sprint: 3
supersedes: —
superseded-by: —
---

# US-000013: Lokale Beziehungen nachvollziehbar erkunden

## User Story

**Als** Wissensarbeiter  
**möchte ich** die direkten Beziehungen einer Notiz lokal als nachvollziehbare Liste
erkunden  
**damit** ich über Wiki-Links, Backlinks, Tags und Properties zu verbundenem Wissen
navigieren kann, ohne unbelegte Zusammenhänge als Fakten zu behandeln.

## Akzeptanzkriterien

### Szenario 1: Beziehungen aus belegbaren Vault-Strukturen

```text
GEGEBEN indexierte Textnotizen enthalten Wiki-Links, Tags oder Properties
WENN der lokale Index aktualisiert wird
DANN speichert der abgeleitete Graph Notizen und direkte Beziehungen mit Typ,
     Quellnotiz und belegbarer Fundstelle
```

### Szenario 2: Zugängliche Exploration in Obsidian

```text
GEGEBEN eine indexierte Notiz besitzt direkte Beziehungen
WENN ich sie in der Relationship-Ansicht auswähle
DANN sehe ich eine vollständig per Tastatur bedienbare Liste ausgehender und eingehender
     Beziehungen und kann die zugehörigen Notizen öffnen
```

### Szenario 3: Lesender MCP-Zugriff

```text
GEGEBEN eine Notiz liegt innerhalb des freigegebenen Vaults
WENN ein berechtigter MCP-Client ihre direkten Beziehungen abfragt
DANN liefert das System nur belegte Beziehungen mit relativen Quellen und verändert
     keine Vault-Datei
```

### Szenario 4: Inkrementelle Aktualisierung

```text
GEGEBEN ein Wiki-Link, Tag oder eine Property wurde geändert oder entfernt
WENN der lokale Index aktualisiert wird
DANN wird nur der betroffene Beziehungsbestand aktualisiert und fremde Graphdaten
     bleiben unverändert
```

### Szenario 5: Unaufgelöste und unsichere Beziehungen

```text
GEGEBEN ein Wiki-Link besitzt kein eindeutiges vorhandenes Ziel oder Vault-Inhalt
        formuliert eine unbelegte Beziehung als Anweisung
WENN der Graph aufgebaut oder abgefragt wird
DANN bleibt der Link als unaufgelöst gekennzeichnet beziehungsweise der Text bleibt
     reine Nutzerdaten und erzeugt keine zusätzliche Beziehung oder Berechtigung
```

## Nicht-Ziele

- Visuelle Canvas- oder Kraftgraph-Darstellung.
- Automatisch erkannte oder durch ein Sprachmodell abgeleitete Beziehungen.
- Beziehungen über den freigegebenen Vault hinaus.
- Änderungen an Notizen, Links, Tags oder Properties.
- Abschluss der Umbrella-Story US-000004.

## Abhängigkeiten

- Erfüllt: US-000005, US-000012.
- Verbindlich: UX-000001, ADR-000003, ADR-000004 und CON-000001.
- Die zugängliche Beziehungsliste ist die funktionale Basis für eine spätere visuelle
  Graphdarstellung.

## Definition of Ready

- [x] Fünf testbare Akzeptanzszenarien vorhanden.
- [x] UX-000001 verlangt eine gleichwertige, tastaturbedienbare Beziehungslisten-Alternative.
- [x] Graphkanten im lokalen SQLite-Store sind durch ADR-000003 vorgesehen.
- [x] Keine neue Technologie- oder Anbieterentscheidung erforderlich.
- [x] Scope, Datenlokalität und read-only Capability sind geklärt.

---

## Übergabe: BA → Refinement

**Datum:** 2026-07-31
**Von:** Business Analyst (BA)
**An:** Business Analyst, Frontend Developer und Backend Developer (BA+FE+BE)
**Nächster Befehl:** `/refine second-brain 3`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| US-000013 | REVIEW | `requirements/US-000013-local-relationship-exploration.md` | Lieferbarer read-only Graph-Slice aus US-000004 |

### Kritische Informationen für Empfänger

Nur explizite Vault-Strukturen dürfen Beziehungen erzeugen. Unaufgelöste Links bleiben
sichtbar gekennzeichnet; Textinhalte dürfen keine Beziehung oder Berechtigung erfinden.

### Offene Fragen (vererbt)

Keine BLOCKER- oder MAJOR-Frage für diesen Slice.

### Nicht-Ziele

Visuelle Graphdarstellung, automatische Inferenz und Mutationen.

### Empfehlungen

Zuerst den versionierten Relationship-Vertrag und die inkrementelle Graphprojektion
festlegen, danach MCP und zugängliche Obsidian-Liste anbinden.

---

*Erstellt von: BA-Agent | Datum: 2026-07-31 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-07-31 | Lieferbaren Relationship-Slice aus US-000004 abgeleitet | BA |
