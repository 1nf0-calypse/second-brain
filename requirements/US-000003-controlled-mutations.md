---
id: US-000003
title: Kontrollierte Mutationen und Rollback
version: 1.1
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-08-13
project: second-brain
based-on: REQ-000001 F-008, F-009, F-010, F-011, F-012; US-000014
epic: Sicheres Schreiben
priority: Must
sprint: 6
supersedes: —
superseded-by: —
---

# US-000003: Kontrollierte Mutationen und Rollback

## User Story

**Als** Vault-Eigentümer
**möchte ich** KI-Änderungen je Autonomiestufe kontrollieren, prüfen und rücksetzen
**damit** ich Automatisierung ohne unbemerkten Datenverlust nutzen kann.

## Kontext

Sprint 4 lieferte den sicheren Human-in-the-Loop-Slice für genau eine Markdown-Notiz.
Sprint 6 ergänzt die bewusst aktivierten Human-on- und Human-out-Modi, ohne die
Dateisystemberechtigung zu erweitern.

## Verbindliche Budget-Policy

| Regel | Human-on-the-Loop | Human-out-of-the-Loop |
|---|---|---|
| Automatisch erlaubte Aktionen | Markdown-Notiz erstellen oder aktualisieren | Markdown-Notiz erstellen oder aktualisieren |
| Höchstmenge | 60 Mutationen | 60 Mutationen |
| Zeitfenster und maximale Laufzeit | 60 Minuten | 60 Minuten |
| Löschen, Verschieben, Umbenennen | Nicht automatisch erlaubt | Nicht automatisch erlaubt |
| Bei Budgetende, Ablauf oder Pause | Neue automatische Mutationen sofort sperren | Neue automatische Mutationen sofort sperren |

Löschungen bleiben ein eigener Human-in-the-Loop-Vorgang mit sichtbarer Vorschau und
expliziter Nachfrage. Jede automatische Mutation muss weiterhin einzeln auditierbar und
konfliktgeschützt rücksetzbar bleiben.

## Akzeptanzkriterien

### Szenario 1: Human-in-the-Loop bleibt der sichere Standard
```text
GEGEBEN Human-in-the-Loop ist aktiv
WENN ein Client eine Schreib- oder Löschoperation anfordert
DANN sehe ich Scope und Änderungsvorschau und die Mutation erfolgt erst nach expliziter Bestätigung
```

### Szenario 2: Höhere Autonomie wird bewusst und begrenzt aktiviert
```text
GEGEBEN ich will Human-on- oder Human-out-of-the-Loop für Markdown-Erstellungen und
        -Aktualisierungen aktivieren
WENN ich den Modus wechsle
DANN sehe ich Risiken, den 60-Mutationen-pro-60-Minuten-Rahmen und den Ausschluss von
     Löschungen; der Wechsel erfolgt nur nach bewusster Bestätigung
```

### Szenario 3: Automatische Mutation bleibt konfliktgeschützt und rücksetzbar
```text
GEGEBEN eine automatische Mutation liegt innerhalb eines aktiven Budgets und die Zieldatei
        ist seit der Prüfung unverändert
WENN der Client sie ausführt oder ich später rollbacke
DANN wird die einzelne Mutation versioniert protokolliert und sicher rückgesetzt; bei einem
     Konflikt wird abgebrochen, ohne neuere Änderungen still zu überschreiben
```

### Szenario 4: Budget, Ablauf und Pause sperren zuverlässig
```text
GEGEBEN Human-on- oder Human-out-of-the-Loop ist aktiv und noch innerhalb seines Budgets
WENN 60 Mutationen ausgeführt wurden, 60 Minuten abgelaufen sind oder ich die Automatisierung pausiere
DANN werden keine weiteren automatischen Mutationen ausgeführt, der Modus wird als pausiert
     angezeigt und bereits nicht ausgeführte Anfragen benötigen eine neue Aktivierung oder
     die Human-in-the-Loop-Bestätigung
```

