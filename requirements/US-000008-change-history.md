---
id: US-000008
title: Änderungsverlauf und Release-Sicht
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-07-30
project: second-brain
based-on: REQ-000001 F-022
epic: Betrieb und Ausbau
priority: Should
sprint: —
supersedes: —
superseded-by: —
---

# US-000008: Änderungsverlauf und Release-Sicht

## User Story

**Als** Vault-Eigentümer  
**möchte ich** technische Mutationsdetails und verständliche Zusammenfassungen einsehen  
**damit** ich Änderungen prüfen und Produktupdates nachvollziehen kann.

## Akzeptanzkriterien

### Szenario 1: Mutationshistorie
```text
GEGEBEN Mutationen wurden ausgeführt
WENN ich den Änderungsverlauf öffne
DANN sehe ich Zeitpunkt, Auslöser, Scope, Vorher/Nachher-Zusammenfassung und Rollback-Status
```
### Szenario 2: Release-Sicht
```text
GEGEBEN eine neue Produktversion ist installiert
WENN ich die Release-Sicht öffne
DANN sehe ich verständliche Änderungen, relevante Migrationen und Sicherheitsauswirkungen
```
### Szenario 3: Unvollständiger Eintrag
```text
GEGEBEN ein Vorgang wurde unterbrochen
WENN ich den Verlauf prüfe
DANN ist der unvollständige Zustand erkennbar und wird nicht als erfolgreiche Mutation dargestellt
```

## Nicht-Ziele

- Externe Telemetrie.
- Manipulierbares Löschen von Audit-Einträgen über MCP.

## Abhängigkeiten

Blockiert durch US-000003.
