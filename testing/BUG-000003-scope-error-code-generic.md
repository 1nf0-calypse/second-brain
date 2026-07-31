---
id: BUG-000003
title: Bug — Scope-Verletzung liefert generischen Sidecar-Startfehler
version: 1.0
status: OFFEN
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
[AUSSTEHEND — BE]

**Zugrundeliegende (systemische) Ursache:**  
[AUSSTEHEND — BE]

**Andere Stellen mit demselben Muster:**  
[AUSSTEHEND — BE; mindestens CLI und MCP getrennt prüfen]

**Ausgeschlossene Ursachen:**

- Die Vault-Root-Policy selbst erlaubt keinen Zugriff; es liegt kein Datenleck vor.
- FTS5 oder Suchranking verursachen den Fehler nicht.

## Fix-Ansatz

[AUSSTEHEND — BE; typisierte Policy-/Validierungsfehler müssen an jeder öffentlichen
Transportgrenze auf dokumentierte ErrorCodeSchema-Werte abgebildet werden.]

## Regressionsrisiko

**Einschätzung:** [AUSSTEHEND — BE]  
**Begründung:** [AUSSTEHEND — BE]

## Verifikation

*(Wird nach Fix durch QA befüllt.)*

**Ursprüngliche Reproduktionsschritte erneut ausgeführt:** ausstehend.  
**Regressionstest ergänzt:** ausstehend.  
**Regressionstest schlägt ohne Fix fehl und besteht mit Fix:** nicht verifiziert.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-07-31 | OFFEN | Durch QA reproduziert; Root-Cause bewusst für BE offen |

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
