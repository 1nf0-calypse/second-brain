---
id: DOC-000008
title: MCP-Vorschläge in Obsidian prüfen
version: 1.0
status: APPROVED
author-agent: MW (Manual Writer)
date: 2026-08-19
project: second-brain
based-on: US-000017@1.0, US-000016@1.0, US-000008@1.1, UX-000004@1.0, RV-000010@1.0
supersedes: —
superseded-by: —
---

# MCP-Vorschläge in Obsidian prüfen

## Was dieses Feature tut

Second Brain sammelt Vorschläge deines verbundenen KI-Clients in Obsidian. Erst nach deiner
Prüfung und Bestätigung wird genau die angezeigte Notiz geschrieben.

## Voraussetzungen

Obsidian und dein verbundener KI-Client verwenden denselben Vault. Bitte den KI-Client,
einen **Kompilierungs-Vorschlag** einzureichen; eine reine Notizvorschau erscheint nicht in
der Liste ausstehender Prüfungen.

## Vorschlag prüfen und bestätigen

1. Öffne die Befehlspalette und wähle **Second Brain MCP: Open Changes and review pending compilations**. → Die Ansicht **Changes** öffnet sich.
2. Wähle **Pending reviews** und öffne einen Vorschlag. → Zielnotiz, Quellen und Änderungen werden getrennt angezeigt.
3. Prüfe Quelle, Ziel und Änderung. → Bei einer Warnung lies den hervorgehobenen Hinweis vollständig.
4. Aktiviere bei einer Warnung **I reviewed the warnings above.** → **Confirm and write note** wird aktiv.
5. Wähle **Confirm and write note**. → Genau diese Zielnotiz wird geschrieben; danach erscheint der Erfolg mit verfügbarer Rücknahme.

[SCREENSHOT: Changes mit einem ausstehenden Vorschlag, Quellen, Diff, Warnung und Checkbox]

## Warnungen und Vorlagen

- Eine Warnung bedeutet, dass eine Quelle wie eine Anweisung aussieht oder Quellen sich
  widersprechen könnten. Sie verändert keine Rechte, verlangt aber die ausdrückliche Checkbox.
- Unter **Templates** kannst du eine Vorlage prüfen und speichern. Neue Fassungen erhalten
  eine eigene Version; frühere Versionen bleiben lesbar.

## Verwerfen und Verlauf

1. Öffne einen ausstehenden Vorschlag und wähle **Reject proposal**. → Der Dialog erklärt, dass der Vault unverändert bleibt.
2. Wähle **Reject without changing the vault**. → Es wird keine Notiz geschrieben.
3. Öffne **History**. → Erfolgreiche, verworfene und unvollständige Vorgänge sind getrennt erkennbar.

## Fehlerbehebung

**Pending reviews bleibt leer.**

Stelle sicher, dass der KI-Client einen Kompilierungs-Vorschlag einreicht, nicht nur eine
Notizvorschau erzeugt. Starte danach Obsidian und den KI-Client vollständig neu, wenn die
beiden Anwendungen gerade aktualisiert wurden.

---

*Erstellt von: MW-Agent | Datum: 2026-08-19 | Version: 1.0*
