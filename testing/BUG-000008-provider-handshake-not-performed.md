---
id: BUG-000008
title: Bug — Remote-Endpoint-Test führt keinen Handshake aus
version: 1.0
status: VERIFIZIERT
author-agent: QA (QA Engineer)
date: 2026-08-12
project: second-brain
based-on: TP-000006, US-000001, UX-000003
severity: BLOCKER
assigned-to: BE
supersedes: —
superseded-by: —
github-issue: —
epic: Einstieg und Zugriff
github-milestone: —
estimate: —
size: M
iteration: 5
start-date: 2026-08-12
target-date: 2026-08-26
---

# Bug: Remote-Endpoint-Test führt keinen Handshake aus

## 1. Symptom

**Erwartetes Verhalten:** `Test connection` prüft den nutzerverwalteten HTTPS-Endpoint,
einen authentifizierten Handshake, das Tool-Manifest und exakt die erlaubten Scopes.

**Tatsächliches Verhalten:** `--provider-handshake` führt keinen Netzwerkzugriff aus. Der
eingegebene Endpoint überschreibt zunächst die Registry-Konfiguration und wird anschließend
mit sich selbst verglichen. Jede schema-gültige HTTPS-URL ergibt daher `configured: true`
und die fest codierten Scopes, selbst wenn Host und MCP-Server nicht existieren.

**Auswirkung:** Nutzer erhalten eine irreführende positive Konfigurationsaussage; Endpoint,
Authentifizierung, Manifest und tatsächliche Scopes bleiben ungeprüft. US-000001 und
UX-000003 Journey 1 sind nicht erfüllt.

## 2. Reproduktionsschritte

1. `npm run build` ausführen.
2. `NodeSetupTransport.inspectProvider('chatgpt', 'https://does-not-exist.invalid/mcp')`
   gegen den realen Sidecar aufrufen.
3. Antwort prüfen.

**Umgebung:** Windows, Node.js v24.15.0, Branch `feature/sprint-5`, Commit `545b6d5`.
**Reproduzierbarkeit:** Immer; die Logik ist vollständig lokal und deterministisch.

## 3. Schweregrad & Zuweisung

**Schweregrad:** `BLOCKER`  
**Begründung:** Der zentrale Setup-Check behauptet Konfiguration ohne die vorgeschriebene
Kompatibilitäts- und Scope-Prüfung.  
**Zugewiesen an:** BE

## 4. Evidenz

**Screenshot-/Trace-Pfad:** —  
**Quelltextevidenz:** `apps/sidecar/src/bootstrap/main.ts` setzt
`{ ...getApprovedProviderConfiguration(provider), endpoint }`; danach vergleicht
`inspectProviderConnection` `request.endpoint === configured.endpoint` und liefert die
festen `REQUIRED_SCOPES`. Eine konkrete Netzwerkadapter-Implementierung existiert nicht.

## Betroffene Komponenten

- `apps/sidecar/src/bootstrap/main.ts`
- `apps/sidecar/src/providers/provider-service.ts`
- `apps/obsidian-plugin/src/ipc/node-setup-transport.ts`

## Root-Cause

**Direkte Ursache:** Der CLI-Zweig ersetzte den Registry-Endpoint durch die Eingabe und
verglich die Eingabe anschließend mit sich selbst. `inspectProviderConnection` führte weder
einen HTTP-Aufruf noch eine Manifest- oder Scope-Prüfung aus.

**Zugrundeliegende (systemische) Ursache:** Es gab keinen produktiven Remote-MCP-Adapter
und die Handshake-Antwort war im Vertrag fälschlich auf `connected: false` festgeschrieben.

**Andere Stellen mit demselben Muster:** Der nicht angebundene Consent-Port aus BUG-000007
verwendete ebenfalls eine Abstraktion ohne produktive Transportimplementierung.

**Ausgeschlossene Ursachen:** DNS, Firewall und Provider-Verfügbarkeit sind nicht Ursache;
es wird überhaupt kein Netzwerkzugriff versucht.

## Fix-Ansatz

Der Sidecar führt einen zeitlich begrenzten HTTPS-MCP-Initialize- und Tool-Manifest-Aufruf
aus, akzeptiert den Endpunkt nicht als Registry-Ersatz und meldet erst nach Scope-Nachweis
`connected: true`. Netzwerk- und Scope-Fehler bleiben getrennt und inhaltsarm.

## Regressionsrisiko

**Einschätzung:** Hoch  
**Begründung:** Authentifizierter Remote-MCP-Transport, Timeout, Manifestvalidierung und
Scope-Fehlersemantik betreffen die neue Trust Boundary.

## Verifikation

**Implementierungsverifikation (2026-08-13):** `npm run lint`, `npm run build`,
`npm test` (79 Tests), `npm run test:coverage` und der sichtbare Playwright-Lauf (16 Tests)
sind grün. Unerreichbare Endpunkte, fehlende oder breitere Scopes und URL-Credentials werden
abgewiesen. QA prüft TC-000501, 502, 504 und 505 zusätzlich gegen einen erreichbaren,
authentifizierten Nutzerendpunkt.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-08-12 | OFFEN | Selbstvergleich statt Remote-Handshake festgestellt |
| 2026-08-13 | BEHOBEN | Netzwerk-, Manifest- und exakter Scope-Handshake an QA übergeben |
| 2026-08-13 | VERIFIZIERT | QA-Nachtest: 79/79 Vitest- und 16/16 headed Playwright-Regressionen; ungültiger Endpoint, Scope-Abweichung und Credential-URL werden abgewiesen. |

## Übergabe: QA → BE

**Datum:** 2026-08-12  
**Von:** QA Engineer (QA)  
**An:** Backend-Agent (BE)  
**Nächster Befehl:** `/implement be second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| BUG-000008 | OFFEN | `testing/BUG-000008-provider-handshake-not-performed.md` | Root-Cause vor Fix verpflichtend |

### Kritische Informationen für Empfänger

- Eine syntaktisch gültige URL ist kein bestandener Handshake.
- `connected` darf erst nach authentifiziertem Manifest-/Scope-Nachweis wahr sein.

### Offene Fragen

Keine Reproduktionsfrage.

### Nicht-Ziele

Keine automatische Tunnelbereitstellung und keine Credential-Speicherung.

---

*Erstellt von: QA-Agent | Datum: 2026-08-12 | Version: 1.0*

## Übergabe: BE → QA

**Datum:** 2026-08-13
**Von:** Backend-Agent (BE)
**An:** QA Engineer (QA)
**Nächster Befehl:** `/test-run second-brain 5`

`connected: true` folgt nur auf einen erfolgreichen HTTPS-MCP-Initialize-, Manifest- und
exakten Scope-Nachweis. Öffentliche Fehler bleiben typisiert und enthalten keine Remote-
oder Credentialdetails.
