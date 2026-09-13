import { promises as fs } from 'fs';
import path from 'path';
import { MageConfig } from '../utils/config.js';

export interface FileMetric {
  filePath: string;
  relativePath: string;
  extension: string;
  sizeBytes: number;
  lines: number;
  isBinary: boolean;
}

export interface ScanResult {
  rootDirectory: string;
  totalFiles: number;
  totalSizeBytes: number;
  totalLines: number;
  extensionStats: Record<string, { count: number; lines: number; sizeBytes: number }>;
  files: FileMetric[];
  scanDurationMs: number;
}

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.webp',
  '.zip', '.tar', '.gz', '.7z',
  '.exe', '.dll', '.so', '.dylib', '.bin',
  '.woff', '.woff2', '.ttf', '.eot',
  '.pdf', '.mp4', '.mp3', '.wasm',
]);

export async function scanRepository(
  targetDir: string,
  config: MageConfig
): Promise<ScanResult> {
  const startTime = Date.now();
  const rootDir = path.resolve(targetDir);
  const files: FileMetric[] = [];
  const extensionStats: Record<string, { count: number; lines: number; sizeBytes: number }> = {};

  const ignoreSet = new Set(config.ignorePatterns);

  async function walk(currentDir: string): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (ignoreSet.has(entry.name) || entry.name.startsWith('.')) {
        continue;
      }

      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase() || '[no_ext]';
        const isBinary = BINARY_EXTENSIONS.has(ext);

        let sizeBytes = 0;
        let lines = 0;

        try {
          const stat = await fs.stat(fullPath);
          sizeBytes = stat.size;

          if (!isBinary && sizeBytes <= config.maxScanFileSizeKb * 1024) {
            const content = await fs.readFile(fullPath, 'utf-8');
            lines = content.split(/\r?\n/).length;
          }
        } catch {
          // ignore unreadable files
        }

        const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');

        const metric: FileMetric = {
          filePath: fullPath,
          relativePath,
          extension: ext,
          sizeBytes,
          lines,
          isBinary,
        };

        files.push(metric);

        if (!extensionStats[ext]) {
          extensionStats[ext] = { count: 0, lines: 0, sizeBytes: 0 };
        }
        extensionStats[ext].count += 1;
        extensionStats[ext].lines += lines;
        extensionStats[ext].sizeBytes += sizeBytes;
      }
    }
  }

  await walk(rootDir);

  const totalFiles = files.length;
  const totalSizeBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0);
  const totalLines = files.reduce((sum, f) => sum + f.lines, 0);

  return {
    rootDirectory: rootDir,
    totalFiles,
    totalSizeBytes,
    totalLines,
    extensionStats,
    files,
    scanDurationMs: Date.now() - startTime,
  };
}
