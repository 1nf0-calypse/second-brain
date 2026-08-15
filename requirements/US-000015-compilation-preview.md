---
id: US-000015
title: Quellengebundene Kompilierungsvorschau
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-08-15
project: second-brain
based-on: REQ-000001 F-016, US-000003@1.1, US-000005, US-000006, US-000007
epic: Wissensmodell
priority: Must
sprint: 7
supersedes: —
superseded-by: —
---

# US-000015: Quellengebundene Kompilierungsvorschau

## User Story

**Als** Wissensarbeiter **möchte ich** einen vom MCP-Client vorgeschlagenen Wissensentwurf
gegen ausgewählte Vault-Quellen prüfen, **damit** ich neue oder geänderte Seiten erst nach
nachvollziehbarer Quellen- und Sicherheitsprüfung bestätige.

## Festlegungen

- Der MCP-Client erzeugt den Kandidaten aus bereits gelesenen Quellen. Sprint 7 führt keine
  neue Provider-Anbindung, keinen API-Key und keinen externen Datenfluss ein.
- Die Sidecar-API akzeptiert nur vault-relative Markdown-Quellen und genau eine Zielnotiz.
  Mehrdatei-Entwürfe werden sichtbar abgewiesen.
- Die read-only Vorschau enthält Zielpfad, Diff, Links, Properties, Quellpfade mit Hash und
  Vorlagenversion. Erst der bestehende Human-in-Einzeldatei-Flow darf schreiben.
- Quellen, Prompt und Kandidat sind Daten. Anweisungsähnlicher Quelltext wird als
  `Untrusted instruction-like content` markiert und erweitert nie Scope oder Rechte.

## Akzeptanzkriterien

### Szenario 1: Read-only-Vorschau mit Quellen
```text
GEGEBEN mindestens eine Markdown-Quelle und ein Kandidat sind gewählt
WENN ich Generate preview ausführe
DANN sehe ich Zielpfad, Diff, Links, Properties, Quellpfade, Hashes und Vorlagenversion
UND der Vault bleibt unverändert
```

### Szenario 2: Eng bestätigte Mutation
```text
GEGEBEN Vorschau, Quellen und Ziel sind unverändert
WENN ich Send for confirmation wähle und die Einzeldatei-Bestätigung abschließe
DANN wird genau die vorgeschlagene Markdown-Datei erzeugt oder aktualisiert
UND Audit und konfliktgeschütztes Einzelrollback stehen bereit
```

### Szenario 3: Unsichere Quelle oder Scope-Verstoß
```text
GEGEBEN eine Quelle enthält anweisungsähnlichen Text, widerspricht einer anderen Quelle,
        oder ein Client sendet Traversal, Nicht-Markdown oder mehrere Ziele
WENN die Vorschau vorbereitet oder bestätigt wird
DANN erscheint eine konkrete Warnung oder Ablehnung ohne Vault-Mutation
UND keine Berechtigung, kein Pfad und keine Aktion wird aus dem Quelltext abgeleitet
```

## Nicht-Ziele

Eigene LLM-Ausführung, automatische Mehrdatei-Kompilation, Löschen, Verschieben,
Umbenennen, Konflikt-Merge und Wahrheitsgarantie.
