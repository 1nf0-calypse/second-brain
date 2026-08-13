---
id: BUG-000009
title: Bug — Providertransfer ist nicht an den serverseitigen Einmal-Consent gebunden
version: 1.0
status: VERIFIZIERT
author-agent: RV (Code Reviewer)
date: 2026-08-13
project: second-brain
based-on: TP-000006@1.1, US-000007, ADR-000006
severity: BLOCKER
assigned-to: BE
supersedes: —
superseded-by: —
github-issue: 22
epic: Trust Boundary
github-milestone: —
estimate: M
size: M
iteration: 5
start-date: 2026-08-13
target-date: 2026-08-26
---

# Bug: Providertransfer ist nicht an den serverseitigen Einmal-Consent gebunden

## 1. Symptom

**Erwartetes Verhalten:** Der Sidecar darf einen Providertransfer nur nach einem zuvor
serverseitig gespeicherten, noch gültigen und exakt zum sichtbaren Payload passenden
Einmal-Token ausführen. Ohne dieses Token muss `CONSENT_REQUIRED` zurückkommen.

**Tatsächliches Verhalten:** `--provider-transfer` nimmt direkt einen vollständigen Request
entgegen, erzeugt einen neuen `ConsentService`, ruft darin `prepare` auf und bestätigt den
gerade selbst erzeugten Token unmittelbar. Der Checkbox- und Review-Zustand aus der UI ist
kein Bestandteil des Sidecar-Vertrags und wird nicht nachgewiesen.

**Auswirkung:** Ein Aufrufer kann einen gültigen Minimalpayload an einen erfolgreich
geprüften Endpoint senden, ohne dass der Sidecar eine sichtbare Nutzerbestätigung erzwingt.
Das verletzt US-000007 Szenario 2 und ADR-000006s Vorgabe, Consent serverseitig vor jedem
ausgehenden Adapteraufruf zu erzwingen.

## 2. Reproduktionsschritte

1. Einen HTTPS-MCP-Endpoint bereitstellen, der `initialize`, `tools/list`,
   `second-brain/scopes` und `second_brain_transfer_once` erfolgreich beantwortet.
2. `NodeSetupTransport.transferProviderOnce(vaultRoot, endpoint, request)` direkt mit einem
   gültigen Request aufrufen, ohne die Setup-View zu öffnen oder deren Checkbox zu setzen.
3. Den Adapteraufruf am Endpoint beobachten.

**Erwartet:** `CONSENT_REQUIRED`; kein `tools/call` am Endpoint.

**Tatsächlich:** Der Sidecar erzeugt selbst einen Preview-Token und ruft sofort
`ConsentService.confirm(preview.confirmationToken, ...)` auf; der Adaptertransfer wird
ausgeführt.

**Umgebung:** Windows, Node.js v24.15.0, Branch `feature/sprint-5`, Commit `1c61657`.
**Reproduzierbarkeit:** Immer bei einem erfolgreichen Endpoint.

## 3. Schweregrad & Zuweisung

**Schweregrad:** `BLOCKER`
**Begründung:** Die zentrale Datenschutz- und Trust-Boundary-Garantie ist technisch
umgehbar; der sichtbare Checkbox-Gate ist nur Client-Logik.
**Zugewiesen an:** BE

## 4. Evidenz

**Screenshot-Pfad:** Nutzerabnahme vom 2026-08-13 zeigt die UI-Checkbox, belegt aber keine
serverseitige Bindung.

**Code-Evidenz:**

- `apps/obsidian-plugin/src/ui/setup-view.ts:166-183` sperrt nur den UI-Button anhand von
  `reviewed.checked`.
- `apps/sidecar/src/bootstrap/main.ts:71-83` akzeptiert den kompletten Request, erstellt
  `new ConsentService()`, bereitet den Payload vor und bestätigt dessen neuen Token sofort.
- `apps/sidecar/src/providers/provider-service.ts:151-163` hält Tokens nur im
  Instanzspeicher; jede Child-Process-Invocation beginnt daher ohne vorherigen Review.

Die vorhandenen Tests prüfen Replay nur innerhalb einer einzelnen `ConsentService`-Instanz
(`tests/unit/provider-service.test.ts`) und decken diesen Prozessgrenzen-Bypass nicht ab.

