---
id: SB-000001
title: Second Brain
version: 1.0
status: APPROVED
author-agent: PM (Product Manager)
date: 2026-07-30
project: second-brain
based-on: Stakeholder-Interview 2026-07-30, graceruowenwang/obsidian-second-brain
supersedes: —
superseded-by: —
---

# Stakeholder Brief: Second Brain

> **Ablage:** `projects/second-brain/discovery/SB-000001-second-brain.md`

---

## 1. Projektzusammenfassung

**Problem / Chance:**
Private Wissensbestände in Obsidian sind für externe KI-Assistenten nicht einheitlich,
sicher und schreibend nutzbar. Der Projektinitiator benötigt einen zentralen Knowledge
Graph für private Projekte, der von Claude, ChatGPT und Mistral über MCP gelesen und
kontrolliert verändert werden kann. Ohne das Produkt fehlt ein Effizienzwerkzeug für die
projektübergreifende Wissensarbeit.

**Projektvision (1 Satz):**
Wenn Second Brain erfolgreich ist, dient ein bestehender Obsidian-Vault als zentraler,
lokaler und sicher kontrollierbarer RAG-Knowledge-Graph für alle privaten Projekte und
mehrere KI-Assistenten.

**Auslöser / Warum jetzt:**
Der Stakeholder hatte jetzt die Produktidee; es besteht kein externer Zieltermin.

**Frühere Lösungsversuche:**
Es gab keinen eigenen Vorläufer. Fachliche Referenz ist das MIT-lizenzierte Projekt
`graceruowenwang/obsidian-second-brain`. Parallel entsteht `campaignworld`, ein separates
Rollenspielprojekt mit geplanter eigener MCP-Schnittstelle. Beide Systeme sollen später
kombinierbar sein, ohne schon im MVP fest gekoppelt zu werden.

**Projektkategorie:**
[x] Neuentwicklung  [ ] Erweiterung bestehend  [ ] Migration  [ ] Optimierung  [ ] Forschung/Spike

### Referenz und Recherche

- Referenzprojekt: https://github.com/graceruowenwang/obsidian-second-brain
- MIT-Lizenz: https://opensource.org/license/mit
- Creative-Commons-Hinweis für Software:
  https://creativecommons.org/faq/#can-i-apply-a-creative-commons-license-to-software

Das Referenzprojekt bietet bereits Wissenskompilierung, semantische Suche, Wiki-Links,
Graphdarstellung und direkte Multi-LLM-Anbindungen. Der geplante Nachbau unterscheidet sich
insbesondere durch MCP-first-Zugriff ohne zusätzlichen LLM-API-Key, kontrolliertes Schreiben,
mehrere Autonomiestufen und expliziten Prompt-Injection-Schutz.

---

## 2. Stakeholder

| Name / Rolle | Organisation | Interesse / Erwartung | Entscheidungsbefugnis | Kontakt |
|---|---|---|---|---|
| Projektinitiator / primärer Nutzer | Privat | Zentraler Knowledge Graph für private Projekte | Hoch | Aktueller Nutzer; Kontakt nicht im Artefakt gespeichert |
| Freunde als Early Adopters | Privat | Einfach installierbares und verständliches Obsidian-Plugin | Gering | Noch nicht benannt |
| Spätere Obsidian-Nutzer | Open-Source-Community | Funktionsreiches Plugin mit einfacher Einrichtung | Gering | Öffentliches Projekt, noch kein Kanal festgelegt |

**Primärer Auftraggeber:** Projektinitiator und aktueller Nutzer.

**Wer wird durch das Projekt negativ betroffen?**
Keine Personengruppe ist als unmittelbar negativ betroffen identifiziert. Nutzer können
jedoch Datenschutzrisiken eingehen, wenn Vault-Inhalte zur Verarbeitung an einen gewählten
KI-Anbieter übertragen werden. Darauf muss die Ersteinrichtung ausdrücklich hinweisen.

---

## 3. Zielgruppen / Nutzer

| Nutzergruppe | Kurzbeschreibung | Primäres Ziel | Schmerzpunkt heute | Technische Affinität |
|---|---|---|---|---|
| Projektinitiator / Power User | Verwaltet mehrere private Projekte und nutzt mehrere KI-Assistenten | Obsidian als zentralen, projektübergreifenden Knowledge Graph verwenden | Kein einheitlicher MCP-Lese-/Schreibzugriff und hoher manueller Kontextaufwand | Hoch |
| Freunde / normale Obsidian-Nutzer | Nutzen Obsidian ohne tiefe MCP- oder Entwicklungskenntnisse | Plugin mit wenigen verständlichen Einrichtungsschritten nutzen | Technische Integrationen und lokale KI-Werkzeuge sind schwer einzurichten | Gering bis mittel |
| Open-Source-Power-User | Möchten Anbieter, Prompts und Betriebsart selbst konfigurieren | Erweiterbarer Funktionsumfang und optionale direkte LLM-Anbindung | Bestehende Lösungen erzwingen häufig einzelne Anbieter oder API-Keys | Mittel bis hoch |

