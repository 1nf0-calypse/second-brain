---
id: SP-000005
title: Sprint 4 Backlog — Kontrollierte Ein-Datei-Mutationen
version: 1.0
status: REVIEW
author-agent: BA (Business Analyst) + FE + BE
date: 2026-07-31
project: second-brain
sprint: 4
based-on: REQ-000001, US-000014, UX-000001, ADR-000003, ADR-000004, CON-000001
supersedes: —
superseded-by: —
---

# Sprint 4 Backlog: Kontrollierte Ein-Datei-Mutationen

## Sprint-Ziel

**In einem Satz:** Nutzer können das Erstellen oder Aktualisieren genau einer Markdown-Notiz
als Vorschau prüfen, ausdrücklich bestätigen, auditieren und konfliktgeschützt rücksetzen.

**Erfolgskriterium:** Alle fünf Szenarien aus US-000014 bestehen unter Windows; kein
Schreibvorgang erfolgt ohne gültige Bestätigung, Hashkonflikte verhindern Überschreiben,
Rollback bewahrt neuere Änderungen und Scope-/Injection-Tests bleiben grün.

## Sprint-Rahmen

| Eigenschaft | Wert |
|---|---|
| Sprint-Start | Nach PASS des in `/implement` integrierten Gate 5.5 |
| Sprint-Ende | Scope-basiert; keine Kalender-Timebox vorgegeben |
| Dauer | Nicht festgelegt |
| Kapazität FE | 8 SP Planbedarf |
| Kapazität BE | 18 SP Planbedarf |
| Gemeinsame Qualität | 5 SP Planbedarf |
| Velocity (Referenz) | Sprint 3: 24 SP Planbedarf, eine Story geliefert |
| Schätzmethode | Fibonacci Story Points |

Die 31 SP sind Planbedarf, keine historische Kapazitätszusage. Der Slice wird nicht ohne
Konflikt-, Audit- und Rollbackschutz als abgeschlossen erklärt.

## Stories im Sprint

### Commit-Stories

| US | Titel | Schätzung | Verantwortlich | Abhängigkeiten |
|---|---|---:|---|---|
| US-000014 | Textnotizen kontrolliert vorschlagen, bestätigen und rücksetzen | 26 SP | BE+FE | US-000005, US-000011, US-000012, ADR-000004, UX-000001 |

### Querschnittliche Qualität

| ID | Aufgabe | Schätzung | Verantwortlich |
|---|---|---:|---|
| Q4-001 | Absturz-/Lock-Fixtures für atomaren Dateiersatz und Recovery | 2 SP | QA+BE |
| Q4-002 | Hashmanifest und Injection-/Traversal-Matrix für alle Mutationsphasen | 3 SP | QA+BE |

**Gesamter Planbedarf:** 31 Story Points.

### Stretch-Stories

Keine. Freie Kapazität dient Windows-Dateisperren, Token-Replay und Rollback-Regressionsfällen.

### Explizit nicht im Sprint

- Löschen, Verschieben, Umbenennen oder Mehrdatei-Mutationen.
- Human-on-the-Loop und Human-out-of-the-Loop.
- US-000006 Wissenskompilierung und Vorlagen.
- Visuelle Graphdarstellung, Android und externe Anbieter.

## Subtasks

### US-000014 — 26 SP

