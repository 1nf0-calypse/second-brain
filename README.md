# Second Brain

Second Brain is a local, MCP-first Obsidian plugin that connects an existing vault to
supported AI clients and maintains a local incremental index without migrating or modifying
the original notes.

## Project history

Second Brain was originally created by Ruowen Wang and released through version 2.1.21.
This project is a continued development maintained by Frederik Hirche.

- Original project: <https://github.com/graceruowenwang/obsidian-second-brain>
- Continued development: <https://github.com/1nf0-calypse/second-brain>

The original copyright and MIT license notice are preserved in `LICENSE`.

## Current scope

Version 2.2.0 provides the first release of this continuation:

- local Claude Desktop connection through MCP;
- no additional LLM API key in the plugin;
- local incremental SQLite indexing;
- safe index rebuilds that preserve the last valid index on failure;
- no forced vault migration;
- no persistent external storage of vault contents.

ChatGPT, Mistral, search, knowledge-graph exploration, and controlled mutations are planned
separately and are not part of this release.

## Requirements

- Windows desktop
- Obsidian 1.8.0 or later
- Node.js 24 LTS
- Claude Desktop for the currently supported MCP setup

## Development

```powershell
npm ci
npm run lint
npm test
npm run test:coverage
npm run build
```

The installable plugin is created in `dist/obsidian-plugin/` and contains:

- `manifest.json`
- `main.js`
- `styles.css`
- `sidecar/main.js`

## Local Claude Desktop setup

1. Build the project.
2. Install the contents of `dist/obsidian-plugin/` in the Obsidian plugin directory.
3. Restart or disable and re-enable the plugin so Obsidian loads the new bundle.
4. Open the command palette and run **Second Brain: Open setup**.
5. Select the local vault.
6. Merge the displayed `mcpServers` entry into the existing top-level Claude Desktop
   configuration. Do not append it as a second JSON object.
7. Restart Claude Desktop and verify the Second Brain connection.

The sidecar can also be started directly for development:

```powershell
$env:SECOND_BRAIN_VAULT_ROOT='C:\path\to\vault'
node dist/obsidian-plugin/sidecar/main.js
```

## Security

- MCP exposes only explicitly defined capabilities.
- Paths outside the approved vault root, traversal attempts, and symbolic-link escapes are
  blocked.
- The derived index is stored locally.
- Original vault files are read-only during setup and indexing.
- Vault contents and secrets are not written to logs.
- Test fixtures contain synthetic data only.

## License

Second Brain is distributed under the MIT License. See [LICENSE](LICENSE).
