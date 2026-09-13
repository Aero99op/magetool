# Contributing to MageTool

Thank you for contributing to MageTool! We welcome bug reports, improvements to existing media converters, and extensions to our AI Agent MCP tooling.

## Development Guidelines

1. **Web Platform (`/frontend`)**:
   - Built with Next.js (App Router), Tailwind CSS, and WebAssembly.
   - Client-side processing should remain serverless and light on bandwidth.

2. **AI CLI & MCP (`/cli`)**:
   - Pure TypeScript with strict type checking (`npm run build`).
   - All tools and scanners must be backed by unit tests (`npm test`).

## Workflow

1. Fork the repository.
2. Create your feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: description of feature'`
4. Ensure tests pass: `cd cli && npm test`
5. Submit a Pull Request.
