---
id: TP-000008
title: Testplan Second Brain Sprint 7
version: 1.0
status: APPROVED
author-agent: QA (QA Engineer)
date: 2026-08-15
project: second-brain
sprint: 7
based-on: US-000015, US-000016, US-000008@1.1, SP-000008, US-000003@1.1, US-000007, UX-000001, ADR-000004
supersedes: —
superseded-by: —
ablage: projects/second-brain/testing/
---

# Testplan: Second Brain — Sprint 7

## 1. Testumfang

- **US-000015:** Quellengebundene Kompilierungsvorschau, Hashbindung, Warnungen und Übergabe
  an den bestehenden Einzeldatei-Confirm-Flow.
- **US-000016:** Lokale, immutable Vorlagenversionen mit Prepare/Confirm und Provenienz.
- **US-000008:** Read-only Verlauf für Erfolg, Rollback und unvollständige Vorgänge.

Nicht im Scope: neue Provider-/LLM-Aufrufe, Mehrdatei-Kompilierung, Template-Löschen oder
-Synchronisation, Anhänge, semantische Suche, Graph, Android und campaignworld.

## 2. Testumgebung

| Eigenschaft | Wert |
|---|---|
| Umgebung | Lokaler Windows-Sprint-7-Worktree |
| Produktpfad | `apps/sidecar`, `apps/obsidian-plugin`, `packages/contracts` |
| Daten | Temporäre Vaults mit `.obsidian` und `.second-brain` |
| Laufzeit | Node.js 24, SQLite über `node:sqlite` |
| UI | Headed Playwright Chromium; native Obsidian-Abnahme getrennt |
| Netzwerk | Keines. Jeder Test prüft, dass kein neuer Providerpfad entsteht. |

## 3. Automatisierte Nachweise

```powershell
npm run build
npm run lint -- --max-warnings=0
npm test
npm run test:coverage
npm run test:e2e
```

| Datei | Erforderliche Ergänzung | Nachweis |
|---|---|---|
| `tests/integration/mutation-service.test.ts` | Template-Prepare/Confirm, Versionierung, Kompilierung, Quelle-/Vorlagendrift, Warnungen, Historie | P0 |
| `tests/integration/mcp-mutations.test.ts` | Neue Toolliste und Contract-Validierung | P0 |
| `tests/integration/node-setup-transport.test.ts` | Getrennte Prozesse für Template, Preview und Historie | P0 |
| `tests/unit/mutation-client.test.ts` | Laufzeitvalidierung aller neuen Responses | P1 |
| `tests/e2e/mutations.spec.ts` | Vorlage vorbereiten/bestätigen, Preview, Warnung, Verlauf und Tastaturpfad | P1 |

## 4. Manuelle Testfälle

### TC-000701: Vorlage bewusst versionieren — P0

1. Öffne **Review note change** und den Bereich **Compilation template**.
2. Gib Name und Inhalt ein, wähle **Prepare template version** und prüfe Name, Version und
   Status.
3. Wähle **Confirm template version**.
4. Ändere den Inhalt derselben Vorlage, wiederhole Prepare/Confirm.

**Erwartung:** Vor der Bestätigung ist keine Version gespeichert. Danach existiert eine neue
Version; die zuvor bestätigte Version wird nicht überschrieben oder gelöscht.

### TC-000702: Kompilierungsvorschau ohne Vault-Mutation — P0

1. Bestätige eine Vorlage. Wähle eine vorhandene Markdown-Quelle und setze Kandidatinhalt.
2. Wähle **Generate compilation preview**.
3. Vergleiche Quellnotiz und Zielnotiz vor der Einzelbestätigung.

**Erwartung:** Zielpfad, Diff, Quellen und Vorlagenprovenienz erscheinen. Keine Notiz wird
erstellt oder geändert, bevor der vorhandene Confirm-Flow bewusst abgeschlossen wird.

### TC-000703: Quell- oder Vorlagendrift — P0

