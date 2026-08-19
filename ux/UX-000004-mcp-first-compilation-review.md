---
id: UX-000004
title: MCP-first Compilation Inbox und Review
version: 1.0
status: APPROVED
author-agent: UX (UX Designer)
date: 2026-08-15
project: second-brain
based-on: US-000017@1.0, US-000016@1.0, US-000008@1.1, ADR-000007@1.0, UX-000001@1.0, RV-000008
supersedes: —
superseded-by: —
---

# UX-000004: MCP-first Compilation Inbox und Review

## 1. Scope

Diese Spezifikation ergänzt UX-000001 und ersetzt für den Sprint-7-Recovery-Slice dessen
manuell gestartete Compilation Journey 6. Der Standardweg beginnt beim verbundenen
MCP-Client. Die Obsidian-Oberfläche erfasst weder einen technischen Zielpfad noch den
vollständigen Markdown-Kandidaten erneut.

**Abgedeckte User Stories:** US-000017, US-000016 und Sprint-7-Anteil von US-000008  
**Primäre Nutzungsgruppe:** Power User und technisch wenig versierte Obsidian-Nutzer  
**Nutzungskontext:** Obsidian Desktop unter Windows  
**Produktsprache:** Englisch  
**Design-System:** Native Obsidian-Komponenten und CSS-Variablen  
**Accessibility-Ziel:** WCAG 2.2 AA

### Nicht enthalten

- Kein manuell gestarteter Compilation-Editor in Obsidian.
- Keine Auswahl von Quellen oder Ziel nach Eingang eines Vorschlags; eine solche Änderung
  verlangt einen neuen Vorschlag des MCP-Clients.
- Keine automatische Bestätigung, Mehrdatei-Mutation oder Konfliktzusammenführung.
- Kein neuer Provider-, Chat- oder externer Datenfluss.

## 2. Informationsarchitektur

```text
Second Brain
└─ Changes
   ├─ Pending reviews ({count})
   │  ├─ Proposal list
   │  └─ Compilation review
   │     ├─ Overview
   │     ├─ Sources
   │     ├─ Proposed changes
   │     └─ Decision
   ├─ Templates
   │  ├─ Template library
   │  ├─ Template detail
   │  └─ New version review
   └─ History
      ├─ Operation list
      └─ Operation detail / rollback
```

`Compile knowledge` auf Home startet im Recovery-Slice keine Eingabemaske. Die Aktion
öffnet `Pending reviews`. Sind keine Vorschläge vorhanden, erklärt der Empty State, dass
der Nutzer die Wissenskompilierung in seinem verbundenen KI-Client beauftragt.

## 3. User Journeys

### Journey 1: Neuen MCP-Vorschlag erkennen und öffnen

**Startpunkt:** Der verbundene KI-Client hat einen Vorschlag eingereicht.  
**Ziel:** Der Nutzer findet die ausstehende Prüfung ohne technische Doppelerfassung.

| Schritt | Nutzeraktion | Systemreaktion | UI-State danach |
|---:|---|---|---|
| 1 | Nutzer arbeitet weiter in Obsidian | Plugin erkennt eine höhere ungelesene Inbox-Revision | Badge count updated |
| 2 | Keine Aktion erforderlich | Eine nicht fokussierende Notice erscheint: `A knowledge compilation is ready for review.` | Notice shown |
| 3 | Nutzer öffnet über Ribbon, Command Palette, Home oder Changes `Pending reviews` | Summary wird geladen; Überschrift nennt die Anzahl | Loading list |
| 4 | Laden endet | Vorschläge erscheinen nach Eingang absteigend sortiert | Ready list |
| 5 | Nutzer aktiviert einen Listeneintrag | Detail wird geladen und serverseitig erneut geprüft | Loading review |
| 6 | Detail ist gültig | Fokus liegt auf `Review knowledge compilation`; kein Eingabefeld wird gezeigt | Ready review |

**Abbruchpunkte:** Die Notice kann ignoriert und die View geschlossen werden. Der Vorschlag
bleibt bis zur sichtbaren Ablaufzeit ausstehend. Eine Notice verschiebt niemals den Fokus.

### Journey 2: Vorschlag vollständig prüfen und bestätigen

