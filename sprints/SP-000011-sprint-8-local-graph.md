---
id: SP-000011
title: Sprint 8 Local Graph Backlog
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst) + FE + BE
date: 2026-08-19
project: second-brain
sprint: 8
based-on: RM-000001@1.6, US-000004@1.0, US-000013@1.0, UX-000005@1.0, ADR-000001@1.0, ADR-000003@1.0, SRP-000001@1.0
supersedes: —
superseded-by: —
---

# SP-000011: Sprint 8 — Lokale Graphansicht

## Sprint-Ziel

**In einem Satz:** Nutzer können die expliziten lokalen Beziehungen der aktiven Notiz als
native, zugängliche Graphansicht mit einer gleichwertigen Liste erkunden und verbundene
Vault-Notizen öffnen.

**Messbares Erfolgskriterium:** Für eine indexierte Notiz zeigt `Local graph` nur
nachvollziehbare Wiki-Link-, Backlink-, Tag- und Property-Kanten mit Richtung, Quelle und
Fundstelle. Die vollständige Liste ist bei Tastaturbedienung, 200-%-Zoom und 320 CSS-Pixel
gleichwertig nutzbar. Refresh und Fehlerfälle sind read-only; keine Vault-Datei verändert
sich.

## Sprint-Rahmen

| Eigenschaft | Wert |
|---|---|
| Sprint-Start | 2026-09-23 |
| Sprint-Ende | 2026-10-07 |
| Dauer | 14 Tage |
| Commit-Umfang | 8 SP / L |
| Schwerpunkt BE | 3 SP |
| Schwerpunkt FE | 5 SP |
| RM-Grobschätzung | 8 SP / L |
| Abweichung | Keine – die Detailplanung bleibt innerhalb der RM-Schätzung. |

## Commit-Story

| US | Titel | Grobschätzung | Refinement | Verantwortlich | Abhängigkeiten |
|---|---|---:|---:|---|---|
| US-000004 | Knowledge Graph und Exploration | 8 SP / L | 8 SP / L | BE+FE | US-000013, US-000005, UX-000005, ADR-000003 |

**Gesamt Commit:** 8 SP. Keine Stretch-Story.

## Technische Entscheidung im Refinement

Die Graphdarstellung wird mit **nativem Obsidian-DOM und SVG** umgesetzt; sie führt keine
neue Runtime oder Visualisierungsbibliothek ein. Der kanonische, zugängliche Datenpfad ist
die strukturierte Relationship list. Das SVG ist eine ergänzende Darstellung desselben
read-only Graphvertrags und darf keine Beziehungen hinzufügen oder verbergen.

Die sichere Metadatenanzeige nutzt ausschließlich vorhandene Indexfakten: relativer Pfad,
Kantenzahlen und `extractionStatus`. Bei `not_extracted` lautet die Anzeige ausschließlich
`Not extracted`; sie zeigt, erfindet oder verarbeitet keinen Anhangsinhalt.

## Implementierungsreihenfolge

```text
S8-01: read-only Graphvertrag + Indexprojektion
  └─→ S8-02: Plugin-Transport und Graph-Entry-Points
       └─→ S8-03: Local Graph View (SVG + Liste)
            └─→ S8-04: Zustände, A11y, responsive Verhalten und E2E
```

S8-01 muss vor jeder UI-Arbeit abgeschlossen sein. S8-02 kann unmittelbar danach parallel
zu den Unit-Tests aus S8-01 beginnen. S8-04 prüft die integrierte Ansicht und ist erst nach
S8-03 abschließbar.

## Subtasks

### US-000004 — Local graph: 8 SP

