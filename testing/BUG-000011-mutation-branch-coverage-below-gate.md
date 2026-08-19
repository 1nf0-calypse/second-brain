---
id: BUG-000011
title: Bug — Mutations-Branch-Coverage unterschreitet Gate-Ziel
version: 1.3
status: VERIFIZIERT
author-agent: QA (QA Engineer)
date: 2026-08-16
project: second-brain
based-on: TP-000009, ADR-000001
severity: MAJOR
assigned-to: BE
supersedes: —
superseded-by: —
github-issue: —
epic: Wissensmodell
github-milestone: —
estimate: —
size: —
iteration: —
start-date: —
target-date: —
---

# Bug: Mutations-Branch-Coverage unterschreitet Gate-Ziel

## 1. Symptom

**Erwartetes Verhalten:** Domain, Policy und Mutationslogik erreichen gemäß ADR-000001
mindestens 90 % Branch-Coverage.

**Tatsächliches Verhalten:** `apps/sidecar/src/mutations/mutation-service.ts` erreicht
82,17 % Branches. Der Gesamtwert liegt bei 81,91 %.

**Auswirkung:** Das Coverage-MAJOR-Kriterium von Gate 7 ist nicht erfüllt; nicht ausgeführte
Fehlerzweige erhöhen das Regressionsrisiko der Schreibpfade.

## 2. Reproduktionsschritte

1. Im Sprint-Worktree `npm run test:coverage` ausführen.
2. Den V8-Coverage-Eintrag für `mutation-service.ts` prüfen.

**Umgebung:** Windows 11; Node.js 24.15.0; Vitest 4.1.10 mit V8 Coverage.
**Reproduzierbarkeit:** Immer im isolierten Lauf.

## 3. Schweregrad & Zuweisung

**Schweregrad:** `MAJOR`
**Begründung:** Verbindliches Coverage-Ziel aus ADR-000001 und TP-000009 wird verfehlt.
**Zugewiesen an:** BE

## 4. Evidenz

```text
All files: Statements 91.04 %, Branches 81.91 %, Functions 89.51 %, Lines 92.69 %
mutation-service.ts: Branches 82.17 %
105/105 Tests bestanden
```

## Betroffene Komponenten

- `apps/sidecar/src/mutations/mutation-service.ts`
- `tests/integration/mutation-service.test.ts`

## Root-Cause

Die vorhandenen Integrationstests bestätigen die zentralen Erfolgs- und Securitypfade,
lassen aber mehrere fachliche Alternativen und Fehlerzweige im `MutationService`
unausgeführt. V8 weist deshalb trotz 105 grüner Tests nur 82,17 % Branch-Coverage für den
Schreibdienst aus.

Systemisch wurde Gate 6 anhand der bestandenen Suite abgeschlossen, ohne das in
ADR-000001 festgelegte komponentenspezifische Branch-Ziel explizit zu messen. Es liegt kein
Produktfehler als Ursache vor; der Befund ist eine nachweisbare Testlücke im risikoreichen
Mutationspfad.

## Fix-Ansatz

Die V8-Branchdaten werden auf konkrete nicht ausgeführte Entscheidungen zurückgeführt.
Für diese werden fachlich aussagekräftige Integrationstests ergänzt, insbesondere für
alternative Validierungs-, Migrations- und Fehlerausgänge. Coverage-Ausnahmen oder eine
Absenkung des 90-%-Ziels sind ausgeschlossen. Anschließend wird der isolierte Coverage-
Lauf als Gate-Nachweis wiederholt.

## Regressionsrisiko

**Einschätzung:** Mittel
**Begründung:** Zusätzliche Tests können bisher unbeobachtete Fehlerzweige offenlegen.

## Verifikation

**Implementierungsverifikation (2026-08-16):** `npm run test:coverage` besteht mit 110/110
Tests. `mutation-service.ts` erreicht 91,47 % Branches, 93,70 % Statements, 100 % Functions
und 94,39 % Lines. Damit ist das komponentenspezifische 90-%-Branch-Ziel erfüllt.

**Regressionstest ergänzt:** Ja. Die Tests decken Default-/Legacy-Migration,
automatisches Update und No-op-Budgetrückgabe, Compilation-Quell-/Templatekonflikte,
Warnungsklassifikation sowie Rollback-History ab. Es wurden keine Coverage-Ausnahmen oder
Schwellwertsenkungen vorgenommen.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-08-16 | OFFEN | Coverage-Ziel im unabhängigen QA-Lauf verfehlt |
| 2026-08-16 | IN_BEARBEITUNG | Testlücke als Ursache bestätigt; branchgenaue Ergänzung begonnen |
| 2026-08-16 | BEHOBEN | Fachliche Zweigtests ergänzt; MutationService erreicht 91,47 % Branch-Coverage |
| 2026-08-16 | VERIFIZIERT | QA-Nachtest: 110/110 Tests und 91,47 % Branch-Coverage für `mutation-service.ts` |

---

## Übergabe: QA → BE

**Datum:** 2026-08-16
**Von:** QA Engineer (QA)
**An:** Backend Developer (BE)
**Nächster Befehl:** `/implement be second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| BUG-000011 | OFFEN | `testing/BUG-000011-mutation-branch-coverage-below-gate.md` | Root-Cause vor Änderung ausfüllen |

### Kritische Informationen für Empfänger

Die Suite ist funktional grün; der Fund betrifft die verbindliche Zweigabdeckung.

### Offene Fragen (vererbt)

Keine.

### Nicht-Ziele

QA legt keine künstlichen Tests ohne fachliche Branch-Erwartung an.

---

## Übergabe: BE → QA

**Datum:** 2026-08-16  
**Von:** Backend Developer (BE)  
**An:** QA Engineer (QA)  
**Nächster Befehl:** `/test-run second-brain 7`

QA soll den isolierten Coverage-Lauf wiederholen und das ADR-000001-Ziel unabhängig
bestätigen.

---

*Aktualisiert von: QA-Agent | Datum: 2026-08-16 | Version: 1.3*
