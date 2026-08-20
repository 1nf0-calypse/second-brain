---
id: UX-000005
title: Lokale Graphansicht und nachvollziehbare Exploration
version: 1.0
status: APPROVED
author-agent: UX (UX Designer)
date: 2026-08-19
project: second-brain
based-on: US-000004@1.0, US-000013@1.0, ADR-000001@1.0, ADR-000003@1.0, SRP-000001@1.0, RM-000001@1.5
supersedes: —
superseded-by: —
---

# UX-000005: Lokale Graphansicht und nachvollziehbare Exploration

## 1. Scope

**Abgedeckte User Story:** US-000004 (visuelle Graphansicht); die bereits gelieferte Beziehungsliste aus US-000013 bleibt die gleichwertige, zugängliche Alternative.

**Primäre Nutzungsgruppe:** Wissensarbeiter, die von einer Notiz zu ihren direkten, belegbaren Vault-Beziehungen navigieren möchten.  
**Nutzungskontext:** Obsidian Desktop unter Windows, in einer Seitenleiste oder einem eigenen Arbeitsbereich.  
**Produktsprache:** Englisch.  
**Design-System:** Native Obsidian-Komponenten und CSS-Variablen.  
**Accessibility-Ziel:** WCAG 2.2 AA.

Die Ansicht visualisiert ausschließlich bereits lokal indexierte Wiki-Links, Backlinks, Tags und Properties. Jede Kante bleibt auf ihren Typ und ihre Quellnotiz zurückführbar. `Refresh graph` aktualisiert nur die lokale Projektion und schreibt nie in den Vault.

### Nicht enthalten

- Keine semantisch oder durch Sprachmodelle abgeleiteten Kanten und keine Vektorsuche.
- Keine Inhalts- oder OCR-Extraktion aus Anhängen; Sprint 9 benötigt dafür zuerst den in SRP-000001 geforderten Packaging-ADR.
- Keine Änderungen an Notizen, Links, Tags oder Properties.
- Kein externes Netzwerk, Provider-Consent oder neues Visualisierungsframework.

## 2. Informationsarchitektur

```text
Second Brain
└─ Graph
   ├─ Graph canvas (ergänzende Visualisierung)
   ├─ Relationship list (vollwertige Alternative)
   ├─ Node detail
   │  ├─ Note metadata
   │  └─ Direct relationships with evidence
   └─ Filters and refresh
```

Der Ribbon- und Command-Palette-Eintrag heißt `Open local graph`. Die bestehende Relationship-Ansicht kann mit `Show in graph` zum ausgewählten Knoten wechseln. Ein Knotenname ist nie der einzige Informationsträger: Detail und Liste nennen immer Relationstyp, Richtung und Quelle.

## 3. User Journeys

### Journey 1: Aktive Notiz im lokalen Graphen erkunden

**Startpunkt:** Eine geöffnete, indexierte Notiz oder `Open local graph`.  
**Ziel:** Direkte, belegbare Zusammenhänge erkennen und eine verbundene Notiz öffnen.

| Schritt | Nutzeraktion | Systemreaktion | UI-State danach |
|---:|---|---|---|
| 1 | Nutzer wählt `Show in graph` oder öffnet die Graphansicht. | Der lokale Index wird für die aktive Notiz abgefragt. | Loading |
| 2 | Daten liegen vor. | Canvas, Beziehungsfilter und gleichwertige Liste zeigen den Fokus-Knoten. | Ready |
| 3 | Nutzer aktiviert einen Knoten oder Listeneintrag. | Detailbereich nennt Notiz, Richtung, Typ, Quelle und Fundstelle. | Node selected |
| 4 | Nutzer wählt `Open note`. | Obsidian öffnet die zugrunde liegende Vault-Notiz. | Note opened |
| 5 | Nutzer wählt `Back to focused note`. | Der Fokus wechselt zur vorherigen Notiz, ohne die Filter zu verlieren. | Ready |

**Abbruchpunkte:** Schließt der Nutzer die Ansicht, wird weder Index noch Vault verändert. Nicht indexierte oder nicht vorhandene Ziele bleiben als `Unresolved link` sichtbar und sind nicht als Notiz öffnbar.

