#!/usr/bin/env node

import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { OpenApiMcpGenerator } from "../lib/generator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function printUsage() {
  console.log(`
Usage: openapi-mcp-generate [options]

Options:
  --spec <file>         OpenAPI specification file (required)
  --output <dir>        Output directory (required)  
  --server-name <name>  MCP server name (optional)
  --auth-env-var <var>  Environment variable for auth token (optional)
  --help               Show this help message

Example:
  openapi-mcp-generate \\
    --spec api-spec.yaml \\
    --output ./my-mcp-server \\
    --server-name "My MCP Server" \\
    --auth-env-var "API_TOKEN"
`);
}

function parseArgs(args) {
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--spec":
        options.spec = args[++i];
        break;
      case "--output":
        options.output = args[++i];
        break;
      case "--server-name":
        options.serverName = args[++i];
        break;
      case "--auth-env-var":
        options.authEnvVar = args[++i];
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        process.exit(1);
    }
  }

  return options;
}

function validateOptions(options) {
  if (options.help) {
    printUsage();
    process.exit(0);
  }

  if (!options.spec) {
    console.error("Error: --spec is required");
    printUsage();
    process.exit(1);
  }

  if (!options.output) {
    console.error("Error: --output is required");
    printUsage();
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  validateOptions(options);

  try {
    const generator = new OpenApiMcpGenerator();
    await generator.generateServer(
      resolve(options.spec),
      resolve(options.output),
      {
        serverName: options.serverName,
        authEnvVar: options.authEnvVar,
      }
    );
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);
