---
id: RETRO-000001
title: Sprint-Retrospektive — Sprint 1 — Second Brain
version: 1.0
status: REVIEW
author-agent: AC (Agile Coach)
date: 2026-07-31
project: second-brain
sprint: 1
based-on: .phase, SP-000001, SP-000002, TR-000001, TR-000002, TR-000003, RV-000001, RV-000002
supersedes: —
superseded-by: —
---

# Sprint-Retrospektive: Sprint 1 — Second Brain

## Sprint-Überblick

| Feld | Wert |
|---|---|
| Sprint | 1 |
| Zeitraum | 2026-07-30 bis 2026-07-31 |
| Geplante Stories | 2 |
| Abgeschlossene Stories | 2 |
| Liefergrad | 100 % |
| Reguläre Gates am Ende bestanden | 9/9 |
| Fehlgeschlagene/abgelehnte Gate-Läufe | 4 |
| Offene BLOCKER am Ende | 0 |

## 1. Prozess-Fluss

Alle Hauptphasen wurden innerhalb eines Tages durchlaufen; die Dokumentation folgte am
nächsten Tag. Die Zeitstempel erlauben keine belastbare Stundenanalyse. Aussagekräftig ist
die Anzahl der Rückläufe:

| Abschnitt | Ergebnis | Rücklauf | Bewertung |
|---|---|---|---|
| Discovery bis Refinement | Gates 1–5 PASS | keiner | stabil |
| Analyse | erster Lauf FAIL | zurück zu BA/UX/Refinement | fachlich nützlich, als eigene Phase schwergewichtig |
| Implementierung | Gate 6 PASS | keiner | stabil |
| Testing | erster Gate-7-Lauf FAIL mit 2 BLOCKERN | FE/BE → QA | notwendig; nicht installierbares Paket und ungültiger Startpfad |
| Review | REQUEST_CHANGES, danach REJECTED | FE/BE → QA → RV | notwendig; 8 MAJOR-Funde und veralteter Plugin-Laufzeitzustand |
| Dokumentation | Gate 9 PASS mit 1 MINOR | keiner | stabil |

Die Wiederholungen hatten zwei Ursachenklassen:

1. **Qualitätssicherung mit hohem Nutzen:** Testing und Review fanden auslieferungsrelevante
   Fehler und schützten Datenintegrität sowie Bedienbarkeit.
2. **Orchestrierungsreibung:** Freigabe und nächster Phasenstart wurden getrennt behandelt,
   obwohl der Nutzer durch den Folge-Command bereits eindeutig fortfahren wollte.

## 2. Artefakt-Qualität

| Artefakt | Bewertung | Überarbeitungen | Auffälligkeit |
|---|---|---:|---|
| SB/CON/REQ | Gut | 0 | stabiler Scope und Sicherheitsrahmen |
| US | Mittel | 1 neuer Slice | US-000001 war als Sprint-Commit zu breit; US-000011 wurde ergänzt |
| ADR/STRUCTURE | Gut | 0 | trug die späteren Qualitätsprüfungen |
| UX | Gut | 1 Ergänzung | UX-000002 präzisierte den Claude-Desktop-Slice |
| SP | Mittel | 1 Ersatz | SP-000001 wurde nach Gate 5.5 durch SP-000002 ersetzt |
| TP/TR/BUG | Gut | mehrere Testläufe | BLOCKER waren reproduzierbar und mit Root Cause dokumentiert |
| RV | Gut | 1 Re-Review plus korrigierte Abnahme | hoher Nutzen, aber viele Nutzerbestätigungen |
| DOC/RN/GS | Gut | 0 | 2/2 Sprint-Stories abgedeckt |

Der zentrale Artefaktmangel lag nicht in fehlender Detailtiefe, sondern in der fehlenden
Unterscheidung zwischen einer produktweiten Umbrella-Story und einem lieferbaren
Sprint-Slice. Das hätte bereits beim Refinement erkannt werden können.

## 3. Agenten-Performance und Übergaben

| Übergabe | Qualität | Nacharbeit | Ursache |
|---|---|---|---|
| PM → BA | Gut | nein | Scope und Constitution klar |
| BA → AR | Gut | nein | NFRs und Stories vollständig |
| AR → UX | Gut | nein | Architekturentscheidungen verbindlich |
| UX/BA/FE/BE → ORCH | Mittel | ja | Sprint plante zunächst die zu breite US-000001 |
| FE/BE → QA | Mittel | ja | Paketvertrag und echter Electron/Node-Pfad fehlten |
| QA → RV | Gut | ja | QA PASS genügte nicht; Review fand zusätzliche Produkt- und Qualitätslücken |
| RV → FE/BE | Gut | ja | acht konkrete MAJOR-Funde mit Root Causes |
| RV → MW | Gut | nein | Plugin-Neustart und offene Schuld klar übergeben |

Die Handoffs waren überwiegend informativ. Die Reibung entstand weniger durch
Informationsverlust als durch zu viele separate Bestätigungs- und Aktivierungsmomente.

## 4. Entscheidungsqualität

**Bewährt:**

- D-000001 (MCP-first) und D-000002 (Windows zuerst) hielten Sprint 1 fokussiert.
- D-000003/D-000004 sowie die Constitution schützten lokale Daten und Vault-Grenzen.
- Der enge US-000011-Slice war nach seiner verspäteten Einführung die richtige
  Lieferentscheidung.

**Zu spät getroffen:**

- Die Trennung zwischen Umbrella-Story US-000001 und dem Claude-Desktop-Lieferslice hätte
  vor Freigabe von SP-000001 erfolgen sollen.
- Der installierbare Paketvertrag und der echte Obsidian/Node-Prozesspfad hätten vor Gate 6
  als verpflichtende vertikale Smoke-Checks feststehen sollen.