### Journey 2: Beziehungen eingrenzen und Herkunft prüfen

| Schritt | Nutzeraktion | Systemreaktion | UI-State danach |
|---:|---|---|---|
| 1 | Nutzer öffnet `Relationship types`. | Checkboxen für Wiki links, Backlinks, Tags und Properties erscheinen. | Filters open |
| 2 | Nutzer deaktiviert einen Typ. | Canvas und Liste erhalten dieselbe Filterung; der Fokus-Knoten bleibt sichtbar. | Filtered |
| 3 | Nutzer aktiviert eine Kante in Liste oder Canvas. | Details zeigen Typ, Richtung, Quellnotiz und Fundstelle. | Evidence shown |
| 4 | Nutzer wählt `Clear filters`. | Alle belegten direkten Beziehungen erscheinen wieder. | Ready |

### Journey 3: Leeren, veralteten oder nicht verfügbaren Graphen sicher behandeln

| Schritt | Nutzeraktion | Systemreaktion | UI-State danach |
|---:|---|---|---|
| 1 | Für die aktive Notiz gibt es keine Beziehungen. | Die Ansicht zeigt einen erklärenden Empty State statt eines leeren Canvas ohne Kontext. | Empty |
| 2 | Der Index meldet eine neuere Revision oder der Nutzer wählt `Refresh graph`. | Vorherige Daten bleiben lesbar; ein Status zeigt die Aktualisierung an. | Refreshing |
| 3 | Aktualisierung gelingt. | Canvas, Liste und Zeitstempel wechseln gemeinsam auf die neue Revision. | Ready |
| 4 | Sidecar oder Index ist nicht erreichbar. | Vorherige Daten werden als möglicherweise veraltet markiert oder ein Offline-State erscheint. | Offline / stale |
| 5 | Nutzer wählt `Try again`. | Nur der lesende Graphabruf wird wiederholt. | Loading |

## 4. View: Local graph

**Zweck:** Direkte lokale Beziehungen einer Notiz visualisieren, ohne die zugängliche Liste zu ersetzen.  
**Erreichbar von:** Ribbon, Command Palette, Relationship-Ansicht und einer aktiven Notiz.  
**Führt zu:** Öffnen einer bestehenden Note; die Graphansicht bleibt dabei verfügbar.

### Layout-Skizze ab 900 px

```text
┌─ Local graph ─────────────────────────────────────────────────────────────┐
│ [Search visible nodes…] [Relationship types ▾] [Refresh graph]            │
│ Focus: Project Atlas                                  Indexed 10:42        │
├───────────────────────────────┬────────────────────────────────────────────┤
│ GRAPH CANVAS                  │ NODE DETAILS                               │
│       ○ Research              │ Project Atlas                              │
│       │                       │ [Open note] [Show relationships]           │
│   ○ Atlas ── ○ Decisions      │ Direct relationships (4)                   │
│       │                       │ → Wiki link · Decisions · Atlas.md:12     │
│       ○ Tasks                 │ ← Backlink · Research · Research.md:8     │
├───────────────────────────────┴────────────────────────────────────────────┤
│ RELATIONSHIP LIST (keyboard alternative)                                   │
│ [→] Wiki link to Decisions — source: Atlas.md:12   [Open note]             │
│ [←] Backlink from Research — source: Research.md:8 [Open note]             │
└────────────────────────────────────────────────────────────────────────────┘
```

Bei weniger als 900 px stehen Detail und Relationship list vor dem Canvas in einer einspaltigen, vertikal scrollenden Reihenfolge. Bei weniger als 640 px wird der Canvas standardmäßig eingeklappt; `Show graph canvas` bleibt verfügbar. Die Liste ist dort die primäre Exploration.

### UI-Zustände

