---
id: RV-000011
title: Review Second Brain Sprint 8 Local Graph
version: 1.0
status: REQUEST_CHANGES
author-agent: RV (Code Reviewer)
date: 2026-08-20
project: second-brain
sprint: 8
reviewed-stories: US-000004@1.0, US-000013@1.0
qa-report: TR-000014@1.0
supersedes: —
superseded-by: —
---

# Review: Second Brain — Sprint 8 Local Graph

## Review-Übersicht

| Eigenschaft | Wert |
|---|---|
| Branch | `feature/sprint-6` |
| Reviewed Commit | `84a146d` plus nicht eingecheckter Sprint-8-Diff |
| Reviewer-Agent | RV |
| QA-Freigabe | CONDITIONAL |
| Nutzerabnahme | **ACCEPTED** |
| Technischer Review | **REQUEST CHANGES** |
| Gesamtentscheidung | **REQUEST CHANGES** |

## Teil 1: Nutzerabnahme

### Durchgeführter Test-Guide

1. Lokalen Graphen einer Notiz mit Wiki-Link, Tag oder Property öffnen und aktualisieren.
2. Filter zwischen Canvas und Liste vergleichen, Filter zurücksetzen und ein Ziel öffnen.
3. Aus der Relationship-Ansicht zum Graphen wechseln, Offline-Refresh prüfen und per Tastatur bedienen.

### Interview-Ergebnis

| Feature | Funktioniert? | Nutzer-Befund | Anmerkung |
|---|---|---|---|
| US-000004 – Lokaler Graph | Ja | ACCEPTED | „Alles funktioniert. Abnahme erfolgt.“ |
| US-000013 – Relationship-Regression | Ja | ACCEPTED | Wechsel in den Graphen und Listenalternative funktionieren. |

**Nutzerabnahme: ACCEPTED.** Es gab keine neuen Feedback-Items; ein Wiederholungs-Check
gegen frühere Reviews oder `DECISIONS.md` ist daher nicht auszulösen.

## Teil 2: Technisches Code Review

### Dimension 1: Korrektheit

| Kriterium | Status | Anmerkung |
|---|---|---|
| US-Akzeptanzkriterien im Kern implementiert | ❌ | Begrenzte Canvas-Projektion wird nicht transparent gemacht |
| Vertrag und Implementierung konsistent | ✅ | Zod-Contract validiert read-only Fokus, Knoten und Kanten |
| Edge Cases | ❌ | Quellenfundstelle und maximale sichtbare Nachbarschaft unvollständig |
| Fehlerbehandlung | ✅ | Offline wird spezifisch, andere Fehler als Retry-Hinweis dargestellt |

| # | Kategorie | Datei:Zeile | Problem | Empfehlung |
|---|---|---|---|---|
| K-001 | MAJOR | `apps/obsidian-plugin/src/ui/local-graph-view.ts:181` | `relationships.slice(0, 12)` zeigt bei bis zu 100 erlaubten direkten Beziehungen nur zwölf Canvas-Kanten, ohne Zähler oder Hinweis. Das verletzt UX-000005: Canvas und Liste müssen dieselbe gefilterte Menge nachvollziehbar darstellen, und TC-001011 verbietet falsche Vollständigkeitsbehauptungen. | Canvas für alle begrenzten Kanten skalieren/paginieren oder sichtbar „12 von N Beziehungen dargestellt“ anzeigen; mit >12-Kanten-Test absichern. |
| K-002 | MAJOR | `apps/obsidian-plugin/src/ui/local-graph-view.ts:206` | Die Liste zeigt nur `Source: <Pfad>`, nicht die im Vertrag vorhandene Fundstelle (`source.line`/Property). UX-000005 verlangt für jede Kante Herkunft und Fundstelle. | Zeile bzw. Property im Listeneintrag ausgeben und in den Detail-/Filtertests prüfen. |

### Dimension 2: Sicherheit

| Kriterium | Status | Anmerkung |
|---|---|---|
| Input-Validierung | ✅ | Plugin-Client und Sidecar validieren über den versionierten Zod-Vertrag; Vault-Root bleibt bestehende Grenze |
| Secrets/Credentials | ✅ | Keine neuen Secrets oder externen Dienste |
| Injection/SQL | ✅ | Parametrisierte SQLite-Queries; SVG-Texte werden per `textContent` gesetzt |
| Sensible Daten/Logging | ✅ | Kein neuer Inhalt- oder Netzwerklogpfad |
| Geschützte Ressource Coverage-Check | N/A | Neuer Pfad ist rein lesend, führt keine Mutation oder Berechtigungserweiterung ein |

### Dimension 3: ADR-Konformität

| ADR | Eingehalten? | Anmerkung |
|---|---|---|
| ADR-000001 | ✅ | TypeScript, nativer Obsidian-View, lokaler Node-Sidecar und keine neue Runtime |
| ADR-000003 | ✅ | SQLite bleibt abgeleitete lokale Projektion; Vault bleibt Source of Truth |
| SRP-000001 | ✅ | Keine Vektorsuche oder Anhangsextraktion implementiert |

### Dimension 4: Code-Qualität

