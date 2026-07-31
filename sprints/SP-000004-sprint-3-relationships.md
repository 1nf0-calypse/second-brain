---
id: SP-000004
title: Sprint 3 Backlog — Lokale Beziehungen erkunden
version: 1.0
status: REVIEW
author-agent: BA (Business Analyst) + FE + BE
date: 2026-07-31
project: second-brain
sprint: 3
based-on: REQ-000001, US-000013, UX-000001, ADR-000003, ADR-000004, CON-000001
supersedes: —
superseded-by: —
---

# Sprint 3 Backlog: Lokale Beziehungen erkunden

## Sprint-Ziel

**In einem Satz:** Nutzer können direkte, belegte Beziehungen einer Vault-Notiz lokal in
Obsidian und Claude Desktop als zugängliche Liste erkunden und zu verbundenen Notizen
navigieren.

**Erfolgskriterium:** Alle fünf Szenarien aus US-000013 bestehen unter Windows; jede
Beziehung nennt Typ, Richtung und Quelle, Änderungen werden inkrementell übernommen,
Scope-Escapes bleiben blockiert und Vorher-/Nachher-Hashes bestätigen unveränderte
Vault-Dateien.

## Sprint-Rahmen

| Eigenschaft | Wert |
|---|---|
| Sprint-Start | Nach PASS des in `/implement` integrierten Gate 5.5 |
| Sprint-Ende | Scope-basiert; keine Kalender-Timebox vorgegeben |
| Dauer | Nicht festgelegt |
| Kapazität FE | 7 SP Planbedarf |
| Kapazität BE | 13 SP Planbedarf |
| Gemeinsame Qualität | 4 SP Planbedarf |
| Velocity (Referenz) | Sprint 2: 26 SP Planbedarf, 1/1 Story und Querschnittsschuld geliefert |
| Schätzmethode | Fibonacci Story Points |

Die 24 SP sind Planbedarf, keine historische Kapazitätszusage. Eine Story wird nicht
teilweise als abgeschlossen erklärt.

## Stories im Sprint

### Commit-Stories

| US | Titel | Schätzung | Verantwortlich | Abhängigkeiten |
|---|---|---:|---|---|
| US-000013 | Lokale Beziehungen nachvollziehbar erkunden | 21 SP | BE+FE | US-000005, US-000012, ADR-000003, ADR-000004, UX-000001 |

**Gesamt Commit:** 21 Story Points.

### Querschnittliche Qualität

| ID | Aufgabe | Schätzung | Verantwortlich |
|---|---|---:|---|
| Q3-001 | Testsuche im Haupt-Checkout muss `.worktrees/**` ausschließen | 1 SP | QA+BE |
| Q3-002 | Windows-Fixtures für Wiki-Links, Tags, Properties und unaufgelöste Ziele | 2 SP | QA+BE |

**Gesamter Planbedarf:** 24 Story Points.

### Stretch-Stories

Keine. Freie Kapazität dient Scope-, Unicode- und inkrementellen Graphregressionen.

### Explizit nicht im Sprint

- Abschluss der Umbrella-Story US-000004.
- Visuelle Canvas-/Kraftgraph-Darstellung.
- Semantisch oder durch ein Sprachmodell abgeleitete Beziehungen.
- US-000003 Mutationen und Autonomiestufen.
- US-000006 Wissenskompilierung.
- Vault-übergreifende oder `campaignworld`-Beziehungen.

## Subtasks

### US-000013 — 21 SP

| # | Subtask | Verantwortlich | Schätzung | Status |
|---|---|---:|---|
| 13.1 | Versionierte Relationship-, Neighbor- und Source-Verträge mit Laufzeitschemas definieren | BE | 2 SP | ⬜ |
| 13.2 | Reversible SQLite-Migration für gerichtete Graphkanten und Quellenmetadaten erstellen | BE | 3 SP | ⬜ |
| 13.3 | Wiki-Links, Tags und Properties deterministisch aus unterstützten Textnotizen extrahieren | BE | 3 SP | ⬜ |
| 13.4 | Graphkanten bei Index-Update atomar und dateibezogen ersetzen oder entfernen | BE | 3 SP | ⬜ |
| 13.5 | Read-only MCP-Werkzeuge für direkte Beziehungen und Knotendetails anbieten | BE | 2 SP | ⬜ |
| 13.6 | Native Obsidian-Relationship-View mit Richtung, Typ, Quelle und Empty/Error-Zuständen bauen | FE | 3 SP | ⬜ |
| 13.7 | Tastaturnavigation, Notizöffnung, Fokusführung und 320-px-/200-%-Zoom-Verhalten umsetzen | FE | 2 SP | ⬜ |
| 13.8 | Unit-, Integrations-, Security- und headed E2E-Tests für alle fünf Szenarien ergänzen | FE+BE | 3 SP | ⬜ |