| State | Auslöser | Darstellung | Erlaubte Aktionen |
|---|---|---|---|
| Loading | View öffnet oder Retry | `Loading local graph…`; keine leere Beziehungsliste vortäuschen | View schließen |
| Ready | Lokale Projektion verfügbar | Canvas, Liste, Zeitstempel und ausgewählter Knoten | Filtern, Knoten/Liste wählen, Note öffnen, Refresh |
| Empty | Keine direkten, indexierten Beziehungen | Erklärung und `Refresh graph` | Refresh, aktive Note öffnen |
| Filtered empty | Filter blenden alle Beziehungen aus | `No relationships match these filters.` und `Clear filters` | Filter ändern, zurücksetzen |
| Refreshing | Manueller oder erkannter Index-Refresh | Bestehende Liste bleibt sichtbar; Status `Refreshing local graph…` | Lesen, Ansicht schließen |
| Stale | Bekannte neuere Indexrevision | Hinweis `Graph data changed. Refresh to view current relationships.` | Refresh, bisherige Daten lesen |
| Offline | Sidecar nicht erreichbar | `The local graph is unavailable while the local service is offline.` | `Try again`, Details |
| Error | Validierter lokaler Lesefehler | Sachliche Ursache mit `Try again`; keine Mutation angeboten | Retry, Details |

Unaufgelöste Links sind gestrichelt und mit Text `Unresolved link` gekennzeichnet. Sie erhalten keinen `Open note`-Button. Keine Visualisierung darf eine Richtung, einen Typ oder eine Quelle allein durch Farbe ausdrücken.

### Microcopy

| Element | Text (EN) | Hinweise |
|---|---|---|
| View title | `Local graph` | Benennt den lokalen Geltungsbereich. |
| Einstieg | `Open local graph` | Ribbon/Command Palette. |
| Hilfetext | `Explore explicit links, tags, and properties from your vault.` | Keine Inferenz suggerieren. |
| Primäraktion | `Refresh graph` | Lesende Aktualisierung, keine Vault-Änderung. |
| Detailaktion | `Open note` | Nur für vorhandene, erlaubte Ziele. |
| Empty state | `No indexed relationships are available for this note yet.` | Nächster Schritt: Refresh. |
| Filtered empty | `No relationships match these filters.` | `Clear filters` anbieten. |
| Offline | `The local graph is unavailable while the local service is offline.` | Technisch präzise, ohne einen Schreibfehler zu behaupten. |
| Stale | `Graph data changed. Refresh to view current relationships.` | Bestehende Daten nicht als aktuell ausgeben. |
| Unresolved | `Unresolved link` | Nicht als Fehler oder Beziehung zu einer Note ausgeben. |

## 5. Accessibility-Anforderungen

**WCAG-Ziel:** 2.2 AA.

| Anforderung | Gilt für | Umsetzungshinweis |
|---|---|---|
| Gleichwertige Bedienung | Canvas und Liste | Jede Canvas-Kante und jeder Knoten sind als strukturierte, tastaturbedienbare Liste verfügbar. |
| Tastaturpfad | Alle Aktionen | Tab-Reihenfolge: Toolbar, Detailaktionen, Relationship list; Pfeiltasten nur innerhalb klar fokussierter Listen. |
| Fokus | Filter, Buttons, Listen, Canvas-Steuerung | Sichtbarer Fokus; nach `Open note` kehrt der Fokus kontrolliert zur auslösenden Aktion zurück. |
| Semantik | Beziehungen | Richtung und Typ als Text (`to`, `from`, `Wiki link`, `Backlink`) ausgeben, nicht nur per Linienform/Farbe. |
| Live-Status | Loading, refresh, error | Nicht störende Statusregion für Lade-/Erfolgswechsel; Fehler mit `role=alert`. |
| Kontrast | Kanten, Filter, Hinweise | Textkontrast mindestens 4.5:1; Kanten unterscheiden sich zusätzlich über Text/Pattern. |
| Bewegung | Canvas | Keine zwingende Animation; Simulationen respektieren `prefers-reduced-motion`. |
| Zoom/Reflow | Seitenleiste | Bei 200 % Zoom und 320 CSS-Pixeln bleibt die Liste vollständig nutzbar; keine horizontale Pflichtnavigation. |

## 6. Animationen und Übergänge

