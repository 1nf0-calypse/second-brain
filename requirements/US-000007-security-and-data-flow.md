---
id: US-000007
title: Injection-Schutz und Datenflusstransparenz
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-07-30
project: second-brain
based-on: REQ-000001 F-018, F-019, F-020, F-021
epic: Trust Boundary
priority: Must
sprint: —
supersedes: —
superseded-by: —
---

# US-000007: Injection-Schutz und Datenflusstransparenz

## User Story

**Als** Vault-Eigentümer  
**möchte ich** klare Berechtigungs- und Datenflussgrenzen  
**damit** manipulierte Inhalte keine unerlaubten Aktionen oder Offenlegungen bewirken.

## Akzeptanzkriterien

### Szenario 1: Prompt Injection
```text
GEGEBEN eine Vault-Datei enthält Anweisungen zur Scope-Erweiterung oder Systemausführung
WENN sie gelesen oder verarbeitet wird
DANN bleibt sie nicht vertrauenswürdiger Inhalt und löst weder Berechtigungserweiterung noch Systemaktion aus
```
### Szenario 2: Erster externer Datenfluss
```text
GEGEBEN Inhalte sollen erstmals an einen gewählten KI-Anbieter übertragen werden
WENN die Übertragung vorbereitet wird
DANN sehe ich Empfänger, Zweck, Datenkategorie und bekannte Aufbewahrungshinweise und muss bewusst bestätigen
```
### Szenario 3: Unzulässiges Werkzeug
```text
GEGEBEN ein Client fordert Shell-, Prozess-, Codeausführung oder Zugriff außerhalb des freigegebenen Kontexts
WENN die Anfrage den MCP-Endpunkt erreicht
DANN wird sie verweigert, sicher protokolliert und es werden keine fremden Daten offengelegt
```

## Nicht-Ziele

- Schutz vor kompromittiertem Betriebssystem.
- Umgehung der Bedingungen externer Anbieter.

## Abhängigkeiten

Querschnittliche Voraussetzung für alle lese- und schreibenden Stories.
