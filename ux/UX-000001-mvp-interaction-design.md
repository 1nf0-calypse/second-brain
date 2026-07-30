---
id: UX-000001
title: MVP Interaction Design
version: 1.0
status: APPROVED
author-agent: UX (UX Designer)
date: 2026-07-30
project: second-brain
based-on: US-000001, US-000002, US-000003, US-000004, US-000005, US-000006, US-000007, US-000008, US-000009, US-000010, ADR-000001, ADR-000004
supersedes: —
superseded-by: —
---

# UX-Spec: Second Brain MVP Interaction Design

## 1. Scope

**Abgedeckte User Stories:** US-000001–US-000010  
**Primäre Nutzungsgruppen:** Power User sowie technisch wenig versierte Obsidian-Nutzer  
**Nutzungskontext:** Windows Desktop im MVP; Android als explizit eingeschränkter
Post-MVP-Zustand  
**Produktsprache:** Englisch  
**Design-System:** Native Obsidian-Komponenten und Obsidian-CSS-Variablen gemäß ADR-000001

Die UX bündelt alle sicherheitskritischen Entscheidungen in einer beständigen
`Second Brain`-Seitenleiste. Einstellungen enthalten Installation und Verbindungen;
arbeitsbezogene Flows öffnen fokussierte Views oder modale Bestätigungen. Sicherheitsregeln
werden nicht ausschließlich in der UI erzwungen.

## 2. Informationsarchitektur

```text
Second Brain
├─ Home
│  ├─ Connection status
│  ├─ Index status
│  └─ Recent activity
├─ Search
│  ├─ Results and citations
│  └─ Graph context
├─ Compile knowledge
│  ├─ Sources, prompt and template
│  └─ Change preview
├─ Changes
│  ├─ Pending confirmations
│  ├─ History
│  └─ Rollback
└─ Settings
   ├─ Vault and sidecar
   ├─ MCP clients
   ├─ Autonomy and budgets
   ├─ Data sharing
   └─ Integrations and mobile availability
```

Globale Statusanzeige:

- `Connected`, `Needs attention` oder `Offline` für den Sidecar.
- `Up to date`, `Indexing`, `Degraded` oder `Unavailable` für den Index.
- `Human-in-the-loop`, `Human-on-the-loop` oder `Human-out-of-the-loop` dauerhaft sichtbar.
- Ein Wechsel aus Human-in-the-loop darf nie als beiläufiger Toggle umgesetzt werden.

## 3. User Journeys

### Journey 1: Installation, Vault und MCP-Client verbinden

**Startpunkt:** Obsidian Settings → Community plugins → Second Brain  
**Ziel:** Lokalen Sidecar prüfen, bestehenden Vault freigeben und Client verbinden.

| Schritt | Nutzeraktion | Systemreaktion | UI-State danach |
|---|---|---|---|
| 1 | `Start setup` wählen | Setup erklärt lokale Persistenz und benötigte Komponenten | Setup overview |
| 2 | Erkannten Vault prüfen oder Ordner wählen | Pfad, Lesbarkeit und Root-Grenze werden validiert; keine Migration | Vault validated oder error |
| 3 | `Set up local service` wählen | Sidecar wird erkannt oder eine manuelle Installationsanleitung gezeigt | Service connected oder offline |
| 4 | Claude, ChatGPT oder Mistral wählen | Nur für die erkannte Kompatibilitätsmatrix gültige Schritte erscheinen | Client instructions |
| 5 | `Test connection` wählen | Read-only Handshake testet Vertrag und Scope | Success oder diagnostics |
| 6 | `Finish setup` wählen | Home öffnet im Human-in-the-loop-Modus | Ready |

**Abbruchpunkte:** Jeder Schritt kann mit `Save and exit setup` verlassen werden. Bereits
validierte Einstellungen bleiben lokal gespeichert; keine Vault-Datei wird verändert.

**Fehlerflüsse:** Ungültiger Vault, Symlink-Escape, Sidecar nicht gefunden,
Vertragsversionskonflikt, inkompatibler Client. Jeder Fehler nennt Ursache, unveränderten
Zustand und konkrete nächste Aktion.

### Journey 2: Initialindex und laufenden Indexstatus prüfen

