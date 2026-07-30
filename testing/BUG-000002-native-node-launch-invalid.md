---
id: BUG-000002
title: Bug — Nativer Setup-Pfad startet keinen verlässlichen Node-Sidecar
version: 1.0
status: VERIFIZIERT
author-agent: QA (QA Engineer)
date: 2026-07-30
project: second-brain
based-on: TP-000001, US-000011
severity: BLOCKER
assigned-to: FE+BE
supersedes: —
superseded-by: —
---

# Bug: Nativer Setup-Pfad startet keinen verlässlichen Node-Sidecar

## 1. Symptom

**Erwartetes Verhalten:** Die native Obsidian-View startet den gebauten Node-Sidecar und
kopiert eine unmittelbar nutzbare Claude-Desktop-Konfiguration.

**Tatsächliches Verhalten:** `NodeSetupTransport` verwendet `process.execPath`; im
Electron-Host ist dies die Obsidian-Anwendung, nicht eine garantierte Node-24-Runtime.
Die kopierte Konfiguration enthält zusätzlich den Literal-Platzhalter
`<path-to-second-brain-sidecar>`.

**Auswirkung:** Verbindungstest und kopierte Claude-Konfiguration sind im echten
Obsidian-/Claude-Pfad nicht ausführbar.

## 2. Reproduktionsschritte

1. Gebündelten Plugin-Code bzw. Quellpfad für `NodeSetupTransport` prüfen.
2. `createConfigurationPreview()` mit einem gültigen Vault-Pfad aufrufen.
3. Programm und Argumente mit einem realen Obsidian-Electron-Prozess vergleichen.

**Umgebung:** Windows 11, Obsidian Desktop 1.12.7, Node.js 24  
**Reproduzierbarkeit:** Immer

## 3. Schweregrad & Zuweisung

**Schweregrad:** `BLOCKER`  
**Begründung:** Der einzige Sprint-1-Client kann den freigegebenen P0-Happy-Path nicht
abschließen.  
**Zugewiesen an:** FE+BE

## 4. Evidenz

```text
execFile(process.execPath, [this.sidecarEntry, '--setup-handshake'], ...)
args: ['<path-to-second-brain-sidecar>']
```

Betroffene Komponenten:

- `apps/obsidian-plugin/src/ipc/node-setup-transport.ts`
- `apps/obsidian-plugin/src/ui/presentation.ts`
- `apps/sidecar/src/bootstrap/setup-service.ts`

## Root-Cause

**Direkte Ursache:** Der Plugin-Transport verwendet `process.execPath`, obwohl dieser Wert im
Obsidian-Electron-Prozess auf die Obsidian-Anwendung zeigt. Parallel erzeugt
`createConfigurationPreview()` einen Literal-Platzhalter statt des bereits bekannten
absoluten Sidecar-Pfads.

**Zugrundeliegende (systemische) Ursache:** Die Node-Prozessauflösung wurde in Node-basierten
Tests gegen `process.execPath` entworfen und nicht als expliziter Runtime-Vertrag an der
Electron-Grenze modelliert. Die UI-Präsentationslogik erhielt den Sidecar-Pfad nicht als
Abhängigkeit; deshalb konnte sie nur eine unverbindliche Vorlage erzeugen.

**Andere Stellen mit demselben Muster:** `createClaudeDesktopConfiguration()` im Sidecar
verwendet ebenfalls `process.execPath` und erzeugt damit maschinenabhängige statt portable
Konfiguration.

**Ausgeschlossene Ursachen:**

- Kein MCP-Vertragsfehler; der direkte Sidecar-Handshake ist mit Node 24 erfolgreich.
- Kein Claude-API-Key- oder Authentifizierungsproblem.

## Fix-Ansatz

Der lokale Runtime-Vertrag verwendet explizit `node` (optional injizierbar für Tests) und
übergibt den absoluten Paket-Sidecar-Pfad vom Plugin-Entrypoint bis zur View. Sowohl der
Transport als auch die kopierte Claude-Konfiguration nutzen damit dieselbe ausführbare
Runtime und denselben realen Entry. Regressionstests prüfen den echten Kindprozess sowie
das Fehlen von Platzhaltern.

## Regressionsrisiko

**Einschätzung:** Hoch  
**Begründung:** Prozessstart, Runtime-Kompatibilität und Claude-Konfiguration sind betroffen.

## Verifikation

**Ursprüngliche Reproduktionsschritte erneut ausgeführt:** 2026-07-30 — Ergebnis: Der
Fehler tritt nicht mehr auf. Der reale Node-Kindprozess liefert den versionierten
`setup:read`-Handshake, und die Konfiguration enthält den realen Sidecar-Pfad ohne Platzhalter.

**Regressionstest ergänzt:** Ja (`tests/integration/node-setup-transport.test.ts`,
`tests/e2e/setup-flow.test.ts`, `tests/compatibility/setup-contract.test.ts`)

**Regressionstest schlägt ohne Fix fehl und besteht mit Fix:** Verifiziert.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-07-30 | OFFEN | Durch QA bei Prüfung des nativen P0-Pfads erfasst |
| 2026-07-30 | IN_BEARBEITUNG | Root-Cause vor Codeänderung dokumentiert |
| 2026-07-30 | BEHOBEN | Explizite Node-Runtime und realer Sidecar-Pfad implementiert |
| 2026-07-30 | VERIFIZIERT | QA hat Prozessstart, Vertrag und Konfigurationspfad geprüft |

## Übergabe: FE/BE → QA

**Datum:** 2026-07-30
**Von:** Frontend-/Backend-Agent (FE/BE)
**An:** QA Engineer (QA)
**Nächster Befehl:** `/test-run second-brain 1`

Der Integrationstest startet den Sidecar als echten Node-Kindprozess. QA soll den
abschließenden Obsidian-/Claude-Desktop-Systempfad verifizieren.