| Schritt | Nutzeraktion | Systemreaktion | UI-State danach |
|---:|---|---|---|
| 1 | Nutzer liest `Overview` | Client, Vault, Ziel, Eingangs- und Ablaufzeit sowie Vorlage werden ausgeschrieben | Overview reviewed |
| 2 | Nutzer öffnet `Sources` | Jede Quelle zeigt Anzeigename, relativen Pfad, Hash-Kurzform und mögliche Warnung | Sources reviewed |
| 3 | Nutzer öffnet `Proposed changes` | Zugänglicher Diff, entstehende Links und Properties werden getrennt gezeigt | Changes reviewed |
| 4 | Falls Warnungen vorliegen: Nutzer öffnet jede Warnung | Betroffene Quelle und konkrete Bedeutung erscheinen; Warnungen erweitern keine Rechte | Warning reviewed |
| 5 | Bei Warnungen aktiviert Nutzer `I reviewed the warnings above.` | `Confirm and write note` wird nur bei weiterhin gültigem Vorschlag aktiv | Ready to confirm |
| 6 | Nutzer wählt `Confirm and write note` | Aktionen werden gesperrt; Zustand wird erneut gegen Quellen, Ziel und Vorlage geprüft | Confirming |
| 7 | Commit erfolgreich | Ziel, Audit-ID und `Undo this change` erscheinen; Badge count sinkt | Confirmed |
| 8 | Nutzer wählt `Done` | Rückkehr zur Pending-Liste; Fokus landet auf Listenüberschrift oder nächstem Eintrag | Ready list / empty |

Ohne Warnung ist keine zusätzliche Checkbox nötig. Die Primäraktion bleibt jedoch bis zum
vollständig geladenen Detail und einem konfliktfreien Zustand deaktiviert.

### Journey 3: Vorschlag bewusst verwerfen

| Schritt | Nutzeraktion | Systemreaktion | UI-State danach |
|---:|---|---|---|
| 1 | Nutzer wählt `Reject proposal` | Ein fokussierter Bestätigungsdialog erklärt, dass der Vault unverändert bleibt | Reject confirmation |
| 2 | Nutzer wählt `Cancel` | Dialog schließt; Fokus kehrt zu `Reject proposal` zurück | Ready review |
| 3 | Nutzer wählt `Reject without changing the vault` | Entscheidung wird einmalig verbraucht; keine Datei wird geschrieben | Rejecting |
| 4 | Verwerfen erfolgreich | Meldung bestätigt unveränderten Vault; Rückkehr zur Liste | Rejected |

Der Dialog zeigt keinen Diff erneut. Er verhindert nur versehentliches Verwerfen einer
nicht wieder aktivierbaren Prüfung.

### Journey 4: Drift, Ablauf, Replay oder Unterbrechung behandeln

| Schritt | Nutzeraktion | Systemreaktion | UI-State danach |
|---:|---|---|---|
| 1 | Nutzer öffnet oder entscheidet einen inzwischen ungültigen Vorschlag | Detail wird in den passenden terminalen Zustand versetzt | Conflict / expired / decided |
| 2 | Nutzer liest die Fehlerzusammenfassung | Betroffene Quelle, Zielnotiz oder Vorlage und der sichere Zustand werden genannt | Recovery available |
| 3 | Bei Drift oder Ablauf wählt Nutzer `Copy recovery request` | Eine kurze, nicht geheime Anweisung für den KI-Client wird in die Zwischenablage kopiert | Recovery copied |
| 4 | Nutzer beauftragt den KI-Client erneut | Ein neuer Vorschlag erhält einen eigenen Eintrag; alter Eintrag bleibt Historie | New pending |
| 5 | Bei `Checking outcome` nach Unterbrechung wartet Nutzer oder wählt `Check again` | Sidecar-Recovery bestimmt `Confirmed`, `Incomplete` oder Konflikt | Resolved outcome |

Es gibt kein `Try confirm again` für verbrauchte, abgelaufene oder inhaltlich gedriftete
Vorschläge. Die Recovery erzeugt immer einen neuen MCP-Vorschlag.

### Journey 5: Projektvorlage anlegen, versionieren und wiederfinden