| Schritt | Nutzeraktion | Systemreaktion | UI-State danach |
|---|---|---|---|
| 1 | `Build local index` wählen | Umfang und ausschließlich lokale Speicherung werden erklärt | Confirmation |
| 2 | Start bestätigen | Fortschritt zeigt verarbeitete, übersprungene und fehlerhafte Dateien | Indexing |
| 3 | Obsidian weiter nutzen oder View schließen | Hintergrundlauf bleibt sichtbar und pausierbar | Background progress |
| 4 | Abschluss öffnen | Zusammenfassung zeigt Dauer, Fundstücke und nicht extrahierbare Anhänge | Up to date |
| 5 | Bei Schaden `Rebuild index` wählen | Warnung erklärt, dass nur abgeleitete Daten ersetzt werden | Rebuild confirmation |

**Fehlerflüsse:** Beschädigter Index, gesperrte Datei, nicht extrahierbarer Anhang,
unzureichender Speicherplatz und Sidecar-Abbruch. Originaldateien bleiben ausdrücklich
als `Not changed` ausgewiesen.

### Journey 3: Suchen, Quellen prüfen und Graph erkunden

| Schritt | Nutzeraktion | Systemreaktion | UI-State danach |
|---|---|---|---|
| 1 | Suchbegriff eingeben | Suche startet nach Submit; Filter bleiben tastaturbedienbar | Loading |
| 2 | Ergebnisse erhalten | Treffer zeigen Titel, Fundstelle, Match-Typ und Extraktionsstatus | Results |
| 3 | Treffer wählen | Notiz öffnet an der Fundstelle; Quelle bleibt im Suchverlauf | Note open |
| 4 | `Show connections` wählen | Direkte, belegte Beziehungen und Beziehungstypen erscheinen | Graph context |
| 5 | Beziehung wählen | Zielnotiz und Herkunft der Kante werden angeboten | Related note |

**Leerer Zustand:** Suchbegriff vorhanden, aber keine Treffer: alternative Schreibweise,
Filter zurücksetzen und Indexstatus prüfen anbieten.  
**Degradierter Zustand:** Semantische Suche nicht verfügbar: Volltextresultate bleiben
nutzbar und werden als `Full-text results only` gekennzeichnet.

### Journey 4: Mutation prüfen, bestätigen und zurücksetzen

**Startpunkt:** MCP-Client fordert Mutation an oder Nutzer öffnet `Pending confirmations`.

| Schritt | Nutzeraktion | Systemreaktion | UI-State danach |
|---|---|---|---|
| 1 | Pending request öffnen | Client, Vault, Dateien, Operationen und Risikostufe erscheinen | Preview |
| 2 | Diff und Scope prüfen | Vorher/Nachher, Löschungen und Konflikte sind getrennt erkennbar | Review |
| 3 | `Confirm changes` wählen | Serverseitiger Hash- und Policy-Check läuft | Committing |
| 4 | Commit erfolgreich | Audit-ID, geänderte Dateien und `Undo this change` erscheinen | Success |
| 5 | `Undo this change` wählen | Rollback-Vorschau prüft neuere Änderungen | Rollback preview |
| 6 | Rollback bestätigen | Einzelmutation wird zurückgesetzt oder konfliktfrei abgebrochen | Rolled back oder conflict |

**Abbruch:** `Reject` verwirft das Confirmation Token ohne Vault-Änderung.  
**Konflikt:** Bei geändertem Hash ist `Confirm changes` deaktiviert. Nur `Refresh preview`
oder `Reject` bleibt möglich.  
**Löschung:** Immer eigener Abschnitt `Files to delete`, Warnsymbol, ausgeschriebener
Button `Confirm deletion` und keine Vorbelegung.

### Journey 5: Autonomiestufe und Mutationsbudget ändern

| Schritt | Nutzeraktion | Systemreaktion | UI-State danach |
|---|---|---|---|
| 1 | `Change autonomy mode` wählen | Vergleich von Bestätigung, Überwachung und automatischer Ausführung | Mode comparison |
| 2 | Human-on/out wählen | Konkrete Risiken, Scope, Zeitfenster, Anzahl und Löschregel werden verlangt | Budget form |
| 3 | Warnung bestätigen | Nutzer muss Bestätigungssatz aktiv anhaken; serverseitige Policy wird vorbereitet | Final confirmation |
| 4 | `Activate mode` wählen | Modus, Ablaufzeit und Restbudget werden dauerhaft sichtbar | Active mode |
| 5 | `Pause automation` wählen oder Budget läuft aus | Neue automatische Mutationen werden blockiert | Paused |

