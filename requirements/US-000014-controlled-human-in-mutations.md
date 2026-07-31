---
id: US-000014
title: Textnotizen kontrolliert vorschlagen, bestätigen und rücksetzen
version: 1.0
status: REVIEW
author-agent: BA (Business Analyst)
date: 2026-07-31
project: second-brain
based-on: REQ-000001 F-008, F-009, F-010, F-012; US-000003
epic: Sicheres Schreiben
priority: Must
sprint: 4
supersedes: —
superseded-by: —
---

# US-000014: Textnotizen kontrolliert vorschlagen, bestätigen und rücksetzen

## User Story

**Als** Vault-Eigentümer
**möchte ich** das Erstellen oder Aktualisieren einer Textnotiz vorab prüfen, ausdrücklich
bestätigen und einzeln rücksetzen können
**damit** ein MCP-Client nützliche Änderungen vorbereitet, ohne unbemerkten Datenverlust zu
verursachen.

## Akzeptanzkriterien

### Szenario 1: Änderung nur als Vorschau vorbereiten

```text
GEGEBEN eine vorhandene Markdown-Notiz oder ein neuer relativer Markdown-Pfad im
        freigegebenen Vault
WENN ein berechtigter Client einen neuen vollständigen Inhalt vorbereitet
DANN erhalte ich eine read-only Vorschau mit Aktion, relativem Pfad, Vorher-/Nachher-Hash
     und verständlichem Text-Diff und keine Vault-Datei wurde verändert
```

### Szenario 2: Explizit bestätigte Erstellung oder Aktualisierung

```text
GEGEBEN eine gültige, noch nicht abgelaufene Vorschau im Human-in-the-Loop-Modus
WENN ich genau diese Änderung ausdrücklich bestätige
DANN wird genau eine Markdown-Notiz atomar erstellt oder aktualisiert, anschließend neu
     indexiert und mit einer eindeutigen Audit-ID bestätigt
```

### Szenario 3: Konflikt verhindert stilles Überschreiben

```text
GEGEBEN die Zieldatei wurde nach Erzeugung der Vorschau verändert oder die Vorschau ist
        abgelaufen beziehungsweise bereits verwendet
WENN eine Bestätigung versucht wird
DANN wird nichts geschrieben, der Konflikt konkret erklärt und eine neue Vorschau verlangt
```

### Szenario 4: Einzelne Mutation sicher rücksetzen

```text
GEGEBEN eine durch Second Brain ausgeführte Mutation besitzt einen vollständigen Audit-Eintrag
WENN ich genau diese Mutation rücksetzen möchte und die Datei seitdem unverändert ist
DANN sehe ich zuerst eine Rollback-Vorschau und kann den vorherigen Zustand atomar
     wiederherstellen; neuere externe Änderungen werden niemals überschrieben
```

### Szenario 5: Scope und Inhalte erweitern keine Berechtigung

```text
GEGEBEN Pfad oder Notizinhalt fordert Löschen, Prozessausführung, Zugriff außerhalb des
        Vaults oder Umgehung der Bestätigung
WENN Vorschau, Bestätigung oder Rollback verarbeitet werden
DANN wird die unzulässige Aktion blockiert beziehungsweise der Inhalt als Daten behandelt
     und keine zusätzliche Fähigkeit ausgeführt
```

## Nicht-Ziele

- Löschen, Verschieben oder Umbenennen von Dateien.
- Human-on-the-Loop oder Human-out-of-the-Loop.
- Paketbestätigungen für mehrere Dateien.
- Automatische Konfliktauflösung oder Zusammenführung konkurrierender Änderungen.
- Binärdateien, Anhänge oder Pfade außerhalb des freigegebenen Vaults.
- Wissenskompilierung, Vorlagenverwaltung oder externe KI-Anbieter.

## Abhängigkeiten

- Erfüllt: US-000011, US-000012 und die lokale Indexbasis aus US-000005.
- Verbindlich: UX-000001 Journey 4, ADR-000001, ADR-000003, ADR-000004 und CON-000001.
- Leitet einen lieferbaren Human-in-the-Loop-Slice aus US-000003 ab; US-000003 bleibt offen.
- Die ungeklärten Budgets für Human-on/out betreffen diesen Sprint ausdrücklich nicht.

## Definition of Ready

- [x] Fünf testbare Akzeptanzszenarien einschließlich Konflikt, Rollback und Scope vorhanden.
- [x] UI-Vorschau, Bestätigung, Konflikt und Rollback sind in UX-000001 beschrieben.
- [x] Prepare/Confirm/Commit, Hashprüfung und Audit sind durch ADR-000004 vorgegeben.
- [x] Keine neue Technologie- oder Anbieterentscheidung erforderlich.
- [x] Löschung und höhere Autonomie sind klar ausgeschlossen.

---

## Übergabe: BA → Refinement

**Datum:** 2026-07-31
**Von:** Business Analyst (BA)
**An:** Business Analyst, Frontend Developer und Backend Developer (BA+FE+BE)
**Nächster Befehl:** `/implement all second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| US-000014 | REVIEW | `requirements/US-000014-controlled-human-in-mutations.md` | Sicherer Ein-Datei-Schreibslice |

### Kritische Informationen für Empfänger

Jeder Schreibpfad benötigt Vorschau, expiring confirmation token, erwarteten Hash,
atomaren Dateiersatz und Audit. Vault-Inhalt bleibt untrusted data.

### Offene Fragen (vererbt)

Keine BLOCKER- oder MAJOR-Frage für den Human-in-the-Loop-Slice.

### Nicht-Ziele

Löschen, Mehrdatei-Pakete, höhere Autonomie und Wissenskompilierung.

### Empfehlungen

Vertrag und Zustandsmaschine vor UI und Dateischreiblogik festlegen.

---

*Erstellt von: BA-Agent | Datum: 2026-07-31 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-07-31 | Human-in-the-Loop-Slice aus US-000003 abgeleitet | BA |
