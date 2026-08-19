---
id: REQ-000002
title: Sprint-7-Korrektur — MCP-first Wissenskompilierung
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst)
date: 2026-08-15
project: second-brain
based-on: SB-000001, CON-000001, REQ-000001, RV-000008, Nutzerfeedback vom 2026-08-15
supersedes: —
superseded-by: —
---

# REQ-000002: Sprint-7-Korrektur — MCP-first Wissenskompilierung

## 1. Anlass und Ziel

Sprint 7 wurde in RV-000008 abgelehnt, weil der gelieferte Kompilierungsablauf interne
API-Parameter als manuelle Benutzereingaben gezeigt hat. Das widerspricht dem MCP-first-
Produktversprechen: Der KI-Client kennt Quellen, Ziel und Entwurf bereits und muss diese
Informationen direkt an das Produkt übergeben können.

Diese Ergänzung präzisiert REQ-000001 F-016 und F-017. Sie verändert weder den bestätigten
Human-in-the-Loop-Grundsatz noch den akzeptierten fachlichen Umfang von US-000016 und
US-000008.

## 2. Verbindlicher Nutzerablauf

1. Der Nutzer beauftragt seinen verbundenen MCP-Client mit einer Wissenskompilierung.
2. Der Client liest die freigegebenen Quellen und übermittelt einen vollständigen Vorschlag
   mit Ziel, Inhalt und Provenienz an das Produkt.
3. Das Produkt speichert den Vorschlag als `Pending Confirmation` und signalisiert Obsidian,
   dass eine neue Prüfung bereitsteht.
4. Der Nutzer öffnet den ausstehenden Vorschlag in Obsidian und prüft Diff, Quellen,
   Zielnotiz, Links, Properties, Vorlage, Warnungen und Konflikte.
5. Der Nutzer bestätigt oder verwirft genau diesen Vorschlag. Nur die Bestätigung darf die
   eine angezeigte Markdown-Zielnotiz verändern.
6. Historie und Rollback zeigen das tatsächliche Ergebnis einschließlich abgebrochener oder
   unvollständiger Vorgänge.

## 3. Funktionale Anforderungen

| ID | Anforderung | Priorität | US-Referenz |
|---|---|---|---|
| F-025 | Ein autorisierter MCP-Client muss einen vollständigen Kompilierungsvorschlag als persistenten Zustand `Pending Confirmation` einreichen können. | Must | US-000017 |
| F-026 | Für einen MCP-seitig eingereichten Vorschlag darf die Obsidian-UI weder einen technischen Vault-Pfad noch den vollständigen Markdown-Inhalt erneut als Pflichtangabe verlangen. | Must | US-000017 |
| F-027 | Die Prüfung muss Client und Vault, getrennte Quell- und Zielangaben, Diff, Links, Properties, Quell-Hashes, Vorlagenprovenienz sowie konkrete Sicherheits- und Konfliktwarnungen anzeigen. | Must | US-000017, US-000016 |
| F-028 | Bestätigen und Verwerfen müssen sich auf genau den angezeigten, unveränderten Vorschlag beziehen; Drift, abgelaufene oder erneut verwendete Bestätigungen müssen ohne Mutation scheitern. | Must | US-000017 |
| F-029 | Projektvorlagen müssen unter `.second-brain/templates/` versioniert gespeichert, aufgelistet, gelesen, ausgewählt und in späteren Kompilierungen wiederverwendet werden können. | Must | US-000016 |
| F-030 | Die lokale Historie muss erfolgreiche, abgelehnte, fehlgeschlagene und `Incomplete`-Vorgänge sowie den tatsächlichen Rollback-Status korrekt unterscheiden. | Must | US-000008 |
| F-031 | Ausstehende Vorschläge, Vorschauartefakte und Bindungen müssen durch dokumentierte Höchstgrenzen und Aufbewahrungsregeln begrenzt sein, ohne bestätigungspflichtige Einträge vorzeitig zu verlieren. | Must | US-000017 |
| F-032 | Fehlende oder ungültige fachliche Eingaben müssen am betroffenen Feld verständlich erklärt werden; generische interne Fehler wie `INVALID_QUERY` sind kein ausreichendes Nutzerfeedback. | Must | US-000017 |

## 4. Nicht-funktionale Anforderungen

| ID | Kategorie | Anforderung | Messgröße / Zielwert |
|---|---|---|---|
| NF-015 | Bedienbarkeit | Der normale MCP-first-Kompilierungsflow erfordert nach dem KI-Auftrag nur Prüfung und eine bewusste Entscheidung in Obsidian. | 0 erneute Pflichtangaben für Pfad oder Volltext |
| NF-016 | Datenintegrität | Ein Vorschlag bleibt über Plugin-Neustart oder kurzzeitige Trennung bis zur Entscheidung oder geregelten Ablaufzeit prüfbar. | 100 % der Restart-/Reconnect-Abnahmetests |
| NF-017 | Nachvollziehbarkeit | Jede Zustandsänderung eines Vorschlags ist mit Vorschlags-ID, Zeitpunkt und Ergebnis lokal nachvollziehbar. | 100 % der getesteten Zustandsübergänge |

## 5. Abgrenzung der Eingabemethoden

