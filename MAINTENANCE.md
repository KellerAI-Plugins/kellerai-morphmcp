# Fork Maintenance Workflow

Complete guide for maintaining `@kellerai/morphmcp` fork with full CRUD capabilities.

## Quick Reference

| Task | Command | Frequency |
|------|---------|-----------|
| Check for upstream updates | GitHub Actions (automatic) | Daily |
| Manual upstream sync | `npm run sync-upstream` | As needed |
| Verify tools | `npm test` | Before each release |
| Publish release | `npm publish` | After upstream sync |
| Check fork status | `kellerai-morph-mcp --version` | Anytime |

## Automated Workflows

### Daily Upstream Sync (GitHub Actions)

**Location:** `.github/workflows/sync-upstream.yml`

**Schedule:** 2 AM UTC daily

**Process:**
1. Checks npm registry for new `@morphllm/morphmcp` versions
2. Downloads upstream if newer than current
3. Runs sync script to merge changes
4. Re-applies filesystem tools patch if needed
5. Runs verification tests
6. Creates PR if all tests pass

**Manual Trigger:**
```bash
# Via GitHub UI: Actions → Sync Upstream MorphLLM → Run workflow
```

## Manual Maintenance

### Syncing Upstream Changes

```bash
# 1. Check current versions
npm view @morphllm/morphmcp version  # Upstream
node -p "require('./package.json').version"  # Ours

# 2. If upstream is newer, sync
npm run sync-upstream

# 3. Verify all tools present
npm test

# 4. Commit changes
git add .
git commit -m "chore: sync upstream @morphllm/morphmcp@X.Y.Z"

# 5. Tag new version
git tag vX.Y.Z-kellerai.N

# 6. Push
git push && git push --tags
```

### Handling Sync Failures

If automated sync fails:

```bash
# 1. Check workflow logs
# GitHub → Actions → Latest failed run → View logs

# 2. Common issues:
# - Tests failed: Upstream broke tools
# - Patch failed: Upstream changed structure
# - Verification failed: Missing tools

# 3. Manual intervention
cd ~/Projects/kellerai-morphmcp

# Download upstream manually
npm pack @morphllm/morphmcp@VERSION
tar -xzf morphllm-morphmcp-VERSION.tgz

# Inspect changes
diff -u dist/index.js package/dist/index.js

# Apply patch manually if needed
node scripts/patch-logic.mjs \
  --source=package/dist/index.js \
  --output=dist/index.js

# Verify and commit
npm test
git add . && git commit -m "fix: manual sync for vVERSION"
```

## Version Management

### Version Scheme

```
[upstream-version]-kellerai.[patch]
```

**Examples:**
- `0.8.33-kellerai.1` - First fork of v0.8.33
- `0.8.33-kellerai.2` - Second patch for v0.8.33
- `0.8.34-kellerai.1` - Synced to v0.8.34

### Bumping Versions

**Automatic** (via sync script):
```bash
npm run sync-upstream
# Automatically bumps patch level
```

**Manual:**
```json
// package.json
{
  "version": "0.8.33-kellerai.2",  // Increment patch
  "kellerai": {
    "upstream": {
      "version": "0.8.33",  // Match upstream
      "lastSync": "2024-12-04T20:30:00Z"  // Update timestamp
    }
  }
}
```

## Testing & Verification

### Pre-Release Checklist

```bash
# 1. All 15 tools present
npm test

# 2. No duplicate functions
grep -c "async function getFileStats" dist/index.js
# Should be exactly 1

# 3. No syntax errors
node -c dist/index.js

# 4. Command works
kellerai-morph-mcp ~/.claude/debug &
# Should show "Enabled tools: read_file, read_multiple_files, ..."
pkill -f kellerai-morph-mcp

# 5. Version matches
npm version --json
```

### Verification Output

Expected `npm test` output:

```
✅ read_file
✅ read_multiple_files
✅ write_file
...
✅ warpgrep_codebase_search
✅ codebase_search

✅ VERIFICATION PASSED
📦 All 15 required tools present and functional
```

## Release Process

### 1. Prepare Release

```bash
# Ensure on main branch
git checkout main
git pull

# Run full verification
npm test

# Check no uncommitted changes
git status
```

### 2. Tag Release

```bash
# Tag with version
git tag v0.8.33-kellerai.2 -m "Release v0.8.33-kellerai.2"

# Push tags
git push origin main --tags
```

### 3. Publish to npm

```bash
# Publish (requires npm auth)
npm publish

# Verify published
npm view @kellerai/morphmcp version
```

### 4. Update Dependents

```bash
# Update global installation
pnpm remove -g @kellerai/morphmcp
pnpm add -g @kellerai/morphmcp

# Verify command
which kellerai-morph-mcp
kellerai-morph-mcp ~/.claude/debug &
pkill -f kellerai-morph-mcp
```

## Troubleshooting

### Tools Missing After Sync

```bash
# Check ALL_TOOLS array
grep -A 20 "const ALL_TOOLS" dist/index.js

# If missing tools, re-apply patch
node scripts/patch-logic.mjs \
  --source=dist/index.js.backup \
  --output=dist/index.js

npm test
```

### Duplicate Functions

```bash
# Find duplicates
grep -n "async function getFileStats" dist/index.js

# If multiple found, restore backup and re-patch
cp dist/index.js.backup-TIMESTAMP dist/index.js
npm run sync-upstream
```

### Verification Failing

```bash
# Run with verbose output
node test/verify-tools.js 2>&1 | tee verify.log

# Check for specific missing tools
grep "❌" verify.log

# Manually inspect dist/index.js
code dist/index.js  # Search for missing tool name
```

## Upstream Changes to Watch

### Critical Patterns

**If upstream adds back filesystem tools:**
```bash
# Our fork becomes unnecessary, notify users
echo "⚠️ Upstream restored tools - consider deprecating fork"
```

**If upstream changes tool structure:**
```bash
# May need to update patch logic
# Check scripts/patch-logic.mjs
```

**If upstream changes package structure:**
```bash
# May need to update sync script
# Check scripts/sync-upstream.js
```

## Fork Health Monitoring

### Monthly Checks

```bash
# 1. Upstream version drift
npm view @morphllm/morphmcp version
cat package.json | grep '"version"'

# 2. GitHub Actions status
# Visit: https://github.com/KellerAI-Plugins/kellerai-morphmcp/actions

# 3. Issue tracker
# Visit: https://github.com/KellerAI-Plugins/kellerai-morphmcp/issues

# 4. Download stats
npm info @kellerai/morphmcp
```

### Quarterly Review

- Review upstream changelog for breaking changes
- Update dependencies (`@modelcontextprotocol/sdk`, `zod`)
- Review and close stale issues
- Update README if needed

## Emergency Rollback

If a release breaks:

```bash
# 1. Identify last good version
npm view @kellerai/morphmcp versions --json

# 2. Publish previous version as latest
npm unpublish @kellerai/morphmcp@BAD_VERSION
npm publish --tag latest  # From git tag of good version

# 3. Notify users
# Create GitHub issue explaining rollback
```

## Contact & Support

- **Fork Issues**: GitHub Issues on kellerai-morphmcp repo
- **Upstream Issues**: Report to @morphllm/morphmcp
- **Security**: Email security@kellerai.com

---

**Last Updated:** 2024-12-04
**Maintainer:** KellerAI
**Fork Version:** v0.8.33-kellerai.1
