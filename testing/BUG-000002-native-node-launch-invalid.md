---
id: BUG-000002
title: Bug — Nativer Setup-Pfad startet keinen verlässlichen Node-Sidecar
version: 1.0
status: OFFEN
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

**Direkte Ursache:**  

**Zugrundeliegende (systemische) Ursache:**  

**Andere Stellen mit demselben Muster:**  

**Ausgeschlossene Ursachen:**  

## Fix-Ansatz

Von FE/BE nach Root-Cause-Analyse auszufüllen.

## Regressionsrisiko

**Einschätzung:** Hoch  
**Begründung:** Prozessstart, Runtime-Kompatibilität und Claude-Konfiguration sind betroffen.

## Verifikation

Noch nicht verifiziert.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-07-30 | OFFEN | Durch QA bei Prüfung des nativen P0-Pfads erfasst |

## Übergabe: QA → FE/BE

**Nächster Befehl:** `/implement all second-brain`

Root-Cause ist vor jeder Codeänderung auszufüllen; ein echter
Obsidian-/Claude-Systemtest ist als Regression erforderlich.