### Querschnittliche Qualität — 3 SP

| # | Subtask | Verantwortlich | Schätzung | Status |
|---|---|---:|---|
| Q3.1 | Vitest-Excludes um `.worktrees/**` ergänzen und Haupt-Checkout-Regression nachweisen | QA+BE | 1 SP | ⬜ |
| Q3.2 | Synthetischen Vault mit Alias-Link, Backlink, Tag, Property, gelöschtem und unaufgelöstem Ziel erstellen | QA+BE | 2 SP | ⬜ |

## Technische Voraussetzungen

| # | Voraussetzung | Verantwortlich | Status |
|---|---|---|---|
| 1 | US-000013 und SP-000004 durch `/implement` bestätigt | ORCH | ⬜ Übergangsaktion |
| 2 | ADR-000001–ADR-000005, STRUCTURE und CON-000001 APPROVED | AR/PM | ✅ |
| 3 | UX-000001 APPROVED; Beziehungsliste und Accessibility spezifiziert | UX | ✅ |
| 4 | Lokaler Index und Volltext-/Quellenzugriff aus Sprint 1–2 auf `main` | FE+BE | ✅ |
| 5 | Neuer `feature/sprint-3`-Worktree | ORCH | Erst nach Gate-5.5-PASS anlegen |
| 6 | Push/Cleanup von Sprint 2 | ORCH/Nutzer | Nicht blockierend; getrennte Release-Hygiene |

## Definition of Ready

| Kriterium | US-000013 |
|---|:---:|
| Story eindeutig Sprint 3 zugeordnet | ✅ |
| Status durch Folge-Command bestätigbar | REVIEW ✅ |
| Mindestens drei Akzeptanzszenarien | 5 ✅ |
| UX-Abdeckung | UX-000001 ✅ |
| ADR-/Constitution-Bezug geklärt | ✅ |
| Keine ungeklärte fachliche Abhängigkeit | ✅ |
| Schätzung vorhanden | 21 SP ✅ |
| Testbarer Akzeptanznachweis definiert | ✅ |

## Qualitäts- und Abnahmekriterien

- Beziehungsschemas werden vor Handlern und UI versioniert und laufzeitvalidiert.
- Nur explizite Wiki-Links, Tags und Properties erzeugen Graphkanten; keine KI-Inferenz.
- Jede Kante enthält Typ, Richtung, Quellnotiz und eine technisch bestimmbare Fundstelle.
- Unaufgelöste Links bleiben gekennzeichnet und werden nicht auf fremde Pfade aufgelöst.
- Alle Pfade durchlaufen die kanonische Vault-Root-Policy; keine generischen Datei- oder
  Prozesswerkzeuge.
- Die Graphprojektion ist abgeleitet, reproduzierbar und wird pro geänderter Datei atomar
  aktualisiert.
- Domain-/Policy-/Graphmodule erreichen mindestens 90 % Branch Coverage; Gesamtprojekt
  mindestens 80 %.
- Headed Windows-E2E prüft Relationship-View, Tastaturpfad, Notizöffnung und MCP-Abfrage.
- UI bleibt bei 320 px, 200 % Zoom und reduzierter Bewegung vollständig nutzbar.
- Vorher-/Nachher-Hashes beweisen, dass Exploration keine Originaldatei verändert.
- US-000004 bleibt nach Sprint 3 offen, bis die vereinbarte visuelle Exploration geliefert ist.

## Risiken und Unsicherheiten

