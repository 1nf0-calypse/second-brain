---
id: DOC-000007
title: Autonomie begrenzen und pausieren
version: 1.0
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-08-15
project: second-brain
based-on: US-000003@1.1, SP-000007, RV-000007@1.5
supersedes: —
superseded-by: —
ablage: projects/second-brain/docs/
---

# Automatische Notizänderungen begrenzen und pausieren

## Was diese Funktion tut

Neben der normalen Einzelbestätigung kannst du zwei zeitlich begrenzte Automationsmodi
einschalten: **Human-on-the-loop** und **Human-out-of-the-loop**. In beiden Modi darf
Second Brain nur Markdown-Notizen erstellen oder aktualisieren.

Eine Aktivierung gilt höchstens eine Stunde und erlaubt insgesamt höchstens 60 erfolgreiche
automatische Änderungen. Löschen, Verschieben und Umbenennen bleiben immer gesperrt und
erfordern weiterhin einen separaten, bestätigten Vorgang.

## Voraussetzungen

- Öffne einen lokalen Obsidian-Vault auf dem Desktop.
- Öffne die Ansicht **Second Brain Note Change**.
- Verwende nur einen vault-relativen Markdown-Pfad, zum Beispiel `Projekte/Plan.md`.
- Prüfe den vorgeschlagenen Inhalt, bevor du einen automatischen Modus aktivierst.

## Einen Automationsmodus aktivieren

1. Öffne im Bereich **Automation mode** das Auswahlfeld **Automation mode**.
   → Wähle **Human-on-the-loop** oder **Human-out-of-the-loop**.

2. Lies den Hinweis direkt über der Auswahl.
   → Er nennt die erlaubten Aktionen, die Grenze von 60 Änderungen in einer Stunde und
   den Ausschluss von Löschen, Verschieben und Umbenennen.

3. Aktiviere die Checkbox **I understand this mode can change my vault without asking for
   every operation.**
   → Erst danach wird **Activate automation** verfügbar.

4. Wähle **Activate automation**.
   → Die Statusmeldung zeigt das verbleibende Budget und den Ablaufzeitpunkt. Der Button
   **Apply automatic create or update** wird eingeblendet.

[SCREENSHOT: Automation mode mit Auswahl, bestätigter Warnung, Status und aktivem Pause-Button.]

## Eine automatische Notiz erstellen oder aktualisieren

1. Gib unter **Vault-relative Markdown path** einen Pfad innerhalb des Vaults ein oder
   übernimm den bereits geladenen Pfad der aktiven Notiz.

2. Gib unter **Complete proposed note content** den vollständigen gewünschten Inhalt ein.

3. Wähle **Apply automatic create or update**.
   → Die Änderung wird nur ausgeführt, wenn der serverseitige Status aktiv ist und noch
   Budget vorhanden ist. Danach aktualisiert die Statusmeldung das Restbudget.

4. Prüfe bei Bedarf die Änderung in Obsidian. Jede erfolgreiche automatische Änderung wird
   mit Audit-ID protokolliert und kann einzeln über den normalen Rücksetzablauf geprüft
   und zurückgesetzt werden.

## Automatisierung sofort anhalten

1. Wähle **Pause automation**.
   → Neue automatische Änderungen werden sofort abgewiesen. Die Ansicht meldet, dass jede
   Änderung wieder eine Einzelbestätigung benötigt.

2. Für eine neue automatische Phase wähle den gewünschten Modus erneut, bestätige die
   Warnung und aktiviere ihn bewusst.
   → Eine Reaktivierung setzt weder die bereits verbrauchten Änderungen noch den
   Ablaufzeitpunkt des laufenden Stundenfensters zurück.

Eine Änderung, die vor dem Klick auf **Pause automation** bereits begonnen hat, darf noch
sauber beendet und auditiert werden. Die Pause verhindert zuverlässig alle danach neu
beanspruchten automatischen Änderungen.

## Wenn der Modus nicht mehr aktiv ist

### Das Budget ist aufgebraucht

Nach 60 erfolgreichen automatischen Änderungen pausiert Second Brain die Automatisierung.
Es gibt keine automatische Verlängerung und keine Umgehung über einen erneuten Klick auf
**Activate automation**. Prüfe weitere Änderungen als Einzelvorschau.

### Eine Stunde ist abgelaufen

Nach einer Stunde endet die Aktivierung. Erstelle für eine weitere Automationsphase eine
neue, bewusste Aktivierung mit Warnungsbestätigung.

### Die Statusmeldung ist nicht verfügbar

Second Brain fällt auf den sicheren Standard zurück: Erstelle eine **Prepare read-only
preview** und bestätige anschließend nur die geprüfte Einzeländerung.

## Sicherheitsgrenzen

- Automatisch zulässig sind ausschließlich Markdown-Erstellungen und -Aktualisierungen.
- Absolute Pfade, `..`, Pfade außerhalb des Vaults und nicht Markdown-basierte Ziele werden
  abgewiesen.
- Löschen, Verschieben, Umbenennen, Mehrdatei-Änderungen und Konflikt-Merges werden nicht
  automatisch ausgeführt.
- Bei einer konkurrierenden Änderung wird die Notiz nicht still überschrieben.

---

## Übergabe: MW → ORCH

**Datum:** 2026-08-15
**Von:** Manual Writer (MW)
**An:** Orchestrator (ORCH)
**Nächster Befehl:** `/retro second-brain 6` (optional) oder `/refine second-brain 7`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| DOC-000007 | APPROVED | `docs/DOC-000007-autonomie-budgets-und-pause.md` | Aktivierung, Budget, Pause, Recovery und Sicherheitsgrenzen |
| RN-000006 | APPROVED | `docs/RN-000006-sprint-6.md` | Nutzerorientierte Sprint-6-Release-Notes |
| FAQ-000001@1.3 | APPROVED | `docs/FAQ-000001-suche-und-verbindung.md` | Autonomiefragen ergänzt |

### Offene Fragen

Keine. Die in RV-000007 akzeptierten nativen QA-Restprüfungen sind keine Einschränkung der
Bedienanleitung.

---

*Erstellt von: MW-Agent | Datum: 2026-08-15 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-08-15 | Initiale Anleitung für aktivierbare Autonomie, 60/60-Budget und Pause | MW |
