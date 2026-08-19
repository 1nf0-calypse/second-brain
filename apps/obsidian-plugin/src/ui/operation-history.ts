// Beschreibung: Truthful operation history with independent operation and rollback states.
// Artefakte:    US-000008; UX-000004
// Agent:        FE — 2026-08-15
import { getOperationHistory, type CompilationInboxTransport } from '../ipc/compilation-client.js';

/** Renders filterable history without presenting incomplete or rejected work as success. */
// Implementiert: US-000008
export async function renderOperationHistory(root: HTMLElement, transport: CompilationInboxTransport, vaultRoot: string): Promise<void> {
  root.replaceChildren();
  const heading = document.createElement('h2');
  heading.textContent = 'History';
  const label = document.createElement('label');
  label.textContent = 'Filter by status';
  const filter = document.createElement('select');
  filter.id = 'second-brain-history-filter';
  label.htmlFor = filter.id;
  for (const value of ['all', 'success', 'rejected', 'failed', 'incomplete', 'conflicted', 'expired']) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value === 'all' ? 'All statuses' : value;
    filter.append(option);
  }
  const history = await getOperationHistory(transport, vaultRoot);
  const list = document.createElement('ul');
  list.className = 'second-brain-card-list';
  const paint = (): void => {
    list.replaceChildren();
    for (const entry of history.entries.filter((candidate) => filter.value === 'all' || candidate.status === filter.value)) {
      const item = document.createElement('li');
      const title = document.createElement('strong');
      title.textContent = entry.targetPath;
      const state = document.createElement('p');
      state.textContent = `Operation: ${entry.status} · Rollback: ${entry.rollbackStatus}`;
      state.className = `second-brain-state second-brain-state-${entry.status}`;
      const detail = document.createElement('small');
      detail.textContent = `${entry.kind} · ${new Date(entry.createdAt).toLocaleString()}${entry.errorCode ? ` · ${entry.errorCode}` : ''}`;
      item.append(title, state, detail);
      list.append(item);
    }
    if (list.childElementCount === 0) {
      const empty = document.createElement('li');
      empty.textContent = 'No operations match this filter.';
      list.append(empty);
    }
  };
  filter.addEventListener('change', paint);
  root.append(heading, label, filter, list);
  paint();
}
