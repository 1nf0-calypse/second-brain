---
id: US-000001
title: Installation, Vault-Auswahl und MCP-Einrichtung
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-07-30
project: second-brain
based-on: REQ-000001 F-001, F-002, F-003
epic: Einstieg und Zugriff
priority: Must
sprint: —
supersedes: —
superseded-by: —
---

# US-000001: Installation, Vault-Auswahl und MCP-Einrichtung

## User Story

**Als** Obsidian-Nutzer  
**möchte ich** das Plugin installieren, einen bestehenden Vault auswählen und meinen KI-Client per MCP verbinden  
**damit** ich mein vorhandenes Wissen ohne Migration und ohne zusätzlichen Plugin-API-Key nutzen kann.

## Akzeptanzkriterien

### Szenario 1: Geführte Einrichtung
```text
GEGEBEN das Plugin wurde unter Windows manuell installiert
WENN ich die englische Ersteinrichtung öffne und einen bestehenden Vault auswähle
DANN erhalte ich prüfbare Schritte für mindestens einen unterstützten MCP-Client, ohne dass Originaldateien migriert werden
```
### Szenario 2: Kein zusätzlicher API-Key
```text
GEGEBEN ich nutze eine unterstützte, bereits authentifizierte Client-Verbindung
WENN ich MCP-first konfiguriere
DANN verlangt das Plugin keinen zusätzlichen LLM-API-Key und behauptet keine Umgehung der Client-Authentifizierung
```
### Szenario 3: Ungültiger Vault oder Client
```text
GEGEBEN der gewählte Pfad ist kein lesbarer Vault oder der Client ist inkompatibel
WENN die Einrichtung validiert wird
DANN bleibt der Bestand unverändert und ich erhalte eine konkrete, korrigierbare Fehlermeldung
```

## Nicht-Ziele

- Aufnahme in den Obsidian Community-Katalog.
- Direkte LLM-API-Nutzung.

## Abhängigkeiten

Keine fachliche Vorstory; Architekturvertrag für unterstützte Clients und Transporte erforderlich.
