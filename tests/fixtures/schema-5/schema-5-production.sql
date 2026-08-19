PRAGMA foreign_keys = OFF;

CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);
CREATE TABLE mutation_previews (
  token TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  relative_path TEXT NOT NULL,
  before_hash TEXT,
  after_hash TEXT NOT NULL,
  before_content TEXT,
  after_content TEXT,
  diff TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  source_audit_id TEXT
);
CREATE TABLE mutation_audit (
  audit_id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  relative_path TEXT NOT NULL,
  before_hash TEXT,
  after_hash TEXT,
  before_content TEXT,
  after_content TEXT,
  source_audit_id TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE autonomy_policy (
  mode TEXT NOT NULL CHECK(mode IN ('human-on', 'human-out')),
  activated_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_mutations INTEGER NOT NULL CHECK(used_mutations >= 0 AND used_mutations <= 60),
  in_flight INTEGER NOT NULL DEFAULT 0 CHECK(in_flight >= 0),
  paused_at TEXT
);
CREATE TABLE template_versions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(name, version)
);
CREATE TABLE template_previews (
  token TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  name TEXT NOT NULL,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT
);
CREATE TABLE compilation_bindings (
  token TEXT PRIMARY KEY,
  sources_json TEXT NOT NULL,
  template_id TEXT NOT NULL,
  template_version INTEGER NOT NULL,
  template_hash TEXT NOT NULL,
  warnings_json TEXT NOT NULL
);

INSERT INTO schema_migrations(version, applied_at) VALUES
  (1, '2026-01-01T00:00:00.000Z'),
  (2, '2026-02-01T00:00:00.000Z'),
  (3, '2026-03-01T00:00:00.000Z'),
  (4, '2026-04-01T00:00:00.000Z'),
  (5, '2026-05-01T00:00:00.000Z');
INSERT INTO mutation_previews(
  token, action, relative_path, before_hash, after_hash, before_content, after_content,
  diff, expires_at, used_at, source_audit_id
) VALUES (
  'fixture-live-preview', 'update', 'Existing.md',
  'e757448c8f9339e876d9e68aac3df85251a13cc60c8b86f41bd063e31e4cdb8d',
  '89a356a171ec3dfdcfd87c87e24c29f89dd2662930fc3fc4721dfbaed8066fd7',
  '# Before' || char(10), '# After' || char(10), '- # Before' || char(10) || '+ # After',
  '2099-01-01T00:00:00.000Z', NULL, NULL
);
INSERT INTO mutation_audit(
  audit_id, action, relative_path, before_hash, after_hash, before_content, after_content,
  source_audit_id, created_at
) VALUES
  ('11111111-1111-4111-8111-111111111111', 'create', 'Existing.md', NULL,
   '6834266323e358397568675abee12ea0b8433a024b14651b5ae305e6c8f1b0dd', NULL,
   '# Existing' || char(10), NULL, '2026-05-02T10:00:00.000Z'),
  ('22222222-2222-4222-8222-222222222222', 'update', 'Existing.md',
   '6834266323e358397568675abee12ea0b8433a024b14651b5ae305e6c8f1b0dd',
   'e757448c8f9339e876d9e68aac3df85251a13cc60c8b86f41bd063e31e4cdb8d',
   '# Existing' || char(10), '# Before' || char(10), NULL, '2026-05-03T10:00:00.000Z');
INSERT INTO autonomy_policy(mode, activated_at, expires_at, used_mutations, in_flight, paused_at)
VALUES ('human-on', '2026-05-03T09:00:00.000Z', '2026-05-03T10:00:00.000Z', 7, 0, '2026-05-03T09:30:00.000Z');
INSERT INTO template_versions(id, name, version, content, hash, created_at)
VALUES ('33333333-3333-4333-8333-333333333333', 'Production summary', 2, '# {{title}}',
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        '2026-05-01T08:00:00.000Z');
INSERT INTO template_previews(token, template_id, name, version, content, hash, created_at, expires_at, used_at)
VALUES ('fixture-template-preview', '44444444-4444-4444-8444-444444444444', 'Draft template', 3,
        '# {{title}} draft', 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        '2026-05-03T08:00:00.000Z', '2026-05-03T08:10:00.000Z', NULL);
INSERT INTO compilation_bindings(token, sources_json, template_id, template_version, template_hash, warnings_json)
VALUES
  ('fixture-live-preview', '[{"relativePath":"Source.md","hash":"cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"}]',
   '33333333-3333-4333-8333-333333333333', 2,
   'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '[]'),
  ('fixture-orphan-preview', '[]', '33333333-3333-4333-8333-333333333333', 2,
   'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', '[]');
