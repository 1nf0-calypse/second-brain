---
id: RM-000001
title: Roadmap / Release-Plan — Second Brain
version: 1.2
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-08-15
project: second-brain
based-on: REQ-000001, US-000001–US-000014, BUG-000001–BUG-000006, DEBT-000001
supersedes: —
superseded-by: —
---

# RM-000001: Roadmap / Release-Plan — Second Brain

Diese Roadmap macht den bereits freigegebenen Scope planbar. Sie ergänzt keine
Anforderungen: abgeschlossene Liefer-Slices bleiben als historische Einträge sichtbar;
Umbrella-Storys bleiben offen, solange ihre ausdrücklich ausgeschlossenen Teile fehlen.

## Gesamtscope-Übersicht

| Fachlicher Bereich | Priorität | Ziel-Iteration | Ziel-Datum |
|---|---|---:|---|
| Einstieg und MCP-Client-Kompatibilität | Must | 5 | 2026-08-26 |
| Trust Boundary und Provider-Consent | Must | 5 | 2026-08-26 |
| Erweiterte kontrollierte Mutationen und Wissenskompilierung | Must | 6–7 | 2026-09-23 |
| Suche, visuelle Exploration und Betriebssicht | Must/Should | 8–9 | 2026-10-21 |
| Integrations- und Plattformausbau | Should | 10–11 | 2026-11-18 |

## Vollständiger Backlog mit Vorausplanung

| ID | Bereich | Priorität | SP | Size | Iteration | Start | Ziel | Abhängigkeiten |
|---|---|---|---:|---|---:|---|---|---|
| US-000011 | Einstieg: Claude-Desktop-Slice | Must | 13 | L | 1 | 2026-07-30 | 2026-07-31 | Geliefert; Slice von US-000001 |
| US-000005 | Wissensmodell: lokaler Index | Must | 13 | L | 1 | 2026-07-30 | 2026-07-31 | US-000011 |
| BUG-000001 | Plugin-Paket | Must | 2 | S | 1 | 2026-07-30 | 2026-07-30 | Verifiziert |
| BUG-000002 | nativer Node-Start | Must | 2 | S | 1 | 2026-07-30 | 2026-07-30 | Verifiziert |
| DEBT-000001 | Sprint-1-Review-Folgearbeiten | Must | 5 | M | 2 | 2026-07-31 | 2026-07-31 | Archiviert |
| US-000012 | Suche: Volltext und Quellen | Must | 21 | XL | 2 | 2026-07-31 | 2026-07-31 | US-000005; Slice von US-000002 |
| BUG-000003 | typisierter Scope-Fehler | Must | 2 | S | 2 | 2026-07-31 | 2026-07-31 | Verifiziert |
| US-000013 | Exploration: lokale Beziehungen | Must | 24 | XL | 3 | 2026-07-31 | 2026-07-31 | US-000005; Slice von US-000004 |
| BUG-000004 | Relationship-Index-Migration | Must | 3 | M | 3 | 2026-07-31 | 2026-07-31 | Verifiziert |
| US-000014 | Mutation: Ein-Datei-Human-in-Slice | Must | 26 | XL | 4 | 2026-07-31 | 2026-08-12 | US-000005, US-000011, US-000012; Slice von US-000003 |
| BUG-000005 | Windows-Dateisperre | Must | 3 | M | 4 | 2026-08-12 | 2026-08-12 | Verifiziert |
| BUG-000006 | begrenzte Vorschauablage | Must | 2 | S | 4 | 2026-08-12 | 2026-08-12 | Verifiziert |
| US-000001 | Einstieg: ChatGPT- und Mistral-MCP-Slices | Must | 13 | L | 5 | 2026-08-12 | 2026-08-26 | US-000011 geliefert; verbindliche Client-Matrix |
| US-000007 | Trust Boundary: Provider-Consent und Datenfluss | Must | 8 | L | 5 | 2026-08-12 | 2026-08-26 | US-000001; ADR-000004 |
| US-000003 | kontrollierte Mutationen: Restumfang | Must | 26 | XL | 6 | 2026-08-26 | 2026-09-09 | US-000014; verbindliche 60/60-Budget-Policy für höhere Autonomie |
| US-000015 | Quellengebundene Kompilierungsvorschau | Must | 10 | L | 7 | 2026-09-09 | 2026-09-23 | US-000003, US-000005, US-000016 |
| US-000016 | Versionierte projektlokale Vorlagen | Must | 7 | M | 7 | 2026-09-09 | 2026-09-23 | US-000006, US-000007 |
| US-000008 | Lokale Mutationshistorie | Should | 6 | M | 7 | 2026-09-09 | 2026-09-23 | US-000003 |
| US-000002 | Suche: semantisch und Anhänge | Must | 13 | L | 8 | 2026-09-23 | 2026-10-07 | US-000012; Windows-Vector-/Extraktionsentscheidung |
| US-000004 | Exploration: visuelle Graphansicht | Must | 8 | L | 8 | 2026-09-23 | 2026-10-07 | US-000013, US-000005 |
| US-000009 | campaignworld-Integrationsgrenze | Should | 5 | M | 10 | 2026-10-21 | 2026-11-04 | US-000002, US-000004; separater Vertrag |
| US-000010 | Android-Nutzung nach Desktop-MVP | Should | 8 | L | 11 | 2026-11-04 | 2026-11-18 | Desktop-MVP; Plattformvalidierung |

