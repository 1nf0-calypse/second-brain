---
id: SRP-000001
title: Spike: Windows-Vektorsuche und Anhangsextraktion
version: 1.0
status: APPROVED
author-agent: AR (Software Architect)
date: 2026-08-19
project: second-brain
based-on: ADR-000001@1.0, US-000002@1.0, US-000004@1.0, RM-000001@1.4
timebox: 2h
actual-time: 1h
---

# Spike: Windows-Vektorsuche und Anhangsextraktion

## Ergebnis und Empfehlung

**Semantische Suche wird nicht in Sprint 8 implementiert.** SQLite unterstützt geprüfte
Erweiterungs-DLLs, doch `sqlite-vec` ist pre-v1 und hat aktuell dokumentierte
Node-/Windows-Paketprobleme sowie einen Konflikt mit `onnxruntime-node`.
[SQLite](https://www.sqlite.org/c3ref/enable_load_extension.html),
[sqlite-vec](https://github.com/asg017/sqlite-vec/issues/272),
[Konflikt](https://github.com/asg017/sqlite-vec/issues/270)

Apache Tika unterstützt viele Dokumentformate, würde jedoch eine Java-Runtime und eine
hart begrenzte Extraktions-Subprozessgrenze erfordern.
[Tika](https://tika.apache.org/3.0.0/formats.html)

Sprint 8 sollte deshalb Graphansicht und sichere Anhang-Metadaten liefern. Für Semantik ist
zuerst ein eigener ADR für paketierte lokale Embeddings, signierte Modell-/DLL-Artefakte,
Hashprüfung, Speicherlimits und einen Windows-Installtest nötig.

## Verworfene Optionen

- `sqlite-vec` direkt im Sidecar mit ONNX: aktuelles Windows-/Prozessrisiko.
- Tika als Pflichtbestandteil: zusätzliche Java-Betriebs- und Angriffsfläche.
- Cloud-Embeddings: neuer Consent-Scope und keine lokale Standardverarbeitung.

## Nächster Schritt

Roadmap und Sprint-8-Scope durch BA ohne semantische Suche präzisieren.

---
▶ **Nächste Phase:** `/ba second-brain`
