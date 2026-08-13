---
id: RV-000007
title: Code Review Second Brain Sprint 6
version: 1.0
status: REQUEST_CHANGES
author-agent: RV (Code Reviewer)
date: 2026-08-13
project: second-brain
sprint: 6
reviewed-stories: US-000003
qa-report: TR-000009@1.0
supersedes: —
superseded-by: —
---

# Code Review: Second Brain — Sprint 6

## Entscheidung

**REQUEST_CHANGES.** Build, Lint und die vorhandenen Tests sind grün, aber drei MAJOR-
Probleme verletzen die verbindliche Autonomie-Policy. Insbesondere sind "60 Mutationen je
Aktivierung", "Pause sofort" und der native automatische Write-Flow nicht gewährleistet.

## Befunde

### MAJOR R6-001: Reaktivierung umgeht das 60/60-Limit

**Stellen:** `apps/sidecar/src/mutations/mutation-service.ts:85-101`,
`apps/sidecar/src/mutations/mutation-service.ts:323-329`

`activateAutonomy()` löscht den einzigen Policy-Datensatz und legt ihn mit
`used_mutations = 0` und einem neuen Ablaufzeitpunkt an. Ein Client kann daher während der
ersten Stunde nach 59 oder 60 Writes erneut aktivieren und sofort ein frisches Budget von 60
Writes erhalten. Es gibt weder eine Aktivierungs-Historie noch eine Sperre bis zum Ende des
60-Minuten-Fensters.

Das widerspricht US-000003:36-39 und SP-000007:42-44 (höchstens 60 erfolgreiche
Mutationen je Aktivierung und 60-Minuten-Zeitfenster; keine stille Verlängerung).

**Reproduktion:** Human-out aktivieren, 60 automatische Create/Update ausführen,
`second_brain_activate_autonomy({mode: "human-out", reviewed: true})` erneut aufrufen und
eine 61. Änderung anwenden. Diese wird akzeptiert.

**Erwartete Korrektur:** Aktivierungsperiode unveränderlich identifizieren und Reaktivierung
bis Ablauf ablehnen, oder nur eine explizit dokumentierte neue Periode nach Ablauf zulassen.
Einen Regressionstest für Reaktivierung nach teilweise verbrauchtem und ausgeschöpftem Budget
ergänzen.

### MAJOR R6-002: Eine bereits reservierte Mutation kann nach Pause noch schreiben

**Stellen:** `apps/sidecar/src/mutations/mutation-service.ts:128-153`,
`apps/sidecar/src/mutations/mutation-service.ts:335-346`

`executeAutonomous()` erhöht den Zähler und committet den Claim, bevor es asynchron Scope,
Hash und Dateioperation ausführt. `pauseAutonomy()` kann anschließend erfolgreich laufen,
doch `commitAutomatic()` prüft Policy/Ablauf/Pause vor dem Write nicht erneut. Eine wartende
oder verlangsamte Anfrage schreibt also nach erfolgreicher Pause weiter.

Das verletzt US-000003:74-78 sowie SP-000007:44 und :92: Pause muss neue automatische
Mutationen sofort blockieren. SP-000007:106 benennt genau dieses Risiko und fordert die
Prüfung unmittelbar vor dem Write.

**Reproduktion:** Einen File-Operations-Testdouble so verzögern, dass der Budget-Claim
abgeschlossen ist; parallel `pauseAutonomy()` aufrufen und danach den Write freigeben. Die
Datei wird trotz pausiertem Status erstellt/aktualisiert.

**Erwartete Korrektur:** Vor dem Dateischreiben atomar gegen dieselbe Aktivierung nochmals
prüfen/claimen oder Pause und Write so serialisieren, dass eine nach der Pause beginnende
Dateioperation nicht mehr stattfinden kann. Ein deterministischer Pause-gegen-Write-Test ist
erforderlich.

### MAJOR R6-003: Die native Ansicht bietet keinen automatischen Schreibpfad

**Stellen:** `apps/obsidian-plugin/src/ui/mutation-view.ts:44-81`, `:153-178`,
`apps/obsidian-plugin/src/ipc/mutation-client.ts:14-65`,
`apps/obsidian-plugin/src/ipc/node-setup-transport.ts:160-193`

Die Ansicht kann Modus aktivieren, Status lesen und pausieren. Ihre einzige Notizänderung
bleibt jedoch `prepareMutation()` plus `confirmMutation()`; kein `MutationTransport`-Methode,
kein UI-Handler und kein CLI-Transport ruft `--autonomous-mutation` auf. Nutzer sehen somit
einen aktivierten Modus, erhalten für jede Änderung aber weiterhin die Human-in-Vorschau und
Bestätigung. Der serverseitige automatische MCP-Tool-Pfad ist aus der nativen Ansicht nicht
erreichbar.

Damit fehlen US-000003 Szenario 2/3 und SP-000007:58-62, :90-96 in der ausgelieferten
Obsidian-Interaktion. Dies erklärt auch die im QA-Bericht dokumentierte fehlende dedizierte
Autonomie-E2E.

**Erwartete Korrektur:** Einen expliziten, klar beschrifteten automatischen
Create/Update-Pfad an `executeAutonomous` anbinden, Restbudget/Fehler aktualisieren und
Human-in als Fallback beibehalten. Headed Playwright für beide Modi, Pause und Rückfall sowie
native Tastaturprüfung ergänzen.

## Testlücken

- Kein Test für Reaktivierung innerhalb des laufenden Zeitfensters.
- Kein Race-Test "Pause nach Claim, vor Write".
- Die 16 Playwright-Fälle enthalten keinen Autonomie-Clickpfad; `mutation-view.ts` besitzt
  hierfür keine Test-IDs und der Harness bildet die neue Ansicht nicht ab.
- Es fehlt ein Prozessgrenzen-Test für parallele Status-, Aktivierungs- und Pause-Aufrufe.

## Positiv verifiziert

- `AutonomyActivationRequestSchema` verlangt serverseitig `reviewed: true`.
- Der normale Budget-Claim verwendet `BEGIN IMMEDIATE` und begrenzt die getesteten 60
  parallelen Anfragen auf 60 erfolgreiche Writes.
- Automatische Pfade sind auf relative Markdown-Create/Update begrenzt und benutzen den
  vorhandenen Scope-, Symlink-, Hash-, Audit- und Einzelrollback-Schutz.

## Zusammenfassung

| Schweregrad | Offen |
|---|---:|
| BLOCKER | 0 |
| MAJOR | 3 |
| MINOR | 0 |
| SUGGESTION | 0 |

Die Testphase darf nicht als uneingeschränkte Sprint-Freigabe interpretiert werden. Nach den
drei Korrekturen ist ein Nachtest mit den genannten Race-/Budget-Regressionen und dem
dedizierten headed Autonomie-Flow erforderlich.

## Übergabe: RV -> FE+BE

**Nächster Befehl:** `/implement second-brain 6`

---

*Erstellt von: RV-Agent | Datum: 2026-08-13 | Version: 1.0*
