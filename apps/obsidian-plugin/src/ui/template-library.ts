// Beschreibung: Projektlokale Template Library mit immutablem Versions-Review.
// Artefakte:    US-000016; UX-000004
// Agent:        FE — 2026-08-15
import type { StoredTemplateVersion } from '@second-brain/contracts';
import { listTemplates, readTemplate, writeTemplateVersion, type TemplateStoreTransport } from '../ipc/template-client.js';

function field(root: HTMLElement, labelText: string, control: HTMLInputElement | HTMLTextAreaElement): void {
  const label = document.createElement('label');
  label.textContent = labelText;
  label.htmlFor = control.id;
  root.append(label, control);
}

/** Template text entry is intentionally isolated from the compilation review flow. */
// Implementiert: US-000016
export async function renderTemplateLibrary(root: HTMLElement, transport: TemplateStoreTransport, vaultRoot: string, announce: (message: string, alert?: boolean) => void): Promise<void> {
  root.replaceChildren();
  const heading = document.createElement('h2');
  heading.textContent = 'Templates';
  root.append(heading);
  const loading = document.createElement('p');
  loading.textContent = 'Loading templates…';
  root.append(loading);
  const templates = await listTemplates(transport, vaultRoot);
  loading.remove();
  const list = document.createElement('ul');
  list.className = 'second-brain-card-list';
  for (const template of templates.items) {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = `${template.name} · version ${template.latestVersion}`;
    item.append(title);
    const versions = document.createElement('div');
    versions.className = 'second-brain-inline-actions';
    for (const version of template.versions) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `Read v${version.version}`;
      button.addEventListener('click', () => void readTemplate(transport, vaultRoot, template.id, version.version)
        .then((stored) => showTemplateReview(root, stored, null))
        .catch((error: unknown) => announce(error instanceof Error ? error.message : 'Template could not be read.', true)));
      versions.append(button);
    }
    item.append(versions);
    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = 'Create new version';
    next.addEventListener('click', () => void readTemplate(transport, vaultRoot, template.id, template.latestVersion)
      .then((stored) => showEditor(root, transport, vaultRoot, announce, stored))
      .catch((error: unknown) => announce(error instanceof Error ? error.message : 'Template could not be read.', true)));
    item.append(next);
    list.append(item);
  }
  root.append(list);
  if (templates.items.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No templates yet. Create one to reuse a reviewed compilation structure.';
    root.append(empty);
  }
  const create = document.createElement('button');
  create.type = 'button';
  create.textContent = 'Create template';
  create.addEventListener('click', () => showEditor(root, transport, vaultRoot, announce, null));
  root.append(create);
}

function showTemplateReview(root: HTMLElement, stored: StoredTemplateVersion, onSave: (() => void) | null): void {
  const review = document.createElement('section');
  review.className = 'second-brain-review-panel';
  const heading = document.createElement('h3');
  heading.textContent = `${stored.name} · version ${stored.version}`;
  const content = document.createElement('pre');
  content.textContent = stored.content;
  content.setAttribute('aria-label', 'Read-only template content');
  review.append(heading, content);
  if (onSave) {
    const save = document.createElement('button');
    save.type = 'button';
    save.textContent = 'Save reviewed version';
    save.addEventListener('click', onSave);
    review.append(save);
  }
  root.append(review);
  heading.tabIndex = -1;
  heading.focus();
}

function showEditor(root: HTMLElement, transport: TemplateStoreTransport, vaultRoot: string, announce: (message: string, alert?: boolean) => void, current: StoredTemplateVersion | null): void {
  const editor = document.createElement('section');
  const heading = document.createElement('h3');
  heading.textContent = current ? 'Create new template version' : 'Create template';
  const name = document.createElement('input');
  name.id = 'second-brain-template-name';
  name.value = current?.name ?? '';
  const content = document.createElement('textarea');
  content.id = 'second-brain-template-content';
  content.rows = 12;
  content.value = current?.content ?? '';
  editor.append(heading);
  field(editor, 'Template name', name);
  field(editor, 'Template content', content);
  const review = document.createElement('button');
  review.type = 'button';
  review.textContent = 'Review template version';
  review.addEventListener('click', () => {
    if (!name.value.trim()) { announce('Enter a template name.', true); name.focus(); return; }
    if (!content.value) { announce('Enter template content.', true); content.focus(); return; }
    editor.querySelector('.second-brain-review-panel')?.remove();
    const draft = { name: name.value, content: content.value };
    const placeholder: StoredTemplateVersion = {
      id: current?.id ?? '00000000-0000-4000-8000-000000000000',
      name: draft.name,
      version: (current?.version ?? 0) + 1,
      hash: '0'.repeat(64),
      content: draft.content,
      createdAt: new Date().toISOString()
    };
    showTemplateReview(editor, placeholder, () => void writeTemplateVersion(transport, vaultRoot, {
      ...(current ? { templateId: current.id } : {}),
      name: draft.name,
      content: draft.content,
      expectedLatestVersion: current?.version ?? 0
    }).then((saved) => {
      announce(`Template ${saved.name} version ${saved.version} saved.`);
      void renderTemplateLibrary(root, transport, vaultRoot, announce);
    }).catch((error: unknown) => {
      announce(`${error instanceof Error ? error.message : 'Template version could not be saved.'} Your draft is still available.`, true);
    }));
  });
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancel';
  cancel.addEventListener('click', () => { void renderTemplateLibrary(root, transport, vaultRoot, announce); });
  const actions = document.createElement('div');
  actions.className = 'second-brain-actions';
  actions.append(review, cancel);
  editor.append(actions);
  root.replaceChildren(editor);
  heading.tabIndex = -1;
  heading.focus();
}
