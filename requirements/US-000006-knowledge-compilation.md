---
id: US-000006
title: Wissenskompilierung mit anpassbaren Vorlagen
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-07-30
project: second-brain
based-on: REQ-000001 F-016, F-017
epic: Wissensmodell
priority: Must
sprint: —
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
