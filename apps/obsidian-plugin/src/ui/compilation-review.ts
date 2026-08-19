// Beschreibung: Read-only Detailpruefung und explizite Entscheidung fuer eine Compilation.
// Artefakte:    US-000017; UX-000004; ADR-000007
// Agent:        FE — 2026-08-15
import type { PendingCompilationDetail } from '@second-brain/contracts';

export type CompilationDecision = 'confirm' | 'reject';

const warningCopy: Record<string, string> = {
  'untrusted-instruction-like-content': 'This source contains text that looks like instructions. Second Brain will treat it as note content only.',
  'potentially-contradictory-sources': 'These sources may conflict. Review the highlighted passages before deciding.'
};

/** Returns the approved, human-readable explanation for an untrusted compilation warning. */
export function compilationWarningMessage(warning: string): string {
  return warningCopy[warning] ?? 'Review the highlighted sources before deciding.';
}

function section(root: HTMLElement, title: string): HTMLElement {
  const wrapper = document.createElement('section');
  const heading = document.createElement('h2');
  heading.textContent = title;
  wrapper.append(heading);
  root.append(wrapper);
  return wrapper;
}

function text(parent: HTMLElement, tag: keyof HTMLElementTagNameMap, value: string): HTMLElement {
  const element = document.createElement(tag);
  element.textContent = value;
  parent.append(element);
  return element;
}

function shortHash(hash: string | null): string {
  return hash ? `${hash.slice(0, 12)}…` : 'New note';
}

function recoveryRequest(detail: PendingCompilationDetail): string {
  return `Please submit a new compilation for ${detail.targetPath}. Pending request ${detail.pendingId} can no longer be confirmed because its reviewed inputs changed or expired.`;
}

export function extractCompilationMetadata(content: string): { links: string[]; properties: string[] } {
  const links = Array.from(content.matchAll(/\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/gu), (match) => match[1]?.trim() ?? '')
    .filter((value) => value.length > 0);
  const lines = content.split(/\r?\n/u);
  const properties: string[] = [];
  if (lines[0]?.trim() === '---') {
    for (const line of lines.slice(1)) {
      if (line.trim() === '---') break;
      if (/^[\w-]+\s*:/u.test(line)) properties.push(line.trim());
    }
  }
  return { links: [...new Set(links)], properties };
}

/** Renders provenance, target, sources, template, linear diff, warnings and decisions in that order. */
// Implementiert: US-000017
export function renderCompilationReview(
  root: HTMLElement,
  detail: PendingCompilationDetail,
  onBack: () => void,
  onDecision: (decision: CompilationDecision) => void,
  onCopyRecovery: (value: string) => void
): void {
  root.replaceChildren();
  const back = document.createElement('button');
  back.type = 'button';
  back.textContent = 'Back to pending reviews';
  back.addEventListener('click', onBack);
  root.append(back);
  const title = text(root, 'h1', 'Review knowledge compilation');
  title.tabIndex = -1;
  title.dataset.reviewHeading = 'true';

  const provenance = section(root, 'Request');
  text(provenance, 'p', `Submitted by ${detail.clientName}`);
  text(provenance, 'p', `Created ${new Date(detail.createdAt).toLocaleString()}`);

  const target = section(root, 'Target note');
  text(target, 'strong', detail.targetPath);
  const hashes = text(target, 'p', `${shortHash(detail.beforeHash)} → ${shortHash(detail.afterHash)}`);
  hashes.title = `Before: ${detail.beforeHash ?? 'new note'}\nAfter: ${detail.afterHash}`;

  const sources = section(root, `Sources (${detail.sources.length})`);
  const sourceList = document.createElement('ul');
  for (const source of detail.sources) {
    const item = text(sourceList, 'li', `${source.relativePath} · ${shortHash(source.hash)}`);
    item.title = source.hash;
  }
  sources.append(sourceList);

  const template = section(root, 'Template');
  text(template, 'p', detail.template
    ? `${detail.template.id} · version ${detail.template.version} · ${shortHash(detail.template.hash)}`
    : 'No template was used.');

  const changes = section(root, 'Proposed changes');
  const diff = document.createElement('pre');
  diff.className = 'second-brain-mutation-diff';
  diff.setAttribute('aria-label', 'Linear change preview');
  diff.textContent = detail.diff;
  changes.append(diff);
  const metadata = extractCompilationMetadata(detail.content);
  text(changes, 'h3', `Links (${metadata.links.length})`);
  text(changes, 'p', metadata.links.length > 0 ? metadata.links.join(', ') : 'No wiki links in the proposed note.');
  text(changes, 'h3', `Properties (${metadata.properties.length})`);
  const propertyPreview = document.createElement('pre');
  propertyPreview.textContent = metadata.properties.length > 0 ? metadata.properties.join('\n') : 'No frontmatter properties in the proposed note.';
  changes.append(propertyPreview);

  const warnings = section(root, `Warnings (${detail.warnings.length})`);
  let warningReview: HTMLInputElement | null = null;
  if (detail.warnings.length === 0) {
    text(warnings, 'p', 'No warnings were detected.');
  } else {
    const list = document.createElement('ul');
    for (const warning of detail.warnings) text(list, 'li', compilationWarningMessage(warning));
    warnings.append(list);
    const label = document.createElement('label');
    warningReview = document.createElement('input');
    warningReview.type = 'checkbox';
    label.append(warningReview, document.createTextNode(' I reviewed the warnings above.'));
    warnings.append(label);
  }

  const decisions = section(root, 'Decision');
  const actions = document.createElement('div');
  actions.className = 'second-brain-actions';
  const confirm = document.createElement('button');
  confirm.type = 'button';
  confirm.textContent = 'Confirm and write note';
  confirm.disabled = warningReview !== null;
  const confirmReason = text(decisions, 'p', warningReview ? 'Review the warnings before confirmation is enabled.' : 'Ready for your explicit decision.');
  confirmReason.id = 'second-brain-confirm-reason';
  confirm.setAttribute('aria-describedby', confirmReason.id);
  warningReview?.addEventListener('change', () => {
    confirm.disabled = !warningReview?.checked;
    confirmReason.textContent = warningReview?.checked ? 'Warnings reviewed. Confirmation is enabled.' : 'Review the warnings before confirmation is enabled.';
  });
  confirm.addEventListener('click', () => onDecision('confirm'));
  const reject = document.createElement('button');
  reject.type = 'button';
  reject.textContent = 'Reject proposal';
  reject.addEventListener('click', () => onDecision('reject'));
  actions.append(confirm, reject);
  decisions.append(actions);
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.textContent = 'Copy recovery request';
  copy.addEventListener('click', () => onCopyRecovery(recoveryRequest(detail)));
  decisions.append(copy);
}
