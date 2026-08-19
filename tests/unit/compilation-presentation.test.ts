// Beschreibung: Prueft read-only Metadaten und sichere Recovery-Microcopy.
// Artefakte:    US-000017; UX-000004
// Agent:        FE — 2026-08-15
import { describe, expect, it } from 'vitest';
import { compilationWarningMessage, extractCompilationMetadata } from '../../apps/obsidian-plugin/src/ui/compilation-review.js';
import { compilationErrorMessage } from '../../apps/obsidian-plugin/src/ui/compilation-error.js';

describe('compilation review presentation', () => {
  it('extracts proposed wiki links and frontmatter properties read-only', () => {
    expect(extractCompilationMetadata('---\nstatus: reviewed\ntags: [sprint]\n---\nSee [[Alpha|source]] and [[Beta#Facts]].')).toEqual({
      links: ['Alpha', 'Beta'], properties: ['status: reviewed', 'tags: [sprint]']
    });
  });

  it('maps drift, expiry, already-decided and capacity errors to recovery text', () => {
    expect(compilationErrorMessage(new Error('COMPILATION_DRIFT: changed'))).toContain('fresh compilation');
    expect(compilationErrorMessage(new Error('CONFIRMATION_EXPIRED: late'))).toContain('submit it again');
    expect(compilationErrorMessage(new Error('CONFIRMATION_ALREADY_DECIDED: done'))).toContain('check History');
    expect(compilationErrorMessage(new Error('PENDING_CAPACITY_REACHED: full'))).toContain('inbox is full');
  });

  it('uses the approved warning microcopy instead of exposing warning codes', () => {
    expect(compilationWarningMessage('untrusted-instruction-like-content')).toBe('This source contains text that looks like instructions. Second Brain will treat it as note content only.');
    expect(compilationWarningMessage('potentially-contradictory-sources')).toBe('These sources may conflict. Review the highlighted passages before deciding.');
    expect(compilationWarningMessage('unknown-warning')).toBe('Review the highlighted sources before deciding.');
  });
});
