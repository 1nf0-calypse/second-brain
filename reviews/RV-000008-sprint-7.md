---
id: RV-000008
title: Review Second Brain Sprint 7
version: 1.0
status: REJECTED
author-agent: RV (Code Reviewer)
date: 2026-08-15
project: second-brain
sprint: 7
reviewed-stories: US-000015, US-000016, US-000008@1.1
qa-report: TR-000010@1.0
based-on: SP-000008@1.0, TP-000008@1.0, TR-000010@1.0, UX-000001@1.0, ADR-000001–ADR-000006
supersedes: —
superseded-by: RV-000009@1.0
---

# Review: Second Brain — Sprint 7

## Review-Übersicht

| Eigenschaft | Wert |
|---|---|
| Branch | `feature/sprint-6` |
| Reviewed Commit | `81bec1f` |
| Diff-Basis | `1861426..81bec1f` |
| Reviewer-Agent | RV |
| QA-Freigabe | CONDITIONAL |
| Nutzerabnahme | **REJECTED** |
| Technischer Review | **REJECTED** |
| Gesamtentscheidung | **REJECTED** |

**Entscheidung:** Sprint 7 wird nicht freigegeben. US-000015 verfehlt den freigegebenen
MCP-first-Nutzerfluss und wurde vom Nutzer abgelehnt. Der technische Review bestätigt
fehlende Kernfunktionalität bei Pending Confirmations, Quellen-/Zieldarstellung,
Vorlagenwiederverwendung und `Incomplete`-Historie. Zusätzlich sind flüchtige
Template-/Compilation-Daten erneut unbegrenzt.

---

## Teil 1: Nutzerabnahme

### Präsentierter Test-Guide

Der Nutzer testete im nativen Obsidian-Review-Vault mit dem aktuellen Sprint-7-Build:

1. **Versionierte Vorlagen:** Version 1 und Version 2 getrennt vorbereiten und bestätigen.
2. **Kompilierung:** read-only Vorschau, sichtbare Injection-Warnung und Konfliktschutz nach
   einer Änderung der Quelle prüfen.
3. **Verlauf:** Erfolgs- und Rollback-Einträge aktualisieren, Inhalte auf Redaction prüfen
   und eine Teständerung zurücksetzen.

Vor dem Test wurde ein veralteter Plugin-Build im Review-Vault erkannt, gesichert und durch
den frisch gebauten Sprint-7-Stand ersetzt. Der folgende Befund entstand danach mit dem
aktuellen Build.

### Interview-Ergebnisse

| Feature | Funktioniert? | Nutzer-Befund | Anmerkungen |
|---|---|---|---|
| US-000015: Quellengebundene Kompilierung | Teilweise | REJECTED | Der Nutzer muss internen Vault-Pfad und fertigen Markdown-Inhalt manuell eingeben. Zitat: „Die KI hat über MCP einen direkten Eingabepfad … Das erscheint mir unnötig umständlich.“ Ein leerer Pfad führte zudem nur zu `INVALID_QUERY`. |
| US-000016: Versionierte Vorlagen | Ja | ACCEPTED | Zwei aufeinanderfolgende Versionen ließen sich vorbereiten und bestätigen. |
| US-000008: Lokaler Änderungsverlauf | Ja | ACCEPTED | Verlauf und Rücksetzung wurden als erfolgreich und zufriedenstellend bewertet. |

### Nutzerabnahme-Entscheidung

- [ ] ACCEPTED
- [ ] CONDITIONAL
- [x] **REJECTED**

US-000015 bietet in der ausgelieferten Form keinen ausreichenden Mehrwert gegenüber der
direkten Markdown-Bearbeitung. Ein Nutzer-REJECTED führt unabhängig vom technischen Ergebnis
zur Gesamtentscheidung REJECTED.

---

## Teil 2: Technisches Code Review

### Change-Impact

Der aktuelle Codegraph wurde für den Sprint-7-Worktree neu aufgebaut. Das MCP-Werkzeug
`detect_changes` war in dieser Sitzung nicht exponiert; der Impact wurde deshalb aus dem
kanonischen Git-Diff sowie `search_graph` und `trace_path` bestimmt.

- `MutationView.onOpen` ruft alle neuen Template-, Compilation- und History-Clients direkt
  auf und ist damit der gemeinsame UI-Risikoknoten.
- `MutationService.confirm` ruft neu `assertCompilationBinding` auf. Dieser Pfad liegt in der
  sicherheitskritischen Bestätigungskette mit Preview-, Scope-, Hash- und Template-Prüfung.
- `MutationService` wird vom CLI-Bootstrap und MCP-Gateway genutzt; Fehler betreffen daher
  Plugin- und MCP-Prozessgrenzen.
