---
id: BUG-000003
title: Bug — Scope-Verletzung liefert generischen Sidecar-Startfehler
version: 1.2
status: VERIFIZIERT
author-agent: QA (QA Engineer)
date: 2026-07-31
project: second-brain
based-on: TP-000003, US-000012
severity: BLOCKER
assigned-to: BE
supersedes: —
superseded-by: —
---

# Bug: Scope-Verletzung liefert generischen Sidecar-Startfehler

## 1. Symptom

**Erwartetes Verhalten:** Traversal, absolute Fremdpfade und Symlink-Escapes werden mit
einem stabilen, dokumentierten Scope-Fehlercode aus dem öffentlichen Vertrag abgelehnt.

**Tatsächliches Verhalten:** Der Zugriff wird sicher blockiert, die CLI-/Transportantwort
liefert jedoch unabhängig von der Ursache `SIDECAR_START_FAILED`.

**Auswirkung:** US-000012 Szenario 3 und TC-000203 scheitern. Clients können eine
Policy-Ablehnung nicht stabil von einem Startfehler unterscheiden. Fremde Inhalte werden
nicht offengelegt.

## 2. Reproduktionsschritte

1. Synthetischen Obsidian-Vault indexieren.
2. Sidecar mit `--read-note` und `SECOND_BRAIN_READ_PATH=..\outside.md` starten.
3. Prozessfehler auf stderr auswerten.

**Umgebung:** Windows, Node.js v24.15.0, `feature/sprint-2`, Commit `1718e7a`,
synthetischer 503-Dateien-Vault.  
**Reproduzierbarkeit:** Immer.

## 3. Schweregrad & Zuweisung

**Schweregrad:** `BLOCKER`  
**Begründung:** Ein verbindliches P0-Akzeptanzszenario und der versionierte öffentliche
Fehlervertrag sind nicht erfüllt. Die Security-Grenze selbst hält.  
**Zugewiesen an:** BE

## 4. Evidenz

**Screenshot-Pfad:** Nicht anwendbar — deterministischer CLI-/Transportfund.  
**Trace-Pfad:** Nicht anwendbar.  
**Log-Auszug / Stack Trace:**

```json
{"level":"error","code":"SIDECAR_START_FAILED","message":"This path leaves the vault you approved. Access was blocked."}
```

Prozess-Exitcode: `1`; stdout war leer.

## Betroffene Komponenten

- `apps/sidecar/src/bootstrap/main.ts`
- `apps/sidecar/src/policy/vault-root.ts`
- `packages/contracts/src/index.ts`
- `apps/sidecar/src/mcp-gateway/server.ts`

## Root-Cause

> **Von BE vor jeder Codeänderung auszufüllen.**

**Direkte Ursache:**  
`apps/sidecar/src/bootstrap/main.ts` fängt alle Fehler am Prozessrand pauschal ab und ersetzt
ihren Typ durch den nicht im `ErrorCodeSchema` enthaltenen Code `SIDECAR_START_FAILED`.
`VaultScopeError` trägt außerdem selbst keinen maschinenlesbaren Fehlercode.

**Zugrundeliegende (systemische) Ursache:**  
Der Sprint-2-Vertrag definierte zwar erlaubte Fehlercodes, aber kein laufzeitvalidiertes
öffentliches Fehlerantwortschema und keine gemeinsame Abbildung von Domain-/Policy-Fehlern
auf CLI und MCP. Die Tests prüften bisher nur, dass Scope-Escapes werfen, nicht den
transportierten Code.

**Andere Stellen mit demselben Muster:**  
Ja. Der MCP-Tool-Handler lässt `VaultScopeError` ungeordnet bis zum SDK propagieren; dadurch
ist auch dort `PATH_OUTSIDE_VAULT` nicht als stabiler öffentlicher Payload garantiert.
Zod-Validierungsfehler besitzen ebenfalls noch keine zentrale Zuordnung zu `INVALID_QUERY`.

**Ausgeschlossene Ursachen:**

- Die Vault-Root-Policy selbst erlaubt keinen Zugriff; es liegt kein Datenleck vor.
- FTS5 oder Suchranking verursachen den Fehler nicht.

## Fix-Ansatz

Ein `ErrorResponseSchema` wird zum versionierten Vertrag ergänzt. `VaultScopeError` trägt
`INVALID_VAULT` oder `PATH_OUTSIDE_VAULT`. Eine zentrale Mapper-Funktion validiert
öffentliche Fehlerantworten und wird sowohl vom CLI-Catch als auch vom MCP-Handler genutzt.
Regressionstests prüfen die unveränderte Reproduktion am echten Sidecar-Prozess und die
MCP-Fehlerantwort.

