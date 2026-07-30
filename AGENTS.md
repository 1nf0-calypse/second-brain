# Projektanweisungen für Codex

Dieses Projekt wird von der Claude-first AI Development Tool Chain verwaltet.
`CLAUDE.md` im Toolchain-Root ist die kanonische fachliche und funktionale Quelle.

## Toolchain finden

Lies `.toolchain.yml` und verwende `toolchain-path`, um den Toolchain-Root zu bestimmen.
In der Standardstruktur ist dies `../../`.

## Commands in Codex

Codex unterstützt keine repository-definierten, nackten Slash-Commands. Verwende den
projektlokalen Skill und hänge den kanonischen Command an:

```text
$coding-toolchain /ba
$coding-toolchain /architect
$coding-toolchain /test-plan
```

Das gilt für alle Commands aus `CLAUDE.md`. Der Skill wird aus
`.agents/skills/coding-toolchain/` geladen und ermittelt Projektname sowie Toolchain-Pfad
selbst. Natürliche Formulierungen wie „Führe /ba aus“ sollen denselben Skill implizit
aktivieren.

Vor einem Toolchain-Command vollständig lesen:

1. `<toolchain-path>/CLAUDE.md`
2. `<toolchain-path>/.claude/commands/<command>.md`
3. `<toolchain-path>/toolchain/agents/_base-agent.md`
4. die im Command referenzierte Rollen-Datei
5. benötigte Workflows, Protokolle und Templates

Wenn der konfigurierte Toolchain-Pfad nicht existiert, stoppe vor Artefaktänderungen und
bitte um den korrekten Pfad. Erfinde keine Ersatzregeln.

## Projektregeln

- Ermittle den Zustand aus `.phase`, `INDEX.md` und vorhandenen Artefakten.
- Lege Artefakte nur im dafür vorgesehenen Unterordner an.
- Nutze die Templates und sechsstellige IDs der Toolchain.
- Aktualisiere nach jeder Artefakterstellung die zugehörige `INDEX.md`.
- Aktualisiere `.phase` nur nach bestandenem Gate.
- Lösche keine Artefakte ohne direkten Nutzerauftrag.
- Triff keine Technologieannahme ohne freigegebenes `ADR-000001-tech-stack.md`.
- Beende jede Rollenphase mit Definition-of-Done-Prüfung, Handoff und dem konkreten
  nächsten Command einschließlich Projektname.

Codex-spezifische Regeln dürfen Claude-Code-Dateien nicht überschreiben.
