---
id: DOC-000001
title: Claude Desktop lokal verbinden
version: 1.0
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-07-31
project: second-brain
based-on: US-000011, UX-000001, UX-000002, RV-000002
supersedes: —
superseded-by: —
---

# Claude Desktop lokal verbinden

## Was dieses Feature tut

Du verbindest einen bestehenden Obsidian-Vault lokal mit Claude Desktop. Second Brain
verlangt dafür keinen zusätzlichen KI-Anbieter-Schlüssel und verändert beim Einrichten keine
Notizen.

## Voraussetzungen

- Windows mit Obsidian 1.8.0 oder neuer
- Node.js 24 LTS
- Claude Desktop, dort bereits regulär angemeldet
- das entpackte Second-Brain-MCP-Plugin-Paket

## Plugin installieren

1. Beende Obsidian.
2. Öffne im gewünschten Vault den Ordner `.obsidian/plugins/`.
3. Lege darin den Ordner `second-brain-mcp` an.
4. Kopiere `manifest.json`, `main.js` und `styles.css` aus dem gelieferten
   `dist/obsidian-plugin/`-Ordner hinein.
5. Starte Obsidian neu. Wenn das Plugin schon aktiv war, deaktiviere und aktiviere es nach
   jedem Paket-Update erneut. Erst danach ist sicher, dass Obsidian die neue Version geladen
   hat.
6. Aktiviere unter **Settings → Community plugins** das Plugin **Second Brain MCP**.

[SCREENSHOT: Community-Plugins-Liste mit aktiviertem „Second Brain MCP“]

## Verbindung Schritt für Schritt

1. Öffne die Befehlspalette und wähle **Second Brain MCP: Open setup**.
   → Das Pane **Set up Second Brain** erscheint.
2. Trage bei **Obsidian vault folder** den vollständigen Pfad des bestehenden Vaults ein.
   → Die vier Aktionen werden verfügbar und eine lokale Konfiguration erscheint.
3. Wähle **Test local service**.
   → Bei Erfolg siehst du, dass der lokale Dienst bereit ist. Der Test liest nur
   Einrichtungsdaten; er verändert keine Vault-Datei.
4. Wähle **Copy configuration**.
   → Obsidian bestätigt: `Configuration copied. Claude Desktop is not connected yet.`
5. Öffne in Claude Desktop **Settings → Developer → Edit Config**.
6. Füge den kopierten `mcpServers`-Eintrag in das bestehende oberste JSON-Objekt ein. Erzeuge
   kein zweites JSON-Objekt und überschreibe vorhandene Server nicht.
7. Speichere die Datei und starte Claude Desktop vollständig neu.
   → Der Server `second-brain` sollte in Claude Desktop verfügbar sein.

[SCREENSHOT: Setup-Pane nach erfolgreichem lokalen Diensttest]

[SCREENSHOT: Claude-Desktop-Konfiguration mit „second-brain“ innerhalb von „mcpServers“]

## Sicherheit und Datenschutz

- Vault und Index bleiben dauerhaft auf diesem Gerät.
- Setup und Indexierung behandeln Originalnotizen nur lesend.
- Zugriffe außerhalb des freigegebenen Vault-Ordners werden blockiert.
- ChatGPT und Mistral sind in Sprint 1 noch nicht enthalten.

## Fehlerbehebung

**Problem: Obsidian zeigt nach einem Update noch die alte Oberfläche.**
Deaktiviere **Second Brain MCP**, aktiviere es erneut und öffne das Setup neu. Falls nötig,
starte Obsidian vollständig neu.

**Problem: `This folder is not a readable Obsidian vault.`**
Prüfe den vollständigen Pfad und stelle sicher, dass darin ein lesbarer `.obsidian`-Ordner
liegt. Wähle anschließend erneut **Test local service**. Es wurden keine Dateien geändert.

**Problem: Der lokale Dienst ist nicht verfügbar.**
Prüfe mit `node --version`, ob Node.js 24 oder neuer installiert ist. Installiere das
vollständige Plugin-Paket erneut und starte Obsidian neu.

**Problem: Claude Desktop zeigt den Server nicht.**
Prüfe, ob `mcpServers` nur einmal im obersten JSON-Objekt vorkommt, die Datei gültiges JSON
enthält und Claude Desktop nach dem Speichern vollständig neu gestartet wurde.

**Problem: Ein Zugriff verlässt den freigegebenen Vault.**
Second Brain blockiert absolute Fremdpfade, `..`-Pfade und Verknüpfungen nach außerhalb.
Wähle einen Pfad, der tatsächlich innerhalb des freigegebenen Vaults liegt.

---

## Übergabe: MW → ORCH

**Datum:** 2026-07-31
**Von:** Manual Writer (MW)
**An:** Orchestrator (ORCH)
**Nächster Befehl:** `/retro second-brain 1` (optional) oder `/refine second-brain 2`

### Übergebene Artefakte

| Artefakt-ID | Status | Pfad | Hinweise |
|---|---|---|---|
| DOC-000001 | APPROVED | `docs/DOC-000001-claude-desktop-setup.md` | Setup-Happy-Path und Recovery |

### Kritische Informationen für Empfänger

Der Plugin-Neustart nach Paket-Updates ist als verbindlicher Nutzerschritt dokumentiert.

### Offene Fragen (vererbt)

Keine.

### Nicht-Ziele (explizit ausgeschlossen)

Keine Anleitung für ChatGPT, Mistral oder direkte KI-Anbieter-Schlüssel.

### Empfehlungen

Die markierten Screenshots vor einer öffentlichen Veröffentlichung ergänzen.

---

*Erstellt von: MW-Agent | Datum: 2026-07-31 | Version: 1.0*

## Änderungshistorie

| Version | Datum | Änderung | Agent |
|---|---|---|---|
| 1.0 | 2026-07-31 | Initiale, Gate-9-geprüfte Version | MW |
