# Dev-Tools Marketplace Integration

This fork is designed to work seamlessly with the KellerAI dev-tools marketplace.

## Current Integration

**Location:** `~/.claude/plugins/marketplaces/dev-tools/plugins/morphllm/`

**Configuration:** `.mcp.json`
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

## Installation for Dev-Tools

### Method 1: Global pnpm Link (Development)

```bash
# Clone and link fork
cd ~/Projects
git clone https://github.com/KellerAI-Plugins/kellerai-morphmcp.git
cd kellerai-morphmcp

# Install dependencies
pnpm install

# Link globally
pnpm link --global

# Verify
which kellerai-morph-mcp
kellerai-morph-mcp --version
```

### Method 2: Published Package (Production)

```bash
# Install from npm registry
pnpm add -g @kellerai/morphmcp

# Dev-tools .mcp.json automatically uses it
```

## Verifying Integration

```bash
# Check command is available
which kellerai-morph-mcp

# Test with all tools
ENABLED_TOOLS=all kellerai-morph-mcp ~/.claude/debug

# Should output:
# Enabled tools: read_file, read_multiple_files, write_file, ...
# (15 tools total)
```

## Updating the Fork

### Pull Latest Changes

```bash
cd ~/Projects/kellerai-morphmcp
git pull
pnpm install

# Re-link if using development mode
pnpm link --global
```

### Sync Upstream

```bash
# Manual sync
pnpm run sync-upstream

# Or wait for automated GitHub Actions daily sync
```

## Dev-Tools Plugin Structure

```
dev-tools/
├── plugins/
│   ├── morphllm/
│   │   ├── .mcp.json          # Uses kellerai-morph-mcp
│   │   ├── CLAUDE.md
│   │   └── skills/
│   │       └── server-patch/  # Historical patch scripts
│   └── ...other plugins
└── plugin.json
```

## Switching Between Upstream and Fork

### Use Fork (Current)
```json
// .mcp.json
{
  "command": "kellerai-morph-mcp"  // ✅ 15 tools
}
```

### Use Upstream (Not Recommended)
```json
// .mcp.json
{
  "command": "morph-mcp"  // ❌ Only 3 tools
}
```

## Troubleshooting

### Command Not Found

```bash
# Check if linked
pnpm list -g | grep kellerai

# Re-link
cd ~/Projects/kellerai-morphmcp
pnpm link --global
```

### Missing Dependencies

```bash
cd ~/Projects/kellerai-morphmcp
pnpm install
pnpm link --global
```

### Tools Not Showing

```bash
# Verify environment variable
ENABLED_TOOLS=all kellerai-morph-mcp ~/.claude/debug

# Check MCP configuration
cat ~/.claude/plugins/marketplaces/dev-tools/plugins/morphllm/.mcp.json
```

## Publishing Updates

When publishing new versions to npm:

```bash
cd ~/Projects/kellerai-morphmcp

# Verify tests pass
pnpm test

# Bump version (done automatically by sync script)
# npm version patch

# Publish
pnpm publish

# Update global installation
pnpm add -g @kellerai/morphmcp@latest
```

## CI/CD Integration

The fork uses GitHub Actions for:
- **Daily upstream sync** (2 AM UTC)
- **Automated testing** before merge
- **PR creation** for review

See `.github/workflows/sync-upstream.yml` for details.

## Development Workflow

1. **Fork changes** are made in `~/Projects/kellerai-morphmcp`
2. **Test locally** with `pnpm link --global`
3. **Commit and push** to GitHub
4. **Publish to npm** when stable
5. **Dev-tools automatically uses** the published version

## Benefits of This Integration

| Feature | Benefit |
|---------|---------|
| **Unified config** | Single .mcp.json in dev-tools |
| **Automatic updates** | GitHub Actions syncs upstream daily |
| **Version control** | Git tracking for all changes |
| **Easy rollback** | Switch command in .mcp.json |
| **Development mode** | pnpm link for testing |

---

**Last Updated:** 2024-12-04
**Integration Status:** ✅ Active
**Command:** `kellerai-morph-mcp`
**Tools:** 15 (12 filesystem + 3 MorphLLM)
