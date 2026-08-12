---
id: RN-000004
title: Release Notes — Sprint 4
version: 1.0
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-08-12
project: second-brain
based-on: RV-000005, US-000014
supersedes: —
superseded-by: —
ablage: projects/second-brain/docs/
---

# Release Notes — Sprint 4

## Neu

- **Kontrollierte Notizänderungen** — Du kannst eine Markdown-Notiz als Vorschau prüfen und
  nur anschließend ausdrücklich bestätigen. Siehe [Anleitung](DOC-000005-kontrollierte-notizaenderungen.md).
- **Sicherer Einzel-Rollback** — Eine bestätigte Änderung kann nach einer eigenen Vorschau
  wieder zurückgesetzt werden, sofern die Notiz seitdem unverändert ist.

## Geändert

- **Schutz vor Überschreiben** — Änderungen zwischen Vorschau und Bestätigung führen zu einer
  Konfliktmeldung. Deine neuere Notizversion bleibt erhalten.
- **Lokale Nachvollziehbarkeit** — Nach jeder bestätigten Änderung zeigt Second Brain eine
  Audit-ID an, über die der Rücksetzvorgang vorbereitet wird.

## Behoben

- Wenn Windows eine Notiz sperrt, erklärt Second Brain den Schreibfehler nun korrekt, statt
  eine nicht vorhandene Verbindungsstörung zu melden.
- Nicht bestätigte Vorschauen belegen nur noch begrenzt lokalen Speicher.

## Bekannte Einschränkungen

- Pfade werden derzeit manuell als vault-relative Markdown-Pfade eingegeben, etwa
  `Testnotiz.md`.
- Löschen, Verschieben, Umbenennen, Mehrdatei-Änderungen und automatische Änderungen ohne
  Bestätigung sind nicht enthalten.
- Obsidian Sync ist unabhängig von dieser lokalen Funktion; ein Status wie „Sync:
  Uninitialized“ verhindert die Nutzung nicht.

---

*Erstellt von: MW-Agent | Datum: 2026-08-12 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-08-12 | Initiale Release Notes für Sprint 4 | MW |