### Szenario 5: Automatische Modi erweitern keine Berechtigung
```text
GEGEBEN ein Client fordert Löschen, Verschieben, Umbenennen, Zugriff außerhalb des Vaults
        oder eine nicht freigegebene Operation an
WENN die Anfrage in einem automatischen Modus verarbeitet wird
DANN wird sie vor jeder Dateisystemänderung blockiert und als unzulässige Aktion protokolliert
```

## Nicht-Ziele

- Beliebige System- oder Codeausführung.
- Automatische Konfliktauflösung mit Datenverlust.
- Automatisches Löschen, Verschieben oder Umbenennen.
- Paketbestätigungen für mehrere Dateien.
- Binärdateien, Anhänge oder Pfade außerhalb des freigegebenen Vaults.
- Wissenskompilierung, Vorlagenverwaltung oder externe KI-Anbieter.

## Abhängigkeiten

| Typ | Referenz | Beschreibung |
|---|---|---|
| Baut auf | US-000014 | Sicherer Ein-Datei-Human-in-Slice liefert Prepare/Confirm, Audit und Einzelrollback. |
| Sicherheit | US-000007 | Serverseitige Datenfluss- und Trust-Boundary-Muster bleiben verbindlich. |
| Architektur | ADR-000004 | Versionierte Policy, Mutationsbudget und Audit-/Rollback-Paket sind verpflichtend. |
| UX | UX-000001 Journey 5 | Modusvergleich, Budgetformular, Warnung, Pause und sichtbarer Status. |

## Technische Notizen

**Frontend-Aufwand:** 8 SP / L
**Backend-Aufwand:** 13 SP / L
**Qualitätsaufwand:** 5 SP
**Besondere technische Risiken:** Die Policy muss serverseitig durchgesetzt und bei
konkurrierenden Anfragen atomar gezählt werden. Ein Client darf weder den Modus noch
Restbudget oder Laufzeit frei behaupten.

## Definition of Done

- [ ] Beide Autonomiestufen nur nach sichtbarer Risiko- und Budgetbestätigung aktivierbar
- [ ] Serverseitige Policy bindet Modus, 60-Minuten-Fenster, 60-Mutations-Limit und erlaubte Aktionen
- [ ] Budgetende, Ablauf und manuelle Pause blockieren neue automatische Mutationen
- [ ] Jede automatische Mutation besitzt Audit-Eintrag und konfliktgeschütztes Einzel-Rollback
- [ ] Löschungen, Verschiebungen und Umbenennungen bleiben aus automatischen Modi ausgeschlossen
- [ ] Vertrags-, Integration-, Security- und headed Obsidian-E2E-Tests bestanden
- [ ] Code Review und Nutzerdokumentation abgeschlossen

---

## Übergabe: BA → BA+FE+BE

**Datum:** 2026-08-13
**Von:** Business Analyst (BA)
**An:** Business Analyst, Frontend Developer und Backend Developer (BA+FE+BE)
**Nächster Befehl:** `/refine second-brain 6`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| US-000003 | APPROVED | `requirements/US-000003-controlled-mutations.md` | Verbindliche 60/60-Budget-Policy für beide Autonomiestufen |

### Kritische Informationen für Empfänger

- Automatische Modi dürfen ausschließlich Markdown-Dateien erstellen oder aktualisieren.
- Budgetende, Ablauf oder Pause müssen vor der nächsten Mutation serverseitig wirken.
- Delete, Move und Rename bleiben Human-in-the-Loop und gehören nicht in diesen Sprint.

### Offene Fragen (vererbt)

Keine BLOCKER- oder MAJOR-Frage für den Sprint-6-Scope.

### Nicht-Ziele (explizit ausgeschlossen)

Automatisches Löschen, Verschieben, Umbenennen, Mehrdatei-Pakete und Konflikt-Merges.

---

*Erstellt von: BA-Agent | Datum: 2026-08-13 | Version: 1.1*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.1 | 2026-08-13 | Verbindliche 60/60-Budgets, einstündige Laufzeit, Pause und Delete-Ausschluss für Sprint 6 ergänzt | BA+FE+BE |
| 1.0 | 2026-07-30 | Initiale Umbrella-Story für kontrollierte Mutationen und Rollback | BA |