**Priorität bei Konflikten:** Produktweiter Funktionsumfang vor einfacher Bedienung vor
zusätzlicher Sicherheitsoptimierung. Ein definierter Sicherheits- und Datenschutzboden ist
nicht unterschreitbar und darf durch diese Priorisierung nicht vernachlässigt werden.

---

## 4. Geschäftsziele & Erfolgskriterien

Das Projekt ist privat und verwendet keine OKRs. Erfolg wird durch prüfbare
Launch-Abnahmekriterien bestimmt.

| Ziel | Messgröße (KPI) | Ist-Wert heute | Zielwert | Zeithorizont |
|---|---|---|---|---|
| Bestehende Vaults sicher nutzbar machen | Datenverlust oder erzwungene Migration im Test-Vault | Keine Lösung vorhanden | 0 verlorene Originaldateien; 0 erzwungene Migrationen | MVP-Launch |
| Kontrolliertes KI-Schreiben ermöglichen | Unbestätigte Mutationen im Human-in-the-Loop-Modus | Keine Lösung vorhanden | 0 unbestätigte Schreib- oder Löschoperationen | Jeder Release |
| Automatische Änderungen beherrschbar machen | Protokollierte und erfolgreich rücksetzbare automatische Mutationen | Keine Lösung vorhanden | 100 % protokolliert und versioniert; Rollback für jede Mutation prüfbar | MVP-Launch |
| Prompt-Injection-Schäden verhindern | Unerlaubte Aktionen oder Offenlegungen im dokumentierten Sicherheitstestset | Keine Lösung vorhanden | 0 unerlaubte Aktionen; 0 Offenlegungen außerhalb des freigegebenen Vault-Kontexts | Jeder Release |
| Versionskontinuität gewährleisten | Lesbarkeit oder verlustfreie Migration früherer Daten-/Konfigurationsstände | Nicht vorhanden | 100 % der unterstützten früheren Format-Fixtures lesbar oder verlustfrei migrierbar | Ab erstem Post-MVP-Release |

**MVP-Definition:**

Backend-first wird zunächst ein bestehender Vault lokal indexiert und über MCP ohne
zusätzlichen LLM-API-Key zugänglich gemacht. Das MVP umfasst:

1. Bestehende Vaults ohne Migration erkennen; lokal und inkrementell indexieren.
2. MCP-Einrichtung für Claude, ChatGPT und Mistral.
3. Notizen, Metadaten und Beziehungen lesen, durchsuchen und mit Quellen abrufen.
4. Notizen und Beziehungen kontrolliert erstellen und ändern.
5. Human-in-, Human-on- und Human-out-of-the-Loop mit klaren Warn- und Schutzmechanismen.
6. Unstrukturierte Notizen mit anpassbaren Prompts zu verknüpftem Wissen aufbereiten.
7. Prompt-Injection-Abwehr und transparente Datenschutz-/Datenflusshinweise.
8. Minimale englische Obsidian-Oberfläche für Installation, Konfiguration, Moduswahl und
   Änderungsprüfung.

**"Guter Launch" vs. "Perfekter Launch":**

- Gut: Alle MVP-Abläufe und Launch-Abnahmekriterien funktionieren unter Windows.
- Perfekt: Der gute Launch ist vollständig enthalten; zusätzlich ist die weitere
  Ausarbeitung rückwärtskompatibel zu allen Daten- und Konfigurationsständen ab dem MVP.
  Funktionen dürfen hinzukommen, bestehende Nutzerdaten bleiben verwendbar.

---

## 5. Scope

### In Scope (explizit enthalten)

