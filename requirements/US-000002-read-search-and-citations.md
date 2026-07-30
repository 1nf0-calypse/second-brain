---
id: US-000002
title: Vault lesen, durchsuchen und Quellen nachvollziehen
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-07-30
project: second-brain
based-on: REQ-000001 F-004, F-005, F-006, F-007
epic: Einstieg und Zugriff
priority: Must
sprint: —
supersedes: —
superseded-by: —
---

# US-000002: Vault lesen, durchsuchen und Quellen nachvollziehen

## User Story

**Als** Wissensarbeiter  
**möchte ich** meinen freigegebenen Vault per MCP lesen und semantisch durchsuchen  
**damit** ich relevante Antworten samt überprüfbarer Quellen erhalte.

## Akzeptanzkriterien

### Szenario 1: Kombinierte Suche
```text
GEGEBEN ein lokaler Index für den freigegebenen Vault ist verfügbar
WENN ich eine Volltext- oder semantische Suche ausführe
DANN erhalte ich relevante Notizen, Metadaten und Beziehungen mit Quelle und Fundstelle
```
### Szenario 2: Scope-Grenze
```text
GEGEBEN eine Anfrage referenziert Inhalte außerhalb des freigegebenen Vault-Kontexts
WENN der MCP-Client diese lesen will
DANN wird der Zugriff verweigert und es werden keine externen Inhalte offengelegt
```
### Szenario 3: Nicht extrahierbarer Anhang
```text
GEGEBEN ein gefundener Anhang ist beschädigt, verschlüsselt oder nicht unterstützt
WENN er in eine Suche fällt
DANN bleiben sichere Metadaten auffindbar und der fehlende extrahierte Inhalt wird eindeutig ausgewiesen
```

## Nicht-Ziele

- Garantie einer perfekten semantischen Rangfolge.
- OCR-Unterstützung für jeden Dateityp im ersten Release.

## Abhängigkeiten

Blockiert durch US-000001 und US-000005.
