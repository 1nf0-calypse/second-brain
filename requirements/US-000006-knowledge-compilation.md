---
id: US-000006
title: Wissenskompilierung mit anpassbaren Vorlagen
version: 1.2
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-08-15
project: second-brain
based-on: REQ-000001 F-016, F-017
epic: Wissensmodell
priority: Must
sprint: 7
supersedes: —
superseded-by: —
---

# US-000006: Wissenskompilierung mit anpassbaren Vorlagen

## User Story

**Als** Wissensarbeiter  
**möchte ich** unstrukturierte Notizen mit eigenen Prompts und Vorlagen in verlinktes Wissen überführen  
**damit** wiederverwendbare Wissensseiten entstehen, ohne die Quellen zu verlieren.

## Akzeptanzkriterien

### Szenario 1: Vorschau
```text
GEGEBEN Quellen, Prompt und Vorlage sind ausgewählt
WENN ich eine Kompilierung anfordere
DANN sehe ich neue oder geänderte Seiten, Links und Properties vor der Mutation als Vorschau
```
### Szenario 2: Anpassbare Vorlage
```text
GEGEBEN ich speichere eine projektbezogene Vorlage
WENN ich sie erneut verwende
DANN wird die bestätigte Version angewandt und ihre Herkunft im Änderungsprotokoll referenziert
```
### Szenario 3: Widersprüchliche oder injizierte Quelle
```text
GEGEBEN Quellen widersprechen sich oder enthalten Anweisungen an das System
WENN die Kompilierung läuft
DANN werden Unsicherheit und Quellen kenntlich gemacht und die Anweisungen erweitern keine Berechtigung
```

## Nicht-Ziele

- Automatische Wahrheitsgarantie erzeugter Inhalte.
- Verdeckte Änderung von Quellen.

## Abhängigkeiten

Blockiert durch US-000003 und US-000005.

## Sprint-7-Schnitt

US-000017 liefert die MCP-first eingereichte, persistente Prüfung, US-000016 die versionierten lokalen
Vorlagen. Der MCP-Client liefert den fachlichen Kandidaten; Second Brain führt keinen neuen
Provider-Aufruf oder LLM-Schlüssel ein und kontrolliert Quellen, Vorlage, Vorschau und die
nachfolgende Mutation lokal.

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.2 | 2026-08-15 | Veraltete US-000015-Referenz auf den freigegebenen MCP-first-Slice US-000017 korrigiert | BA+FE+BE |
| 1.1 | 2026-08-15 | Sprint-7-Schnitt und lokale Kontrollgrenze präzisiert | BA+FE+BE |
| 1.0 | 2026-07-30 | Initiale Umbrella-Story | BA |
