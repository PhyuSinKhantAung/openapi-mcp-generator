#!/usr/bin/env node

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

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
      case '--spec':
        options.spec = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--server-name':
        options.serverName = args[++i];
        break;
      case '--auth-env-var':
        options.authEnvVar = args[++i];
        break;
      case '--help':
        options.help = true;
        break;
      default:
        if (arg.startsWith('--')) {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        }
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
    console.error('Error: --spec is required');
    printUsage();
    process.exit(1);
  }
  
  if (!options.output) {
    console.error('Error: --output is required');
    printUsage();
    process.exit(1);
  }
  
  if (!existsSync(options.spec)) {
    console.error(`Error: OpenAPI spec file not found: ${options.spec}`);
    process.exit(1);
  }
}

function checkOpenApiGenerator() {
  try {
    execSync('openapi-generator-cli version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function installOpenApiGenerator() {
  console.log('Installing OpenAPI Generator CLI...');
  try {
    execSync('npm install -g @openapitools/openapi-generator-cli', { stdio: 'inherit' });
    console.log('OpenAPI Generator CLI installed successfully');
  } catch (error) {
    console.error('Failed to install OpenAPI Generator CLI:', error.message);
    console.error('Please install it manually: npm install -g @openapitools/openapi-generator-cli');
    process.exit(1);
  }
}

function generateServer(options) {
  const { spec, output, serverName = 'Generated MCP Server', authEnvVar = 'API_TOKEN' } = options;
  
  // Get templates directory relative to this script
  const templatesDir = resolve(__dirname, '..', 'templates');
  const configFile = resolve(__dirname, '..', 'openapi-generator-config.yaml');
  
  console.log(`Generating MCP server from ${spec}...`);
  console.log(`Output directory: ${output}`);
  console.log(`Templates directory: ${templatesDir}`);
  
  // Create output directory if it doesn't exist
  if (!existsSync(output)) {
    mkdirSync(output, { recursive: true });
  }
  
  // Generate additional properties for OpenAPI Generator
  const packageName = serverName.toLowerCase().replace(/\s+/g, '-');
  const additionalProperties = [
    `projectName=${packageName}`,
    `projectVersion=1.0.0`,
    `projectDescription=${serverName.replace(/"/g, '\\"')}`,
    `sourceFolder=src`
  ].join(',');
  
  try {
    // Run OpenAPI Generator with custom templates
    const command = [
      'openapi-generator-cli generate',
      `-i "${spec}"`,
      `-g javascript`,
      `-o "${output}"`,
      `-t "${templatesDir}"`,
      `--additional-properties="${additionalProperties}"`,
      '--skip-validate-spec'
    ].join(' ');
    
    console.log('Running OpenAPI Generator...');
    console.log('Command:', command);
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    
    // Post-process the generated files
    postProcessGenerated(output, options);
    
    console.log(`\\nMCP Server generated successfully in: ${output}`);
    console.log('\\nTo run the server:');
    console.log(`  cd ${output}`);
    console.log(`  npm install`);
    console.log(`  ${authEnvVar}=your_token npm start`);
    
  } catch (error) {
    console.error('Failed to generate MCP server:', error.message);
    process.exit(1);
  }
}

function postProcessGenerated(outputDir, options) {
  const { authEnvVar = 'API_TOKEN' } = options;
  
  // Create README.md
  const readmeContent = `# Generated MCP Server

This MCP server was generated from an OpenAPI specification.

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set your API token:
   \`\`\`bash
   export ${authEnvVar}=your_token_here
   \`\`\`

3. Run the server:
   \`\`\`bash
   npm start
   \`\`\`

## Usage

This server provides MCP tools for each endpoint defined in the OpenAPI specification.
Connect it to any MCP-compatible client to start using the API through natural language.

## Configuration

The server uses the following environment variables:
- \`${authEnvVar}\`: API authentication token

## Generated Files

- \`src/index.js\`: Main entry point
- \`src/server.js\`: MCP server setup
- \`src/tools/\`: Individual tool implementations for each API endpoint
- \`src/utils/auth.js\`: Authentication handling
- \`src/utils/response.js\`: Response formatting utilities
`;

  writeFileSync(join(outputDir, 'README.md'), readmeContent);
  
  // Create config directory
  const configDir = join(outputDir, 'config');
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
  
  // Create default config
  const defaultConfig = {
    server: {
      name: options.serverName || 'Generated MCP Server',
      version: '1.0.0'
    },
    auth: {
      envVar: authEnvVar
    }
  };
  
  writeFileSync(join(configDir, 'default.json'), JSON.stringify(defaultConfig, null, 2));
  
  console.log('Post-processing completed');
}

function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  
  validateOptions(options);
  
  // Check if OpenAPI Generator is installed
  if (!checkOpenApiGenerator()) {
    installOpenApiGenerator();
  }
  
  generateServer(options);
}

main();