| Schritt | Nutzeraktion | Systemreaktion | UI-State danach |
|---:|---|---|---|
| 1 | Nutzer öffnet `Templates` | Versionierte projektlokale Vorlagen werden geladen | Library loading / ready |
| 2 | Nutzer wählt `Create template` | Name und Inhalt erscheinen als echte Verwaltungsfelder | New template form |
| 3 | Nutzer gibt Name und Inhalt ein und wählt `Review template` | Validierung zeigt Name, Hash und Inhalt read-only | Template preview |
| 4 | Nutzer wählt `Save template` | Version 1 wird atomar gespeichert | Template saved |
| 5 | Nutzer öffnet eine bestehende Vorlage | Detail zeigt ID, Name, Versionen, Hash und read-only Inhalt | Template detail |
| 6 | Nutzer wählt `Create new version` und bearbeitet eine Kopie | Alte Version bleibt unverändert; neue Fassung wird separat geprüft | New version form |
| 7 | Nutzer bestätigt | Nächste eindeutige Version erscheint in der Bibliothek | New version saved |

Ein Pending Review zeigt die vom MCP-Client verwendete Vorlagenversion nur read-only.
Ändern oder Austauschen der Vorlage würde den Kandidaten verändern und verlangt daher einen
neuen Vorschlag.

### Journey 6: Verlauf und Rollbackstatus prüfen

| Schritt | Nutzeraktion | Systemreaktion | UI-State danach |
|---:|---|---|---|
| 1 | Nutzer öffnet `History` | Einträge zeigen Zeit, Auslöser, Ziel, Ergebnis und Rollbackstatus | History ready |
| 2 | Nutzer filtert nach `Incomplete`, `Failed` oder `Rejected` | Liste aktualisiert sich, ohne diese Zustände als Erfolg zu gestalten | Filtered history |
| 3 | Nutzer öffnet einen Eintrag | Zustandsfolge und verständliche Zusammenfassung erscheinen | History detail |
| 4 | Bei verfügbarem Rollback wählt Nutzer `Review rollback` | Konfliktgeschützte Rollback-Vorschau öffnet | Rollback preview |
| 5 | Rollback gelingt | Ursprung zeigt `Rolled back`; Rollbackvorgang zeigt `Not applicable` | History updated |

## 4. View: Pending Reviews

### Layout-Skizze

```text
┌─ Pending reviews (3) ─────────────────────────────┐
│ Knowledge compilations prepared by your AI client │
│ [Refresh]                    Last checked 10:42    │
├───────────────────────────────────────────────────┤
│ ⚠ Project Atlas · Review-Sprint-7.md              │
│   Claude Desktop · 3 sources · expires in 21 h    │
├───────────────────────────────────────────────────┤
│   Meeting summary.md                              │
│   ChatGPT · 2 sources · expires in 8 h            │
└───────────────────────────────────────────────────┘
```

Ein Eintrag zeigt in dieser Reihenfolge: Warnstatus, lesbarer Zieltitel, Client,
Quellenanzahl, relative Eingangszeit und verbleibende Zeit. Technische IDs und vollständige
Hashes sind nicht Teil der Listenzeile.

### UI-Zustände

| State | Auslöser | Darstellung | Erlaubte Aktionen |
|---|---|---|---|
| Initial loading | View öffnet | Überschrift und `Loading pending reviews…`; keine leere Liste vortäuschen | View schließen |
| Ready | Mindestens ein Eintrag | Sortierte Liste und `Last checked` | Öffnen, Refresh |
| Empty | Keine offenen Einträge | `No knowledge compilations are waiting for review.` plus Erklärung des MCP-Starts | `Check again`, Verbindung öffnen |
| Refreshing | Manuelles/automatisches Polling | Bestehende Liste bleibt sichtbar; Statuszeile `Checking for new reviews…` | Einträge weiter lesen |
| Offline | Sidecar nicht erreichbar | `Pending reviews are unavailable while the local service is offline.` | `Reconnect local service` |
| Error | Validierter lokaler Fehler | Ursache und Recovery in Statusbereich | `Try again`, Details |
| Capacity warning | Inbox-Limit erreicht | Bestehende Vorschläge bleiben; Erklärung, dass neue Einreichungen pausieren | Einträge prüfen/verwerfen |

Polling aktualisiert die Liste nicht mitten in einer Tastaturaktion. Ein verschwundener
oder terminal gewordener Eintrag bleibt bis zum nächsten sicheren Fokuswechsel als
Statusmeldung sichtbar.

## 5. View: Compilation Review

### Layout-Skizze ab 900 px