- **MCP-first:** Standardweg. Der Client liefert den vollständigen Vorschlag; die UI ist
  Prüf- und Bestätigungsoberfläche.
- **Obsidian-initiierter Weg:** Optionaler späterer Komfortweg. Falls angeboten, verwendet
  er aktive Notiz, Suchauswahl oder Dateiauswahl statt eines rohen technischen Pfadfelds.
- **Manuelle Markdown-Erstellung:** Bleibt eine native Obsidian-Funktion und ist kein
  Ersatz für eine KI-gestützte Kompilierung.

## 6. Edge Cases und Ausnahmeflüsse

| ID | Auslöser | Erwartetes Verhalten |
|---|---|---|
| EC-011 | Plugin ist beim Eingang nicht geöffnet oder startet neu | Der Vorschlag bleibt ausstehend und wird nach Verbindung sichtbar. |
| EC-012 | Quelle, Ziel oder Vorlage ändert sich nach Einreichung | Bestätigung wird mit konkretem Drift-Hinweis blockiert; eine neue Vorschau ist erforderlich. |
| EC-013 | Derselbe Bestätigungstoken wird erneut verwendet | Anfrage wird ohne Mutation als bereits verbraucht abgewiesen. |
| EC-014 | Mehrere Vorschläge warten gleichzeitig | Jeder Eintrag ist eindeutig zuordenbar und einzeln prüf-, verwerf- oder bestätigbar. |
| EC-015 | Aufbewahrungsgrenze wird erreicht | Neue Annahme wird kontrolliert begrenzt oder alte erledigte Daten werden regelkonform bereinigt; offene Bestätigungen verschwinden nicht still. |
| EC-016 | Client sendet fehlende Quellen, ungültiges Ziel oder mehrere Ziele | Der Client erhält einen feldbezogenen Fehler und im Vault findet keine Mutation statt. |

## 7. Story Map und Abhängigkeiten

```text
Epic: Wissensmodell — Sprint-7-Korrektur
  US-000017 (Must) MCP-first Pending Confirmation → US-000003, US-000005, US-000007
  US-000016 (Must) Projektvorlagen speichern und wiederverwenden → US-000017
  US-000008 (Must im Korrektur-Slice) wahrheitsgetreue Historie → US-000003, US-000017
```

US-000017 ersetzt US-000015. US-000016 und US-000008 bleiben fachlich gültig; RV-000008
weist für beide Umsetzungsabweichungen nach, die vor einer erneuten Abnahme zu beheben sind.

## 8. Offene Architekturfragen

| # | Frage | Verantwortlich | Kritikalität | Fällig bis | Status |
|---:|---|---|---|---|---|
| 1 | Welcher versionierte MCP-/IPC-Vertrag transportiert Einreichung, Benachrichtigung und Zustandsabfrage? | AR | MAJOR | Vor Refinement | OFFEN |
| 2 | Wo und wie lange werden offene Vorschläge sicher und begrenzt persistiert? | AR | MAJOR | Vor Refinement | OFFEN |
| 3 | Wie werden gleichzeitige Einreichung, Bestätigung, Drift und Bereinigung atomar serialisiert? | AR | MAJOR | Vor Refinement | OFFEN |

## 9. Definition-of-Done-Selbstprüfung

- [x] Das Stakeholder-Feedback aus RV-000008 ist in testbare Anforderungen übersetzt.
- [x] Der MCP-first-Nutzerablauf ist ohne erneute technische Pfad- oder Volltexteingabe definiert.
- [x] Human-in-the-Loop, Drift-Schutz und Einmal-Bestätigung bleiben verbindlich.
- [x] Template-Wiederverwendung und wahrheitsgetreue Historie sind tracebar.
- [x] Edge Cases für Neustart, Parallelität, Ablauf und Kapazitätsgrenzen sind beschrieben.
- [x] Technologie- und Speicherentscheidungen bleiben der Architekturphase vorbehalten.
- [x] Freigabe durch Folge-Command `/architect` am 2026-08-15 erteilt.

---

## Übergabe: BA → AR

**Datum:** 2026-08-15
**Von:** Business Analyst (BA)
**An:** Software Architect (AR)
**Nächster Befehl:** `/architect second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| REQ-000002 | REVIEW | `requirements/REQ-000002-sprint-7-mcp-first-correction.md` | Verbindliche Korrekturanforderungen aus RV-000008 |
| US-000017 | REVIEW | `requirements/US-000017-mcp-first-pending-compilation.md` | Ersatz für US-000015 |
| RM-000002 | REVIEW | `requirements/RM-000002-sprint-7-recovery-roadmap.md` | Korrektur-Slice und Reihenfolge |

### Kritische Informationen für Empfänger

- MCP ist der Eingabekanal; Obsidian ist die Prüf- und Entscheidungsoberfläche.
- Offene Vorschläge benötigen einen sicheren, begrenzten und neustartfesten Lebenszyklus.
- Die Architektur muss Einreichung, Benachrichtigung, Zustandsabfrage, Driftprüfung und
  atomare Zustandsübergänge festlegen.

### Nicht-Ziele

- Keine neue LLM- oder Provider-Anbindung.
- Keine Mehrdatei-Mutation und keine automatische Bestätigung.
- Keine Technologie-, Tabellen- oder konkrete Transportentscheidung durch BA.
