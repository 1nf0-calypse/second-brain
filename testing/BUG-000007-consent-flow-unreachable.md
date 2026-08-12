---
id: BUG-000007
title: Bug — Externer Einmal-Consent ist produktiv nicht erreichbar
version: 1.0
status: OFFEN
author-agent: QA (QA Engineer)
date: 2026-08-12
project: second-brain
based-on: TP-000006, US-000007, UX-000003
severity: BLOCKER
assigned-to: FE+BE
supersedes: —
superseded-by: —
github-issue: —
epic: Trust Boundary
github-milestone: —
estimate: —
size: L
iteration: 5
start-date: 2026-08-12
target-date: 2026-08-26
---

# Bug: Externer Einmal-Consent ist produktiv nicht erreichbar

## 1. Symptom

**Erwartetes Verhalten:** Ein Providertransfer kann über einen sichtbaren Prepare-/Review-/
Confirm-Pfad vorbereitet, exakt einmal bestätigt, ausgeführt und widerrufen werden. Der
Adapter erhält ausschließlich den bestätigten Minimalpayload.

**Tatsächliches Verhalten:** `ConsentService.prepare/confirm/revoke` sind nur aus Unit-Tests
erreichbar. UI, IPC, CLI und MCP bieten keinen Consent-Pfad. Es existiert keine konkrete
`ProviderAdapter`-Implementierung; dessen Port erhält außerdem nur den Payload-Hash und
nicht den bestätigten Text. Ein realer Transfer kann weder geprüft noch ausgeführt werden.

**Auswirkung:** US-000007 Szenario 2 und UX-000003 Journey 2 sind nicht nutzbar. Die
vorgeschriebene bewusste Bestätigung vor externem Datenfluss kann nicht end-to-end belegt
werden; Sprint-5-Release ist blockiert.

## 2. Reproduktionsschritte

1. Aktuelles Pluginpaket bauen und die Setup-View öffnen.
2. Nach `Review external data`, `I reviewed the exact data above` und
   `Allow this transfer once` suchen bzw. einen Providertransfer auslösen.
3. CLI-/MCP-Toolliste und IPC-Transport auf Consent-Prepare/Confirm prüfen.

**Umgebung:** Windows, Node.js v24.15.0, Branch `feature/sprint-5`, Commit `545b6d5`.
**Reproduzierbarkeit:** Immer.

## 3. Schweregrad & Zuweisung

**Schweregrad:** `BLOCKER`  
**Begründung:** Ein verpflichtender P0-Hauptpfad und die Datenschutzbestätigung fehlen.  
**Zugewiesen an:** FE+BE

## 4. Evidenz

**Screenshot-Pfad:** — — der geplante View-Zustand existiert nicht.  
**Trace-Pfad:** — — keine passende Playwright-Spec kann den Produktpfad öffnen.  
**Log-/Graph-Evidenz:** Codegraph: `ConsentService.prepare` hat 0 produktive Aufrufer;
`confirm` nur Selbstreferenz. Quelltextsuche findet die verbindliche Consent-Microcopy nur
in UX/TP, nicht in `apps/`.

## Betroffene Komponenten

- `apps/sidecar/src/providers/provider-service.ts`
- `apps/sidecar/src/bootstrap/main.ts`
- `apps/sidecar/src/mcp-gateway/server.ts`
- `apps/obsidian-plugin/src/ipc/`
- `apps/obsidian-plugin/src/ui/setup-view.ts`

## Root-Cause

**Direkte Ursache:** [Von FE/BE vor jeder Codeänderung auszufüllen.]

**Zugrundeliegende (systemische) Ursache:** [Von FE/BE auszufüllen.]

**Andere Stellen mit demselben Muster:** [Von FE/BE auszufüllen.]

**Ausgeschlossene Ursachen:** Automatisierte Tests und Build schlagen nicht fehl; die
vorhandenen Unit-Tests prüfen nur die isolierte Klasse.

## Fix-Ansatz

[Von FE/BE nach Root-Cause-Analyse auszufüllen.]

## Regressionsrisiko

**Einschätzung:** Hoch  
**Begründung:** Neue öffentliche Verträge, Persistenz-/Token-Lebensdauer, UI-Zustände und
eine echte Netzwerkgrenze müssen konsistent verbunden werden.

## Verifikation

*(Nach Fix durch QA: TC-000507–510 und E2E-000503–506.)*

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-08-12 | OFFEN | Produktiver Consent-Pfad und Adapter fehlen |

## Übergabe: QA → FE+BE

**Datum:** 2026-08-12  
**Von:** QA Engineer (QA)  
**An:** Frontend- und Backend-Agent (FE+BE)  
**Nächster Befehl:** `/implement all second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| BUG-000007 | OFFEN | `testing/BUG-000007-consent-flow-unreachable.md` | Root-Cause vor Fix verpflichtend |

### Kritische Informationen für Empfänger

- Unit-Tests sind kein Ersatz für den öffentlichen Nutzerpfad.
- Der freigegebene Minimalpayload muss am Adapter gebunden sein; ein Hash allein kann ihn
  nicht übertragen.

### Offene Fragen

Keine Reproduktionsfrage.

### Nicht-Ziele

Keine Provider-Credential-Speicherung und keine dauerhafte Freigabe.

---

*Erstellt von: QA-Agent | Datum: 2026-08-12 | Version: 1.0*