- 23 Dateien änderten sich seit Sprint-6-Abschluss, davon sieben produktive Code-Dateien.

### Dimension 1: Korrektheit

| Kriterium | Status | Anmerkungen |
|---|---|---|
| Alle Akzeptanzkriterien implementiert | ❌ | US-000015, US-000016 und US-000008 sind nur teilweise umgesetzt. |
| Implementierung stimmt mit Vertrag überein | ⚠️ | Laufzeitverträge sind strikt, aber der vorgesehene End-to-End-Flow fehlt. |
| Edge Cases behandelt | ❌ | Template-Race, `Incomplete` und Wiederverwendung fehlen. |
| Fehlerbehandlung vollständig | ❌ | Leerer Pfad wird als generisches `INVALID_QUERY` ausgegeben. |

| # | Kategorie | Fundstelle | Problem | Empfehlung |
|---|---|---|---|---|
| K-001 | MAJOR | `mutation-view.ts:92-226`, `server.ts:168-262`, UX-000001 §3 Journey 4/6 | Es gibt keinen MCP-first-Flow von einer angeforderten Kompilierung zu `Pending confirmations`. Die UI verlangt stattdessen Pfad und fertigen Inhalt manuell. | Pending-Preview-Repository und Plugin-Inbox implementieren; MCP erzeugt den Vorschlag, der Nutzer prüft/reject/confirm. |
| K-002 | MAJOR | `mutation-view.ts:209-219`, US-000015 §Festlegungen/AK1 | Die UI setzt Quelle und Ziel auf dasselbe Feld und zeigt weder Quellhashes noch Template-Provenienz, Links, Properties oder die konkrete Warnung an. | Quellen und Ziel getrennt modellieren; alle Preview-Metadaten und verbindliche Microcopy rendern. |
| K-003 | MAJOR | `mutation-service.ts:225-244,407-414`, US-000016 §Festlegungen/AK1 | Vorlagen liegen nur in SQLite statt unter `.second-brain/templates/`; es existiert weder List-/Read-Vertrag noch UI-Auswahl zur späteren Wiederverwendung. | Versionierte Dateien gemäß Story persistieren und list/select/read für MCP und Plugin ergänzen. |
| K-004 | MAJOR | `mutation-service.ts:246-251`, US-000008 AK1/AK3 | `history()` markiert jeden Audit-Eintrag als `success`; `Incomplete` kann nicht entstehen. Der Originaleintrag bleibt nach Rollback fälschlich `available`, während nur der Rollback-Eintrag `rolled-back` heißt. | Audit-Zustandsmodell persistieren und Rollback-Relation korrekt auf den Ursprung projizieren. |
| K-005 | MINOR | `mutation-service.ts:225-244` | Parallele Previews desselben Vorlagennamens erhalten dieselbe Versionsnummer. `confirmTemplate()` verbraucht das Token vor dem nicht-transaktionalen Insert; ein Unique-Konflikt hinterlässt ein unbrauchbares Token. | Versionsvergabe und Claim/Insert in eine `BEGIN IMMEDIATE`-Transaktion legen. |
| UX-001 | MINOR | `mutation-view.ts:209-219` | Ein leeres Pflichtfeld löst nur `INVALID_QUERY: The search or read request is invalid` aus. | Inline-Validierung, verständliche Feldbezeichnung und konkrete Recovery-Meldung ergänzen. |

### Dimension 2: Sicherheit

| Kriterium | Status | Anmerkungen |
|---|---|---|
| Input-Validierung | ✅ | Zod-Verträge sind strikt und begrenzen Pfade, Größen und Arrays. |
| Keine Secrets/Credentials | ✅ | Im Diff keine Secrets oder neue Credentials. |
| Auth/Authz | N/A | Kein neuer externer Auth-Pfad. |
| Pfad-/Scope-Schutz | ✅ | Bestehende normalisierte Markdown-Scope-Prüfung wird wiederverwendet. |
| SQL-Injection-Schutz | ✅ | Queries sind parametrisiert. |
| Sensible Daten nicht geloggt | ✅ | Kein neuer Content-Logpfad. |
| OWASP Top 10 | ✅ | Kein neuer Netzwerk- oder Browser-Endpunkt. |

Positiv: Quellen- und Template-Hashes werden bei der Bestätigung erneut geprüft; der Sprint
öffnet keinen neuen Provider- oder Netzwerkpfad. Es wurde kein eigenständiger Security-
BLOCKER festgestellt.

### Dimension 3: ADR- und Constitution-Konformität

