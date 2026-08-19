---
id: BUG-000010
title: Bug — APPLYING-Recovery scheitert bei noch nicht angelegtem Ziel
version: 1.3
status: VERIFIZIERT
author-agent: QA (QA Engineer)
date: 2026-08-16
project: second-brain
based-on: TP-000009, US-000017
severity: BLOCKER
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

# Bug: APPLYING-Recovery scheitert bei noch nicht angelegtem Ziel

## 1. Symptom

**Erwartetes Verhalten:** Ein vor dem ersten Dateischreibvorgang unterbrochener Create-
Vorgang wird nach Restart ohne Vault-Mutation deterministisch als `Incomplete` abgeschlossen.

**Tatsächliches Verhalten:** `recoverApplying()` wirft bei jedem Restart
`COMPILATION_INVALID_TARGET`, weil die neue Zielnotiz noch nicht existiert. Der Datensatz
bleibt `applying` und wird nicht in einen wahrheitsgetreuen terminalen Zustand überführt.

**Auswirkung:** Der P0-Recovery-Pfad von US-000017 ist blockiert. Nach einem Crash im
kritischen Fenster bleiben Inbox und History ohne belastbaren Endzustand.

## 2. Reproduktionsschritte

1. Eine Compilation für eine noch nicht existierende Markdown-Zieldatei einreichen.
2. Den Datensatz wie nach einem Prozessabbruch vor dem Write auf `applying` setzen.
3. Sidecar/`CompilationInboxService` neu starten und `recoverApplying()` ausführen.
4. Den Lauf fünfmal wiederholen.

**Umgebung:** Windows 11; Node.js 24.15.0; Contract 3; Schema 6; temporärer QA-Vault.
**Reproduzierbarkeit:** Immer (5/5 Restarts).

## 3. Schweregrad & Zuweisung

**Schweregrad:** `BLOCKER`
**Begründung:** Verbindlicher P0-Restart-/Datenintegritätspfad schlägt reproduzierbar fehl
und verhindert Gate 7.
**Zugewiesen an:** BE

## 4. Evidenz

**Screenshot-Pfad:** —
**Trace-Pfad:** —
**Log-Auszug / Stack Trace:**

```text
CompilationInboxError: Markdown file Restart-0.md does not exist.
code: COMPILATION_INVALID_TARGET
at CompilationInboxService.resolveTarget (...compilation-inbox-service.ts:559)
at CompilationInboxService.recoverApplying (...compilation-inbox-service.ts:87)
```

Reproduktionsbefehl:

```powershell
npx vite-node tests/performance/compilation-baseline.ts
```

Ergebnis: fünf Zustände `error`, fünfmal `COMPILATION_INVALID_TARGET`,
`deterministic: false`.

## Betroffene Komponenten

- `apps/sidecar/src/compilations/compilation-inbox-service.ts`
- `tests/performance/compilation-baseline.ts`
- `tests/integration/compilation-inbox-service.test.ts`

## Root-Cause

`recoverApplying()` löst das gespeicherte Ziel stets mit `allowMissing = false` auf. Das ist
für Updates korrekt, widerspricht aber dem regulären Create-Zustand: Vor dem ersten Write
existiert die Zielnotiz absichtlich noch nicht und `before_hash` ist `NULL`. Die
Pfadauflösung bricht deshalb mit `COMPILATION_INVALID_TARGET` ab, bevor der vorhandene
Vergleich `currentHash === before_hash` den Vorgang als `incomplete` abschließen kann.

Systemisch wurde nur die Recovery nach bereits erfolgreichem Write getestet. Das zweite
zulässige Crashfenster — Create vor Write — fehlte als Regressionstest. Andere
Aufrufstellen von `resolveTarget()` sind nicht betroffen, da nur die Recovery beide
persistierten Ausgangszustände rekonstruieren muss.

## Fix-Ansatz

Die Recovery darf ein fehlendes gespeichertes Ziel auflösen. Danach entscheidet weiterhin
ausschließlich der Hashvergleich: `after_hash` führt zu `confirmed`, `before_hash = NULL`
bei fehlender Datei zu `incomplete`; jeder abweichende Zustand bleibt ein Konflikt. Ein
Integrationstest bildet den Create-Abbruch vor dem Write ab und prüft terminalen Status,
History und ausbleibende Vault-Mutation.

## Regressionsrisiko

**Einschätzung:** Hoch
**Begründung:** Recovery entscheidet über tatsächliche Vault- und Audit-Zustände nach einem
Prozessabbruch.

## Verifikation

**Implementierungsverifikation (2026-08-16):** Der neue Integrationstest bildet den Crash
eines Creates vor dem ersten Write ab. Status und History enden ohne Vault-Datei als
`incomplete`. Die Performance-Recovery liefert über fünf unabhängige Restarts fünfmal
`incomplete`, keinen Fehler und `deterministic: true`.

**Regression:** 110/110 Vitest-Tests, Build und Lint bestanden. Die bestehende Recovery
nach bereits geschriebenem After-Hash bleibt grün. Traversal-, Reserved- und
Nicht-Markdown-Prüfungen bleiben unverändert aktiv.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-08-16 | OFFEN | In PERF-000906 reproduziert; 5/5 Restarts fehlgeschlagen |
| 2026-08-16 | IN_BEARBEITUNG | Root Cause bestätigt; Recovery löst Create-Ziel fälschlich nur bei vorhandener Datei auf |
| 2026-08-16 | BEHOBEN | Fehlendes Create-Ziel in Recovery zugelassen; Hashentscheidung und Regressionstest bestanden |
| 2026-08-16 | VERIFIZIERT | QA-Nachtest: fünf von fünf Neustarts enden als `incomplete`, ohne Fehler und ohne Vault-Mutation |

---

## Übergabe: QA → BE

**Datum:** 2026-08-16
**Von:** QA Engineer (QA)
**An:** Backend Developer (BE)
**Nächster Befehl:** `/implement be second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| BUG-000010 | OFFEN | `testing/BUG-000010-applying-create-recovery-invalid-target.md` | Root-Cause vor Fix ausfüllen |

### Kritische Informationen für Empfänger

Der Fall betrifft ein Create-Ziel, das beim Crash noch nicht existiert. Ein bereits mit dem
After-Hash geschriebenes Ziel ist durch den vorhandenen Integrationstest abgedeckt und grün.

### Offene Fragen (vererbt)

Keine.

### Nicht-Ziele

Kein automatischer Fix und keine Änderung der Saga-Semantik durch QA.

---

## Übergabe: BE → QA

**Datum:** 2026-08-16  
**Von:** Backend Developer (BE)  
**An:** QA Engineer (QA)  
**Nächster Befehl:** `/test-run second-brain 7`

QA soll insbesondere TC-000906 erneut ausführen und den Status erst nach unabhängiger
Reproduktion auf `VERIFIZIERT` setzen.

---

*Aktualisiert von: QA-Agent | Datum: 2026-08-16 | Version: 1.3*