| ID | Konkrete Arbeit | Verantwortlich | SP | Fertiges Ergebnis | Verbindlicher Nachweis |
|---|---|---|---:|---|---|
| S8-01 | Versionierten read-only `LocalGraph`-Vertrag vor dem Code ergänzen: Fokus-Knoten, begrenzte Knoten/Kanten, Relationstyp, Richtung, Quelle/Fundstelle, Auflösungsstatus und sichere Knotendetails. `LocalIndex` projiziert ausschließlich vorhandene `graph_edges`; unaufgelöste Wiki-Links bleiben markiert. | BE | 2 | Ein lokaler Graphabruf liefert nur explizite, belegte Kanten und validierte Daten; er verändert weder Vault noch Index. | Unit- und Integrationstests für Wiki-Link, Backlink, Tag, Property, unaufgelöstes Ziel, Limit und read-only-Invariante; vor/nach Hash aller Vault-Fixtures identisch. |
| S8-02 | Sidecar-CLI/IPC und Plugin-Transport für den neuen Graphabruf sowie `nodeDetail` vollständig anbinden. Fehler bleiben typisiert, Timeouts/Abbruch signalisierbar und Sidecar-offline von einem leeren Graphen unterscheidbar. | BE | 1 | Der Plugin-Prozess kann Fokus-Graph und Knotendetail über den lokalen Sidecar lesen; bestehender Relationship-MCP-Zugriff bleibt kompatibel. | Contract-/Transporttests für Erfolg, ungültigen Pfad, Index-fehlt, Abort/Timeout und Offline; keine neue externe Schnittstelle oder Berechtigung. |
| S8-03 | Ribbon- und Command-Palette-Einstieg `Open local graph`, `Show in graph` aus der Relationship-Ansicht sowie `LocalGraphView` mit Toolbar, Fokus-Knoten und nativer SVG-Sternansicht implementieren. | FE | 2 | Die aktive Note öffnet eine fokussierte lokale Ansicht; Knoten/Kanten stammen eins zu eins aus dem Graphvertrag. | Komponenten-/UI-Tests prüfen Entry-Points, Fokuswechsel, `Open note`, keine Canvas-Daten ohne Listenäquivalent und keine Schreiboperation. |
| S8-04 | Vollständige Relationship list, Filter für Wiki links/Backlinks/Tags/Properties, sichtbare Quellen und `Not extracted`-Knotendetails implementieren. Canvas und Liste filtern immer gleich; unaufgelöste Links sind nicht öffnbar. | FE | 2 | Liste und SVG zeigen dieselben, erklärbaren Beziehungen; Quellen, Richtung und Typ sind textlich verfügbar. | Tests für Filter-Synchronität, Quelle/Fundstelle, resolved/unresolved Ziele, `not_extracted` ohne Dateiinhaltszugriff und Navigation zu einer vorhandenen Note. |
| S8-05 | UX-000005-Zustände (Loading, Ready, Empty, Filtered empty, Refreshing, Stale, Offline, Error), Tastaturpfad, ARIA-Live-Status, 320-px-/200-%-Reflow und `prefers-reduced-motion` umsetzen und nachweisen. | FE | 1 | Die Liste bleibt voll bedienbar, wenn SVG ausgeblendet oder Bewegung reduziert ist; Fehler sind verständlich und retrybar. | Headed E2E für Ready/Empty/Offline/Retry/Filter/Öffnen; Keyboard-Test der Liste, 320 CSS-Pixel und 200-%-Zoom; keine horizontale Pflichtnavigation. |

## Abnahmekriterien

1. Eine aktive indexierte Note öffnet `Local graph` und zeigt nur direkte, lokale,
   explizite Beziehungen mit Richtung, Typ, Quellnotiz und Fundstelle.
2. Jede im SVG sichtbare Kante besitzt einen inhaltlich gleichen, tastaturbedienbaren
   Listeneintrag; die Liste bleibt ohne SVG vollständig nutzbar.
3. Filter ändern SVG und Liste identisch. Bei keinem Treffer erscheint `No relationships
   match these filters.` mit `Clear filters`.
4. Ein aufgelöstes Ziel kann mit `Open note` geöffnet werden; ein unaufgelöstes Ziel ist als
   `Unresolved link` markiert und nicht öffnbar.
5. `Refresh graph` und jeder Fehler-/Offline-/Retry-Pfad bleiben lesend. Vault-Fixture-
   Hashes sind vor und nach diesen Pfaden identisch.
6. Bei `not_extracted` wird nur der sichere Status angezeigt – kein Anhängeinhalt, keine
   OCR und keine Semantik.
7. Die Sichttexte, Statusregionen und responsive Darstellung entsprechen UX-000005; der
   gesamte Pfad besteht in einem headed Obsidian-Harness.

## Technische Voraussetzungen

| # | Voraussetzung | Status | Nachweis |
|---:|---|---|---|
| 1 | US-000004 und US-000013 sind APPROVED | ✅ | Requirements-Header |
| 2 | UX-000005, ADR-000001 und ADR-000003 sind APPROVED | ✅ | Artefakt-Header |
| 3 | Lokale SQLite-Graphkanten und Relationship list existieren | ✅ | `LocalIndex.relationships`, `RelationshipView` |
| 4 | `nodeDetail` enthält einen read-only `extractionStatus` | ✅ | Bestehender Contract/Index |
| 5 | Windows-Vector-/Extraktionsrisiko ist bewertet | ✅ | SRP-000001; für Sprint 8 ausgeschlossen |
| 6 | Externe Infrastruktur, Provider-Consent oder neue Runtime | N/A | Nicht Teil des Sprints |

