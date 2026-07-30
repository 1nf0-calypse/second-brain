---
id: US-000009
title: campaignworld-Integrationsgrenze
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-07-30
project: second-brain
based-on: REQ-000001 F-023
epic: Betrieb und Ausbau
priority: Should
sprint: —
supersedes: —
superseded-by: —
---

# US-000009: campaignworld-Integrationsgrenze

## User Story

**Als** Nutzer beider Projekte  
**möchte ich** `campaignworld` später über eine klar getrennte MCP-Schnittstelle kombinieren können  
**damit** projektübergreifendes Wissen nutzbar wird, ohne das MVP fest zu koppeln.

## Akzeptanzkriterien

### Szenario 1: Explizite Verbindung
```text
GEGEBEN beide Systeme bieten kompatible, dokumentierte Schnittstellen
WENN ich die Integration bewusst konfiguriere
DANN werden nur explizit freigegebene Daten und Werkzeuge sichtbar
```
### Szenario 2: Nicht verfügbar
```text
GEGEBEN campaignworld ist nicht installiert oder erreichbar
WENN Second Brain startet
DANN funktionieren alle MVP-Kernfunktionen unabhängig weiter
```
### Szenario 3: Scope-Verstoß
```text
GEGEBEN campaignworld fordert Inhalte außerhalb des freigegebenen Kontexts
WENN die Anfrage verarbeitet wird
DANN wird sie verweigert und die Trust Boundary bleibt erhalten
```

## Nicht-Ziele

- Implementierung von `campaignworld`.
- Feste Kopplung im MVP.

## Abhängigkeiten

Benötigt US-000002 und US-000004; konkreter Vertrag erst nach separater Schnittstellendefinition.
