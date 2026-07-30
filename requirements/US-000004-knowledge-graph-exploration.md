---
id: US-000004
title: Knowledge Graph und Exploration
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-07-30
project: second-brain
based-on: REQ-000001 F-013, F-014
epic: Wissensmodell
priority: Must
sprint: —
supersedes: —
superseded-by: —
---

# US-000004: Knowledge Graph und Exploration

## User Story

**Als** Wissensarbeiter  
**möchte ich** Notizen und ihre Beziehungen als durchsuchbaren Graphen erkunden  
**damit** ich Zusammenhänge über Projekte hinweg erkenne.

## Akzeptanzkriterien

### Szenario 1: Graphaufbau
```text
GEGEBEN indexierte Notizen enthalten Wiki-Links, Tags, Properties oder erkannte Beziehungen
WENN der Graph aktualisiert wird
DANN erscheinen die Notizen und Beziehungen nachvollziehbar mit ihrer Herkunft
```
### Szenario 2: Exploration
```text
GEGEBEN ein Graph ist vorhanden
WENN ich über Graph, Wiki-Browser oder globale Suche einen Knoten auswähle
DANN kann ich zur zugrunde liegenden Notiz und ihren direkten Beziehungen navigieren
```
### Szenario 3: Veraltete Beziehung
```text
GEGEBEN eine Quelle für eine Beziehung wurde entfernt oder geändert
WENN der Index inkrementell aktualisiert wird
DANN wird die Beziehung entfernt oder aktualisiert, ohne andere Graphdaten zu beschädigen
```

## Nicht-Ziele

- Automatische Behauptung unbelegter Beziehungen als Fakten.
- Festlegung eines Visualisierungsframeworks.

## Abhängigkeiten

Blockiert durch US-000005; nutzt Suchzugriff aus US-000002.
