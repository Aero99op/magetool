/**
 * Terminal styling and formatting utilities with zero external dependencies.
 */

export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
};

export function style(text: string | number, ...styles: string[]): string {
  return `${styles.join('')}${text}${colors.reset}`;
}

export function createBanner(title: string, subtitle?: string): string {
  const line = '━'.repeat(54);
  const out = [
    style(`┏${line}┓`, colors.magenta),
    style(`┃  ✨ ${title.padEnd(48)}┃`, colors.bold, colors.magenta),
  ];
  if (subtitle) {
    out.push(style(`┃  ${subtitle.padEnd(52)}┃`, colors.dim, colors.cyan));
  }
  out.push(style(`┗${line}┛`, colors.magenta));
  return out.join('\n');
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function drawTable(headers: string[], rows: (string | number)[][]): string {
  const colWidths = headers.map((h, i) => {
    const maxRow = rows.reduce((max, row) => Math.max(max, String(row[i] ?? '').length), 0);
    return Math.max(h.length, maxRow);
  });

  const sep = colWidths.map((w) => '─'.repeat(w + 2)).join('┼');
  const top = colWidths.map((w) => '─'.repeat(w + 2)).join('┬');
  const bottom = colWidths.map((w) => '─'.repeat(w + 2)).join('┴');

  const headerStr = headers
    .map((h, i) => ` ${style(h.padEnd(colWidths[i]), colors.bold, colors.cyan)} `)
    .join('│');

  const rowStrs = rows.map((r) =>
    r
      .map((cell, i) => ` ${String(cell).padEnd(colWidths[i])} `)
      .join('│')
  );

  return [
    `┌${top}┐`,
    `│${headerStr}│`,
    `├${sep}┤`,
    ...rowStrs.map((r) => `│${r}│`),
    `└${bottom}┘`,
  ].join('\n');
}