Human-out-of-the-loop ist deaktiviert, solange kein gültiges Budget mit Ablaufzeit vorliegt.
Löschungen sind standardmäßig ausgeschlossen und benötigen eine separate bewusste Freigabe.

### Journey 6: Wissen aus Quellen kompilieren

| Schritt | Nutzeraktion | Systemreaktion | UI-State danach |
|---|---|---|---|
| 1 | Quellen wählen | Lesbarer Scope und widersprüchliche Quellen werden markiert | Sources selected |
| 2 | Prompt und Vorlage wählen | Version und Herkunft werden angezeigt | Configuration ready |
| 3 | `Generate preview` wählen | Verarbeitung läuft ohne Vault-Mutation | Loading |
| 4 | Vorschau prüfen | Neue Seiten, Änderungen, Links, Properties und Quellen erscheinen als Diff | Preview |
| 5 | `Send for confirmation` wählen | Flow wechselt in Journey 4 | Pending confirmation |

In Quellen enthaltene Werkzeuganweisungen erscheinen bei Erkennung als
`Untrusted instruction-like content` und verändern weder Prompt noch Berechtigungen.

### Journey 7: Verlauf, Integrationen und Plattformgrenzen prüfen

| Schritt | Nutzeraktion | Systemreaktion | UI-State danach |
|---|---|---|---|
| 1 | `Changes` öffnen | Chronologische Einträge zeigen Status, Auslöser, Scope und Rollback | History |
| 2 | Eintrag öffnen | Technische Details und verständliche Zusammenfassung erscheinen getrennt | Change detail |
| 3 | `Integrations` öffnen | campaignworld steht bis zur Konfiguration als `Not connected` | Integration empty |
| 4 | Android-Status öffnen | Unterstützte und nicht verfügbare Funktionen werden konkret gelistet | Platform capability view |

Ein unterbrochener Vorgang trägt `Incomplete` und darf nicht visuell wie ein Erfolg wirken.
Nicht verfügbare Android-Sidecar-Funktionen bieten keinen Cloud- oder unsicheren Fallback an.

## 4. Views und UI-Zustände

### View: Second Brain Home

```text
┌─ Second Brain ───────────────────────────────┐
│ Local service  Connected                    │
│ Index          Up to date · 1,248 notes     │
│ Autonomy       Human-in-the-loop            │
├─────────────────────────────────────────────┤
│ [Search your vault…                     ]   │
│ [Search]  [Compile knowledge]               │
├─────────────────────────────────────────────┤
│ Pending confirmations (2)                   │
│ Recent activity                             │
└─────────────────────────────────────────────┘
```

| State | Darstellung | Verfügbare Aktion |
|---|---|---|
| Initial/empty | Setup-Einführung statt leerer Kennzahlen | `Start setup` |
| Loading | Bereichsbezogene Fortschrittsanzeige; Navigation bleibt nutzbar | `Cancel` nur bei sicher abbrechbaren Vorgängen |
| Success | Kompakte Statuszeilen und letzter erfolgreicher Zeitpunkt | Primäraktionen |
| Error | Betroffener Bereich, Ursache und Recovery; andere Bereiche bleiben nutzbar | `View diagnostics`, `Try again` |
| Offline | Lesen des Vaults über Obsidian bleibt unberührt; MCP-Aktionen deaktiviert | `Reconnect local service` |

### View: Mutation Preview

```text
┌─ Review requested changes ──────────────────┐
│ Requested by: Claude · Vault: Second Brain  │
│ Mode: Human-in-the-loop · 3 files           │
├─────────────────────────────────────────────┤
│ Modified (2)  Created (1)  Deleted (0)       │
│ [File list]        │ [Accessible diff]       │
├─────────────────────────────────────────────┤
│ [Reject] [Refresh preview] [Confirm changes] │
└─────────────────────────────────────────────┘
```

| State | Darstellung | Verfügbare Aktion |
|---|---|---|
| Empty | `No changes are waiting for review.` | Zurück zu Home |
| Loading | Diff-Platzhalter und `Checking current file versions…` | `Cancel review` |
| Ready | Vollständiger Scope und fokussierbarer Diff | Reject/Confirm |
| Committing | Aktionen gesperrt; Status live angekündigt | Keine Doppelübermittlung |
| Success | Audit-ID und Rollback-Aktion | `Undo this change`, `Done` |
| Conflict | Betroffene Datei und Grund; alte Bestätigung ungültig | `Refresh preview`, `Reject` |
| Error | Keine Erfolgssprache; Zusicherung über atomaren Zustand | `View details`, `Try again` |