- Manuell installierbares, englischsprachiges Obsidian-Plugin.
- Lokaler Hintergrundprozess für MCP, Indexierung und RAG unter Windows.
- MCP-Lese- und Schreibwerkzeuge für Notizen, Ordner, Links, Properties und Suchergebnisse.
- Nutzung mit Claude, ChatGPT und Mistral ohne zusätzlichen LLM-API-Key im Plugin.
- Optionaler direkter LLM-Zugriff mit eigenem API-Key.
- Volltext- und semantische RAG-Suche über bestehende Vaults.
- Knowledge Graph aus Wikilinks, Backlinks, Tags, Properties und erkannten Beziehungen.
- Inkrementelle Wissenskompilierung von unstrukturierten Notizen in strukturierte Wiki-Seiten.
- Drei Autonomiestufen: Human-in-, Human-on- und Human-out-of-the-Loop.
- Änderungsprüfung, detaillierte Versionierung, Rollback und verständliche Release Notes.
- Prompt-Injection-Schutz, Datenflussanzeige und lokaler dauerhafter Datenspeicher.
- Erweiterbarkeit für Anhänge, Visualisierung, Mobile, Mehrbenutzerbetrieb und spätere
  `campaignworld`-Integration.

### Out of Scope (explizit ausgeschlossen)

- Entwicklung oder Betrieb eines eigenen Foundation Models.
- Entwicklung einer eigenständigen Notiz-App als Ersatz für Obsidian.
- Umgehung von Anmeldung, Abonnement oder Nutzungsbedingungen der verwendeten KI-Anbieter;
  "ohne API-Key" gilt für Plugin und MCP, nicht als Umgehung der Client-Authentifizierung.
- Beliebige Shell-, Prozess- oder Codeausführung über MCP; Autonomiestufen gelten nur für
  definierte und berechtigte Vault-/Plugin-Funktionen.

### Betroffene bestehende Systeme / Integrationen

| System | Art der Berührung | Kritikalität |
|---|---|---|
| Bestehende Obsidian-Vaults | Lesen und kontrolliertes Schreiben ohne erzwungene Migration | Hoch |
| Obsidian Desktop unter Windows | Plugin-Host und Benutzeroberfläche | Hoch |
| Claude, ChatGPT und Mistral | MCP-Clients; übertragen ausgewählte Inhalte zur KI-Verarbeitung | Hoch |
| Obsidian Mobile auf Android | Spätere mobile Nutzung | Mittel |
| `campaignworld` | Spätere Kombination über eigenständige MCP-Schnittstelle | Mittel |
| Externe LLM-APIs | Optionaler direkter Zugriff mit eigenem API-Key | Gering |

---

## 6. Priorisierung (MoSCoW)

Die Priorisierung bezieht sich auf das Gesamtprodukt, nicht ausschließlich auf das MVP.

| Priorität | Feature / Ziel | Begründung |
|---|---|---|
| Must Have | Manuelle Plugin-Installation | Notwendiger Einstieg außerhalb des Community-Katalogs |
| Must Have | MCP-Lesezugriff | Kernnutzen für KI-Assistenten |
| Must Have | MCP-Schreibzugriff | Knowledge Graph muss durch KI pflegbar sein |
| Must Have | Kontrollierte Mutationen und drei Autonomiestufen | Verbindet Funktionsumfang mit beherrschbarem Risiko |
| Must Have | Einfache Einrichtung für Claude, ChatGPT und Mistral | Primäre Client-Zielgruppe |
| Must Have | Betrieb ohne zusätzlichen LLM-API-Key | Zentrales Differenzierungsmerkmal |
| Must Have | Volltext- und semantische RAG-Suche | Kern der Wissensnutzung |
| Must Have | Knowledge Graph | Zentrale Produktvision |
| Must Have | Wissenskompilierung | Überführt unstrukturierte Notizen in wiederverwendbares Wissen |
| Must Have | Inkrementelle Indexierung | Verhindert unnötige Vollverarbeitung |
| Must Have | Prompt-Injection-Schutz | Nicht unterschreitbarer Sicherheitsboden |
| Must Have | Datenschutz- und Datenflusshinweise | Bewusste Entscheidung vor externer KI-Verarbeitung |
| Must Have | Soweit möglich lokale Verarbeitung und Indizes | Vermeidet eigene externe Datenspeicherung und laufende Kosten |
| Must Have | Anpassbare Prompts und Vorlagen | Funktionsreiche, projektübergreifende Nutzung |
| Should Have | Bestehende Vaults automatisch erkennen | Senkt Einrichtungsaufwand und vermeidet Migration |
| Should Have | Detailliertes Änderungsprotokoll plus Release-Notes-Sicht | Rollback und menschliche Übersicht |
| Should Have | Antworten mit Quellenzitaten | Nachvollziehbarkeit von RAG-Antworten |
| Should Have | Visueller Graph, Wiki-Browser und globale Suche | Direkte Wissensexploration in Obsidian |
| Should Have | PDF-, Bild- und Anhangssuche | Erweitert den nutzbaren Wissensbestand |
| Should Have | Export, Backup und Wiederherstellung | Resilienz und Portabilität |
| Should Have | Spätere `campaignworld`-Integration | Projektübergreifender Knowledge Graph |
| Should Have | Obsidian Mobile auf Android | Mobile Nutzung nach Desktop-Basis |
| Could Have | Veröffentlichung als Community Plugin | Komfortable Distribution nach manueller Installation |
| Could Have | Direkte LLM-Anbindung mit API-Key | Alternative zur MCP-first-Nutzung |
| Could Have | Chat direkt in Obsidian | Zusätzliche Interaktionsoberfläche |
| Could Have | Link-, Lücken- und Qualitätsanalyse | Fortgeschrittene Wissenspflege |
| Could Have | Mehrbenutzerbetrieb | Nutzung über den privaten Einzelbetrieb hinaus |
| Could Have | Cloud-Synchronisation oder eigener Server | Optionaler verteilter Betrieb |
| Could Have | Externe Telemetrie | Nur transparent und opt-in |
| Could Have | Weitere UI-Sprachen | Englisch ist die verbindliche Ausgangssprache |
| Could Have | macOS und Linux | Plattformausbau nach Windows |
| Won't Have | Eigenes Foundation Model | Unnötiger Betriebs- und Kostenumfang |
| Won't Have | Eigenständiger Obsidian-Ersatz | Produkt bleibt ein Obsidian-Plugin |
| Won't Have | Umgehung von Anbieter-Authentifizierung | Rechtlich und betrieblich ausgeschlossen |
| Won't Have | Beliebige Systemausführung via MCP | Nicht für den Vault-Kernnutzen erforderlich und unverhältnismäßiges Risiko |

