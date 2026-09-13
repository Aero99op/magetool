import { test } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import { scanRepository } from '../src/core/scanner.js';
import { DEFAULT_CONFIG } from '../src/utils/config.js';

test('scanner - correctly counts files and lines in src', async () => {
  const targetDir = path.resolve('./src');
  const result = await scanRepository(targetDir, DEFAULT_CONFIG);

  assert.ok(result.totalFiles > 0, 'Should find files in src');
  assert.ok(result.totalLines > 0, 'Should count lines in src');
  assert.ok(result.scanDurationMs >= 0, 'Duration should be non-negative');
  assert.ok(result.extensionStats['.ts'], 'Should detect TypeScript files');
});
