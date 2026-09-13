import readline from 'readline';
import { MCP_TOOLS, executeTool } from './tools.js';
import { MageConfig } from '../utils/config.js';

interface JSONRPCRequest {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: any;
}

interface JSONRPCResponse {
  jsonrpc: '2.0';
  id?: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export function startMCPServer(config: MageConfig, cwd: string): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  const sendResponse = (resp: JSONRPCResponse) => {
    process.stdout.write(JSON.stringify(resp) + '\n');
  };

  rl.on('line', async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let req: JSONRPCRequest;
    try {
      req = JSON.parse(trimmed);
    } catch {
      sendResponse({
        jsonrpc: '2.0',
        error: { code: -32700, message: 'Parse error' },
      });
      return;
    }

    try {
      switch (req.method) {
        case 'initialize': {
          sendResponse({
            jsonrpc: '2.0',
            id: req.id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {},
              },
              serverInfo: {
                name: config.mcp.name,
                version: config.mcp.version,
              },
            },
          });
          break;
        }

        case 'tools/list': {
          sendResponse({
            jsonrpc: '2.0',
            id: req.id,
            result: {
              tools: MCP_TOOLS,
            },
          });
          break;
        }

        case 'tools/call': {
          const { name, arguments: args } = req.params || {};
          const output = await executeTool(name, args || {}, config, cwd);
          sendResponse({
            jsonrpc: '2.0',
            id: req.id,
            result: {
              content: [
                {
                  type: 'text',
                  text: typeof output === 'string' ? output : JSON.stringify(output, null, 2),
                },
              ],
            },
          });
          break;
        }

        case 'ping': {
          sendResponse({
            jsonrpc: '2.0',
            id: req.id,
            result: {},
          });
          break;
        }

        default: {
          sendResponse({
            jsonrpc: '2.0',
            id: req.id,
            error: { code: -32601, message: `Method not found: ${req.method}` },
          });
          break;
        }
      }
    } catch (err: any) {
      sendResponse({
        jsonrpc: '2.0',
        id: req.id,
        error: { code: -32000, message: err.message || 'Internal error' },
      });
    }
  });
}
