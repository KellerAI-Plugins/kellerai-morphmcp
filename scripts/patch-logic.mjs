/**
 * Core patching logic for merging v0.8.25 filesystem tools into any version
 * Used by both manual patch scripts and automated sync workflow
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function applyPatch(sourcePath, outputPath) {
  console.log(`Patching ${sourcePath} → ${outputPath}`);

  const sourceContent = readFileSync(sourcePath, 'utf-8');

  // Define the complete ALL_TOOLS array with all 15 tools
  const completeAllTools = `const ALL_TOOLS = [
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
    'edit_file',
    'warpgrep_codebase_search',
    'codebase_search'
];`;

  // Step 1: Update ALL_TOOLS
  let patched = sourceContent.replace(/const ALL_TOOLS = \[[\s\S]*?\];/, completeAllTools);

  // Step 2: Check if we need to add filesystem tool handlers
  const hasReadFile = /case ["']read_file["']/.test(sourceContent);

  if (!hasReadFile) {
    console.log('Adding filesystem tool handlers from reference...');

    // Load the reference implementation
    const refPath = join(__dirname, '..', 'reference', 'filesystem-tools-reference.js');
    const referenceContent = readFileSync(refPath, 'utf-8');

    // Extract tool handlers section
    const handlersMatch = referenceContent.match(/\/\/ FILESYSTEM_TOOLS_START([\s\S]*)\/\/ FILESYSTEM_TOOLS_END/);
    if (handlersMatch) {
      const handlers = handlersMatch[1];

      // Insert before default case in switch
      patched = patched.replace(
        /(            default:)/,
        `${handlers}\n\n$1`
      );
    }
  }

  writeFileSync(outputPath, patched, 'utf-8');
  console.log('✅ Patch complete');
}

export function verifyPatch(filePath) {
  const content = readFileSync(filePath, 'utf-8');

  const requiredTools = [
    'read_file', 'read_multiple_files', 'write_file', 'tiny_edit_file',
    'create_directory', 'list_directory', 'list_directory_with_sizes',
    'directory_tree', 'move_file', 'search_files', 'get_file_info',
    'list_allowed_directories', 'edit_file', 'warpgrep_codebase_search',
    'codebase_search'
  ];

  const allToolsMatch = content.match(/const ALL_TOOLS = \[([\s\S]*?)\];/);
  if (!allToolsMatch) return { success: false, error: 'ALL_TOOLS not found' };

  const foundTools = allToolsMatch[1]
    .split(',')
    .map(line => line.trim().replace(/['"]/g, ''))
    .filter(Boolean);

  const missing = requiredTools.filter(tool => !foundTools.includes(tool));

  if (missing.length > 0) {
    return { success: false, error: `Missing tools: ${missing.join(', ')}` };
  }

  return { success: true, tools: foundTools };
}