## Iterationskadenz

**Iterationslänge:** 14 Tage  
**Start der nächsten Iteration:** 2026-08-12  
**Anzahl geplanter künftiger Iterationen:** 7 (Sprint 5–11)

## Ist-Abweichungen

| Sprint | Betroffene ID | Ursprünglich geplant | Tatsächlich | Grund |
|---:|---|---|---|---|
| 5 | US-000001, US-000007 | 21 SP | 26 SP | Threat-Model, Negativmatrix sowie Consent- und Accessibility-Abnahme sind zusätzlich verbindlich. |
| 6 | US-000003 | 13 SP | 26 SP | Die entschiedene Human-on/out-Policy verlangt serverseitige Budgetdurchsetzung, Pause, Audit/Rollback und vollständige Sicherheits- sowie UI-Abnahme. |
| 7 | US-000015, US-000016, US-000008 | 18 SP | 23 SP | Wissenskompilierung wurde in Vorschau und Vorlagen geschnitten; die Verlaufssicht liefert den dritten Nutzerfluss. |
| 1–4 | RM-000001 | Keine Roadmap vorhanden | Historische Liefer-Slices nachträglich eingeordnet | Roadmap-Pflicht wurde vor Sprint 5 nachgezogen. |

## Offene Annahmen

- ChatGPT wird ausschließlich für Business/Enterprise/Edu mit freigegebenem,
  nutzerverwaltetem Remote-/Tunnelpfad geplant; Consumer-Pläne sind kein Sprint-5-Ziel.
- Mistral wird ausschließlich über einen nutzerverwalteten Connector geplant; das Produkt
  speichert keine Provider-Credentials. Provider-Hinweise werden versioniert mit Quelle und
  Prüfdatum gepflegt; ohne gültige Consent-Quittung bleibt jede Übertragung gesperrt.
- Für Sprint 6 gelten je Autonomiestufe maximal 60 Markdown-Erstellungen/-Aktualisierungen
  in 60 Minuten. Beide Modi laufen höchstens eine Stunde; Löschungen, Verschiebungen und
  Umbenennungen sind automatisch ausgeschlossen. Budgetende, Ablauf oder Pause sperren neue
  automatische Mutationen sofort.
- Die Windows-Vector-/Anhangsextraktionsentscheidung bleibt ein separates, vor Sprint 8 zu
  klärendes Risiko.

## Definition of Done

- [x] Jede bestehende US, jeder Bug und die Debt ist eingeplant oder als historisch erledigt markiert.
- [x] Alle offenen Umbrella-Storys haben Priorität, Schätzung, Iteration und Abhängigkeiten.
- [x] Sprint 5 adressiert nur bereits freigegebene Anforderungen.
- [x] Keine offene BLOCKER-Annahme im Sprint-5-Zuschnitt.
- [x] Anforderungen- und Projektindex werden aktualisiert.

---

## Übergabe: BA → BA+FE+BE

**Datum:** 2026-08-12  
**Von:** Business Analyst (BA)  
**An:** Business Analyst, Frontend Developer und Backend Developer (BA+FE+BE)  
**Nächster Befehl:** `/refine second-brain 5`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| RM-000001 | APPROVED | `requirements/RM-000001-roadmap.md` | Vollständige Vorausplanung; Sprint 5 umfasst US-000001 und US-000007. |
| US-000001 | APPROVED | `requirements/US-000001-installation-and-mcp-setup.md` | Restumfang: ChatGPT- und Mistral-Client-Slices. |
| US-000007 | APPROVED | `requirements/US-000007-security-and-data-flow.md` | Consent und Datenflussgrenzen sind der verbindliche Sicherheitsanteil. |

### Kritische Informationen für Empfänger

- Sprint 5 darf keine externe Übertragung ohne vorherige, prüfbare Consent-Information aktivieren.
- Die bestehende Claude-Desktop-Integration ist ein gelieferter Slice und kein Ersatz für
  die in US-000001 weiterhin geforderten Clients.

### Offene Fragen (vererbt)

| # | Frage | Ursprung | Kritikalität | An wen |
|---:|---|---|---|---|
| 1 | Welche konkreten Client-Versionen bestehen die Sprint-5-Kompatibilitätsmatrix? | ADR-000006 | Durch Tests vor Release zu beantworten | QA/FE/BE |

### Nicht-Ziele

- Keine höheren Autonomiestufen, keine automatische externe Datenübertragung und keine
  semantische Suche im Sprint-5-Scope.

---

*Erstellt von: BA-Agent | Datum: 2026-08-13 | Version: 1.1*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.2 | 2026-08-15 | Sprint 7 als drei Storys für Vorschau, Vorlagen und lokalen Verlauf geplant | BA+FE+BE |
| 1.1 | 2026-08-13 | Sprint-6-Aufwand und verbindliche Autonomie-Budget-Policy präzisiert | BA+FE+BE |
| 1.0 | 2026-08-12 | Initiale Vorausplanung für Sprint 5–11 | BA |
