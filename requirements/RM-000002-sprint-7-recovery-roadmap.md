---
id: RM-000002
title: Sprint-7-Recovery-Roadmap
version: 1.2
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-08-15
project: second-brain
based-on: RM-000001@1.2, REQ-000002, RV-000008
supersedes: —
superseded-by: —
---

# RM-000002: Sprint-7-Recovery-Roadmap

Diese Roadmap ergänzt RM-000001 ausschließlich um den nach Gate 8 erforderlichen
Korrektur-Slice. Die übrige Produktplanung bleibt unverändert.

## Korrektur-Backlog

| Reihenfolge | Story | Ergebnis | Priorität | Schätzung | Abhängigkeiten |
|---:|---|---|---|---:|---|
| 1 | US-000017 | MCP-Einreichung, persistentes Pending Confirmation, vollständige Prüfung und Einmal-Entscheidung | Must | 13 SP | AR-Korrektur zu ADR-000004; US-000003, US-000005, US-000007 |
| 2 | US-000016 | Vorlagen unter `.second-brain/templates/` speichern, versionieren, auflisten, lesen, auswählen und wiederverwenden | Must | 8 SP | Architekturvertrag aus Schritt 1 |
| 3 | US-000008 | Erfolgs-, Fehler-, Abbruch-, Incomplete- und Rollback-Zustände wahrheitsgetreu anzeigen | Must im Recovery-Slice | 5 SP | Lebenszyklus aus Schritt 1 |

**Gesamt:** 26 SP. Die frühere Sprint-7-Schätzung von 23 SP gilt für die abgelehnte
Umsetzung und wird nicht als verbleibender Aufwand fortgeschrieben.

## Ist-Abweichungen

| Sprint | Betroffene ID | Recovery-Grobplanung | Refinement | Grund |
|---:|---|---:|---:|---|
| 7 | US-000017 | 13 SP | 21 SP | Contract 3, Schema 6, durable Inbox, plugin-only Entscheidung und Write-ahead-Recovery bilden einen durchgängigen statt nur oberflächlichen MCP-Pfad. |
| 7 | US-000016 | 8 SP | 13 SP | Datei-Source-of-Truth, Registry-Rebuild, Race-Schutz sowie Library-/Versions-UX benötigen getrennte Persistenz-, Service- und UI-Nachweise. |
| 7 | US-000008 | 5 SP | 8 SP | Alle terminalen Zustände, Event-Timeline, Rollbackprojektion und headed Abnahme müssen wahrheitsgetreu ergänzt werden. |

**Verfeinerter Gesamtaufwand:** 42 SP. Die Differenz ist kein neuer Produktscope, sondern
die vollständige Zerlegung der bereits in ADR-000007 und UX-000004 festgelegten
Persistenz-, Recovery-, Accessibility- und End-to-End-Nachweise.

### Gate-8-Korrekturabgleich

| Sprint | Grundlage | Zusätzlicher Ist-Aufwand | Kumuliert | Begründung |
|---:|---|---:|---:|---|
| 7 | RV-000009@1.0 / SP-000010@1.0 | 8 SP | 50 SP | 3 SP Post-Write-Saga, 4 SP Template-Dateidrift und Registry-Recovery, 1 SP exakte Warn-Microcopy einschließlich gezielter Regressionen. |

Der Zusatzaufwand ist Rework innerhalb von US-000017, US-000016 und US-000008. Er ändert
weder Scope noch Zieltermin oder Contract 3.0.0.

## Phasenfolge und Gates

1. **Requirements-Freigabe:** REQ-000002 und US-000017 bestätigen.
2. **Architecture:** MCP-/IPC-Vertrag, Persistenz, Zustandsautomat, Atomarität und
   Aufbewahrungsgrenzen entscheiden.
3. **UX:** Pending-Liste, Prüfansicht, konkrete Fehler und Tastaturfluss festlegen.
4. **Refinement:** Storys in implementierbare Tasks mit MCP-, Prozess-, Plugin- und
   End-to-End-Abnahme schneiden.
5. **Implementation und Testing:** alle offenen MAJOR- und MINOR-Funde aus RV-000008
   schließen und gegen die korrigierten Akzeptanzkriterien nachweisen.
6. **Re-Review:** Nutzerabnahme für US-000017; technische Re-Abnahme für US-000016 und
   US-000008.

## Exit-Kriterien für den Recovery-Slice

- [ ] Ein realer MCP-Client kann einen Vorschlag ohne UI-Doppelerfassung einreichen.
- [ ] Der Vorschlag überlebt den vereinbarten Neustart-/Reconnect-Fall.
- [ ] Die UI zeigt vollständige Provenienz und konkrete Validierungsfehler.
- [ ] Bestätigen und Verwerfen sind atomar, einmalig und driftgeschützt.
- [ ] Vorlagen sind projektlokal persistent und wiederverwendbar.
- [ ] Historie und Rollbackstatus entsprechen dem tatsächlichen Ergebnis.
- [ ] Persistente Vorschau- und Bindungsdaten besitzen getestete Höchstgrenzen.
- [ ] Gate 7 und Gate 8 bestehen ohne offenen MAJOR-Fund.

## Nicht-Ziele

- Keine Erweiterung des Gesamtscopes von RM-000001.
- Kein neuer KI-Anbieter und kein automatischer Schreibmodus.
- Keine Terminfreigabe vor Architektur-, UX- und Refinement-Schätzung.

---

## Übergabe: BA → AR

**Datum:** 2026-08-15
**Nächster Befehl:** `/architect second-brain`

AR soll zuerst den MCP-first-Lebenszyklus und seine Persistenzgrenzen entscheiden. UX und
Refinement bauen anschließend auf diesem Vertrag auf; eine direkte Rückkehr zur
Implementierung wäre nicht gate-konform.

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.2 | 2026-08-18 | RV-000009 als 8-SP-Gate-8-Korrekturschnitt SP-000010 eingeplant; kumuliert 50 SP | BA+FE+BE |
| 1.1 | 2026-08-15 | Refinement-Abweichung von 26 auf 42 SP je Story begründet | BA+FE+BE |
| 1.0 | 2026-08-15 | Recovery-Reihenfolge und Grobplanung nach RV-000008 erstellt | BA |
