---
id: SP-000007
title: Sprint 6 Backlog — Autonomiestufen und Mutationsbudgets
version: 1.0
status: APPROVED
author-agent: BA (Business Analyst) + FE + BE
date: 2026-08-13
project: second-brain
sprint: 6
based-on: REQ-000001, RM-000001@1.1, US-000003@1.1, US-000014, UX-000001, ADR-000004, CON-000001
supersedes: —
superseded-by: —
---

# SP-000007: Sprint 6 — Autonomiestufen und Mutationsbudgets

## Sprint-Ziel

Nutzer können Human-on-the-Loop und Human-out-of-the-Loop bewusst aktivieren; beide Modi führen ausschließlich Markdown-Erstellungen und -Aktualisierungen innerhalb eines serverseitig erzwungenen Budgets von höchstens 60 Mutationen in 60 Minuten aus und pausieren bei Ablauf, Budgetende oder auf Nutzeraktion sofort.

**Erfolgskriterium:** Die fünf Szenarien aus US-000003 bestehen. Kein automatischer Pfad kann löschen, verschieben, umbenennen, das 60/60-Budget überschreiten, nach Ablauf oder Pause schreiben oder eine Mutation ohne Audit und konfliktgeschütztes Einzelrollback ausführen.

## Sprint-Rahmen

| Eigenschaft | Wert |
|---|---|
| Sprint-Start | 2026-08-26 |
| Sprint-Ende | 2026-09-09 |
| Dauer | 14 Tage |
| Commit-Umfang | 26 SP |
| Kapazität FE | 8 SP |
| Kapazität BE | 13 SP |
| Gemeinsame Qualität | 5 SP |
| Velocity (Referenz) | Sprint 5: 26 SP Planbedarf, zwei Stories geliefert |

## Verbindliche Policy

| Regel | Festlegung |
|---|---|
| Modi | Human-on-the-Loop und Human-out-of-the-Loop sind aktivierbar. |
| Erlaubte automatische Aktionen | Eine Markdown-Notiz erstellen oder aktualisieren. |
| Budget | Höchstens 60 erfolgreiche automatische Mutationen je Aktivierung und 60-Minuten-Zeitfenster. |
| Maximale Laufzeit | 60 Minuten ab Aktivierung; keine stillschweigende Verlängerung. |
| Pause | Manuelle Pause, Budgetende oder Ablauf sperren neue automatische Mutationen sofort. |
| Löschungen | Nie automatisch; nur späterer Human-in-the-Loop-Flow mit eigener Nachfrage. |
| Weiterer Scope | Kein Move, Rename, Mehrdatei-Paket, Binärinhalt, externer Pfad oder Konflikt-Merge. |
| Nachvollziehbarkeit | Jede erfolgreiche automatische Mutation erhält Audit, Hashbindung und Einzelrollback. |

## Verbindlicher Backlog

| ID | Arbeitspaket | Zuständigkeit | SP | Akzeptanzbeleg |
|---|---|---:|---:|---|
| US-000003 | Versionierte Verträge für Autonomiemodus, Aktivierung, Status, Pause und Restbudget definieren. | BE | 2 | Schema- und Contract-Tests |
| US-000003 | Serverseitige Policy- und Budgetzustandsmaschine mit atomarem 60/60-Claim, Ablauf und Pause implementieren. | BE | 4 | Konkurrenz-, Ablauf- und Replay-Tests |
| US-000003 | Automatische Create-/Update-Ausführung an bestehende Scope-, Hash-, Audit- und Rollback-Grenzen anbinden. | BE | 3 | Integrationstest je Aktion und Konflikt |
| US-000003 | MCP-Werkzeuge für Policy-Aktivierung, Status, Pause und budgetierte Mutation eng begrenzen. | BE | 2 | Toolliste und Capability-Negativtests |
| US-000003 | Automatische Delete-, Move-, Rename- und Mehrdatei-Anfragen vor jeder Dateisystemoperation ablehnen. | BE | 2 | Security-/Scope-Matrix |
| US-000003 | Native Obsidian-Ansicht für Modusvergleich, Risiko, 60/60-Budget, Ablaufzeit und explizite Bestätigung umsetzen. | FE | 3 | Headed E2E für beide Aktivierungen |
| US-000003 | Sichtbaren Laufzeitstatus, Restbudget, Pause und verständliche Sperr-/Recovery-Zustände umsetzen. | FE | 2 | Tastatur-, Fokus- und Live-Region-Test |
| Q6-001 | Deterministische Zeit- und Parallel-Fixtures für Budget, Ablauf, Pause und atomaren Claim ergänzen. | QA+BE | 3 | Integrationsregression |
| Q6-002 | Audit-/Rollback-, Traversal-, Injection- und verbotene-Aktion-Regressionen für automatische Modi ergänzen. | QA+BE | 1 | Security-Suite |
| Q6-003 | Headed Playwright für Aktivierung, Warnung, Pause, Budgetende und Human-in-Rückfall ergänzen. | QA+FE | 2 | Versionierter E2E-Report |
| Q6-004 | Nutzerabnahme für Human-on/out und die Löschsperre vorbereiten. | QA+FE | 2 | Granulare Abnahmeanleitung |

