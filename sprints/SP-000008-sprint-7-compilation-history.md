---
id: SP-000008
title: Sprint 7 Backlog — Wissenskompilierung, Vorlagen und Verlauf
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst) + FE + BE
date: 2026-08-15
project: second-brain
sprint: 7
based-on: RM-000001@1.2, US-000006@1.1, US-000008@1.1, US-000015, US-000016, US-000003@1.1, US-000005, US-000007, UX-000001, ADR-000004
supersedes: —
superseded-by: —
---

# SP-000008: Sprint 7 — Wissenskompilierung, Vorlagen und Verlauf

## Sprint-Ziel

Nutzer können einen quellengebundenen Wissensentwurf lokal prüfen, eine versionierte
Vorlage nachverfolgen und bestätigte oder unterbrochene Vorgänge im Verlauf verstehen.
Schreiben bleibt auf den bestehenden Human-in-Einzeldatei-Flow begrenzt.

## Verbindliche Stories

| ID | Story | SP | Sichtbares Ergebnis |
|---|---|---:|---|
| US-000015 | Quellengebundene Kompilierungsvorschau | 10 | Read-only Vorschau mit Quellen, Diff, Warnung und Bestätigungsübergabe |
| US-000016 | Versionierte projektlokale Vorlagen | 7 | Bestätigt gespeicherte Versionen mit stabiler Provenienz |
| US-000008 | Lokale Mutationshistorie | 6 | Chronologische Ansicht mit Erfolg, Incomplete und Rollback-Status |

**Commit:** 23 SP über drei User Stories. Jede Story hat einen eigenständigen Nutzerwert und
eigenen Abnahmebeleg.

## Backlog

| Arbeitspaket | Zuständigkeit | SP | Nachweis |
|---|---:|---:|---|
| Verträge für Quellenmanifest, Kandidat, Vorschau und Vorlage validieren | BE | 3 | Contract-/Negativtests |
| Preview- und Hashbindung an bestehende Einzeldatei-Mutation anbinden | BE | 4 | Integration: Preview, Konflikt, Confirm |
| Injection- und Widerspruchsmarker ohne Scope-Effekt | BE | 2 | Security-Matrix |
| Immutable Template-Versionen unter `.second-brain/templates/` speichern | BE | 3 | Versionierungs-/Migrationstest |
| Historienabfrage mit redigierter Zusammenfassung und `Incomplete` | BE | 3 | Repository-/Contract-Tests |
| Native Quellen-, Vorlagen- und Verlaufansichten | FE | 4 | Headed Playwright, Tastatur und Live-Status |
| Zeit-, Hash-, Injection- und Unterbrechungs-Fixtures | QA+BE | 2 | Integrationsregression |
| Drei Story-Abnahmen und Anleitung | QA+FE | 2 | Versionierter Testplan |

## Abnahmekriterien

1. Keine Kompilierungsvorschau schreibt in den Vault; nur der vorhandene Einzeldatei-Flow
   darf genau einen geprüften Kandidaten schreiben.
2. Quellen-, Ziel- und Vorlagenhash werden vor der Bestätigung erneut geprüft; Drift führt
   zum Konflikt statt zu einem stillen Überschreiben.
3. Der Sprint öffnet keinen neuen Netzwerkpfad, Provider oder LLM-Key.
4. Jede Vorlage ist lokal und unveränderlich versioniert; ID, Version und Hash erscheinen
   in Vorschau und Historie.
5. Die Historie unterscheidet Erfolg, Rollback und `Incomplete`; Audit-Einträge sind über
   MCP nicht lösch- oder umschreibbar.
6. Alle Oberflächen sind per Tastatur nutzbar und bei 320 px Pane-Breite vollständig.

## Risiken und Nicht-Ziele

| Risiko | Gegenmaßnahme |
|---|---|
| Mehrdatei-Kandidat | Vertrag und UI blockieren ihn vor jeder Mutation. |
| Prompt Injection | Taint-Marker, keine Scope-Ableitung, Security-Regression. |
| Vorlagendrift | ID, Version und Hash sind Teil des Preview-Tokens. |
| Sprint wird zur LLM-Integration | Kein neuer Provider-Aufruf; der MCP-Client liefert den Kandidaten. |

Ausgeschlossen sind automatische Mehrdatei-Mutationen, neue Provider/LLM-Integrationen,
Vorlagen-Löschen/-Synchronisation, Wahrheitsgarantie, Anhänge, semantische Suche,
Graph-Visualisierung, Android und campaignworld.

## Definition of Ready

- [x] Drei User Stories mit je eigenem Nutzerwert und Akzeptanzkriterien.
- [x] Kompatibel mit Constitution, US-000003, US-000007 und ADR-000004.
- [x] Keine offene BLOCKER-Entscheidung für den lokalen Slice.
- [x] Schätzung, Risiken, Qualitätsnachweise und Nicht-Ziele festgelegt.

---

## Übergabe: BA+FE+BE → ORCH/FE/BE

**Datum:** 2026-08-15
**Nächster Befehl:** `/implement second-brain 7`

Implementierungsreihenfolge: Verträge und Migrationen, Services, native Ansichten, dann
Integrations- und headed-Playwright-Regressionen.
