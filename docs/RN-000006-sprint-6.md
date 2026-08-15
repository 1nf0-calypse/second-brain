---
id: RN-000006
title: Release Notes — Sprint 6
version: 1.0
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-08-15
project: second-brain
based-on: US-000003@1.1, RV-000007@1.5
supersedes: —
superseded-by: —
ablage: projects/second-brain/docs/
---

# Release Notes — Sprint 6

## Neu

- **Aktivierbare Automationsmodi** — Human-on-the-loop und Human-out-of-the-loop können
  bewusst aktiviert werden. Sie erstellen oder aktualisieren Markdown-Notizen ohne eine
  Bestätigung für jeden einzelnen Vorgang.
- **Feste Schutzgrenzen** — Eine Aktivierung erlaubt höchstens 60 erfolgreiche Änderungen
  innerhalb von maximal einer Stunde.
- **Sofortige Pause** — **Pause automation** sperrt neue automatische Änderungen direkt.
  Der sichere Einzelbestätigungsablauf bleibt jederzeit verfügbar.
- **Nachvollziehbarkeit** — Automatische Änderungen nutzen dieselben Audit-, Konflikt- und
  Einzelrollback-Schutzmechanismen wie bestätigte Einzeländerungen.

## Geändert

- Die Ansicht **Second Brain Note Change** zeigt jetzt Auswahl, Risikobestätigung, Status,
  Restbudget und Pause für die Automatisierung.
- Reaktivieren einer pausierten Automatisierung setzt das laufende Budgetfenster nicht
  zurück und verlängert die Stunde nicht still.

## Sicherheitsgrenzen

- Löschen, Verschieben und Umbenennen können nicht automatisch ausgeführt werden.
- Mehrdatei-Änderungen, Binärdateien, externe Pfade und Konflikt-Merges bleiben
  ausgeschlossen.
- Eine bereits gestartete Änderung darf nach einer Pause noch kontrolliert fertiglaufen und
  wird auditiert; nach der Pause können keine neuen automatischen Änderungen starten.

## Bekannte Einschränkungen

- Die Automatisierung ist auf lokale Markdown-Notizen im geöffneten Vault begrenzt.
- Für jede neue Stunde oder nach einem aufgebrauchten Budget ist eine neue bewusste
  Aktivierung erforderlich.

Siehe [Anleitung](DOC-000007-autonomie-budgets-und-pause.md).

---

*Erstellt von: MW-Agent | Datum: 2026-08-15 | Version: 1.0 | Ablage: `projects/second-brain/docs/`*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-08-15 | Initiale Release Notes für Sprint 6 | MW |