```text
┌─ Review knowledge compilation ─────────────────────────────────┐
│ Prepared by Claude Desktop · received 4 min ago · expires 10:42│
├───────────────────────┬────────────────────────────────────────┤
│ OVERVIEW              │ PROPOSED CHANGES                       │
│ Target                │ Accessible text diff                   │
│ Review-Sprint-7.md     │ + Added paragraph                     │
│                       │ - Removed sentence                     │
│ SOURCES (3)           │                                        │
│ Alpha.md          [1] │ LINKS                                  │
│ Beta.md           [!] │ [[Alpha]] · [[Beta]]                   │
│ Notes/Gamma.md    [2] │                                        │
│                       │ PROPERTIES                             │
│ TEMPLATE              │ status: reviewed                       │
│ Sprint Review · v3    │                                        │
├───────────────────────┴────────────────────────────────────────┤
│ ⚠ Source Beta.md may contain instruction-like text.            │
│ [ ] I reviewed the warnings above.                              │
│ [Back] [Reject proposal]              [Confirm and write note] │
└────────────────────────────────────────────────────────────────┘
```

### Inhaltsregeln

- `Target` und `Sources` sind getrennte, beschriftete Regionen.
- Der Zielpfad wird relativ angezeigt, aber nie als editierbares Feld.
- Hashes erscheinen gekürzt in der Hauptansicht und vollständig über `Show technical
  details`; sie sind selektierbarer Text.
- Client, Vault, Template-ID, Version und Hash stammen aus validierten Metadaten.
- `Links` und `Properties` zeigen Hinzufügung, Änderung oder Entfernung, nicht nur den
  Endzustand.
- Diff besitzt eine gleichwertige lineare Textansicht mit `Added`, `Removed` und
  `Unchanged`; Farbe ist nur ergänzend.
- Warnungen nennen betroffene Quellen und stehen vor den Entscheidungsaktionen.

### UI-Zustände

| State | Darstellung | Entscheidungsaktionen |
|---|---|---|
| Loading | `Checking sources, target, and template…` | deaktiviert |
| Ready | vollständige Provenienz und Diff | Reject/Confirm |
| Warning | Callout pro Warnung; Review-Checkbox | Reject; Confirm bis Checkbox deaktiviert |
| Confirming | `Confirming this exact proposal…`; alle Aktionen gesperrt | keine |
| Rejecting | `Rejecting proposal…`; alle Aktionen gesperrt | keine |
| Confirmed | Ziel, Audit-ID, Zeitpunkt und Rollback-Aktion | Undo, Done |
| Rejected | `Proposal rejected. Your vault was not changed.` | Back to pending reviews |
| Conflict | betroffene Ressource und neue Vorschau erforderlich | Copy recovery request, Back |
| Expired | Ablaufzeit und sichere Nichtmutation | Copy recovery request, Back |
| Already decided | tatsächlicher Endzustand und Zeitpunkt | View history, Back |
| Checking outcome | Unterbrechung nach Entscheidungsstart | Check again; keine neue Entscheidung |
| Incomplete | `This operation did not finish successfully.` plus tatsächlicher Vaultzustand | View details, neuer Vorschlag falls nötig |
| Error | keine Erfolgssprache; letzte verifizierte Zustandsinformation | Check again, Back |

## 6. View: Template Library

```text
┌─ Compilation templates ───────────────────────────┐
│ Stored locally in .second-brain/templates         │
│ [Create template]                                 │
├──────────────────────┬────────────────────────────┤
│ Sprint Review        │ Sprint Review              │
│ Latest: version 3    │ Version 3 · {hash-short}   │
│ Architecture Note    │ Created 15 Aug 2026        │
│ Latest: version 1    │ [Read content]             │
│                      │ [Create new version]       │
└──────────────────────┴────────────────────────────┘
```

### Formular- und Versionsregeln

- `Template name` und `Template content` sind nur hier editierbar.
- Inline-Fehler stehen am zugehörigen Feld; Fokus wechselt beim Submit zum ersten Fehler.
- `Review template` erzeugt eine read-only Fassung. `Save template` wird erst dort aktiv.
- Bei paralleler Versionsänderung lautet die Recovery `Reload versions`; eingegebener
  Inhalt bleibt lokal im Formular erhalten.
- Vorherige Versionen bleiben über eine fokussierbare Versionsliste lesbar.
- Es gibt in diesem Slice kein Delete, Share oder Sync.

