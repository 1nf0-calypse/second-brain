---
id: US-000003
title: Kontrollierte Mutationen und Rollback
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-07-30
project: second-brain
based-on: REQ-000001 F-008, F-009, F-010, F-011, F-012
epic: Sicheres Schreiben
priority: Must
sprint: —
supersedes: —
superseded-by: —
---

# US-000003: Kontrollierte Mutationen und Rollback

## User Story

**Als** Vault-Eigentümer  
**möchte ich** KI-Änderungen je Autonomiestufe kontrollieren, prüfen und rücksetzen  
**damit** ich Automatisierung ohne unbemerkten Datenverlust nutzen kann.

## Akzeptanzkriterien

### Szenario 1: Human-in-the-Loop
```text
GEGEBEN Human-in-the-Loop ist aktiv
WENN ein Client eine Schreib- oder Löschoperation anfordert
DANN sehe ich Scope und Änderungsvorschau und die Mutation erfolgt erst nach expliziter Bestätigung
```
### Szenario 2: Höhere Autonomie
```text
GEGEBEN ich will Human-on- oder Human-out-of-the-Loop aktivieren
WENN ich den Modus wechsle
DANN sehe ich Risiken und Grenzen und der Wechsel erfolgt nur nach bewusster Bestätigung
```
### Szenario 3: Konflikt und Rollback
```text
GEGEBEN eine Mutation ist protokolliert oder die Zieldatei wurde seit der Vorschau verändert
WENN ich rollbacke beziehungsweise bestätigen will
DANN wird die einzelne Mutation sicher rückgesetzt oder bei Konflikt abgebrochen, ohne neuere Änderungen still zu überschreiben
```

## Nicht-Ziele

- Beliebige System- oder Codeausführung.
- Automatische Konfliktauflösung mit Datenverlust.

## Abhängigkeiten

Blockiert durch US-000001; Sicherheitsanforderungen aus US-000007 gelten querschnittlich.
