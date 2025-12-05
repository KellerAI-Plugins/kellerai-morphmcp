# @kellerai/morphmcp

**KellerAI-maintained fork of MorphLLM MCP with guaranteed filesystem tool support**

## Why This Fork Exists

The upstream `@morphllm/morphmcp` package removed all 12 filesystem tools in v0.8.26+, leaving only 3 tools (edit_file, warpgrep_codebase_search, codebase_search). This fork restores and maintains all 15 tools with a guarantee they will never be removed.

## Installation

```bash
# Using pnpm (recommended)
pnpm add -g @kellerai/morphmcp

# Using npm
npm install -g @kellerai/morphmcp

# Using yarn
yarn global add @kellerai/morphmcp
```

## Usage

### Command Line

```bash
# Same as morph-mcp but with all tools
kellerai-morph-mcp /path/to/project
```

### MCP Configuration

Update your `.mcp.json`:

```json
{
  "mcpServers": {
    "morphllm-mcp": {
      "type": "stdio",
      "command": "kellerai-morph-mcp",
      "args": ["${HOME}/.claude/debug"],
      "env": {
        "MORPH_API_KEY": "${MORPH_API_KEY}",
        "ENABLED_TOOLS": "all"
      }
    }
  }
}
```

## Available Tools

### Filesystem Tools (12)

| Tool | Description |
|------|-------------|
| `read_file` | Read file contents |
| `read_multiple_files` | Read multiple files efficiently |
| `write_file` | Write content to file |
| `tiny_edit_file` | Make small edits to files |
| `create_directory` | Create directories |
| `list_directory` | List directory contents |
| `list_directory_with_sizes` | List with file sizes |
| `directory_tree` | Recursive directory tree |
| `move_file` | Move/rename files |
| `search_files` | Search for files by pattern |
| `get_file_info` | Get file metadata |
| `list_allowed_directories` | List accessible directories |

### MorphLLM Tools (3)

| Tool | Description |
|------|-------------|
| `edit_file` | Advanced file editing with diffs |
| `warpgrep_codebase_search` | Fast grep-based search |
| `codebase_search` | Semantic code search |

## Version Scheme

```
[upstream-version]-kellerai.[patch-level]
```

Example: `0.8.33-kellerai.1`

- **Upstream version**: Base version from `@morphllm/morphmcp`
- **Patch level**: KellerAI-specific fixes and updates

## Upstream Sync

This fork automatically syncs with upstream daily via GitHub Actions:

1. **Detection**: Checks for new upstream versions
2. **Merge**: Applies upstream changes
3. **Patch**: Re-applies filesystem tools if needed
4. **Verify**: Runs comprehensive tool verification
5. **PR**: Creates automated pull request for review

### Manual Sync

```bash
npm run sync-upstream
```

## Verification

Run tool verification anytime:

```bash
npm test
# or
npm run verify
```

Expected output:
```
✅ VERIFICATION PASSED
📦 All 15 required tools present and functional
```

## Fork Guarantees

| Guarantee | Description |
|-----------|-------------|
| **Tool Stability** | All 15 tools always available |
| **No Surprises** | Semantic versioning, no breaking removals |
| **Automated Testing** | Every release verified with test suite |
| **Upstream Sync** | Regular merges from upstream |
| **Long-term Support** | Maintained by KellerAI |

## Differences from Upstream

| Feature | Upstream (v0.8.33+) | This Fork |
|---------|---------------------|-----------|
| Filesystem tools | ❌ Removed | ✅ Present (12 tools) |
| Total tools | 3 | 15 |
| Stability | Tools removed without warning | Guaranteed stability |
| Testing | No verification | Automated test suite |

## Migration from Upstream

### Step 1: Uninstall upstream

```bash
pnpm remove -g @morphllm/morphmcp
# or
npm uninstall -g @morphllm/morphmcp
```

### Step 2: Install fork

```bash
pnpm add -g @kellerai/morphmcp
# or
npm install -g @kellerai/morphmcp
```

### Step 3: Update .mcp.json

Change command from `morph-mcp` to `kellerai-morph-mcp`:

```diff
{
  "mcpServers": {
    "morphllm-mcp": {
      "type": "stdio",
-      "command": "morph-mcp",
+      "command": "kellerai-morph-mcp",
      "args": ["${HOME}/.claude/debug"],
      ...
    }
  }
}
```

### Step 4: Restart Claude Code

```bash
# Restart Claude Code to reload MCP configuration
```

## Development

### Project Structure

```
kellerai-morphmcp/
├── dist/                 # Compiled distribution
│   ├── index.js          # Main MCP server (patched)
│   └── *.js              # Supporting modules
├── test/                 # Verification tests
│   └── verify-tools.js   # Tool completeness check
├── scripts/              # Automation scripts
│   ├── sync-upstream.js  # Upstream sync logic
│   └── patch-logic.mjs   # Core patching functions
├── .github/workflows/    # CI/CD automation
│   └── sync-upstream.yml # Daily upstream sync
└── package.json          # Package metadata
```

### Running Tests

```bash
npm test
```

### Creating Releases

1. Merge upstream sync PR (or manual changes)
2. Verify tests pass
3. Tag release: `git tag v0.8.33-kellerai.2`
4. Push: `git push --tags`
5. Publish: `npm publish`

## Support

- **Issues**: [GitHub Issues](https://github.com/KellerAI-Plugins/kellerai-morphmcp/issues)
- **Upstream**: [@morphllm/morphmcp](https://www.npmjs.com/package/@morphllm/morphmcp)

## License

MIT (same as upstream)

## Credits

- **Upstream**: MorphLLM team for the original MCP server
- **Fork Maintainer**: KellerAI
- **Filesystem Tools**: Restored from v0.8.25

---

**Stability Guaranteed** 🔒