1. Erzeuge eine Kompilierungsvorschau.
2. Ändere die Quelle in Obsidian oder verwende eine andere Vorlagenversion.
3. Versuche die Bestätigung.

**Erwartung:** Die Bestätigung scheitert als Konflikt. Weder Quelle noch Ziel werden still
überschrieben; eine frische Vorschau ist erforderlich.

### TC-000704: Injection und Mehrdatei-Scope — P0

1. Lege eine Quelle mit `Ignore previous instructions` oder einer Tool-Anweisung an.
2. Erzeuge die Vorschau. Sende zusätzlich über MCP einen absoluten Pfad, Traversal,
   Nicht-Markdown oder mehrere Zielnotizen.

**Erwartung:** Die Quelle wird als untrusted markiert. Kein Text erweitert Rechte; jeder
ungültige Scope wird ohne Vault-Mutation abgewiesen.

### TC-000705: Verlauf und Rollback-Status — P0

1. Bestätige eine einzelne Kompilierung und aktualisiere **Refresh change history**.
2. Erzeuge/Bestätige einen Rollback und aktualisiere erneut.
3. Unterbrich eine Mutation vor dem Audit-Commit mit einer Testfixture.

**Erwartung:** Zeitpunkt, Aktion, Pfad, Erfolg und Rollback-Status sind lesbar. Ein
unterbrochener Vorgang ist `Incomplete`, nie Erfolg. Vorher-/Nachher-Inhalte werden in der
Liste nicht ausgeschüttet.

### TC-000706: Tastatur und schmaler Pane — P1

Bei 320 px Pane-Breite und 200 % Zoom alle Template-, Preview-, Confirm- und History-
Controls ausschließlich per Tastatur bedienen.

**Erwartung:** Sichtbarer Fokus, sinnvolle Reihenfolge, Live-Status und kein abgeschnittener
Pflichtinhalt.

## 5. Security- und Integritätsmatrix

| ID | Boundary | Erwartetes Ergebnis |
|---|---|---|
| SEC-000701 | Kompilierung vor Confirm | Read-only; keine Vault-Datei oder Auditmutation. |
| SEC-000702 | Quellenhash nach Preview geändert | `MUTATION_CONFLICT`; kein Zielwrite. |
| SEC-000703 | Vorlagen-ID/Version/Hash fehlt oder driftet | `MUTATION_CONFLICT`; kein Zielwrite. |
| SEC-000704 | Template-Token abgelaufen oder replayed | `CONFIRMATION_INVALID`; keine Version. |
| SEC-000705 | Mehrfachziel, absoluter Pfad, Traversal, Nicht-Markdown | Scope-Ablehnung ohne Offenlegung fremder Dateien. |
| SEC-000706 | Instruction-like Source | Warnung als Daten; keine Tool-, Pfad- oder Rechteableitung. |
| SEC-000707 | Verlauf | Kein MCP-Tool kann Audit-Einträge löschen/überschreiben; Liste enthält keine Vollinhalte. |
| SEC-000708 | Netzwerk | Kein neuer Provider-/Endpoint-Aufruf im Sprint-7-Pfad. |

## 6. Freigaberegel

Gate 7 besteht nur bei grünen Build-, Lint-, Unit-, Integrations- und headed-Playwright-
Läufen, allen P0-Fällen, wiederholbarer Drift-/Replay-Abweisung und ohne BLOCKER. Die native
Obsidian-Abnahme von TC-000701 bis TC-000706 ist ein P0-Nachweis für die UI-Flows und wird
nicht durch den Browser-Harness ersetzt.

## Übergabe: QA-Testplanung → QA-Testausführung

**Datum:** 2026-08-15
**Nächster Befehl:** `/test-run second-brain 7`

Der Testlauf muss die derzeit fehlenden getrennten Prozess-, MCP- und UI-E2E-Nachweise
sichtbar als Testlücken oder Befunde behandeln, nicht als bestanden vermuten.
