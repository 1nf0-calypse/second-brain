---
id: US-000005
title: Lokale inkrementelle Indexierung
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-07-30
project: second-brain
based-on: REQ-000001 F-015
epic: Wissensmodell
priority: Must
sprint: —
supersedes: —
superseded-by: —
---

# US-000005: Lokale inkrementelle Indexierung

## User Story

**Als** Vault-Eigentümer  
**möchte ich** meinen bestehenden Vault lokal und inkrementell indexieren  
**damit** Suche und Graph aktuell bleiben, ohne Originaldateien oder unnötige Rechenkosten zu belasten.

## Akzeptanzkriterien

### Szenario 1: Initialindex
```text
GEGEBEN ich habe einen bestehenden Vault freigegeben
WENN die erste Indexierung startet
DANN entsteht ein lokaler Index und keine Originaldatei wird verändert oder migriert
```
### Szenario 2: Inkrementelles Update
```text
GEGEBEN seit dem letzten Lauf wurden nur einzelne Dateien geändert
WENN der Index aktualisiert wird
DANN werden die Änderungen berücksichtigt, ohne unveränderte Inhalte vollständig neu zu verarbeiten
```
### Szenario 3: Beschädigter Index
```text
GEGEBEN der lokale Index ist unvollständig oder beschädigt
WENN das Produkt dies erkennt
DANN bietet es einen sicheren Neuaufbau an und lässt den Vault unverändert
```

## Nicht-Ziele

- Externe dauerhafte Speicherung des Index.
- Garantie identischer Laufzeit für jede Vault-Größe.

## Abhängigkeiten

Blockiert durch US-000001.
