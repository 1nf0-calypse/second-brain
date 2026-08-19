# Obsidian Plugin — Index

Letzte Aktualisierung: 2026-08-18

| Pfad | Zweck |
|---|---|
| `src/main.ts` | Plugin- und View-Registrierung |
| `src/ipc/setup-client.ts` | Laufzeitvalidierter Setup-Vertrag |
| `src/ipc/search-client.ts` | Laufzeitvalidierte Search-/Read-Verträge |
| `src/ipc/relationship-client.ts` | Laufzeitvalidierter read-only Relationship-Vertrag |
| `src/ipc/mutation-client.ts` | Laufzeitvalidierte Preview-, Confirm- und Rollback-Verträge |
| `src/ipc/compilation-client.ts` | Contract-3-Client für Summary, List, Detail, Decision und History |
| `src/ipc/template-client.ts` | Laufzeitvalidierter Client für immutable Template-Versionen |
| `src/ipc/node-setup-transport.ts` | Abbrechbarer lokaler Transport mit Timeouts und JSON-stdin für große Payloads |
| `src/ui/setup-view.ts` | Zugängliche Setup-View und Zustände |
| `src/ui/search-view.ts` | Zugängliche Search-View, Quellen und Degradationszustand |
| `src/ui/relationship-view.ts` | Zugängliche Liste für Links, Backlinks, Tags und Properties |
| `src/ui/mutation-view.ts` | Changes-Navigation, Polling-Lifecycle und plugin-only Compilation-Entscheidungen |
| `src/ui/pending-review-list.ts` | Metadatenarme Pending-Review-Inbox ohne UI-Doppelerfassung |
| `src/ui/pending-review-poller.ts` | Single-flight Summary-Polling mit 2-s-/15-s-Intervallen und Unload-Schutz |
| `src/ui/compilation-review.ts` | Read-only Ziel-, Quellen-, Template-, Diff-, Link-, Property- und Warnungsprüfung mit verbindlicher Warn-Microcopy |
| `src/ui/compilation-error.ts` | Recovery-Microcopy für Drift, Ablauf, Replay und Kapazität |
| `src/ui/template-library.ts` | Template-Library, Versionsnavigation, Editor und read-only Save-Review |
| `src/ui/operation-history.ts` | Filterbare History mit getrenntem Operation-/Rollbackstatus |
| `src/ui/presentation.ts` | Laufzeitunabhängige Microcopy-Formatierung |
| `manifest.json` | Build-Quelle der Obsidian-Plugin-Metadaten; entspricht `/manifest.json` |
| `styles.css` | 320-px-, 200-%-Zoom- und Reduced-Motion-Regeln |