## Betroffene Komponenten

- `apps/sidecar/src/bootstrap/main.ts`
- `apps/sidecar/src/providers/provider-service.ts`
- `apps/obsidian-plugin/src/ipc/node-setup-transport.ts`
- `apps/obsidian-plugin/src/ipc/setup-client.ts`
- `apps/obsidian-plugin/src/ui/setup-view.ts`

## Root-Cause

**Direkte Ursache:** Vorbereiten und Bestätigen liegen im selben neuen
`--provider-transfer`-Prozess. Der Prozess erhält weder ein vorher ausgegebenes Token noch
einen serverseitig belegten Bestätigungszustand.

**Zugrundeliegende (systemische) Ursache:** Der neue externe Transfer wurde als Einaufruf-
API modelliert, obwohl die Sicherheitseigenschaft eine zustandsbehaftete, atomare
Prepare→Review→Confirm-Prozessgrenze verlangt.

**Andere Stellen mit demselben Muster:** Keine bestätigt. Der lokale Mutation-Flow trennt
Prepare und Confirm bereits über einen gespeicherten Token und ist die passende Referenz.

**Ausgeschlossene Ursachen:** Die sichtbare Checkbox, ihr Styling und der Remote-Handshake
sind nicht die Ursache; sie verhindern den direkten Transportaufruf nicht.

## Fix-Ansatz

Zwei getrennte Sidecar-Operationen einführen: `prepare-provider-transfer` speichert einen
kurzlebigen, payload- und policy-gebundenen Token serverseitig; `confirm-provider-transfer`
akzeptiert ausschließlich diesen Token und verbraucht ihn vor dem Netzwerk-Await atomar.
Der Confirm-Contract darf keinen frei übergebenen Exzerpt-Payload enthalten. Ergänze einen
echten Child-Process-Test, der einen Confirm ohne vorherigen Prepare sowie Replay und
Payload-/Policy-Drift abweist.

## Regressionsrisiko

**Einschätzung:** Hoch
**Begründung:** Vertrag, Sidecar-Persistenz, Ablauf, Receipt und native UI müssen über eine
Prozessgrenze konsistent bleiben.

## Verifikation

**Implementierungsverifikation (2026-08-13):** `npm run build`, `npm test` (81 Tests)
und `npm run lint` bestehen. Der echte Node-Kindprozess-Test prüft einen fehlenden Token,
Prepare→Confirm über die persistente Prozessgrenze und Replay nach dem ersten Confirm.

**Regressionstest ergänzt:** Ja (`tests/integration/node-setup-transport.test.ts`).

**QA-Nachtest (2026-08-13):** Build, Lint, 81/81 Vitest-Tests, Coverage und 16/16 headed
Playwright-Fälle bestehen. Der Child-Process-Nachtest weist einen Confirm ohne Token mit
`CONSENT_REQUIRED` ab, speichert Prepare über die Prozessgrenze und weist Replay nach dem
ersten Confirm ab. Der Token wird vor dem erwarteten Remote-Fehler verbraucht.

## Status-Verlauf

| Datum | Status | Kommentar |
|---|---|---|
| 2026-08-13 | OFFEN | RV-Code-Review: Serverseitige Consent-Bindung fehlt. |
| 2026-08-13 | BEHOBEN | BE: persistierter Prepare-Token, separater Confirm ohne Payload und atomarer Einmalverbrauch implementiert. |
| 2026-08-13 | VERIFIZIERT | QA: unabhängiger Prozessgrenzen-Nachtest, vollständige Regression und headed Browserlauf bestanden. |

---

## Übergabe: RV → FE+BE

**Datum:** 2026-08-13
**Von:** Code Reviewer (RV)
**An:** Backend Developer (BE)
**Nächster Befehl:** `/implement be second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| BUG-000009 | OFFEN | `testing/BUG-000009-provider-consent-not-server-bound.md` | BLOCKER; Root Cause vor Fix verpflichtend |
| RV-000006 | REJECTED | `reviews/RV-000006-sprint-5.md` | Nutzerabnahme bedingt, technische Trust-Boundary abgelehnt |

---

*Erstellt von: RV-Agent | Datum: 2026-08-13 | Version: 1.0*