**Nicht bereut:**

- Kein Eintrag in DECISIONS.md wurde revidiert.
- Die Rückläufe aus Testing und Review waren trotz Aufwand qualitätswirksam.

## 5. Nutzer-Perspektive

**Wo fühlte sich der Prozess am stärksten wie Widerstand an?**

> Manually having to accept everything before I can start a new phase, when the command to
> start the new phase itself should be affirmation of the prior step's artifacts.

**Was war überraschend?**

> The need to repeat phases.

**Welcher Schritt wirkte überflüssig?**

> The /analyze phase.

Diagnose: Der Prozess trennt Zustimmung und Folgehandlung künstlich. `/analyze` hatte in
Sprint 1 zwar einen fachlichen Fund, sollte aber keine obligatorische, eigenständig
anzustoßende Phase sein. Seine Prüfung gehört in den Übergang vom Refinement zur
Implementierung.

## 6. Keep / Stop / Start

### KEEP

| # | Was | Warum |
|---|---|---|
| K1 | Reproduzierbare Gate-Funde mit Root-Cause und Regressionstest | Beide Gate-7-BLOCKER wurden nachweisbar behoben |
| K2 | Echter Desktop-Test plus Nutzerabnahme | Erkannte veralteten Plugin-Zustand und echte Bedienprobleme |
| K3 | Isolierter Sprint-Worktree | Rückläufe blieben vom Hauptbranch getrennt und nachvollziehbar |

### STOP

| # | Was | Warum | Ersatz |
|---|---|---|---|
| S1 | Separate manuelle Freigabe unmittelbar vor einem Folge-Command | doppelte Willensbekundung ohne zusätzlichen Informationsgewinn | Folge-Command bestätigt REVIEW-Artefakte implizit |
| S2 | Obligatorischer eigenständiger `/analyze`-Aufruf | zusätzlicher Phasenwechsel und Freigabepunkt | Gate-5.5-Prüfung beim Start von `/implement` |
| S3 | Erneute Vollphasen-Ausführung für klar begrenzte Gate-Funde | erzeugt Wiederholung außerhalb des betroffenen Deltas | gezielter Korrektur-/Nachtestlauf mit Fund-IDs |

### START

| # | Was | Warum | Aufwand |
|---|---|---|---|
| ST1 | Approval-by-transition | Folge-Command ist eindeutige Zustimmung, sofern keine BLOCKER/MAJOR offen sind | M |
| ST2 | Eingebaute Konsistenzprüfung vor Implementierung | erhält den Nutzen von Gate 5.5 ohne eigene Nutzerphase | M |
| ST3 | Delta-basierte Rückläufe | nur betroffene Kriterien, Tests und Review-Funde erneut prüfen | M |

## 7. Verbesserungsvorschläge

### Sofortige Quick Wins für Sprint 2

| # | Vorschlag | Betroffene Datei | Aufwand |
|---|---|---|---|
| QW1 | Beim Start eines Folge-Commands REVIEW-Artefakte als implizit freigegeben behandeln | `.claude/commands/*.md`, `toolchain/agents/_base-agent.md` | M |
| QW2 | `/analyze` nicht als separaten Nutzerbefehl im Standardpfad verlangen | `toolchain/workflows/full-sprint.md` | M |
| QW3 | Gate-Rückläufe mit konkreten Fund-IDs und reduziertem Prüfbereich übergeben | `toolchain/protocols/gate-protocol.md` | S |

### Mittelfristig

| # | Vorschlag | Betroffene Datei | Aufwand |
|---|---|---|---|
| M1 | Zustandsmodell um `approval-source: explicit-command` ergänzen | `toolchain/agents/orchestrator.md`, `.phase`-Format | M |
| M2 | Nach zwei Sprints messen, ob Durchlaufzeit sinkt ohne mehr Review-Funde | `toolchain/templates/retrospective.md` | S |

### Watchlist

- Anzahl der Nutzerinteraktionen pro Phase.
- Anteil wiederholter Phasen, die nur Freigabe statt neuer Evidenz erzeugen.
- Review-Funde, die durch die integrierte Konsistenzprüfung hätten verhindert werden können.
- Risiko, dass ein versehentlich eingegebener Folge-Command unbeabsichtigt Artefakte
  freigibt; Schutz durch sichtbare Zusammenfassung und Hard-Stop bei offenen BLOCKERN.

## 8. Process Change Proposals

| PC-ID | Titel | Priorität | Status |
|---|---|---|---|
| PC-000001 | Implizite Freigabe und integrierte Analyse | Hoch | DRAFT |

## Definition of Done

- [x] Alle relevanten Sprint-Artefakte gelesen.
- [x] Drei Nutzerfragen gestellt und beantwortet.
- [x] Prozessfluss, Artefakte, Übergaben, Entscheidungen und Nutzerperspektive analysiert.
- [x] Keep/Stop/Start mit jeweils mindestens zwei Punkten dokumentiert.
- [x] Konkrete Vorschläge mit Dateireferenzen erstellt.
- [x] PC-000001 für die strukturelle Änderung erstellt.
- [x] Constitution geprüft; kein Konflikt.
- [x] `retros/INDEX.md` und Projekt-`INDEX.md` aktualisiert.

---

## Übergabe an den Nutzer

### Sofort ändern

PC-000001 prüfen und bei Zustimmung zur Umsetzung freigeben.

### Mittelfristig

Approval-by-transition und integrierte Analyse in Sprint 2 erproben.

### Beobachten

Ob weniger separate Freigaben die Gate-Qualität beeinflussen oder lediglich Reibung abbauen.

---

*Erstellt von: AC-Agent | Datum: 2026-07-31 | Sprint: 1*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-07-31 | Initiale Retrospektive | AC |