### View: Search and Graph

| State | Darstellung | Verfügbare Aktion |
|---|---|---|
| Empty query | Suchhilfe und Beispiele ohne automatische Datenübertragung | Suche eingeben |
| Loading | Fortschrittszeile; vorhandene Treffer werden als veraltet markiert | Suche abbrechen |
| Results | Ergebnisliste mit Quelle, Fundstelle und Match-Typ | Öffnen, filtern, Graph |
| No results | Query wiederholen, Filter löschen, Index prüfen | Recovery-CTAs |
| Degraded | Volltext bleibt aktiv; semantische Ursache sichtbar | Volltext nutzen |
| Error | Diagnose ohne Vault-Inhalt in Logs | `Try again`, `View index status` |

## 5. Microcopy-Katalog

Alle Texte sind verbindlich englisch. Platzhalter in geschweiften Klammern werden durch
laufzeitvalidierte Werte ersetzt.

| Kontext | Element | Verbindlicher Text |
|---|---|---|
| Setup | Titel | `Set up Second Brain` |
| Setup | Datenschutz | `Your vault and search index stay on this device. Selected content is shared only when you choose an external AI provider.` |
| Vault | Validierung erfolgreich | `Vault ready. No files were moved or changed.` |
| Vault | Ungültiger Pfad | `This folder is not a readable Obsidian vault. Choose another folder. No files were changed.` |
| Sidecar | Offline | `The local service is offline. MCP, indexing, and search are unavailable.` |
| Client | Test erfolgreich | `{client} is connected with read-only access.` |
| Client | Inkompatibel | `This client version is not supported by the current local service.` |
| Index | Start | `Build local index` |
| Index | Fortschritt | `Indexed {done} of {total} files. {skipped} skipped.` |
| Index | Sicherheitsaussage | `Your original vault files will not be changed.` |
| Search | Placeholder | `Search notes, tags, properties, and links` |
| Search | Keine Treffer | `No results found. Try another phrase, clear filters, or check the index status.` |
| Search | Degradiert | `Semantic search is unavailable. Showing full-text results only.` |
| Mutation | Titel | `Review requested changes` |
| Mutation | Bestätigen | `Confirm changes` |
| Mutation | Ablehnen | `Reject` |
| Mutation | Konflikt | `This file changed after the preview was created. Refresh the preview before deciding.` |
| Mutation | Commitfehler | `The change was not completed. Your vault was left in a consistent state.` |
| Delete | Bestätigen | `Confirm deletion` |
| Rollback | Aktion | `Undo this change` |
| Rollback | Konflikt | `This change cannot be undone automatically because newer edits would be overwritten.` |
| Autonomie | Titel | `Change autonomy mode` |
| Autonomie | Warnung | `This mode can change your vault without asking for every operation.` |
| Autonomie | Pause | `Pause automation` |
| Budget | Ablauf | `Automation pauses on {date} at {time} or when the mutation budget is used.` |
| Datenfluss | Titel | `Share selected content with {provider}?` |
| Datenfluss | Erklärung | `Recipient: {provider}. Purpose: {purpose}. Data: {categories}. Retention: {retention}.` |
| Datenfluss | Unbekannt | `Provider retention information is unavailable. Sharing is blocked until you can review a valid notice.` |
| Compilation | Aktion | `Generate preview` |
| Injection | Hinweis | `Untrusted instruction-like content was found in a source. It will be treated as data only.` |
| History | Unterbrochen | `Incomplete — this operation did not finish successfully.` |
| Mobile | Einschränkung | `This feature requires the desktop local service and is not available on Android.` |
| Integration | Leerzustand | `campaignworld is not connected. Second Brain continues to work independently.` |

## 6. Accessibility

**Ziel:** WCAG 2.2 AA für alle MVP-Kernabläufe.