---

## 7. Constraints

**Technische Constraints:**

- Windows ist die Must-Have-Startplattform.
- Obsidian Mobile auf Android ist Should; macOS und Linux sind Could.
- Das Produkt muss als Obsidian-Plugin manuell installierbar sein.
- Ein lokaler Hintergrundprozess für MCP, Indexierung und RAG ist zulässig.
- Bestehende Vaults müssen ohne erzwungene Migration nutzbar bleiben.
- Persistente Vault-Inhalte und Indizes verbleiben lokal; zur KI-Verarbeitung erforderliche
  Ausschnitte dürfen an den bewusst gewählten Anbieter übertragen werden.
- Es wird in dieser Phase kein Tech-Stack festgelegt.

**Zeitliche Constraints:**

- Kein Zieltermin.
- Backend-Fähigkeiten werden vor der vollständigen Frontend-Ausarbeitung aufgebaut.

**Budget-Constraints:**

- Laufende Kosten sind außer bereits vorhandenen KI-Abonnements zu vermeiden.
- Direkte, kostenpflichtige LLM-APIs bleiben optional.

**Regulatorische / Compliance-Anforderungen:**

- Open Source unter MIT-Lizenz.
- Transparenter Hinweis vor jeder Aktivierung eines externen Datenflusses.
- Anbieterabhängige Verarbeitung und mögliche Aufbewahrung müssen verständlich ausgewiesen
  werden; das Projekt betreibt keinen eigenen externen Vault-Speicher.
- Urheber- und Lizenzhinweise aus übernommenen MIT-lizenzierten Teilen bleiben erhalten.

**Abhängigkeiten:**

- Obsidian Plugin API und Desktop-/Mobile-Fähigkeiten.
- MCP-Unterstützung und Konfigurationsmöglichkeiten von Claude, ChatGPT und Mistral.
- Bedingungen und Datenverarbeitung der vom Nutzer gewählten KI-Anbieter.
- Spätere, separat entwickelte MCP-Schnittstelle von `campaignworld`.

---

## 8. Top-Risiken

| # | Risiko | Wahrscheinlichkeit | Impact | Mitigationsstrategie |
|---|---|---|---|---|
| 1 | Eingeschleuste Vault-Inhalte manipulieren KI oder MCP-Werkzeuge | Hoch | Hoch | Daten/Anweisungen strikt trennen, Berechtigungen begrenzen, Injection-Testset, sichere Standardmodi und Warnungen |
| 2 | Schreib- oder Löschzugriffe verursachen Datenverlust | Mittel | Hoch | Human-in-the-Loop als Standard, versioniertes Protokoll, Backup, Vorschau und prüfbarer Rollback |
| 3 | Änderungen an Obsidian oder MCP-Clients brechen Integrationen | Mittel | Hoch | Adaptergrenzen, Kompatibilitätstests, versionierte Verträge und rückwärtskompatible Migrationen |

---

## 9. Offene Fragen

