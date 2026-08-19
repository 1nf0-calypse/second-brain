// Beschreibung: Fokussierte, tastaturbedienbare Inbox-Liste fuer MCP-first Compilations.
// Artefakte:    US-000017; UX-000004
// Agent:        FE — 2026-08-15
import type { PendingCompilationList } from '@second-brain/contracts';

function appendText(parent: HTMLElement, tag: keyof HTMLElementTagNameMap, text: string, className?: string): HTMLElement {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  parent.append(element);
  return element;
}

/** Rendered inbox metadata never includes candidate Markdown. */
// Implementiert: US-000017
export function renderPendingReviewList(
  container: HTMLElement,
  list: PendingCompilationList,
  onSelect: (pendingId: string) => void
): void {
  container.replaceChildren();
  const heading = appendText(container, 'h2', `Pending reviews (${list.items.length})`);
  heading.id = 'second-brain-pending-heading';
  heading.tabIndex = -1;
  if (list.items.length === 0) {
    appendText(container, 'p', 'No pending reviews. New MCP proposals will appear here automatically.');
    return;
  }
  const items = document.createElement('ul');
  items.className = 'second-brain-card-list';
  items.setAttribute('aria-labelledby', heading.id);
  for (const item of list.items) {
    const row = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'second-brain-card-button';
    button.dataset.pendingId = item.pendingId;
    button.addEventListener('click', () => onSelect(item.pendingId));
    appendText(button, 'strong', item.targetPath);
    appendText(button, 'span', `${item.clientName} · ${item.sourceCount} source${item.sourceCount === 1 ? '' : 's'}`);
    appendText(button, 'span', item.warningCount > 0 ? `${item.warningCount} warning${item.warningCount === 1 ? '' : 's'}` : 'No warnings');
    appendText(button, 'small', `Expires ${new Date(item.expiresAt).toLocaleString()}`);
    row.append(button);
    items.append(row);
  }
  container.append(items);
}
