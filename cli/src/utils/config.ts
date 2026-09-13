import { promises as fs } from 'fs';
import path from 'path';

export interface MageConfig {
  version: string;
  ignorePatterns: string[];
  securityThreshold: 'low' | 'medium' | 'high' | 'critical';
  maxScanFileSizeKb: number;
  mcp: {
    enabled: boolean;
    name: string;
    version: string;
  };
}

export const DEFAULT_CONFIG: MageConfig = {
  version: '1.0.0',
  ignorePatterns: [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.next',
    '.turbo',
    'vendor',
    'target',
    '.venv',
  ],
  securityThreshold: 'medium',
  maxScanFileSizeKb: 1024, // 1MB
  mcp: {
    enabled: true,
    name: 'magetool-mcp',
    version: '1.0.0',
  },
};

export async function loadConfig(cwd: string): Promise<MageConfig> {
  const configPath = path.join(cwd, '.magetool.json');
  try {
    const raw = await fs.readFile(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function initConfig(cwd: string): Promise<string> {
  const configPath = path.join(cwd, '.magetool.json');
  await fs.writeFile(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
  return configPath;
}