| # | Subtask | Verantwortlich | Schätzung | Status |
|---|---|---:|---|
| 14.1 | Versionierte Prepare-, Confirm-, Result-, Audit- und Rollback-Verträge definieren | BE | 3 SP | ⬜ |
| 14.2 | Zustandsmaschine für kurzlebige, einmalig nutzbare Bestätigungstoken implementieren | BE | 3 SP | ⬜ |
| 14.3 | Vault-Policy für Markdown-Erstellen/-Aktualisieren ohne Delete/Move erweitern | BE | 3 SP | ⬜ |
| 14.4 | Text-Diff, Vorher-/Nachher-Hash und sichere Vorschau deterministisch erzeugen | BE | 3 SP | ⬜ |
| 14.5 | Atomaren Dateiersatz mit TOCTOU-Hashprüfung und Windows-Lock-Recovery umsetzen | BE | 5 SP | ⬜ |
| 14.6 | Lokales Audit mit unveränderlichem Mutationsdatensatz und Rollback-Vorschau speichern | BE | 3 SP | ⬜ |
| 14.7 | Eng begrenzte MCP-Werkzeuge für Prepare, Confirm, Rollback-Prepare und Rollback-Confirm anbieten | BE | 3 SP | ⬜ |
| 14.8 | Native Obsidian-Ansicht für Vorschau, Bestätigung, Konflikt und Ergebnis bauen | FE | 3 SP | ⬜ |

### Querschnittliche Qualität — 5 SP

| # | Subtask | Verantwortlich | Schätzung | Status |
|---|---|---:|---|
| Q4.1 | Fehler-Injektion für Temp-Datei, Rename, Lock, Prozessabbruch und Auditfehler ergänzen | QA+BE | 2 SP | ⬜ |
| Q4.2 | Traversal, Symlink, Replay, abgelaufenes Token, Injection und Fremdhash testen | QA+BE | 2 SP | ⬜ |
| Q4.3 | Headed Tastatur-/Fokuspfad für Preview, Confirm, Conflict und Rollback ergänzen | QA+FE | 1 SP | ⬜ |

## Technische Voraussetzungen

| # | Voraussetzung | Verantwortlich | Status |
|---|---|---|---|
| 1 | US-000014 und SP-000005 durch `/implement` bestätigt | ORCH | ⬜ Übergangsaktion |
| 2 | ADR-000001–ADR-000005, STRUCTURE und CON-000001 APPROVED | AR/PM | ✅ |
| 3 | UX-000001 Journey 4, Fehlerzustände und Accessibility APPROVED | UX | ✅ |
| 4 | Sprint 3 lokal als `v0.3.0` auf `main` | ORCH | ✅ |
| 5 | Neuer `feature/sprint-4`-Worktree | ORCH | Erst nach Gate-5.5-PASS anlegen |
| 6 | Push und Cleanup von Sprint 3 | Nutzer/ORCH | Nicht blockierend; getrennte Release-Hygiene |

## Definition of Ready

| Kriterium | US-000014 |
|---|:---:|
| Story eindeutig Sprint 4 zugeordnet | ✅ |
| Status durch Folge-Command bestätigbar | REVIEW ✅ |
| Mindestens drei Akzeptanzszenarien | 5 ✅ |
| UX-Abdeckung | UX-000001 Journey 4 ✅ |
| ADR-/Constitution-Bezug geklärt | ✅ |
| Keine ungeklärte fachliche Abhängigkeit | ✅ |
| Schätzung vorhanden | 26 SP ✅ |
| Testbarer Akzeptanznachweis definiert | ✅ |

## Qualitäts- und Abnahmekriterien

- Kein Schreibwerkzeug akzeptiert absolute Pfade, Traversal, Symlink-Escapes oder Nicht-Markdown-Ziele.
- Prepare verändert keine Vault-Datei und bindet Pfad, Aktion, Hashes, Diff und Ablaufzeit.
- Confirm akzeptiert nur ein passendes, unverbrauchtes, nicht abgelaufenes Token.
- Schreiben erfolgt als Temp-Datei plus atomarer Ersatz; Fehler hinterlassen Original oder
  vollständig neuen Zustand, niemals eine Teildatei.
- Audit wird so gekoppelt, dass Erfolg nicht ohne nachvollziehbaren Eintrag gemeldet wird.
- Rollback besitzt denselben Prepare-/Confirm- und Hashkonfliktschutz wie Vorwärtsmutationen.
- Vault-Text bleibt untrusted data und kann weder Scope noch Werkzeugfähigkeit erweitern.
- Mutations-/Policy-/Auditmodule erreichen mindestens 90 % Branch Coverage; Gesamtprojekt 80 %.
- Headed Windows-E2E prüft Tastatur, Fokus, Preview, Confirm, Conflict und Rollback.
- Vorher-/Nachher-Manifeste beweisen, dass ausschließlich die bestätigte Datei geändert wird.

