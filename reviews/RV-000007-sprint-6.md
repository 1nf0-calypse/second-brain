---
id: RV-000007
title: Code Review Second Brain Sprint 6
version: 1.5
status: APPROVED
author-agent: RV (Code Reviewer)
date: 2026-08-13
project: second-brain
sprint: 6
reviewed-stories: US-000003
qa-report: TR-000009@1.1
supersedes: —
superseded-by: —
---

# Code Review: Second Brain — Sprint 6

## Entscheidung

**APPROVED.** Die finale Pause-Semantik löst die künstlich eingeführte In-flight-
Wartekette auf: Pause sperrt atomar neue Claims, während ein bereits gestarteter Write
konfliktgeschützt zu Ende läuft und auditiert wird. Es bestehen keine offenen technischen
Code-Befunde. Die zwei verbleibenden QA-Nachweise betreffen nur den dedizierten
Autonomie-Harness sowie die native Obsidian-Abnahme und wurden am 2026-08-15 ausdrücklich
vom Nutzer als Restprüfung akzeptiert.

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

### Nachtest zu R6-002: weiterhin offen

**Stellen:** `apps/sidecar/src/mutations/mutation-service.ts:362-375`

Die Korrektur ergänzt eine zweite Policy-Prüfung, committet deren SQLite-Transaktion in
Zeile 374 aber **vor** `await this.fileOperations.write(...)` in Zeile 375. Genau in diesem
Zwischenraum kann ein paralleler `pauseAutonomy()`-Aufruf Zeile 131 erfolgreich ausführen;
der danach fortgesetzte automatische Aufruf schreibt dennoch. Der Kommentar behauptet einen
"write linearization point", doch der Dateischreibvorgang wurde zu diesem Zeitpunkt noch
nicht gestartet.

Der angekündigte Race-Test fehlt; der vorhandene Test prüft nur eine Pause vor dem Claim
(`tests/integration/mutation-service.test.ts:67-77`). Damit ist R6-002 nicht verifiziert
und bleibt MAJOR.

### Nachtest zu R6-002: behoben durch `e7338d7`

Die Pause setzt nun zuerst `paused_at` und wartet dann auf alle bereits beanspruchten Writes.
Der Zwei-Service-Test in `tests/integration/mutation-service.test.ts:81-119` beweist: Die
Pause antwortet nicht vor dem Abschluss eines laufenden Writes; ein danach gestarteter
automatischer Request wird abgewiesen. R6-002 ist damit behoben.

### MAJOR R6-004: Ein abgestürzter automatischer Write blockiert Pause dauerhaft

**Stellen:** `apps/sidecar/src/mutations/mutation-service.ts:129-135`, `:145-167`,
`:536-547`

Der Claim erhöht `in_flight` persistent in SQLite. Die einzige Verringerung erfolgt in
`releaseInFlight()` nach Rückkehr aus `commitAutomatic()`. Wird der Sidecar-Prozess nach
dem Commit des Claims beendet, beispielsweise durch einen Timeout, Kill oder Stromausfall,
läuft dieser Cleanup nie. Beim nächsten Start bleibt `in_flight > 0` erhalten.
`pauseAutonomy()` pollt dann ohne Timeout, Lease, Operations-ID oder Startup-Recovery
endlos. Über den Plugin-Transport läuft die Pause nach 60 Sekunden nur in dessen generisches
Timeout; der persistierte Zustand bleibt trotzdem hängen.

**Reproduktion:** Eine automatische Mutation nach Zeile 156 gezielt beenden, bevor Zeile 163
oder 166 ausgeführt wird. Danach `pauseAutonomy()` aufrufen: die Promise erfüllt sich nie,
weil `inFlightMutations()` dauerhaft positiv bleibt.

**Erwartete Korrektur:** Statt eines nackten Zählers eine operation-ID mit Lease/Ablauf und
Recovery beim Service-Start persistieren, oder mindestens verwaiste Claims vor einer Pause
deterministisch als fehlgeschlagen zurückbuchen. Die Pause benötigt außerdem eine begrenzte,
verständliche Recovery-Antwort. Einen Prozess-Abbruch-Test zwischen Claim und Cleanup ergänzen.

### Nachtest zu R6-004: behoben durch `6718f0e`

`autonomy_operations` speichert nun Claim-ID und Prozessinhaber. Die Pause entfernt Claims
eines nicht mehr existierenden Prozesses, ohne dessen Budget zurückzugeben. Der Test
`tests/integration/mutation-service.test.ts:122-143` bestätigt den Recovery-Pfad. R6-004 ist
damit behoben.