| Anforderung | Gilt für | Umsetzung |
|---|---|---|
| Vollständige Tastaturbedienung | Setup, Suche, Diff, Consent, Einstellungen | Logische Tab-Reihenfolge; keine Drag-only-Aktion |
| Sichtbarer Fokus | Alle Controls | Obsidian-Fokusstil nicht entfernen; Kontrast ≥ 3:1 |
| Textkontrast | Texte und Status | ≥ 4.5:1; große Texte ≥ 3:1 |
| Status nicht nur über Farbe | Alle Statusanzeigen | Text, Symbol und Farbe kombinieren |
| Live-Status | Index, Commit, Verbindung | Zurückhaltende `aria-live`-Region; keine Zeichen-für-Zeichen-Ausgabe |
| Dialogfokus | Consent und Confirmation | Fokus einschließen, Titel referenzieren, Escape nur bei sicherem Abbruch |
| Fehlerzuordnung | Formulare | Fokus auf Zusammenfassung; Felder via Beschreibung verknüpfen |
| Diff-Zugänglichkeit | Mutation Preview | Zeilenweise Textansicht mit `Added`, `Removed`, `Unchanged`; Farbe nur ergänzend |
| Graph-Alternative | Knowledge Graph | Vollständig bedienbare Beziehungsliste als gleichwertige Alternative |
| Zoom und schmale Paneele | Alle Views | Kein Inhaltsverlust bei 200 % Zoom und 320 px Pane-Breite |
| Reduzierte Bewegung | Übergänge | `prefers-reduced-motion` respektieren |
| Zielgröße | Primäraktionen | Mindestens 24 × 24 CSS-Pixel, bevorzugt 44 × 44 |

Nach destruktiven oder sicherheitskritischen Aktionen kehrt der Fokus auf eine sinnvolle
Statusüberschrift zurück. Toasts sind nie die einzige Bestätigung.

## 7. Pane-, Fenster- und Mobile-Verhalten

Das Produkt ist keine Web-App; klassische Responsive-Breakpoints sind nicht anwendbar.
Stattdessen gilt:

| Breite | Verhalten |
|---|---|
| 320–479 px | Einspaltig; Dateiliste und Diff wechseln als fokussierte Tabs; Buttons stapeln |
| 480–899 px | Einspaltig mit ausklappbaren Details; Primäraktion bleibt sichtbar |
| ≥ 900 px | Zweispaltige Listen-/Detailansicht; Diff und Scope gleichzeitig sichtbar |

Obsidian-Fensterzoom bis 200 % darf keine horizontale Seitensteuerung erzwingen. Auf Android
werden ausschließlich freigegebene mobile Fähigkeiten gezeigt; Sidecar-abhängige Controls
erscheinen deaktiviert mit konkreter Erklärung, nicht als fehlschlagende Aktion.

## 8. Übergänge

| Element | Übergang | Dauer | Accessibility |
|---|---|---|---|
| Dialog | Kurzes Ein-/Ausblenden | 150 ms | Bei reduzierter Bewegung ohne Animation |
| Statuswechsel | Keine Bewegung, Text-/Iconwechsel | sofort | Via Live-Region angekündigt |
| Graph-Fokus | Dezente Hervorhebung | 150 ms | Listenalternative bleibt synchron |
| Fortschritt | Determiniert, wenn Gesamtzahl bekannt | laufend | Prozent und Zähler als Text |

Keine sicherheitskritische Bestätigung darf durch Animation verzögert, verdeckt oder
automatisch ausgelöst werden.

## 9. Design-System und Komponenten

| Komponente | Referenz | Abweichung |
|---|---|---|
| Settings rows, buttons, notices | Native Obsidian UI | Keine eigene SPA-Komponentenbibliothek |
| Modal | Obsidian Modal | Für große Diffs bevorzugt eigene View statt übergroßem Modal |
| Icons | Obsidian/Lucide-Icons | Immer zugänglicher Name oder sichtbarer Text |
| Status | Obsidian CSS variables | Sicherheitsstatus zusätzlich ausgeschrieben |
| Diff | Semantische Text-/Listenstruktur | Eigene Darstellung nötig; keine farbabhängige Bedeutung |
| Graph | Native Canvas/SVG nach Machbarkeit | Beziehungsliste ist verpflichtende Alternative |

## 10. Edge-Case-Matrix

