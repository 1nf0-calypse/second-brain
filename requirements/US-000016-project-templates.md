---
id: US-000016
title: Versionierte projektlokale Kompilierungsvorlagen
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-08-15
project: second-brain
based-on: REQ-000001 F-017, US-000006, US-000007
epic: Wissensmodell
priority: Must
sprint: 7
supersedes: —
superseded-by: —
---

# US-000016: Versionierte projektlokale Kompilierungsvorlagen

## User Story

**Als** Wissensarbeiter **möchte ich** Kompilierungsvorlagen projektlokal anlegen und ihre
verwendete Version sehen, **damit** meine Wissensentwürfe wiederholbar bleiben, ohne Quellen
zu verändern.

## Festlegungen

- Vorlagen liegen lokal unter `.second-brain/templates/`; sie sind Konfiguration, keine
  Vault-Quellen und werden nicht extern übertragen.
- Jede gespeicherte Version erhält stabile ID, Versionsnummer, Hash und Zeitstempel.
  Aktualisieren legt eine neue Version an; die alte wird nicht überschrieben.
- Erstellen und Aktualisieren verlangen eine sichtbare Einzelbestätigung. Löschen ist nicht
  Teil von Sprint 7.
- Eine Vorschau referenziert ID, Version und Hash. Fehlen oder Drift blockieren die
  Bestätigung.

## Akzeptanzkriterien

### Szenario 1: Speichern und Wiederverwenden
```text
GEGEBEN ich gebe Name und Vorlageninhalt ein
WENN ich die Speicher-Vorschau prüfe und bestätige
DANN entsteht eine lokale, versionierte Vorlage, die ich später auswählen kann
```

### Szenario 2: Neue Version ohne Überschreiben
```text
GEGEBEN eine Vorlage existiert
WENN ich ihren Inhalt ändere und bestätige
DANN entsteht eine neue Version mit eigener ID und Hash
UND die vorherige Version bleibt für bestehende Vorschauen lesbar
```

### Szenario 3: Provenienz und ungültige Vorlage
```text
GEGEBEN eine Kompilierung verwendet eine Vorlage
WENN ich Vorschau oder Historie öffne
DANN sehe ich Name, ID, Version und Hash
UND eine fehlende, veränderte oder ungültige Vorlage blockiert ohne Vault-Mutation
```

## Nicht-Ziele

Vorlagen löschen, teilen, synchronisieren oder extern speichern; Ausführung von
Vorlageninhalt als Code, Shell-Befehl oder Berechtigung.