### MAJOR R6-005: Ein lebender, blockierter Sidecar hält Pause unbegrenzt fest

**Stellen:** `apps/sidecar/src/mutations/mutation-service.ts:129-137`, `:559-570`,
`apps/obsidian-plugin/src/ipc/node-setup-transport.ts:17,201-202`

`pauseAutonomy()` pollt alle zehn Millisekunden, bis keine Operation mehr existiert. Recovery
entfernt aber ausschließlich Claims, deren Prozess-ID nicht mehr lebt. Hängt ein Sidecar
beispielsweise in einer Dateisystemoperation oder wird nicht sauber beendet, bleibt seine PID
gültig und die Schleife endet nie. Der Plugin-Transport beendet den Aufruf erst nach 60
Sekunden als generischen Timeout, während die pausierte Policy mit dem Claim weiterbesteht.

**Reproduktion:** Einen automatischen Write in `fileOperations.write()` auf eine nie erfüllte
Promise warten lassen. `pauseAutonomy()` markieren lassen und abwarten: Sie liefert selbst
nach der Transport-Laufzeit kein Ergebnis, obwohl neue Claims bereits gesperrt sind.

**Erwartete Korrektur:** Pro Claim eine feste Lease/Deadline oder einen expliziten begrenzten
Pause-Timeout speichern. Nach Ablauf muss der Claim fail-closed beendet und die Pause mit
einer verständlichen Recovery-Statusantwort abgeschlossen werden. Einen Test für einen
lebenden, blockierten Owner ergänzen.

### Finale Bewertung: R6-004 und R6-005 entfallen

Die vorherigen R6-004/R6-005-Fixes bauten auf der falschen Annahme auf, eine Pause müsse
bereits gestartete asynchrone Dateischreibvorgänge abbrechen. Die verbindliche Policy fordert,
dass **neue** automatische Mutationen sofort gesperrt werden. Der finale Code setzt diese
Grenze am atomaren Claim (`mutation-service.ts:140-156`) und prüft sie nochmals vor dem Start
des Dateiwrites (`:363-376`). Ein Write, der davor bereits gestartet wurde, wird nicht
abgebrochen, sondern konfliktgeschützt auditiert. Damit existiert weder eine wartende
In-flight-Sperre noch ein verwaister Claim-Recovery-Pfad.

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
- **R6-001 behoben:** Reaktivierung im laufenden Fenster bewahrt Zähler und Ablauf; die
  Budget-Regressionssuite weist den 61. Write nach Reaktivierung ab.
- **R6-003 behoben auf Code-Ebene:** Plugin-Ansicht, IPC-Client und Node-Transport reichen
  den automatischen Create/Update-Pfad bis zum Sidecar durch. Die native Abnahme bleibt
  gemäß TR-000009 offen.
- **R6-004 behoben:** Verwaiste Claims werden anhand des Prozessinhabers entfernt; der
  Budgetzähler wird nicht zurückgesetzt.
- **R6-004/R6-005 ersetzt:** Die finale Policy benötigt keine In-flight-Ownership; der
  neue Zwei-Service-Test beweist die sofortige Sperre neuer Claims bei fortlaufendem Write.

## Zusammenfassung

| Schweregrad | Offen |
|---|---:|
| BLOCKER | 0 |
| MAJOR | 2 |
| MINOR | 0 |
| SUGGESTION | 0 |

Sprint 6 ist freigegeben. Der dedizierte headed Autonomie-Flow und die native
Obsidian-Abnahme bleiben als nicht blockierende Restprüfung in TR-000009 nachvollziehbar.

## Übergabe: RV -> FE+BE

**Nächster Befehl:** `/implement second-brain 6`

---

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.5 | 2026-08-15 | Nutzerfreigabe erfasst; zwei QA-Restprüfungen akzeptiert | RV |
| 1.4 | 2026-08-14 | Finale Pause-Semantik bestätigt; keine offenen Code-Befunde, zwei QA-Auflagen verbleiben | RV |
| 1.3 | 2026-08-14 | R6-004 behoben; fehlende Lease für lebenden, blockierten Claim als R6-005 ergänzt | RV |
| 1.2 | 2026-08-14 | R6-002 behoben; neuer Crash-/Recovery-Befund R6-004 | RV |
| 1.1 | 2026-08-13 | R6-001 und R6-003 als behoben bestätigt; R6-002 wegen Commit-vor-Write weiterhin MAJOR | RV |
| 1.0 | 2026-08-13 | Initialreview mit drei MAJOR-Befunden | RV |

---

*Erstellt von: RV-Agent | Datum: 2026-08-13 | Version: 1.1*