## Risiken und Unsicherheiten

| Risiko | Wahrscheinlichkeit | Impact | Status | Mitigation |
|---|---|---|---|---|
| Windows blockiert atomaren Ersatz durch offenen Datei-Handle | Mittel | Hoch | ADRESSIERT | Lock-Fixtures, sicherer Abbruch, Original bewahren |
| Token wird wiederholt oder für anderen Inhalt verwendet | Mittel | Hoch | ADRESSIERT | einmalige Nutzung, Bindung an Hash/Pfad/Aktion, Ablaufzeit |
| Audit und Dateiersatz geraten auseinander | Niedrig | Hoch | ADRESSIERT | definierte Zustandsmaschine und Recovery-Evidenz |
| Externe Änderung zwischen Preview und Confirm | Hoch | Hoch | ADRESSIERT | erwarteter Hash und harter Konflikt ohne Merge |
| UI verleitet zu unbeabsichtigter Bestätigung | Niedrig | Hoch | ADRESSIERT | explizite Preview, kein vorausgewählter Confirm, Fokusführung |
| Höhere Autonomie wird als mitgeliefert erwartet | Mittel | Mittel | ADRESSIERT | UI und Doku benennen Human-in-Scope ausdrücklich |

**Selbstauskunft BA+FE+BE:** Keine offene BLOCKER- oder MAJOR-Frage für den Commit-Scope.
Mutationsbudgets blockieren nur die ausdrücklich ausgeschlossenen höheren Autonomiestufen.

## Technische Schulden aus letztem Sprint

Keine offene Sprint-3-Schuld. Push und Worktree-Cleanup sind Release-Hygiene, kein Produktcode.

## Definition of Done

- [x] Sprint-Ziel und messbares Erfolgskriterium definiert.
- [x] Commit-Story geschätzt und in lieferbare Subtasks zerlegt.
- [x] Technische Voraussetzungen und Worktree-Zeitpunkt gelistet.
- [x] UX-, Architektur-, Security- und Qualitätsanforderungen referenziert.
- [x] Risiken enthalten keine offenen BLOCKER oder MAJORs.
- [x] Höhere Autonomie und Delete sind klar ausgeschlossen.
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
| US-000014 | 1.0 | REVIEW | `requirements/US-000014-controlled-human-in-mutations.md` | Ein-Datei-Human-in-Slice |
| SP-000005 | 1.0 | REVIEW | `sprints/SP-000005-sprint-4-controlled-mutations.md` | Sprint-4-Backlog, 31 SP Planbedarf |

### Kritische Informationen für Empfänger

- `/implement` bestätigt beide Artefakte nur nach Gate 5/5.5.
- Vertrag und Zustandsmaschine kommen vor Dateischreiblogik und UI.
- Confirm und Rollback müssen denselben Scope-, Token- und Hashschutz erzwingen.
- Keine Lösch- oder allgemeine Dateisystemfähigkeit hinzufügen.

### Offene Fragen (vererbt)

Keine offene BLOCKER- oder MAJOR-Frage für US-000014.

### Nicht-Ziele

Löschen, Mehrdatei-Pakete, höhere Autonomie, Wissenskompilierung und externe Anbieter.

### Empfehlungen

Backend-Reihenfolge: Verträge → Zustandsmaschine → Policy → atomarer Write/Audit → MCP;
Frontend anschließend auf denselben Laufzeitverträgen.

---

*Erstellt von: BA+FE+BE (Refinement) | Datum: 2026-07-31 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-07-31 | Sprint-4-Backlog für kontrollierte Ein-Datei-Mutationen | BA+FE+BE |