## 7. View: Change History

### Statusdarstellung

| Status | Sichtbarer Text | Semantik |
|---|---|---|
| `success` | `Completed` | positives Statussymbol, nicht nur Grün |
| `rejected` | `Rejected — no vault change` | neutrales Stop-Symbol |
| `failed` | `Failed — no successful change recorded` | Fehlersymbol |
| `incomplete` | `Incomplete — outcome requires attention` | Warnsymbol; niemals Erfolgsstil |
| `conflicted` | `Conflict — a newer proposal is required` | Konfliktsymbol |
| `expired` | `Expired — no vault change` | Uhrsymbol |

Rollbackstatus wird separat als `Available`, `Rolled back`, `Blocked` oder `Not
applicable` ausgegeben. Nach Rollback zeigt der ursprüngliche Eintrag `Rolled back`.

## 8. Verbindliche Microcopy

Alle Texte sind Englisch. Platzhalter werden nur mit validierten Laufzeitwerten ersetzt.

| Kontext | Element | Verbindlicher Text |
|---|---|---|
| Notice | Neuer Vorschlag | `A knowledge compilation is ready for review.` |
| Navigation | Inbox | `Pending reviews ({count})` |
| Empty | Inbox | `No knowledge compilations are waiting for review. Ask your connected AI client to prepare one, then check again.` |
| Review | Titel | `Review knowledge compilation` |
| Review | Herkunft | `Prepared by {client} for this vault.` |
| Review | Primäraktion | `Confirm and write note` |
| Review | Sekundäraktion | `Reject proposal` |
| Reject dialog | Titel | `Reject this proposal?` |
| Reject dialog | Erklärung | `Your vault will not change. This proposal cannot be confirmed later.` |
| Reject dialog | Aktion | `Reject without changing the vault` |
| Injection | Warnung | `This source contains text that looks like instructions. Second Brain will treat it as note content only.` |
| Widerspruch | Warnung | `These sources may conflict. Review the highlighted passages before deciding.` |
| Warnungen | Checkbox | `I reviewed the warnings above.` |
| Confirming | Status | `Confirming this exact proposal…` |
| Confirmed | Erfolg | `The note was updated from the reviewed proposal.` |
| Rejected | Ergebnis | `Proposal rejected. Your vault was not changed.` |
| Drift | Ziel | `The target note changed after this proposal was created. Ask your AI client for a new proposal.` |
| Drift | Quelle | `Source {source} changed after this proposal was created. Ask your AI client for a new proposal.` |
| Drift | Vorlage | `Template {template} changed or is unavailable. Ask your AI client for a new proposal.` |
| Ablauf | Fehler | `This review expired at {time}. Your vault was not changed.` |
| Replay | Fehler | `This proposal was already {decision} at {time}.` |
| Unterbrechung | Prüfung | `Checking whether the interrupted operation changed your vault…` |
| Incomplete | Ergebnis | `Incomplete — this operation did not finish successfully.` |
| Offline | Inbox | `Pending reviews are unavailable while the local service is offline.` |
| Kapazität | Inbox | `The review inbox is full. Review or reject existing proposals before asking your AI client to submit another.` |
| Template | Bibliothek leer | `No compilation templates yet. Create one to reuse it in future AI requests.` |
| Template | Race | `A newer template version was saved. Reload versions and review your draft again.` |
| History | Rollback done | `This change was rolled back.` |

Technische Codes dürfen in einem ausklappbaren Abschnitt `Technical details` erscheinen,
aber nie den handlungsorientierten Haupttext ersetzen.

## 9. Accessibility-Anforderungen