| Element | Übergang | Dauer | Accessibility-Note |
|---|---|---:|---|
| Canvas-Update | Dezentes Ein-/Ausblenden | maximal 150 ms | Bei `prefers-reduced-motion` sofort wechseln. |
| Detailwechsel | Sofortiger Textwechsel | 0 ms | Fokus und Lesereihenfolge bleiben stabil. |
| Refresh | Statuswechsel | 0 ms | Keine blockierende Animation; alte Daten bleiben eindeutig als alt erkennbar. |

## 7. Design-System-Referenzen

**Verwendetes Design-System:** Native Obsidian-Komponenten und CSS-Variablen gemäß ADR-000001.

| Komponente | Referenz | Abweichung |
|---|---|---|
| Toolbar | Obsidian Button / Dropdown | Textlabels bleiben neben Icon-Aktionen sichtbar oder als zugänglicher Name vorhanden. |
| Relationship list | Bestehende Relationship-Ansicht | Erweitert nur um graphbezogenen Fokus und `Show in graph`. |
| Statusbereich | Bestehende lokale Service-Fehlerbehandlung | Nutzt die vereinbarte, präzise Offline-Meldung. |

## 8. Offene Fragen

| # | Frage | Verantwortlich | Status |
|---:|---|---|---|
| 1 | Welche Canvas-Bibliothek bzw. native Renderstrategie erfüllt die Bedienbarkeit ohne neue Runtime? | FE | Im Refinement entscheiden; kein BLOCKER, da die Liste vollständig nutzbar bleibt. |
| 2 | Welche sicheren Anhang-Metadaten gehören in Sprint 8 sichtbar in den Knotendetails? | BA+FE+BE | Im Refinement schneiden; keine Extraktion oder Semantik voraussetzen. |

## Definition of Done

- [x] Primäre Journeys für Exploration, Filterung und Fehler-Recovery dokumentiert.
- [x] Ready-, Empty-, Loading-, Refresh-, Stale-, Offline- und Fehlerzustände beschrieben.
- [x] Canvas und vollständige Tastaturalternative verbindlich festgelegt.
- [x] Englische Microcopy und responsive Strategie festgelegt.
- [x] Semantik, Anhangsextraktion, Vault-Mutationen und externe Datenflüsse ausgeschlossen.
- [x] UX-Index und Projektindex aktualisiert.

---

## Übergabe: UX → BA+FE+BE

**Datum:** 2026-08-19  
**Von:** UX Designer (UX)  
**An:** Business Analyst, Frontend Developer und Backend Developer (BA+FE+BE)  
**Nächster Befehl:** `/refine second-brain 8`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| UX-000005 | APPROVED | `ux/UX-000005-graph-exploration.md` | Lokale Graphansicht, zugängliche Beziehungsliste, Zustände und Microcopy. |

### Kritische Informationen für Empfänger

- Der Canvas ergänzt die Relationship list; sie darf sie funktional oder per Tastatur nicht ersetzen.
- Nur vorhandene, explizite lokale Beziehungen aus dem Index erscheinen als Kanten.
- `Refresh graph` ist strikt lesend. Offline, stale und unaufgelöste Ziele bleiben sichtbar vom Erfolgszustand getrennt.

### Offene Fragen (vererbt)

| # | Frage | Ursprung | Kritikalität | An wen |
|---:|---|---|---|---|
| 1 | Canvas-Renderstrategie ohne neue unkontrollierte Runtime | UX-000005 | MINOR | FE |
| 2 | Zulässige Sprint-8-Anhang-Metadaten | UX-000005 / SRP-000001 | MINOR | BA+FE+BE |

### Nicht-Ziele (explizit ausgeschlossen)

- Semantische Suche, Embeddings und Anhangstext-Extraktion.
- Automatisch abgeleitete Beziehungen, Vault-Mutationen, externe Provider oder Netzverkehr.

### Empfehlungen

- Im Refinement zuerst den vorhandenen Relationship-Vertrag und die zugängliche Liste als Prüfbasis nutzen; erst danach die Canvas-Darstellung integrieren.

---

*Erstellt von: UX-Agent | Datum: 2026-08-19 | Version: 1.0*