**Gesamter Commit:** 26 Story Points. Keine Stretch-Stories; freie Kapazität dient ausschließlich Parallelitäts-, Windows-Lock-, Audit- und Rollback-Regressionen.

## Technische Voraussetzungen

| # | Voraussetzung | Verantwortlich | Status |
|---:|---|---|---|
| 1 | US-000003@1.1 und SP-000007 durch `/implement` bestätigt | ORCH | ⬜ Übergangsaktion |
| 2 | US-000014 liefert Prepare/Confirm, Hashprüfung, Audit und Einzelrollback | FE+BE | ✅ geliefert |
| 3 | ADR-000004 und CON-000001 sind verbindlich | AR/PM | ✅ |
| 4 | UX-000001 Journey 5 ist die verbindliche Interaktion für Warnung, Budget und Pause | UX | ✅ |
| 5 | Neuer Worktree `feature/sprint-6` nach Gate 5.5 | ORCH | ⬜ |

## Definition of Ready

| Kriterium | Ergebnis |
|---|---|
| Story eindeutig Sprint 6 zugeordnet | ✅ US-000003@1.1 |
| Beide Modi, Aktionen, Budget und Laufzeit entschieden | ✅ 60 Create/Update je 60 Minuten, maximal eine Stunde |
| Löschungen und andere Scope-Erweiterungen explizit ausgeschlossen | ✅ |
| UX-, Architektur- und Constitution-Bezug geklärt | ✅ |
| Keine ungeklärte fachliche Abhängigkeit | ✅ |
| Schätzung und testbarer Abnahmebeleg vorhanden | ✅ 26 SP |

## Qualitäts- und Abnahmekriterien

1. Eine Aktivierung verlangt sichtbaren Modusvergleich, Risiko-Warnung, 60/60-Rahmen und ausdrückliche Bestätigung. Human-in bleibt der Startzustand.
2. Das Budget wird serverseitig und atomar vor jedem automatischen Write beansprucht. Mehr als 60 parallele oder wiederholte Anfragen führen zu höchstens 60 erfolgreichen Mutationen.
3. Nach 60 Minuten, Budgetende oder manueller Pause blockiert der Server neue automatische Mutationen, auch wenn ein Client einen alten Modus- oder Statuswert sendet.
4. Nur Markdown-Create und -Update sind automatisch zulässig. Delete, Move, Rename, Mehrdatei, absolute Pfade, Traversal, Symlink-Escape und nicht freigegebene Aktionen scheitern ohne Vault-Änderung.
5. Jede automatische Mutation verwendet Hash-/Konfliktprüfung, erzeugt einen Audit-Eintrag und lässt sich einzeln konfliktgeschützt rücksetzen.
6. Die native Ansicht ist per Tastatur bedienbar: Warnung, Bestätigung, Status, Pause und Recovery haben logische Fokusreihenfolge und Live-Statusmeldungen.
7. Vertrags-, Unit-, Integrations- und headed Playwright-Tests prüfen Happy Path, beide Modi, Ablauf, Budgetende, Pause, Parallelität, Replay, verbotene Aktionen, Konflikt und Rollback.

## Risiken und Gegenmaßnahmen