| # | Frage | Kontext | Verantwortlich | Fällig bis | Status |
|---|---|---|---|---|---|
| 1 | Welche konkreten Client-Versionen und MCP-Transportarten werden zuerst unterstützt? | Muss vor Architekturvertrag geklärt werden | Architect mit Stakeholder | Architekturphase | OFFEN |
| 2 | Welcher Name soll als Copyright Holder in der MIT-Lizenz stehen? | Für die spätere LICENSE-Datei erforderlich | Stakeholder | Vor Veröffentlichung | OFFEN |
| 3 | Welche Anbieterhinweise zu Verarbeitung/Aufbewahrung werden pro Client angezeigt? | Anbieterbedingungen können sich ändern | BA/PM | Vor MVP-Launch | OFFEN |

Keine dieser Fragen blockiert den Start der Requirements-Analyse.

---

## 10. Übergabe an BA-Agent

**Priorisierte Features für Requirements-Analyse (Must Haves zuerst):**

1. Sicherer MCP-Lese-/Schreibzugriff ohne zusätzlichen LLM-API-Key.
2. Lokale, inkrementelle RAG-Suche und Knowledge Graph über bestehende Vaults.
3. Drei Autonomiestufen mit Human-in-the-Loop als Standard, Warnungen und Rollback.
4. Wissenskompilierung mit anpassbaren Prompts.
5. Prompt-Injection-Abwehr und transparente Datenflüsse.

**Kritische offene Fragen, die vor Requirements geklärt sein müssen:**

- [x] Keine BLOCKER-Frage offen.

**Stakeholder für Rückfragen des BA:**

| Themenbereich | Ansprechpartner | Kontakt |
|---|---|---|
| Produkt, Priorisierung, Datenschutz | Projektinitiator | Aktueller Nutzer |

**Besondere Hinweise für den BA:**

- MoSCoW gilt für das Gesamtprodukt; MVP-Scope ist in Abschnitt 4 enger definiert.
- "Ohne API-Key" bedeutet keine zusätzliche Schlüsselpflicht im Plugin; Client-Anmeldung
  oder KI-Abonnement werden nicht umgangen.
- Funktionsumfang hat hohe Priorität, aber Constitution-Mindeststandards sind bindend.
- Human-on/out-of-the-Loop dürfen ausschließlich definierte Vault-/Plugin-Funktionen nutzen.

---

## Übergabe: PM → BA

**Datum:** 2026-07-30  
**Von:** Product Manager (PM)  
**An:** Business Analyst (BA)  
**Nächster Befehl:** `/ba second-brain`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| SB-000001 | APPROVED | `projects/second-brain/discovery/SB-000001-second-brain.md` | Vision, Gesamtprodukt-MoSCoW, MVP und Risiken |
| CON-000001 | APPROVED | `projects/second-brain/discovery/CON-000001-second-brain.md` | Bindende Sicherheits-, Datenschutz- und Kompatibilitätsleitplanken |

### Kritische Informationen für Empfänger

- Human-in-the-Loop ist der sichere Standard; höhere Autonomie erfordert Warnung und
  bewusste Aktivierung.
- Vault-Inhalte dürfen den gewählten KI-Anbieter zur Verarbeitung erreichen, werden aber
  nicht durch eine eigene Projektinfrastruktur extern persistiert.
- Windows ist Must; Android Should; macOS/Linux Could.

### Offene Fragen (vererbt)

| # | Frage | Ursprung | Kritikalität | An wen |
|---|---|---|---|---|
| 1 | Konkrete Client-Versionen und MCP-Transportarten | Interview Runde 5 | MAJOR | Architect / Stakeholder |
| 2 | Copyright Holder für LICENSE | Lizenzentscheidung | MINOR | Stakeholder |
| 3 | Anbieterbezogene Datenverarbeitungshinweise | Datenschutzklärung | MAJOR | BA / PM |

### Nicht-Ziele (explizit ausgeschlossen)

- Technische Machbarkeit und Tech-Stack wurden nicht bewertet.
- Detaillierte Akzeptanzkriterien werden vom BA erarbeitet.
- Es werden weder ein eigenes Foundation Model noch ein Obsidian-Ersatz entwickelt.

### Empfehlungen

- Requirements zuerst um MCP-Sicherheitsgrenzen, Mutationsmodell, RAG/Graph und
  Datenfluss-Transparenz strukturieren.
- UI-Anforderungen erst nach den Backend-Verträgen präzisieren, ohne Nutzerfreundlichkeit
  für normale Obsidian-Nutzer zu verlieren.

---

*Erstellt von: PM-Agent | Datum: 2026-07-30 | Version: 1.0*
*Ablage: projects/second-brain/discovery/SB-000001-second-brain.md*
