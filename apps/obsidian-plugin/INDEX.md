# Obsidian Plugin — Index

Letzte Aktualisierung: 2026-07-31

| Pfad | Zweck |
|---|---|
| `src/main.ts` | Plugin- und View-Registrierung |
| `src/ipc/setup-client.ts` | Laufzeitvalidierter Setup-Vertrag |
| `src/ipc/search-client.ts` | Laufzeitvalidierte Search-/Read-Verträge |
| `src/ipc/node-setup-transport.ts` | Abbrechbarer lokaler Transport mit operationsspezifischen Timeouts |
| `src/ui/setup-view.ts` | Zugängliche Setup-View und Zustände |
| `src/ui/search-view.ts` | Zugängliche Search-View, Quellen und Degradationszustand |
| `src/ui/presentation.ts` | Laufzeitunabhängige Microcopy-Formatierung |
| `manifest.json` | Build-Quelle der Obsidian-Plugin-Metadaten; entspricht `/manifest.json` |
| `styles.css` | 320-px-, 200-%-Zoom- und Reduced-Motion-Regeln |