| Vorgabe | Status | Anmerkungen |
|---|---|---|
| ADR-000001 TypeScript/Plugin/Sidecar | ✅ | Stack und Prozessgrenze eingehalten. |
| ADR-000002 modularer Monolith | ✅ | Logik bleibt im Mutationsmodul. |
| ADR-000003 lokale Persistenz | ✅ | Keine externe Persistenz. |
| ADR-000004 Prepare/Confirm/Commit | ✅ | Token-, Hash- und Scope-Prüfung vorhanden. |
| ADR-000005 Sprint-Branch | ✅ | Review auf isoliertem Feature-Worktree. |
| ADR-000006 externer Datenfluss | ✅ | Kein neuer externer Datenfluss. |
| UX-000001 Journey 4/6 | ❌ | Pending-Confirmation-Startpunkt, Quellenwahl und verbindliche Warn-Microcopy fehlen. |
| CON-000001 | ✅ | Human-in, lokale Persistenz und Capability-Grenzen bleiben erhalten. |

Die Ablehnung beruht nicht auf einem neuen Sicherheits- oder Constitution-Verstoß, sondern
auf fehlender Kernfunktionalität und Abweichungen von freigegebenen User Stories und UX.

### Dimension 4: Code-Qualität

| Kriterium | Status | Anmerkungen |
|---|---|---|
| Datei-Header aktuell | ❌ | Sieben geänderte Produktivdateien nennen US-000015/16/08 nicht. |
| Öffentliche Funktionen dokumentiert | ❌ | Neue Client-, Transport- und Service-Funktionen haben keine Standard-JSDoc-Blöcke. |
| Kein toter/auskommentierter Code | ✅ | Kein neuer toter Code gefunden. |
| Keine Magic Numbers | ✅ | Größen und TTLs sind benannt beziehungsweise Vertragsgrenzen. |
| Keine `any`-Typen | ✅ | Keine neuen `any`-Typen. |
| Namensgebung | ✅ | Intern überwiegend konsistent. |
| Lint | ✅ | `eslint . --max-warnings=0` bestanden. |

| # | Kategorie | Fundstelle | Problem | Empfehlung |
|---|---|---|---|---|
| Q-001 | MINOR | alle sieben geänderten Produktivdateien | Artefakt-Header und JSDoc entsprechen nicht dem verbindlichen Kommentarstandard für Sprint 7. | US-000015/16/08 ergänzen und neue öffentliche Funktionen vollständig dokumentieren. |

### Dimension 5: Testabdeckung

| Nachweis | Ergebnis |
|---|---|
| Build | PASS |
| Lint ohne Warnungen | PASS |
| Vitest | PASS — 17 Dateien, 87 Tests |
| Coverage | PASS — Statements 90,90 %, Branches 82,57 %, Funktionen 88,98 %, Lines 92,71 % |
| Headed Playwright | PASS — 16/16 |

| # | Kategorie | Bereich | Problem | Empfehlung |
|---|---|---|---|---|
| T-001 | MAJOR | MCP, Kindprozess, Plugin-UI, Audit | Die grünen Läufe enthalten keine Sprint-7-MCP-Tooltests, keine getrennten Prozessnachweise, keine Template-/Compilation-/History-E2E und keinen `Incomplete`-Auditfall. Die neuen Mutation-Client-Funktionen liegen laut Coverage überwiegend ungetestet. | Alle fünf Auflagen aus TR-000010 als verpflichtende Regressionen ergänzen; negative Scope-, Replay-, Drift- und UI-Fälle einschließen. |

### Dimension 6: Performance und Wartbarkeit

| Kriterium | Status | Anmerkungen |
|---|---|---|
| Keine N+1-Probleme | ✅ | Keine neue N+1-Abfrage im Hauptpfad. |
| Speicher begrenzt | ❌ | Neue flüchtige Tabellen werden nicht bereinigt. |
| UI-Wartbarkeit | ⚠️ | `MutationView.onOpen` umfasst 235 Zeilen und zahlreiche Zustände. |
| Komplexität | ⚠️ | Codegraph: `onOpen` cyclomatisch 18, kognitiv 25. |

| # | Kategorie | Fundstelle | Problem | Empfehlung |
|---|---|---|---|---|
| P-001 | MAJOR | `mutation-service.ts:225-244,407-414,519-537` | `template_previews` und `compilation_bindings` werden weder nach Ablauf/Benutzung gelöscht noch begrenzt. Das regressiert die mit BUG-000006 behobene unbegrenzte Preview-Persistenz; Template-Inhalte können bis 100 KB pro Zeile wachsen. | Gemeinsames TTL-/Used-Cleanup und feste Obergrenzen implementieren; Bindings beim Confirm/Expiry löschen und Regressionstest ergänzen. |
| P-002 | SUGGESTION | `mutation-view.ts:40-274` | Alle Autonomie-, Template-, Mutations-, Compilation- und History-Zustände leben in einer 235-Zeilen-Methode. | In fokussierte Komponenten/Renderer mit eigenständigen Tests zerlegen. |

