#!/usr/bin/env node
/**
 * Verify all 15 tools are present in kellerai-morphmcp
 * Runs as part of CI/CD and before npm publish
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REQUIRED_TOOLS = [
    // Filesystem tools (12)
    'read_file',
    'read_multiple_files',
    'write_file',
    'tiny_edit_file',
    'create_directory',
    'list_directory',
    'list_directory_with_sizes',
    'directory_tree',
    'move_file',
    'search_files',
    'get_file_info',
    'list_allowed_directories',
    // MorphLLM tools (3)
    'edit_file',
    'warpgrep_codebase_search',
    'codebase_search'
];

console.log('🔍 Verifying kellerai-morphmcp tool completeness...\n');

const indexPath = join(__dirname, '..', 'dist', 'index.js');
const indexContent = readFileSync(indexPath, 'utf-8');

// Extract ALL_TOOLS array
const allToolsMatch = indexContent.match(/const ALL_TOOLS = \[([\s\S]*?)\];/);
if (!allToolsMatch) {
    console.error('❌ Could not find ALL_TOOLS array in index.js');
    process.exit(1);
}

const allToolsStr = allToolsMatch[1];
const foundTools = allToolsStr
    .split(',')
    .map(line => line.trim())
    .map(line => line.replace(/['"]/g, ''))
    .filter(Boolean);

console.log(`📊 Found ${foundTools.length} tools in ALL_TOOLS array:\n`);

let allPresent = true;
let missingTools = [];
let extraTools = [];

// Check required tools
for (const tool of REQUIRED_TOOLS) {
    const present = foundTools.includes(tool);
    console.log(`  ${present ? '✅' : '❌'} ${tool}`);
    if (!present) {
        allPresent = false;
        missingTools.push(tool);
    }
}

// Check for extra tools (not in required list)
for (const tool of foundTools) {
    if (!REQUIRED_TOOLS.includes(tool)) {
        extraTools.push(tool);
    }
}

console.log();

if (extraTools.length > 0) {
    console.log(`⚠️  Extra tools found (not in required list):`);
    extraTools.forEach(tool => console.log(`     • ${tool}`));
    console.log();
}

// Verify tool handlers exist
console.log('🔧 Verifying tool handlers...\n');

let handlersMissing = [];
for (const tool of REQUIRED_TOOLS) {
    const handlerPattern = new RegExp(`case ["']${tool}["']:\\s*\\{`, 'm');
    if (!handlerPattern.test(indexContent)) {
        console.log(`  ❌ ${tool} handler not found`);
        handlersMissing.push(tool);
        allPresent = false;
    } else {
        console.log(`  ✅ ${tool} handler present`);
    }
}

console.log();

// Summary
if (allPresent && missingTools.length === 0 && handlersMissing.length === 0) {
    console.log('✅ VERIFICATION PASSED');
    console.log(`\n📦 All ${REQUIRED_TOOLS.length} required tools present and functional`);
    console.log('\n🎯 kellerai-morphmcp is ready for release');
    process.exit(0);
} else {
    console.log('❌ VERIFICATION FAILED\n');

    if (missingTools.length > 0) {
        console.log(`Missing tools in ALL_TOOLS: ${missingTools.join(', ')}`);
    }

    if (handlersMissing.length > 0) {
        console.log(`Missing handlers: ${handlersMissing.join(', ')}`);
    }

    console.log('\n⚠️  Do not publish until all tools are restored');
    process.exit(1);
}
