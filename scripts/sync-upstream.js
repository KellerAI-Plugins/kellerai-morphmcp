#!/usr/bin/env node
/**
 * Sync upstream @morphllm/morphmcp changes while preserving filesystem tools
 * Uses direct Node.js APIs (no shell execution) for security
 *
 * Usage: node scripts/sync-upstream.js --upstream-path=/path/to/upstream --upstream-version=0.8.34
 */

import { readFileSync, writeFileSync, cpSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Parse CLI args safely
const args = process.argv.slice(2).reduce((acc, arg) => {
  if (!arg.startsWith('--')) return acc;
  const [key, value] = arg.split('=');
  if (key && value) {
    acc[key.replace('--', '')] = value;
  }
  return acc;
}, {});

const upstreamPath = args['upstream-path'];
const upstreamVersion = args['upstream-version'];

if (!upstreamPath || !upstreamVersion) {
  console.error('❌ Missing required arguments');
  console.error('Usage: node sync-upstream.js --upstream-path=/path --upstream-version=X.Y.Z');
  process.exit(1);
}

// Validate inputs are safe paths/versions (prevent path traversal)
if (!existsSync(upstreamPath) || upstreamPath.includes('..')) {
  console.error('❌ Invalid upstream path');
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+/.test(upstreamVersion)) {
  console.error('❌ Invalid version format');
  process.exit(1);
}

console.log('🔄 Syncing upstream MorphLLM...\n');
console.log(`Upstream path: ${upstreamPath}`);
console.log(`Upstream version: ${upstreamVersion}\n`);

// Step 1: Read upstream dist/index.js
console.log('📖 Reading upstream package...');
const upstreamIndexPath = join(upstreamPath, 'dist', 'index.js');
const upstreamContent = readFileSync(upstreamIndexPath, 'utf-8');
console.log('✅ Upstream loaded');

// Step 2: Check if upstream has filesystem tools
console.log('\n🔍 Analyzing upstream tool set...');
const upstreamAllToolsMatch = upstreamContent.match(/const ALL_TOOLS = \[([\s\S]*?)\];/);
if (!upstreamAllToolsMatch) {
  console.error('❌ Could not find ALL_TOOLS in upstream');
  process.exit(1);
}

const upstreamTools = upstreamAllToolsMatch[1]
  .split(',')
  .map(line => line.trim().replace(/['"]/g, ''))
  .filter(Boolean);

console.log(`Found ${upstreamTools.length} tools in upstream:`);
upstreamTools.forEach(tool => console.log(`  • ${tool}`));

const hasFilesystemTools = upstreamTools.includes('read_file');
console.log(`\n${hasFilesystemTools ? '✅' : '⚠️'}  Upstream ${hasFilesystemTools ? 'HAS' : 'MISSING'} filesystem tools`);

// Step 3: Apply strategy based on upstream state
if (!hasFilesystemTools) {
  console.log('\n🔧 Applying filesystem tools patch...');

  // Import our patch logic directly (no shell execution)
  const patchLogic = await import('./patch-logic.mjs');
  await patchLogic.applyPatch(upstreamIndexPath, join(projectRoot, 'dist', 'index.js'));

  console.log('✅ Patch applied');
} else {
  console.log('\n✅ Upstream already has filesystem tools, copying directly...');
  cpSync(join(upstreamPath, 'dist'), join(projectRoot, 'dist'), { recursive: true });
}

// Step 4: Update package.json metadata
console.log('\n📝 Updating package.json...');
const packageJsonPath = join(projectRoot, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

// Bump kellerai patch version
const currentVersion = packageJson.version;
const versionParts = currentVersion.split('-kellerai.');
const kelleraiPatch = versionParts[1] ? parseInt(versionParts[1]) : 0;
const newPatchVersion = kelleraiPatch + 1;

packageJson.version = `${upstreamVersion}-kellerai.${newPatchVersion}`;
packageJson.kellerai.upstream.version = upstreamVersion;
packageJson.kellerai.upstream.lastSync = new Date().toISOString();

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
console.log(`✅ Version: ${currentVersion} → ${packageJson.version}`);

// Step 5: Run verification using execFile (safe)
console.log('\n🧪 Running verification tests...');
try {
  const { stdout } = await execFileAsync('node', ['test/verify-tools.js'], {
    cwd: projectRoot
  });
  console.log(stdout);
  console.log('✅ Verification passed');
} catch (err) {
  console.error('❌ Verification failed');
  console.error(err.stdout || err.message);
  process.exit(1);
}

console.log('\n✅ SYNC COMPLETE');
console.log(`\n📦 Ready to commit and publish: v${packageJson.version}`);
