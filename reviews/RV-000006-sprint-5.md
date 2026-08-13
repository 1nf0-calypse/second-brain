---
id: RV-000006
title: Review Second Brain Sprint 5
version: 1.0
status: REJECTED
author-agent: RV (Code Reviewer)
date: 2026-08-13
project: second-brain
sprint: 5
reviewed-stories: US-000001, US-000007
qa-report: TR-000008@1.1
supersedes: —
superseded-by: —
---

# Review: Second Brain — Sprint 5

## Review-Übersicht

| Eigenschaft | Wert |
|---|---|
| Branch | `feature/sprint-5` |
| Reviewed Commit | `1c61657` |
| Reviewer-Agent | RV |
| QA-Freigabe | CONDITIONAL |
| Nutzerabnahme | **CONDITIONAL** |
| Technischer Review | **REJECTED** |
| Gesamtentscheidung | **REJECTED** |

## Teil 1: Nutzerabnahme

Der Test erfolgte im echten Obsidian-Host im Vault `second-brain-review-vault`. Der zunächst
installierte Sprint-1-Build wurde durch den aktuellen Build ersetzt. Die native Checkbox war
im Dark-Theme praktisch unsichtbar und wurde in `1c61657` als deutlich umrandete,
akzentfarbene Bestätigungszeile korrigiert; der Nutzer bestätigte danach alle sechs
Testbereiche als funktional.

| Feature | Funktioniert? | Nutzer-Befund | Anmerkung |
|---|---|---|---|
| US-000001 Remote-Setup | Ja | ACCEPTED | Vault, lokaler Dienst, Provider-Auswahl und ungültiger Endpoint verifiziert. |
| US-000007 Consent-UI | Ja | CONDITIONAL | Sichtbarer Review, Sperren, Abbruch und Tastaturpfad funktionieren; der gesamte Ablauf wurde als „umständlich aber vorerst okay“ bewertet. |

**Nutzerabnahme-Entscheidung: CONDITIONAL.** Die UX-Anmerkung ist keine fachliche
Ablehnung, muss aber bei der nächsten Überarbeitung des Setup-Flows berücksichtigt werden.

## Teil 2: Technisches Code Review

### Befunde

| # | Schwere | Datei:Zeile | Problem | Empfehlung |
|---|---|---|---|---|
| S-001 | BLOCKER | `apps/sidecar/src/bootstrap/main.ts:71-83` | Der Transferprozess erzeugt und bestätigt seinen Consent-Token selbst. UI-Checkbox und zuvor sichtbarer Payload sind serverseitig nicht gebunden; ein direkter Transportaufruf kann deshalb ohne nachweisbare Bestätigung senden. | BUG-000009 beheben: serverseitig persistierter Prepare-Token, separater Confirm ohne frei übergebenen Payload, atomarer Einmalverbrauch. |
| T-001 | MAJOR | `tests/integration/node-setup-transport.test.ts:25-31`, `tests/unit/provider-service.test.ts:23-45` | Tests decken nur einen unerreichbaren Endpoint und Replay innerhalb einer Instanz ab. Ein erfolgreicher Child-Process-Transfer ohne vorheriges Prepare/Confirm wird nicht geprüft. | Fake-HTTPS-MCP-Integration mit echten Child-Prozessen und Negativfällen für fehlenden Token, Replay, Drift und Ablauf ergänzen. |
| U-001 | MINOR | `apps/obsidian-plugin/src/ui/setup-view.ts` | Die Nutzerabnahme bewertet den Gesamtflow als umständlich. Die zeitweise unsichtbare Checkbox war ein konkreter nativer Host-Befund und wurde während der Abnahme korrigiert. | Bei der BUG-000009-Überarbeitung Prepare/Review/Confirm als klar getrennte, kompakte Schritte gestalten. |

### Dimensionen

| Dimension | Ergebnis | Anmerkung |
|---|---|---|
| Korrektheit | ❌ | US-000007s verpflichtende serverseitige Einmalbestätigung ist nicht implementiert. |
| Sicherheit | ❌ | S-001 umgeht die zentrale Consent-Trust-Boundary. Input-Schemas und Credential-Verbot sind sonst korrekt begrenzt. |
| ADR-000006 | ❌ | Die ADR fordert serverseitige Durchsetzung vor jedem Adapteraufruf; der Code vertraut effektiv auf UI-Zustand. |
| Code-Qualität | ✅ | Typisierung, öffentliche Fehlercodes und Adapterabgrenzung sind nachvollziehbar. |
| Testabdeckung | ❌ | QA-Tests sind grün, aber die Prozessgrenze und der echte positive Adapterpfad fehlen. |
| Performance/Wartbarkeit | ⚠️ | Keine Produktbudgets; die vorgesehenen Provider-Baselines sind weiterhin nicht messbar. |

## Zusammenfassung

| Schweregrad | Anzahl |
|---|---:|
| BLOCKER | 1 |
| MAJOR | 1 |
| MINOR | 1 |
| SUGGESTION | 0 |

**Gesamtentscheidung: REJECTED.** Trotz funktionaler Nutzerabnahme und erfolgreicher
Automatisierung darf Sprint 5 nicht gemergt oder freigegeben werden: Der zentrale externe
Datenfluss ist nicht an einen serverseitig nachgewiesenen Einmal-Consent gebunden.

## Übergabe: RV → FE+BE

**Nächster Befehl:** `/implement be second-brain`

- BUG-000009 vollständig gemäß Root-Cause-Abschnitt beheben.
- Danach `/test-run second-brain 5` mit einem echten Child-Process-Regressionstest ausführen.

---

*Erstellt von: RV-Agent | Datum: 2026-08-13 | Version: 1.0*
