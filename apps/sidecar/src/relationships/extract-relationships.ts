// Beschreibung: Deterministische Extraktion expliziter Wiki-Link-, Tag- und Property-Kanten.
// Artefakte:    US-000013; ADR-000003; ADR-000004
// Agent:        BE — 2026-07-31
import { dirname, extname, posix } from 'node:path';

export type ExtractedRelationship = {
  type: 'wiki-link' | 'tag' | 'property';
  targetKind: 'note' | 'tag' | 'property';
  targetId: string;
  label: string;
  line: number | null;
  property: string | null;
};

// Implementiert: US-000013 — Explizite lokale Beziehungen
/**
 * Extrahiert ausschließlich im Quelltext explizit vorhandene Beziehungen.
 * @param relativePath Relativer Pfad der Quellnotiz.
 * @param content UTF-8-Inhalt der Notiz.
 * @returns Stabil sortierte und deduplizierte Kanten.
 * @throws Wirft nicht.
 */
export function extractRelationships(
  relativePath: string,
  content: string
): ExtractedRelationship[] {
  const results: ExtractedRelationship[] = [];
  const lines = content.split(/\r?\n/u);
  const frontmatterEnd = lines[0]?.trim() === '---'
    ? lines.findIndex((line, index) => index > 0 && line.trim() === '---')
    : -1;

  lines.forEach((line, index) => {
    for (const match of line.matchAll(/!?\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/gu)) {
      const rawTarget = match[1]?.trim();
      if (!rawTarget) continue;
      const targetId = resolveWikiTarget(relativePath, rawTarget);
      results.push({
        type: 'wiki-link',
        targetKind: 'note',
        targetId,
        label: match[2]?.trim() || rawTarget,
        line: index + 1,
        property: null
      });
    }
    if (index > 0 && index < frontmatterEnd) {
      const propertyMatch = /^([A-Za-z0-9_-]+):\s*(.+?)\s*$/u.exec(line);
      if (propertyMatch?.[1] && propertyMatch[2]) {
        const key = propertyMatch[1];
        const value = propertyMatch[2].replace(/^["']|["']$/gu, '').trim();
        if (value && !value.includes('[[')) {
          results.push({
            type: 'property',
            targetKind: 'property',
            targetId: `property:${key}=${value}`,
            label: `${key}: ${value}`,
            line: index + 1,
            property: key
          });
        }
      }
    }
    if (index <= frontmatterEnd || /^\s*#{1,6}\s/u.test(line)) return;
    for (const match of line.matchAll(/(?:^|[^\p{L}\p{N}_/])#([\p{L}\p{N}_/-]+)/gu)) {
      const tag = match[1]?.toLocaleLowerCase();
      if (!tag) continue;
      results.push({
        type: 'tag',
        targetKind: 'tag',
        targetId: `tag:${tag}`,
        label: `#${tag}`,
        line: index + 1,
        property: null
      });
    }
  });

  return [...new Map(results.map((item) => [
    `${item.type}\0${item.targetId}\0${item.line}\0${item.property ?? ''}`,
    item
  ])).values()].sort((left, right) =>
    (left.line ?? 0) - (right.line ?? 0) || left.targetId.localeCompare(right.targetId)
  );
}

function resolveWikiTarget(sourcePath: string, rawTarget: string): string {
  const normalized = rawTarget.replaceAll('\\', '/');
  const withExtension = extname(normalized) ? normalized : `${normalized}.md`;
  return normalized.includes('/') && !normalized.startsWith('.')
    ? posix.normalize(withExtension)
    : posix.normalize(posix.join(dirname(sourcePath).replaceAll('\\', '/'), withExtension));
}