| Anforderung | Gilt für | Verbindliche Umsetzung |
|---|---|---|
| Vollständige Tastaturbedienung | Alle Views und Dialoge | Keine Hover-only- oder Drag-only-Aktion; logische Tab-Reihenfolge |
| Fokus nach Navigation | Liste → Detail → Liste | Detailfokus auf H1; Back bringt Fokus zum ursprünglichen Listeneintrag |
| Notice | Neue Vorschläge | Kein Fokuswechsel; Badge und Pending-Liste sind dauerhafte Alternative |
| Live-Status | Loading, Confirming, Rejecting, Recovery | Eine höfliche `aria-live`-Region; terminale Fehler `role="alert"` |
| Diff | Added/Removed/Unchanged | Textpräfixe und lineare Lesereihenfolge; keine reine Farbcodierung |
| Warnungen | Sicherheitsinhalte | Überschrift, Symbol und Text; Checkbox via `aria-describedby` verknüpft |
| Dialog | Reject | Fokusfalle, Titel/Erklärung referenziert; Escape entspricht `Cancel` |
| Disabled actions | Confirm | Zugängliche Beschreibung erklärt den fehlenden Schritt |
| Touch-/Klickziel | Aktionen | mindestens 24 × 24 CSS-Pixel, bevorzugt 44 × 44 |
| Zoom und Reflow | Alle Views | kein Inhaltsverlust bei 200 % Zoom und 320 px Pane-Breite |

Nach Confirm, Reject oder Recovery wird das Ergebnis fokussiert. Toasts oder Notices sind
nie der einzige Nachweis eines Zustands.

## 10. Pane- und Fensterverhalten

| Breite | Layout |
|---|---|
| 320–479 px | Einspaltig. Review-Inhalte als `Overview`, `Sources`, `Changes` und `Decision`; Aktionen untereinander. |
| 480–899 px | Einspaltig mit ausklappbaren Regionen; Entscheidungsleiste bleibt nach Inhalt, nicht als überdeckendes Sticky-Element. |
| ≥ 900 px | Zweispaltige Listen-/Detailansicht; Quellen und Diff gleichzeitig sichtbar. |

Die DOM-Lesereihenfolge bleibt in allen Breiten: Herkunft → Ziel → Quellen → Vorlage →
Änderungen → Warnungen → Entscheidungen. Visuelle Spalten dürfen diese Reihenfolge nicht
verändern.

## 11. Übergänge und Aktualisierung

| Element | Verhalten | Accessibility |
|---|---|---|
| Badge count | sofortiger Text-/Zählerwechsel | keine Animation erforderlich |
| Neue Listenzeile | ohne Bewegung einfügen | bei `prefers-reduced-motion` identisch |
| Detailwechsel | maximal 150 ms Fade | ohne Animation bei reduzierter Bewegung |
| Polling refresh | vorhandenen Fokus und Scrollposition bewahren | Status nur bei manueller Aktion ankündigen |
| Entscheidung | Aktionen sofort sperren | Status einmalig live ankündigen |

Keine sicherheitskritische Aktion darf automatisch, zeitgesteuert oder durch doppeltes
Klicken ausgelöst werden.

## 12. Design-System und Komponenten

| Komponente | Referenz | UX-Regel |
|---|---|---|
| Ribbon/Command | Native Obsidian | zugänglicher Name `Open pending reviews, {count} waiting` |
| Notice | Native Obsidian Notice | ergänzend, nie alleiniger Zugang |
| Listen-/Detailview | Native ItemView | getrennte fokussierbare Komponenten statt eines Gesamtformulars |
| Dialog | Native Obsidian Modal | nur Reject-Bestätigung; große Diffs bleiben in der View |
| Callout | Obsidian Callout/CSS variables | Warnstufe zusätzlich ausgeschrieben |
| Diff | semantische Textstruktur | lineare Alternative verpflichtend |
| Tabs/Regions | native Buttons mit ARIA-Vertrag | keine versteckten Inhalte aus der Lesereihenfolge verlieren |

## 13. Fehler- und Edge-Case-Matrix

| Fall | UX-Reaktion |
|---|---|
| Plugin startet mit offenen Vorschlägen | Badge sofort nach Summary; eine zusammengefasste Notice, keine Notice pro Eintrag |
| Mehrere Vorschläge für dasselbe Ziel | Beide sichtbar; Callout `Another proposal targets this note`; Entscheidungen bleiben einzeln |
| Vorschlag läuft während Detailprüfung ab | Confirm deaktivieren, `Expired` live ankündigen, Recovery anbieten |
| Quelle/Ziel/Vorlage driftet | betroffene Ressource nennen; keine generische Fehlermeldung; neuer Vorschlag nötig |
| Doppelklick oder Replay | nur erster Request; tatsächlichen terminalen Zustand anzeigen |
| Plugin/Prozess trennt während Commit | `Checking outcome`; keine erneute Bestätigung anbieten |
| Recovery ergibt fremden Zielhash | `Incomplete` plus Konflikt; niemals automatisch überschreiben |
| Inbox erreicht Grenze | bestehende Einträge nicht entfernen; Kapazitätsmeldung und natürliche Recovery |
| Polling schlägt einmal fehl | vorhandene Liste als `Last checked` behalten; erst nach wiederholtem Fehler Offline-Status |
| Keine Vorlage im Vorschlag | `No template` anzeigen; Bestätigung erlaubt, sofern Vertrag gültig |
| Vorlage wird parallel versioniert | gebundene alte Version bleibt lesbar; nur fehlende/geänderte gebundene Version blockiert |
| Template-Version-Race beim Speichern | Draft erhalten, neue Versionen laden, erneut prüfen |
| Historie meldet `Incomplete` | Warnstil und tatsächlichen Vaultzustand erklären; kein Erfolgssymbol |

