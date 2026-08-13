---
id: BUG-000007
title: Bug — Externer Einmal-Consent ist produktiv nicht erreichbar
version: 1.0
status: BEHOBEN
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

**Direkte Ursache:** Die `ConsentService`-Methoden waren weder über einen Sidecar-Befehl noch
über den Plugin-Transport erreichbar. Zudem enthielt der Adapter-Auftrag nur den Hash des
geprüften Payloads; ein bestätigter Minimalpayload konnte daher nie übertragen werden.

**Zugrundeliegende (systemische) Ursache:** Die Sprint-5-Implementierung behandelte den
Consent-Service als isolierte Unit-Test-Komponente und modellierte keine durchgängige
UI → IPC → Sidecar → Remote-MCP-Trust-Boundary.

**Andere Stellen mit demselben Muster:** Der Provider-Handshake war ebenfalls nur eine
lokale Schema-/Registry-Prüfung (BUG-000008), ohne konkreten Remote-Adapter.

**Ausgeschlossene Ursachen:** Automatisierte Tests und Build schlagen nicht fehl; die
vorhandenen Unit-Tests prüfen nur die isolierte Klasse.

## Fix-Ansatz

Ein sichtbarer Review- und Einmal-Confirm-Pfad ruft einen Sidecar-Transferbefehl auf. Der
Sidecar erstellt und bestätigt den unveränderten Minimalpayload in einem Vorgang und gibt ihn
erst danach an einen konkreten HTTPS-MCP-Adapter weiter; Quittungen bleiben textfrei.

## Regressionsrisiko

**Einschätzung:** Hoch  
**Begründung:** Neue öffentliche Verträge, Persistenz-/Token-Lebensdauer, UI-Zustände und
eine echte Netzwerkgrenze müssen konsistent verbunden werden.

## Verifikation

**Implementierungsverifikation (2026-08-13):** `npm run lint`, `npm run build`,
`npm test` (79 Tests), `npm run test:coverage` und der sichtbare Playwright-Lauf (16 Tests)
sind grün. Der Browserlauf deckt Review, Checkbox-Gate, Payload-Invalidierung, Cancel,
Quittung und Disconnect ab. QA prüft TC-000507–510 zusätzlich gegen einen erreichbaren,
authentifizierten Nutzerendpunkt.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-08-12 | OFFEN | Produktiver Consent-Pfad und Adapter fehlen |
| 2026-08-13 | BEHOBEN | Produktpfad, exakte Payload-Bindung, Receipt und Browserregression an QA übergeben |

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

## Übergabe: FE+BE → QA

**Datum:** 2026-08-13
**Von:** Frontend- und Backend-Agent (FE+BE)
**An:** QA Engineer (QA)
**Nächster Befehl:** `/test-run second-brain 5`

Der öffentliche Pfad reicht vom nativen Review über IPC und Sidecar bis zum allowlisteten
HTTPS-MCP-Adapter. Einmalverbrauch wird vor dem Netzwerk-Await geclaimt; Policy-Drift,
Replay, Ablauf, breitere Scopes und URL-Credentials werden vor dem Transfer abgewiesen.