| Risiko | Wahrscheinlichkeit | Impact | Gegenmaßnahme |
|---|---|---|---|
| Parallele Clients überschreiten das Budget | Mittel | Hoch | Atomarer SQLite-Claim vor dem Dateischreiben; konkurrierender Lasttest. |
| Client fälscht Modus oder Restbudget | Mittel | Hoch | Server lädt nur seine persistierte, aktive Policy. |
| Automatik wird als Löschfreigabe missverstanden | Niedrig | Hoch | Delete im Contract nicht anbieten; UI nennt den Ausschluss ausdrücklich. |
| Ablaufzeit wird verlängert | Mittel | Mittel | Feste Aktivierungszeit; keine Sliding-Window-Verlängerung. |
| Pause trifft eine laufende Anfrage | Niedrig | Hoch | Claim und Policy-Prüfung unmittelbar vor Write; Audit dokumentiert Ergebnis. |
| Automatische Änderung überschreibt externe Änderung | Mittel | Hoch | Bestehende Vorher-Hash-Prüfung und Konfliktabbruch weiterverwenden. |

## Technische Schulden aus letztem Sprint

Keine offene Sprint-5-Schuld im lokalen Consent- oder Vault-Setup. Der externe produktive Provider-Endpoint bleibt eine Betriebsintegration, ist aber nicht Teil von Sprint 6.

## Definition of Done

- [x] Sprint-Ziel, Policy und messbare Abnahmekriterien definiert.
- [x] Commit-Story in Backend-, Frontend- und Qualitätsarbeit zerlegt und auf 26 SP geschätzt.
- [x] 60/60-Budget, einstündige Laufzeit, Pause und Delete-Ausschluss verbindlich dokumentiert.
- [x] Risiken, Abhängigkeiten, Nicht-Ziele und Testnachweise enthalten keine offene BLOCKER- oder MAJOR-Frage.
- [x] RM-000001@1.1, US-000003@1.1, Indizes und Phase werden aktualisiert.
- [x] Gate 5 ist inhaltlich PASS; die formale Freigabe erfolgt durch `/implement` mit Gate 5.5.

---

## Übergabe: BA+FE+BE → ORCH/FE/BE

**Datum:** 2026-08-13
**Von:** Business Analyst, Frontend Developer und Backend Developer (BA+FE+BE)
**An:** Orchestrator, Frontend Developer und Backend Developer (ORCH/FE/BE)
**Nächster Befehl:** `/implement all second-brain`

### Übergebene Artefakte

| Artefakt-ID | Version | Status | Pfad | Hinweise |
|---|---:|---|---|---|
| US-000003 | 1.1 | APPROVED | `requirements/US-000003-controlled-mutations.md` | Verbindliche 60/60-Budget-Policy für Human-on/out |
| RM-000001 | 1.1 | APPROVED | `requirements/RM-000001-roadmap.md` | Sprint-6-Plan auf 26 SP präzisiert |
| SP-000007 | 1.0 | APPROVED | `sprints/SP-000007-sprint-6-autonomie-budgets.md` | Vollständiger Sprint-6-Backlog |

### Kritische Informationen für Empfänger

- Die serverseitige Policy ist die Quelle für Modus, Ablauf, Pause und Restbudget.
- Der Budget-Claim muss atomar vor dem Dateischreiben erfolgen; Client-Daten dürfen dafür nicht als Autorität dienen.
- Wiederverwendung der bewährten Human-in-Hash-, Audit- und Rollback-Grenzen ist Pflicht.

### Offene Fragen (vererbt)

Keine BLOCKER- oder MAJOR-Frage für Sprint 6.

### Nicht-Ziele (explizit ausgeschlossen)

Automatisches Löschen, Verschieben, Umbenennen, Mehrdatei-Pakete, Binärdateien, Konflikt-Merges, Wissenskompilierung und externe Providerarbeit.

### Empfehlungen

Backend-Reihenfolge: Contracts → persistierte Policy/Zustandsmaschine → atomarer Claim → Mutationseinbindung → MCP. Das Frontend setzt anschließend auf Status- und Policy-Verträge auf.

---

*Erstellt von: BA+FE+BE (Refinement) | Datum: 2026-08-13 | Version: 1.0*