## Risiken & Unsicherheiten

| Risiko | Wahrscheinlichkeit | Impact | Mitigation | Blockiert Start? |
|---|---|---|---|---|
| SVG wird fälschlich zur alleinigen Interaktion | Mittel | Hoch | Relationship list als kanonische Alternative und verbindliche Keyboard-/Zoom-E2E | Nein |
| Große direkte Nachbarschaft überlädt Pane oder DOM | Mittel | Mittel | Vertrag begrenzt Knoten/Kanten; Anzeige macht die Begrenzung transparent | Nein |
| Refresh erzeugt ungewollte Vault-Schreibannahmen | Niedrig | Hoch | Read-only Contract und Fixture-Hash-Nachweise | Nein |
| `not_extracted` wird als extrahierter Inhalt missverstanden | Niedrig | Mittel | Feste Microcopy, keine Inhaltsfelder und negative Tests | Nein |

**Selbstauskunft BA+FE+BE:** Keine ungeklärte BLOCKER- oder MAJOR-Frage. Die im UX-
Handoff genannten Entscheidungen sind im Sprint entschieden: natives SVG statt neuer
Runtime; ausschließlich vorhandene, sichere Metadaten statt Anhangsextraktion.

## Technische Schulden

Keine neue technische Schuld. Die separate, signierte Windows-Verpackung für Vektoren und
Anhangsextraktion bleibt eine Architekturvoraussetzung für Sprint 9, nicht Schuld dieses
Sprints.

## Nicht-Ziele

- Semantische Suche, Embeddings, OCR oder Anhangstext-Extraktion.
- Automatisch erkannte Beziehungen oder Kanten außerhalb des freigegebenen Vaults.
- Jede Mutation an Vault, Indexdaten als Source of Truth, Links, Tags oder Properties.
- Externe Provider, Netzverkehr, Telemetrie oder eine neue Graph-/Canvas-Library.

## Definition of Ready

- [x] Die Sprint-Story ist APPROVED und besitzt drei testbare Akzeptanzszenarien.
- [x] UX-000005 definiert Journeys, Zustände, Microcopy und WCAG 2.2 AA.
- [x] Grob- und Detailschätzung stimmen mit 8 SP überein.
- [x] Vertrag, Indexprojektion, UI und E2E haben klare Verantwortliche und Reihenfolge.
- [x] Keine ungeklärte technische BLOCKER- oder MAJOR-Abhängigkeit.
- [x] Constitution geprüft: lokale Persistenz, Vault-Integrität und MCP-Berechtigungsgrenzen
      bleiben erhalten; der Sprint schreibt keine Vault-Datei.
- [x] Semantik und Anhangsextraktion sind nachvollziehbar nach Sprint 9 verschoben.
- [x] Sprints- und Projektindex, Roadmap, `.phase` und ID-Zähler aktualisiert.

---

## Übergabe: BA+FE+BE → FE+BE+QA

**Datum:** 2026-08-19  
**Von:** Business Analyst, Frontend Developer und Backend Developer (BA+FE+BE)  
**An:** Frontend Developer, Backend Developer und QA Engineer (FE+BE+QA)  
**Nächster Befehl:** `/implement all second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| SP-000011 | APPROVED | `sprints/SP-000011-sprint-8-local-graph.md` | 8-SP-Plan für read-only Graphvertrag, native Graphansicht und A11y. |
| UX-000005 | APPROVED | `ux/UX-000005-graph-exploration.md` | Zustände, Microcopy und Listenäquivalenz sind verbindlich. |
| SRP-000001 | APPROVED | `architecture/SRP-000001-windows-vektorsuche-und-anhangsextraktion.md` | Semantik und Extraktion sind explizit nicht Teil von Sprint 8. |

### Kritische Informationen für Empfänger

- Zuerst Contract und Indexprojektion implementieren; SVG darf den Vertrag nicht umgehen.
- Liste und SVG müssen dieselben Kanten und Filter besitzen. Die Liste ist die vollständige
  Tastatur- und Fallback-Interaktion.
- Jede Refresh-, Offline- und Error-Prüfung beweist Vault-Unverändertheit.

### Offene Fragen

Keine.

### Nicht-Ziele

Keine semantische Suche, Anhängeextraktion, automatische Inferenz oder Vault-Mutation.

### Empfehlungen

BE liefert Contract/Transport mit Tests zuerst; FE integriert danach nativ und führt die
headed A11y-/responsive E2E als Abschluss durch.

---

*Erstellt von: BA + FE + BE (Refinement) | Datum: 2026-08-19 | Version: 1.0*