| Risiko | Wahrscheinlichkeit | Impact | Status | Mitigationsstrategie |
|---|---|---|---|---|
| Obsidian-Linkauflösung ist bei Aliasen und gleichnamigen Notizen mehrdeutig | Mittel | Hoch | ADRESSIERT | deterministische Auflösungsregel, unaufgelöster Status und Fixtures |
| Property-Werte besitzen unterschiedliche YAML-Formen | Mittel | Mittel | ADRESSIERT | begrenzter dokumentierter Extraktionsvertrag und Laufzeitfixtures |
| Kanten bleiben nach Dateilöschung veraltet | Mittel | Hoch | ADRESSIERT | dateibezogener atomarer Ersatz und Delete-Regression |
| Graphabfrage legt fremde Pfade offen | Niedrig | Hoch | ADRESSIERT | relative Quellen, Root-Policy und Symlink-/Traversal-Tests |
| Große Beziehungsmengen überladen das schmale Pane | Mittel | Mittel | ADRESSIERT | direkte Nachbarn, begrenzte Ergebnisse und zugängliche Listenstruktur |
| Visuelle Graphdarstellung wird erwartet | Mittel | Mittel | ADRESSIERT | Sprintziel und UI benennen ausdrücklich die Beziehungslisten-Basis |

**Selbstauskunft BA+FE+BE:** Keine offene technische oder fachliche BLOCKER-Frage für den
Commit-Scope. Mutationsbudgets und Provider-Hinweise betreffen bewusst ausgeschlossene
Stories und blockieren US-000013 nicht.

## Technische Schulden aus letztem Sprint

| ID | Beschreibung | Priorität | Adressiert in diesem Sprint? |
|---|---|---|---|
| Q3-001 | Haupt-Checkout-Test scannt eingebettete Worktree-Abhängigkeitstests | Mittel | Ja, als 1-SP-Qualitätsaufgabe |

## Definition of Done

- [x] Sprint-Ziel und messbares Erfolgskriterium definiert.
- [x] Commit-Story geschätzt und in lieferbare Subtasks zerlegt.
- [x] Technische Voraussetzungen und Worktree-Zeitpunkt gelistet.
- [x] UX-, Architektur-, Security- und Qualitätsanforderungen referenziert.
- [x] Release-Hygiene-Befund aus Sprint 2 eingeplant.
- [x] Risiken enthalten keine offenen BLOCKER.
- [x] Umbrella-Story US-000004 bleibt korrekt offen.
- [x] `requirements/INDEX.md`, `sprints/INDEX.md` und Projekt-`INDEX.md` werden aktualisiert.
- [x] Gate 5 ist inhaltlich PASS; formale Freigabe erfolgt durch `/implement`.

---

## Übergabe: Refinement → ORCH/FE/BE

**Datum:** 2026-07-31
**Von:** Business Analyst, Frontend Developer und Backend Developer (BA+FE+BE)
**An:** Orchestrator, Frontend Developer und Backend Developer (ORCH/FE/BE)
**Nächster Befehl:** `/implement all second-brain`

### Übergebene Artefakte

| Artefakt-ID | Version | Status | Pfad | Hinweise |
|---|---:|---|---|---|
| US-000013 | 1.0 | REVIEW | `requirements/US-000013-local-relationship-exploration.md` | Lieferbarer read-only Relationship-Slice |
| SP-000004 | 1.0 | REVIEW | `sprints/SP-000004-sprint-3-relationships.md` | Sprint-3-Backlog, 24 SP Planbedarf |

### Kritische Informationen für Empfänger

- `/implement` bestätigt US-000013 und SP-000004 nur bei bestandenem Gate 5/5.5.
- Graphkanten stammen ausschließlich aus expliziten Vault-Strukturen.
- Relationship-Scope bleibt read-only; Mutationen und automatische Inferenz sind ausgeschlossen.
- Vor Produktcode muss der Haupt-Checkout-Testausschluss für `.worktrees/**` regressionssicher
  gemacht werden.

### Offene Fragen (vererbt)

Keine offene BLOCKER- oder MAJOR-Frage für US-000013.

### Nicht-Ziele

Visuelle Graphdarstellung, Mutationen, KI-Inferenz, Wissenskompilierung und externe Graphen.

### Empfehlungen

Backend zuerst: Vertrag → Migration → deterministische Extraktion → atomare Projektion → MCP.
Frontend baut anschließend die zugängliche Beziehungsliste auf demselben Vertrag.

---

*Erstellt von: BA+FE+BE (Refinement) | Datum: 2026-07-31 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-07-31 | Sprint-3-Backlog für lokale Relationship-Exploration | BA+FE+BE |