| Kriterium | Status | Anmerkung |
|---|---|---|
| Header und öffentliche Kommentare | ✅ | Vorhanden |
| Typisierung und Namensgebung | ✅ | Keine `any`; Transport- und Contractgrenze klar |
| Toter Code/Magic Numbers | ❌ | Die Canvas-Grenze `12` ist unkommentiert und nicht als Produktbegrenzung sichtbar |
| Lint | ✅ | Laut QA/FE-BE-Nachweis grün |

### Dimension 5: Testabdeckung

| Kriterium | Status | Anmerkung |
|---|---|---|
| Unit- und Index-Tests | ✅ | 6/6 Sprinttests grün; Contract, Missing, Anhang und Delta abgedeckt |
| Fehlerfall pro Kernfunktion | ❌ | Keine Testabdeckung der tatsächlichen `NodeSetupTransport`-Operation `--local-graph` |
| E2E für kritischen Graphflow | ❌ | Keine `local-graph.spec.ts`; Nutzerabnahme ersetzt keinen wiederholbaren Regressionstest |
| Coverage-Ziel | ❌ | Vollständiger aktueller Coverage-Report fehlt; gezielter Lauf ist nicht global aussagekräftig |

| # | Kategorie | Bereich | Problem | Empfehlung |
|---|---|---|---|---|
| T-001 | MAJOR | Plugin-/Sidecar-Grenze und Graph-UI | Der neue `--local-graph`-Aufruf und die Canvas-/Listen-Gleichheit sind nicht automatisiert regressionsgesichert. | Transport-Integrationstest plus UI-/E2E-Test für >12 Kanten, Filter, Fundstelle und Offline ergänzen; vollständige Coverage danach erfassen. |

### Dimension 6: Performance und Wartbarkeit

| Kriterium | Status | Anmerkung |
|---|---|---|
| Keine offensichtliche N+1-Query im Standardpfad | ✅ | Bei Standardlimit 100 akzeptabel; Knotendetails sind lokal und begrenzt |
| Wartbarkeit | ✅ | Contract → Transport → Index → View ist nachvollziehbar getrennt |
| Performance-Nachweis | ❌ | QA-PERF-001001–001004 wurden nicht gemessen |

| # | Kategorie | Datei:Zeile | Problem | Empfehlung |
|---|---|---|---|---|
| P-001 | MINOR | `testing/TP-000010-sprint-8-local-graph.md` | Für die begrenzte Graphprojektion fehlt die geplante Ausgangsmessung. | 30-Abruf- und 100-Kanten-Messung im Nachtest dokumentieren. |

## Zusammenfassung

| Schweregrad | Anzahl |
|---|---:|
| BLOCKER | 0 |
| MAJOR | 3 |
| MINOR | 1 |
| SUGGESTION | 0 |

### Gesamtentscheidung

**REQUEST CHANGES.** Die Nutzerabnahme ist ACCEPTED und die Read-only-Architektur ist
konform. Vor Merge müssen jedoch K-001, K-002 und T-001 behoben beziehungsweise durch
Regressionstests abgesichert sein. P-001 bleibt als Nachtest-Auflage bestehen.

### Technische Schulden

Keine neue Schuld erfasst: Alle MAJORs gehören zur fertigen Sprint-8-Funktion und sind vor
einer technischen Freigabe zu beheben.

## Definition-of-Done-Selbstprüfung

- [x] Test-Guide und Nutzerinterview durchgeführt.
- [x] Nutzerbefund je Sprint-Story dokumentiert.
- [x] Sechs technische Dimensionen und Change-Impact geprüft.
- [x] ADR- und Constitution-Konformität geprüft.
- [x] Jede Anmerkung hat Kategorie, Fundstelle und Empfehlung.
- [x] Review-Bericht und Reviews-Index aktualisiert.
- [ ] Kein MAJOR offen — **OFFEN: K-001, K-002, T-001**.

---

## Übergabe: RV → FE+BE

**Datum:** 2026-08-20  
**Von:** Code Reviewer (RV)  
**An:** Frontend- und Backend-Development (FE+BE)  
**Nächster Befehl:** `/implement all second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|
| RV-000011 | REQUEST_CHANGES | `reviews/RV-000011-sprint-8-local-graph.md` | Drei MAJORs und eine MINOR-Auflage |
| TR-000014 | CONDITIONAL | `testing/TR-000014-sprint-8-local-graph.md` | Nutzerabnahme später ACCEPTED; technische E2E-/Performance-Lücken bleiben relevant |

### Kritische Informationen für Empfänger

- K-001 und K-002 sind sichtbare UX-/Nachvollziehbarkeitslücken, nicht nur Testlücken.
- T-001 verlangt einen echten Transporttest und wiederholbare UI-Regressionen.
- Keine semantischen Kanten, Extraktion oder Vault-Mutation als Teil der Korrektur ergänzen.

### Offene Fragen

Keine fachliche Frage: Die Akzeptanzkriterien und die konkrete Korrekturrichtung sind eindeutig.

### Nicht-Ziele

Kein Redesign, keine neue Graphbibliothek, keine semantische Suche oder Anhangsextraktion.

### Empfehlungen

K-001/K-002 zuerst im Frontend beheben, anschließend Transporttest und E2E ergänzen und
den Testlauf inklusive Performance-Baseline wiederholen.

---

*Erstellt von: RV-Agent | Datum: 2026-08-20 | Version: 1.0*