## 14. Offene Fragen

Keine offene BLOCKER- oder MAJOR-Frage für den Recovery-Slice.

| # | Frage | Verantwortlich | Kritikalität | Status |
|---:|---|---|---|---|
| 1 | US-000006 im Sprint-7-Abschnitt auf US-000017 umreferenzieren | BA | MINOR | OFFEN für Refinement |

## 15. Definition-of-Done-Selbstprüfung

- [x] Sechs primäre Journeys für Inbox, Review, Reject, Recovery, Templates und History dokumentiert.
- [x] Empty, Loading, Ready, Warning, Error, Offline, Success, Conflict, Expired und Incomplete beschrieben.
- [x] Ziel, Quellen, Vorlage, Diff, Links, Properties und Warnungen getrennt spezifiziert.
- [x] Manuelle Pfad- und Volltexteingabe aus dem MCP-first-Flow ausgeschlossen.
- [x] Notice, Badge, Polling-Refresh und Fokusverhalten festgelegt.
- [x] Verbindliche englische Microcopy einschließlich feldbezogener Recovery vorhanden.
- [x] WCAG 2.2 AA, Tastaturfluss, Diff-Alternative und Reflow beschrieben.
- [x] Template-Erstellung, immutable Versionierung und Wiederfinden abgedeckt.
- [x] History- und Rollbackzustände entsprechen ADR-000007.
- [x] Native Obsidian UI und Constitution eingehalten.
- [x] `ux/INDEX.md` und Projekt-`INDEX.md` aktualisiert.
- [x] Freigabe durch Folge-Command `/refine` am 2026-08-15 erteilt.

---

## Übergabe: UX → BA+FE+BE

**Datum:** 2026-08-15
**Von:** UX Designer (UX)
**An:** Business Analyst, Frontend Developer und Backend Developer (BA+FE+BE)
**Nächster Befehl:** `/refine second-brain 7`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| UX-000004 | APPROVED | `ux/UX-000004-mcp-first-compilation-review.md` | Inbox, Review, Templates, History, Microcopy und Accessibility |
| ADR-000007 | APPROVED | `architecture/ADR-000007-mcp-first-pending-confirmation.md` | Contract 3, Schema 6 und technische Zustände |
| US-000017 | APPROVED | `requirements/US-000017-mcp-first-pending-compilation.md` | Fachliche Abnahmeszenarien |

### Kritische Informationen für Empfänger

- `Pending reviews` ist eine Liste und Prüfoberfläche, keine Eingabemaske.
- Confirm/Reject, Drift, Ablauf und Recovery benötigen jeweils eigene testbare UI-Zustände.
- Templates bleiben der einzige Bereich mit Name-/Inhaltsfeldern; Vorlagenwahl im Pending
  Review ist read-only.
- Die bestehende monolithische `MutationView.onOpen` darf diese Zustände nicht erneut in
  einer einzigen Methode bündeln.

### Offene Fragen (vererbt)

| # | Frage | Ursprung | Kritikalität | An wen |
|---:|---|---|---|---|
| 1 | Veraltete US-000015-Referenz in US-000006 korrigieren | ADR-000007 / UX-000004 | MINOR | BA |

### Nicht-Ziele

Kein Pixel-Mockup, kein Branding, kein Obsidian-initiierter Compilation-Editor und keine
Implementierung.

### Empfehlungen

Im Refinement zuerst den durchgängigen MCP→Inbox→Review→Decision-E2E-Pfad schneiden;
Template- und History-Korrekturen danach als getrennte, aber gate-relevante Tasks planen.