## Regressionsrisiko

**Einschätzung:** Mittel
**Begründung:** Die zentrale Abbildung betrifft alle öffentlichen Sidecar-Fehlerpfade.
Erfolgsantworten und die Vault-Policy bleiben unverändert; Regressionen könnten jedoch die
Recovery-Semantik für Setup, Suche und Lesen verändern.

## Verifikation

*(Wird nach Fix durch QA befüllt.)*

**Ursprüngliche Reproduktionsschritte erneut ausgeführt:** 2026-07-31 — Fehler tritt nicht
mehr auf; Exitcode 1, stdout leer, stderr enthält `PATH_OUTSIDE_VAULT`.
**Regressionstest ergänzt:** Ja —
`tests/integration/node-setup-transport.test.ts` und
`tests/unit/public-error.test.ts`.
**Regressionstest schlägt ohne Fix fehl und besteht mit Fix:** Verifiziert; der
Kindprozess-Test schlug im BE-Nachweis vor der vollständigen Plugin-Abbildung fehl und
besteht nach dem Fix. QA hat 40/40 Tests unabhängig erneut ausgeführt.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-07-31 | OFFEN | Durch QA reproduziert; Root-Cause bewusst für BE offen |
| 2026-07-31 | IN_BEARBEITUNG | BE reproduziert Fehler und dokumentiert Root-Cause vor Codeänderung |
| 2026-07-31 | BEHOBEN | Gemeinsames Fehlerantwortschema und CLI-/MCP-/Plugin-Abbildung implementiert; Regressionstests grün |
| 2026-07-31 | VERIFIZIERT | QA-Reproduktion und vollständige Regression erfolgreich |

---

## Übergabe: QA → BE

**Datum:** 2026-07-31  
**Von:** QA Engineer (QA)  
**An:** Backend Developer (BE)  
**Nächster Befehl:** `/implement be second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| BUG-000003 | OFFEN | `testing/BUG-000003-scope-error-code-generic.md` | Zugriff sicher blockiert, öffentlicher Fehlercode falsch |

### Kritische Informationen für Empfänger

- Root-Cause ist vor jeder Codeänderung auszufüllen.
- Regressionstests müssen sowohl CLI- als auch MCP-Fehlerabbildung prüfen.
- Der Fix darf keine zusätzlichen Vault- oder Fremdinhalte loggen.

### Offene Fragen (vererbt)

Keine Reproduktionsfrage; Fehler tritt deterministisch auf.

### Nicht-Ziele

Keine Änderung an Scope-Policy, semantischer Suche oder Client-Kompatibilitätsmatrix.

---

*Erstellt von: QA-Agent | Datum: 2026-07-31 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.2 | 2026-07-31 | Ursprüngliche Reproduktion und Regression durch QA verifiziert | QA |
| 1.1 | 2026-07-31 | Root-Cause dokumentiert, zentralen Fehlervertrag implementiert und zur QA-Verifikation übergeben | BE |
| 1.0 | 2026-07-31 | Fehler durch QA erfasst | QA |

---

## Übergabe: BE → QA

**Datum:** 2026-07-31
**Von:** Backend Developer (BE)
**An:** QA Engineer (QA)
**Nächster Befehl:** `/test-run second-brain 2`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| BUG-000003 | BEHOBEN | `testing/BUG-000003-scope-error-code-generic.md` | Root-Cause und Fix vollständig |
| Fehlervertrag | implementiert | `packages/contracts/src/index.ts` | `ErrorResponseSchema` mit erlaubten Codes |
| Mapper | implementiert | `apps/sidecar/src/errors/public-error.ts` | Gemeinsame CLI-/MCP-Abbildung |
| Regressionstests | bestanden | `tests/unit/public-error.test.ts`, `tests/integration/node-setup-transport.test.ts` | 40/40 Vitest grün |

### Kritische Informationen für Empfänger

- Vor dem Fix reproduzierte der neue Kindprozess-Test die generische UI-Meldung und schlug
  fehl; nach dem Fix transportiert er `PATH_OUTSIDE_VAULT`.
- Der reale CLI-Nachlauf ergab Exitcode 1, leeres stdout und den erwarteten Code auf stderr.
- QA muss die ursprünglichen Reproduktionsschritte unabhängig erneut ausführen und erst
  danach den Status auf `VERIFIZIERT` setzen.

### Offene Fragen (vererbt)

Keine.

### Nicht-Ziele

Keine Änderung an der blockierenden Vault-Policy oder an Suchranking und Semantik.

---
