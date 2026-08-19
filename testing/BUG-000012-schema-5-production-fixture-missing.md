---
id: BUG-000012
title: Bug — Gehashte Schema-5-Produktionsfixture fehlt
version: 1.3
status: VERIFIZIERT
author-agent: QA (QA Engineer)
date: 2026-08-16
project: second-brain
based-on: TP-000009, SP-000009, US-000017
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

# Bug: Gehashte Schema-5-Produktionsfixture fehlt

## 1. Symptom

**Erwartetes Verhalten:** Eine unveränderliche, gehashte Schema-5-Produktionsfixture steht
für die verlustfreie und idempotente Schema-6-Migration bereit.

**Tatsächliches Verhalten:** Im Repository existiert nur eine im Test synthetisch erzeugte
Minimaltabelle; eine versionierte Produktionsfixture samt erwarteter Hash-/Datensatzliste
ist nicht vorhanden.

**Auswirkung:** TC-000908 und die produktionsnahe Migrationsabnahme bleiben blockiert.

## 2. Reproduktionsschritte

1. `tests/`, `testing/` und die Sidecar-Migrationspfade nach einer Schema-5-Fixture und
   zugehöriger Hashliste durchsuchen.
2. `tests/integration/compilation-inbox-service.test.ts` prüfen.
3. Feststellen, dass Schema 5 dort nur ad hoc synthetisiert wird.

**Umgebung:** Sprint-7-Worktree `feature/sprint-6`.
**Reproduzierbarkeit:** Immer.

## 3. Schweregrad & Zuweisung

**Schweregrad:** `MAJOR`
**Begründung:** Verbindliche technische Voraussetzung aus SP-000009 fehlt und ein P0-
Migrationstest kann nicht ausgeführt werden.
**Zugewiesen an:** BE

## 4. Evidenz

Repository-Inventar enthält keinen Schema-5-Fixture-Pfad. Der vorhandene Test erzeugt nur
`schema_migrations`, `mutation_previews` und `compilation_bindings` zur Laufzeit.

## Betroffene Komponenten

- `tests/integration/compilation-inbox-service.test.ts`
- vorgesehener Fixture-Ordner unter `tests/fixtures/`
- Schema-6-Migration in `apps/sidecar/src/compilations/compilation-inbox-service.ts`

## Root-Cause

Der Migrationsintegrationstest erzeugt nur die unmittelbar für den Foreign-Key-Fall
benötigten Tabellen per Inline-SQL. Damit prüft er die Schema-6-Logik, stellt aber kein
unveränderliches, repräsentatives Schema-5-Abbild bereit. Im Repository fehlen folglich
sowohl die Fixture selbst als auch ein Manifest, das Identität und erwartete Datensätze
vor der Migration festschreibt.

Systemisch wurde die technische Voraussetzung aus SP-000009 bei Gate 6 nicht als eigenes
lieferbares Testartefakt kontrolliert. Die Migration ist dadurch nicht als defekt
nachgewiesen; ihr produktionsnaher, reproduzierbarer Nachweis fehlt.

## Fix-Ansatz

Unter `tests/fixtures/schema-5/` wird ein sanitisiertes, deterministisches SQL-Abbild des
produktiven Schema-5-Zustands plus SHA-256-Manifest versioniert. Der Integrationstest
verifiziert zuerst den Fixture-Hash, migriert eine daraus erzeugte temporäre Datenbank und
prüft Datenbestand, Orphan-Bereinigung sowie Idempotenz von Schema 6. Reale Nutzerdaten
werden nicht verwendet.

## Regressionsrisiko

**Einschätzung:** Mittel
**Begründung:** Die Fixture muss reale Altstrukturen enthalten, ohne Nutzerdaten oder
Secrets einzuchecken.

## Verifikation

**Implementierungsverifikation (2026-08-16):** Die sanitisierten Schema-5-Daten liegen als
deterministische SQL-Fixture mit Manifest vor. Der Test prüft SHA-256
`6dc63e33b5bfda276ca88487b16a4b74b3dd2e6f1ed1c112078d23071d1c46c4`, migriert dieselbe
Datenbank zweimal und bestätigt genau einen Schema-6-Eintrag, unveränderte Preview-,
Audit- und Template-Daten sowie ausschließlich die Entfernung des Orphan-Bindings.

**Regression:** Der neue produktionsnahe Test und der bestehende synthetische
Idempotenztest bestehen innerhalb der 110/110 grünen Vitest-Tests.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-08-16 | OFFEN | TC-000908 mangels Produktionsfixture blockiert |
| 2026-08-16 | IN_BEARBEITUNG | Fehlendes versioniertes Testartefakt als Ursache bestätigt; Fixture-Erstellung begonnen |
| 2026-08-16 | BEHOBEN | Gehashte Schema-5-Fixture samt Bestands-, Cleanup- und Idempotenztest ergänzt |
| 2026-08-16 | VERIFIZIERT | QA-Nachtest: Fixture-Hash `6dc63e33…d1c46c4` stimmt; vollständige 110-Test-Suite einschließlich zweimaliger Migration besteht |

---

## Übergabe: QA → BE

**Datum:** 2026-08-16
**Von:** QA Engineer (QA)
**An:** Backend Developer (BE)
**Nächster Befehl:** `/implement be second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| BUG-000012 | OFFEN | `testing/BUG-000012-schema-5-production-fixture-missing.md` | Fixture plus Hashmanifest erforderlich |

### Kritische Informationen für Empfänger

Der synthetische Schema-6-Idempotenztest bleibt wertvoll, ersetzt aber keine repräsentative
Schema-5-Produktionsfixture.

### Offene Fragen (vererbt)

Keine.

### Nicht-Ziele

Keine Verwendung realer Nutzerdaten als Fixture.

---

## Übergabe: BE → QA

**Datum:** 2026-08-16  
**Von:** Backend Developer (BE)  
**An:** QA Engineer (QA)  
**Nächster Befehl:** `/test-run second-brain 7`

QA soll TC-000908 mit der versionierten Fixture ausführen und Hash sowie erwartete
Datensätze unabhängig bestätigen.

---

*Aktualisiert von: QA-Agent | Datum: 2026-08-16 | Version: 1.3*