| Fall | UX-Reaktion |
|---|---|
| Datei ändert sich nach Preview | Bestätigung invalidieren, Konflikt erklären, neue Preview verlangen |
| Symlink oder Pfad außerhalb Root | Zugriff blockieren; betroffenen Pfad nennen, fremden Inhalt nicht zeigen |
| Client trennt während Commit | Status `Checking outcome`; erst nach serverseitiger Klärung Erfolg/Fehler anzeigen |
| Unbekannter Provider-Hinweis | Externe Übertragung blockieren |
| Ungewöhnlich hohe Mutationsrate | Automation pausieren; Grund, Budget und letzte Aktionen zeigen |
| Index beschädigt | Sicheren Neuaufbau anbieten; Originaldateien als unverändert ausweisen |
| Anhang nicht extrahierbar | Metadaten anzeigen; Inhalt als nicht durchsuchbar kennzeichnen |
| Audit-Eintrag unvollständig | `Incomplete`; kein grüner Erfolgsstatus |
| Frühere Konfiguration nicht lesbar | Schreibzugriff sperren; Diagnose und sichere Exportoption anbieten |
| campaignworld nicht vorhanden | Integration als optional darstellen; Kernfunktionen unverändert |

## 11. Offene Fragen

| # | Frage | Verantwortlich | Kritikalität | Status |
|---|---|---|---|---|
| 1 | Konkrete Standardbudgets je Autonomiestufe | Stakeholder / BA / AR | MAJOR | OFFEN für Refinement |
| 2 | Verbindliche Client-Versionen und Transportmatrix | AR / Stakeholder | MAJOR | OFFEN für Refinement |
| 3 | Pflege und Wortlaut providerbezogener Retention-Hinweise | PM / BA | MAJOR | OFFEN vor MVP-Abnahme |
| 4 | Erste unterstützte Anhangs- und OCR-Typen | Stakeholder / Refinement | MINOR | OFFEN |

Keine offene Frage blockiert die UX-Freigabe. Fragen 1 und 2 blockieren jedoch die
Implementierung der jeweils betroffenen Verträge, falls sie im Sprint-1-Scope liegen.

## 12. Definition-of-Done-Selbstprüfung

- [x] Sieben primäre Journeys dokumentiert.
- [x] US-000001–US-000010 abgedeckt.
- [x] Empty, loading, error, success, offline, degraded und conflict beschrieben.
- [x] Edge Cases und Recovery-Flows explizit.
- [x] WCAG 2.2 AA und kritische Anforderungen definiert.
- [x] Verbindliche englische Microcopy für alle spezifizierten Nutzeraktionen vorhanden.
- [x] Pane-, Fenster- und Mobile-Verhalten beschrieben.
- [x] Constitution-Prinzipien und harte Ausschlüsse eingehalten.
- [x] `ux/INDEX.md` und Projekt-`INDEX.md` aktualisiert.
- [x] Stakeholder-Freigabe am 2026-07-30 erteilt; Status ist `APPROVED`.

---

## Übergabe: UX → FE

**Datum:** 2026-07-30  
**Von:** UX Designer (UX)  
**An:** Frontend Developer (FE)  
**Nächster Befehl:** `/refine second-brain 1`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| UX-000001 | APPROVED | `ux/UX-000001-mvp-interaction-design.md` | Journeys, Zustände, Microcopy, Accessibility und Handoff |

### Kritische Informationen für Empfänger

- Native Obsidian UI; kein SPA-Framework im MVP.
- WCAG 2.2 AA, vollständige Tastaturpfade und zugänglicher Text-Diff sind verbindlich.
- Sicherheitsstatus und Autonomiemodus bleiben dauerhaft sichtbar.
- Consent und Bestätigung werden serverseitig erzwungen; die UI bildet den Vertrag ab.

### Offene Fragen (vererbt)

| # | Frage | Ursprung | Kritikalität | An wen |
|---|---|---|---|---|
| 1 | Standardbudgets je Autonomiestufe | UX-000001 §11 | MAJOR | BA / AR / Stakeholder |
| 2 | Client-/Transport-Kompatibilitätsmatrix | UX-000001 §11 | MAJOR | AR / Stakeholder |
| 3 | Provider-Hinweise | UX-000001 §11 | MAJOR | PM / BA |

### Nicht-Ziele (explizit ausgeschlossen)

Pixelgenaue Mockups, visuelles Branding und ein eigenes Design-System wurden nicht erstellt.
Post-MVP-Android und campaignworld werden nur als sichere Capability-Zustände spezifiziert.

### Empfehlungen

Im Refinement zuerst Setup, Indexstatus, Suche sowie Trust-Boundary- und
Mutation-Preview-Komponenten schneiden. Die Beziehungsliste vor der Graphvisualisierung
implementieren, da sie zugleich zugängliche Basis und funktionaler Fallback ist.