---

## Zusammenfassung

### Anmerkungen nach Schweregrad

| Schweregrad | Anzahl |
|---|---:|
| BLOCKER | 0 |
| MAJOR | 6 |
| MINOR | 3 |
| SUGGESTION | 1 |

### Gesamtentscheidung

- [ ] APPROVED
- [ ] REQUEST CHANGES
- [x] **REJECTED**

Gründe:

1. Nutzer lehnt US-000015 fachlich ab.
2. Der MCP-first-Pending-Confirmation-Flow fehlt als Kernfunktion.
3. Vorlagen sind nicht wiederverwendbar auswählbar und nicht wie spezifiziert abgelegt.
4. Die Historie kann `Incomplete` nicht korrekt repräsentieren und projiziert Rollbacks falsch.
5. Unbegrenzte Preview-Persistenz wurde in neuen Tabellen erneut eingeführt.
6. Die von QA geforderten Sprint-7-End-to-End-Nachweise fehlen.

### Technische Schulden

Keine neue DEBT-Datei. Sämtliche Befunde sind notwendige Scope-/Implementierungsänderungen
vor einer Freigabe und dürfen nicht als bewusst akzeptierte Schuld verschoben werden.

## Definition-of-Done-Selbstprüfung

- [x] Test-Guide für alle Sprint-Features erstellt und an Nutzer übergeben.
- [x] Nutzer-Interview durchgeführt und Befund pro Feature dokumentiert.
- [x] Alle sechs technischen Review-Dimensionen geprüft.
- [x] Jede Anmerkung mit Kategorie und Empfehlung versehen.
- [x] Review-Bericht RV-000008 erstellt und versioniert.
- [x] Gesamtentscheidung aus Nutzer- und Technikbefund begründet.
- [x] Technische Schulden geprüft; keine Verschiebung als DEBT zulässig.
- [x] Reviews- und Projektindex aktualisiert.
- [x] Constitution gegen Nutzer- und Technikbefund geprüft; kein Ausnahmebedarf.
- [ ] Freigabe-Gate bestanden — **OFFEN/FAIL wegen REJECTED und sechs MAJOR-Funden.**

---

## Übergabe: RV → BA

**Datum:** 2026-08-15  
**Von:** Code Reviewer (RV)  
**An:** Business Analyst (BA)  
**Nächster Befehl:** `/ba second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| RV-000008 | REJECTED | `reviews/RV-000008-sprint-7.md` | Nutzer-REJECTED für US-000015; sechs technische MAJOR-Funde |
| TR-000010 | CONDITIONAL | `testing/TR-000010-sprint-7.md` | Fünf offene QA-Nachweisgruppen |

### Kritische Informationen für Empfänger

- US-000016 und US-000008 wurden aus Nutzersicht akzeptiert, benötigen technisch aber
  Korrekturen an Wiederverwendung beziehungsweise Historiestatus.
- US-000015 muss als MCP-first-Pending-Confirmation-Flow neu geschnitten werden. Interne
  Pfad- und Content-Parameter gehören nicht als primäre Nutzereingabe in die Review-UI.
- Quellen und Ziel müssen getrennt sein; die Preview muss Provenienz und konkrete Warnungen
  vollständig zeigen.

### Offene Fragen (vererbt)

| # | Frage | Ursprung | Kritikalität | An wen |
|---|---|---|---|---|
| 1 | Wie werden MCP-Vorschläge persistent als Pending Confirmation an das Plugin übergeben? | K-001 | MAJOR | BA+AR+FE+BE |
| 2 | Welche UI-Aktion wählt Quellen und Ziel, wenn der Nutzer statt des MCP-Clients startet? | K-002 | MAJOR | BA+UX |

### Nicht-Ziele

- In dieser Review-Phase wurde kein Produktcode verändert.
- Der abgelehnte Flow wurde nicht durch eine ungeprüfte UI-Korrektur ersetzt.

### Empfehlungen

US-000015 und US-000016 mit dem Nutzerfluss beginnen: MCP-Anfrage → Pending Preview →
vollständige Provenienz → Reject/Confirm. Danach Architektur-/UX-Abgleich und erneute
Implementierung mit den bereits festgelegten QA-Nachweisen.

---

*Erstellt von: RV-Agent | Datum: 2026-08-15 | Version: 1.0 | Ablage: `reviews/`*
