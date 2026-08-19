---
id: US-000017
title: MCP-first Kompilierung mit ausstehender Bestätigung
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-08-15
project: second-brain
based-on: REQ-000002 F-025–F-028, F-031–F-032; RV-000008 K-001, K-002, UX-001
epic: Wissensmodell
priority: Must
sprint: 7-recovery
supersedes: US-000015
superseded-by: —
---

# US-000017: MCP-first Kompilierung mit ausstehender Bestätigung

## User Story

**Als** Wissensarbeiter **möchte ich**, dass ein von meinem MCP-Client vorbereiteter
Wissensentwurf automatisch als ausstehende Prüfung in Obsidian erscheint, **damit** ich nur
noch den vollständigen Vorschlag kontrollieren und bewusst bestätigen oder verwerfen muss.

## Fachliche Festlegungen

- Der MCP-Client übermittelt Vorschlags-ID, Client- und Vault-Bezug, mindestens eine
  vault-relative Markdown-Quelle mit Hash, genau ein Markdown-Ziel, den vollständigen
  Kandidaten und optional eine gespeicherte Vorlagenreferenz.
- Der Vorschlag erhält serverseitig den Zustand `Pending Confirmation` und bleibt bis zur
  Entscheidung oder transparent geregelten Ablaufzeit neustartfest verfügbar.
- Die Obsidian-UI zeigt eine Liste ausstehender Vorschläge und öffnet den gewählten Eintrag
  als reine Prüfoberfläche. `Vault-relative Markdown path` und `Complete proposed note
  content` sind im MCP-first-Ablauf keine Benutzereingaben.
- Die Vorschau trennt Quellen und Ziel visuell und zeigt Client, Vault, Diff, Links,
  Properties, Quell-Hashes, Template-ID/-Version/-Hash sowie konkrete Warnungen.
- Bestätigen oder Verwerfen verbraucht die Autorisierung genau einmal. Vor dem Schreiben
  werden Ziel, Quellen und Vorlage erneut gegen die angezeigten Hashes geprüft.
- Es wird höchstens die eine angezeigte Markdown-Zielnotiz verändert. Der gesamte
  Lebenszyklus wird lokal und wahrheitsgetreu protokolliert.

## Akzeptanzkriterien

### Szenario 1: MCP-Einreichung erscheint ohne erneute Eingabe

```text
GEGEBEN ein autorisierter MCP-Client hat Quellen gelesen und einen vollständigen Entwurf erstellt
WENN der Client den Kompilierungsvorschlag einreicht
DANN wird ein eindeutiger Eintrag mit Status Pending Confirmation angelegt
UND der Eintrag ist in Obsidian zur Prüfung sichtbar
UND ich muss weder einen Vault-Pfad noch den vollständigen Markdown-Inhalt erneut eingeben
UND der Vault-Inhalt bleibt unverändert
```

### Szenario 2: Vollständige und verständliche Prüfung

```text
GEGEBEN ein unveränderter Vorschlag wartet auf Bestätigung
WENN ich ihn in Obsidian öffne
DANN sehe ich Client und Vault, die getrennten Quellen und das eine Ziel
UND ich sehe Diff, Links, Properties, Quell-Hashes und gegebenenfalls Vorlagenprovenienz
UND anweisungsähnlicher Inhalt, Widersprüche und andere Risiken werden konkret benannt
UND es gibt keine leeren technischen Pflichtfelder
```

### Szenario 3: Exakte Einzeldatei-Bestätigung

```text
GEGEBEN Vorschlag, Quellen, Ziel und Vorlage entsprechen der angezeigten Prüfung
WENN ich genau diesen Vorschlag bestätige
DANN wird ausschließlich die angezeigte Markdown-Zielnotiz atomar erstellt oder geändert
UND die Autorisierung kann kein zweites Mal verwendet werden
UND Historie und Einzelrollback beziehen sich auf genau diese Änderung
```

### Szenario 4: Verwerfen ohne Mutation

```text
GEGEBEN ein Vorschlag wartet auf meine Entscheidung
WENN ich ihn verwerfe
DANN wird keine Vault-Datei verändert
UND der Vorschlag kann nicht nachträglich mit derselben Autorisierung bestätigt werden
UND die Historie weist die Verwerfung als solche aus
```

### Szenario 5: Drift, Ablauf oder Wiederholungsversuch

```text
GEGEBEN Quelle, Ziel oder Vorlage hat sich geändert, die Frist ist abgelaufen
        oder die Autorisierung wurde bereits verbraucht
WENN eine Bestätigung versucht wird
DANN findet keine Vault-Mutation statt
UND ich sehe den konkreten Konflikt statt einer generischen INVALID_QUERY-Meldung
UND für inhaltliche Drift muss ein neuer Vorschlag eingereicht werden
```

### Szenario 6: Neustart, Trennung und Kapazitätsgrenze

```text
GEGEBEN offene Vorschläge existieren und Plugin oder Verbindung wird neu gestartet
WENN Obsidian die Verbindung wiederherstellt
DANN sind nicht abgelaufene Vorschläge weiterhin eindeutig prüfbar
UND erledigte technische Vorschauartefakte werden nach dokumentierten Grenzen bereinigt
UND offene Bestätigungen verschwinden nicht still durch eine Bereinigung
```

### Szenario 7: Ungültige MCP-Einreichung

```text
GEGEBEN der Client sendet keine Quelle, ein ungültiges Ziel, Traversal, Nicht-Markdown
        oder mehrere Ziele
WENN die Einreichung validiert wird
DANN wird kein ausstehender Vorschlag und keine Vault-Mutation erzeugt
UND der Client erhält einen feldbezogenen, handlungsorientierten Fehler
```

## Abhängigkeiten

- US-000003@1.1: Human-in-the-Loop, Audit, Konfliktschutz und Rollback.
- US-000005: aktuelle lokale Quell- und Zielzustände.
- US-000007: Vault-Scope, Least Privilege und Injection-Schutz.
- US-000016: auswählbare, persistente Vorlagen und vollständige Provenienz.
- US-000008@1.1: korrekte Erfolgs-, Fehler-, Abbruch- und Rollback-Zustände.

## Nicht-Ziele

Eigene LLM-Ausführung, neue Provider-Anbindung, automatische Bestätigung, Mehrdatei-
Mutation, Löschen, Verschieben, Umbenennen, Konflikt-Merge und Wahrheitsgarantie.

## Definition of Done

- [x] Mindestens drei Given/When/Then-Szenarien einschließlich Fehlerfällen vorhanden.
- [x] MCP-first-Eingabe und Obsidian-Prüfung sind eindeutig getrennt.
- [x] Manuelle Pfad- und Volltexteingabe ist für den Standardweg ausgeschlossen.
- [x] Provenienz, Neustart, Drift, Einmaligkeit und Kapazitätsgrenzen sind abgedeckt.
- [x] Abhängigkeiten zu Vorlagen und Historie sind explizit.
- [x] Freigabe durch Folge-Command `/architect` am 2026-08-15 erteilt.

---

## Übergabe: BA → AR

**Datum:** 2026-08-15
**Nächster Befehl:** `/architect second-brain`

Die Architektur muss einen versionierten, neustartfesten und begrenzten Vertrag für
`Pending Confirmation` festlegen. Die konkrete Persistenz- und IPC-Lösung ist bewusst
nicht Teil dieser Story.
