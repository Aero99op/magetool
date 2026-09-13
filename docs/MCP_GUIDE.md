# Model Context Protocol (MCP) Integration Guide for MageTool

This guide provides step-by-step instructions for integrating MageTool's Model Context Protocol (MCP) server with AI coding assistants, including Claude Desktop, Cursor, Windsurf, and OpenAI Codex.

## Prerequisites

- Node.js >= 18.0.0
- MageTool repository cloned and built (`npm run build` in `/cli`)

## Claude Desktop Configuration

Add MageTool to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "magetool": {
      "command": "node",
      "args": [
        "/absolute/path/to/magetool/cli/bin/magetool.js",
        "serve"
      ]
    }
  }
}
```

## Cursor / Windsurf Configuration

Under your project or global settings (`settings.json`):

```json
{
  "mcp": {
    "servers": {
      "magetool": {
        "command": "node",
        "args": ["${workspaceFolder}/cli/bin/magetool.js", "serve"]
      }
    }
  }
}
```

## Available Tools

1. **`magetool_inspect_repo`**: Inspects lines of code, file counts, and language distribution.
2. **`magetool_audit_security`**: Detects credentials and security code smells.
3. **`magetool_pr_review`**: Automated review comments for diffs.
