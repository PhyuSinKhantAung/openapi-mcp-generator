#!/usr/bin/env node

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

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

function parseOpenApiSpec(specPath) {
  const content = readFileSync(specPath, 'utf8');
  
  try {
    // Try YAML first
    if (specPath.endsWith('.yaml') || specPath.endsWith('.yml')) {
      return yaml.load(content);
    } else {
      return JSON.parse(content);
    }
  } catch (error) {
    // If YAML fails, try JSON
    try {
      return JSON.parse(content);
    } catch (jsonError) {
      throw new Error(`Failed to parse OpenAPI spec: ${error.message}`);
    }
  }
}

function extractOperations(spec) {
  const operations = [];
  
  if (!spec.paths) {
    return operations;
  }
  
  for (const [path, pathItem] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
        const operationId = operation.operationId || `${method}${path.replace(/[^a-zA-Z0-9]/g, '')}`;
        const summary = operation.summary || `${method.toUpperCase()} ${path}`;
        const description = operation.description || operation.summary || `${method.toUpperCase()} request to ${path}`;
        
        // Extract parameters
        const parameters = [];
        if (operation.parameters) {
          for (const param of operation.parameters) {
            parameters.push({
              name: param.name,
              in: param.in,
              required: param.required || false,
              type: param.schema?.type || 'string',
              description: param.description || ''
            });
          }
        }
        
        // Extract request body parameters
        if (operation.requestBody) {
          const content = operation.requestBody.content;
          if (content && content['application/json'] && content['application/json'].schema) {
            const schema = content['application/json'].schema;
            if (schema.properties) {
              for (const [propName, propSchema] of Object.entries(schema.properties)) {
                parameters.push({
                  name: propName,
                  in: 'body',
                  required: schema.required?.includes(propName) || false,
                  type: propSchema.type || 'string',
                  description: propSchema.description || ''
                });
              }
            }
          }
        }
        
        operations.push({
          operationId,
          method: method.toUpperCase(),
          path,
          summary,
          description,
          parameters
        });
      }
    }
  }
  
  return operations;
}

function extractAuthInfo(spec) {
  const authInfo = {
    hasAuth: false,
    type: 'none',
    envVar: 'API_TOKEN'
  };
  
  if (spec.components?.securitySchemes) {
    const schemes = Object.values(spec.components.securitySchemes);
    if (schemes.length > 0) {
      const scheme = schemes[0]; // Use first scheme for simplicity
      authInfo.hasAuth = true;
      
      if (scheme.type === 'http' && scheme.scheme === 'bearer') {
        authInfo.type = 'bearer';
      } else if (scheme.type === 'apiKey') {
        authInfo.type = 'apiKey';
        authInfo.keyName = scheme.name;
        authInfo.keyLocation = scheme.in;
      } else if (scheme.type === 'http' && scheme.scheme === 'basic') {
        authInfo.type = 'basic';
      }
    }
  }
  
  return authInfo;
}

function generateFiles(outputDir, operations, authInfo, options) {
  const { serverName = 'Generated MCP Server', authEnvVar = 'API_TOKEN' } = options;
  const packageName = serverName.toLowerCase().replace(/\s+/g, '-');
  
  // Create directory structure
  mkdirSync(join(outputDir, 'src'), { recursive: true });
  mkdirSync(join(outputDir, 'src', 'tools'), { recursive: true });
  mkdirSync(join(outputDir, 'src', 'utils'), { recursive: true });
  mkdirSync(join(outputDir, 'config'), { recursive: true });
  
  // Generate package.json
  const packageJson = {
    name: packageName,
    version: '1.0.0',
    description: serverName,
    type: 'module',
    bin: {
      [packageName]: './src/index.js'
    },
    files: ['src', 'config'],
    scripts: {
      start: 'node src/index.js'
    },
    dependencies: {
      '@modelcontextprotocol/sdk': '^1.15.0',
      'zod': '^3.22.4'
    }
  };
  writeFileSync(join(outputDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  
  // Generate src/index.js
  const indexJs = `#!/usr/bin/env node

import "./server.js";
`;
  writeFileSync(join(outputDir, 'src', 'index.js'), indexJs);
  
  // Generate src/server.js
  const serverJs = `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import tools from "./tools/index.js";

const server = new McpServer({ name: "${packageName}", version: "1.0.0" });

for (const tool of tools) {
  server.registerTool(tool.name, tool.schema, tool.handler);
}

const transport = new StdioServerTransport();
await server.connect(transport);
`;
  writeFileSync(join(outputDir, 'src', 'server.js'), serverJs);
  
  // Generate src/utils/response.js
  const responseJs = `export function formatResponse({ type = "success", message, data }) {
  return {
    content: [
      {
        type: "text",
        text:
          \`[\${type.toUpperCase()}] \${message}\` +
          (data ? \`\\n\${JSON.stringify(data, null, 2)}\` : ""),
      },
    ],
  };
}
`;
  writeFileSync(join(outputDir, 'src', 'utils', 'response.js'), responseJs);
  
  // Generate src/utils/auth.js
  let authJs = '';
  if (authInfo.hasAuth) {
    if (authInfo.type === 'bearer') {
      authJs = `export function getAuthConfig() {
  const token = process.env.${authEnvVar};
  if (!token) {
    return null;
  }
  return {
    type: 'bearer',
    token: token
  };
}

export function getAuthHeaders() {
  const config = getAuthConfig();
  if (!config) {
    return {};
  }
  return {
    'Authorization': \`Bearer \${config.token}\`
  };
}
`;
    } else if (authInfo.type === 'apiKey') {
      authJs = `export function getAuthConfig() {
  const apiKey = process.env.${authEnvVar};
  if (!apiKey) {
    return null;
  }
  return {
    type: 'apiKey',
    key: apiKey,
    name: '${authInfo.keyName}',
    location: '${authInfo.keyLocation}'
  };
}

export function getAuthHeaders() {
  const config = getAuthConfig();
  if (!config || config.location !== 'header') {
    return {};
  }
  return {
    [config.name]: config.key
  };
}

export function getAuthQuery() {
  const config = getAuthConfig();
  if (!config || config.location !== 'query') {
    return {};
  }
  return {
    [config.name]: config.key
  };
}
`;
    }
  } else {
    authJs = `export function getAuthConfig() {
  return null;
}

export function getAuthHeaders() {
  return {};
}
`;
  }
  writeFileSync(join(outputDir, 'src', 'utils', 'auth.js'), authJs);
  
  // Generate tool files
  const toolImports = [];
  for (const operation of operations) {
    const toolName = operation.operationId;
    toolImports.push(`import ${toolName} from "./${toolName}.js";`);
    
    // Generate parameter schema
    const paramSchema = [];
    const paramNames = [];
    for (const param of operation.parameters) {
      paramNames.push(param.name);
      let zodType = 'z.string()';
      if (param.type === 'number' || param.type === 'integer') {
        zodType = 'z.number()';
      } else if (param.type === 'boolean') {
        zodType = 'z.boolean()';
      }
      
      if (!param.required) {
        zodType += '.optional()';
      }
      
      paramSchema.push(`      ${param.name}: ${zodType}`);
    }
    
    const hasParams = paramSchema.length > 0;
    
    const toolJs = `import { z } from "zod";
import { formatResponse } from "../utils/response.js";
import { getAuthConfig, getAuthHeaders${authInfo.type === 'apiKey' ? ', getAuthQuery' : ''} } from "../utils/auth.js";

export default {
  name: "${toolName}",
  schema: {
    title: "${operation.summary}",
    description: "${operation.description}",${hasParams ? `
    inputSchema: {
${paramSchema.join(',\n')}
    },` : ''}
  },
  handler: async (${hasParams ? `{ ${paramNames.join(', ')} }` : ''}) => {
    try {
      const authConfig = getAuthConfig();
      if (!authConfig) {
        return formatResponse({
          type: "error",
          message: "${operation.operationId} failed: No authentication provided (set ${authEnvVar} environment variable)",
        });
      }

      // TODO: Implement actual API call to ${operation.method} ${operation.path}
      // You'll need to add an HTTP client library and implement the actual API calls
      
      return formatResponse({
        message: "${operation.operationId} would be executed with parameters: ${paramNames.join(', ')}",
        data: { 
          method: "${operation.method}",
          path: "${operation.path}",
          ${hasParams ? `parameters: { ${paramNames.join(', ')} }` : 'parameters: {}'}
        }
      });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: \`${operation.operationId} failed: \${error.message || JSON.stringify(error)}\`,
      });
    }
  },
};
`;
    writeFileSync(join(outputDir, 'src', 'tools', `${toolName}.js`), toolJs);
  }
  
  // Generate src/tools/index.js
  const toolsIndexJs = `${toolImports.join('\n')}

export default [
${operations.map(op => `  ${op.operationId}`).join(',\n')}
];
`;
  writeFileSync(join(outputDir, 'src', 'tools', 'index.js'), toolsIndexJs);
  
  // Generate config/default.json
  const defaultConfig = {
    server: {
      name: serverName,
      version: '1.0.0'
    },
    auth: {
      envVar: authEnvVar
    }
  };
  writeFileSync(join(outputDir, 'config', 'default.json'), JSON.stringify(defaultConfig, null, 2));
  
  // Generate README.md
  const readmeContent = `# ${serverName}

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

This server provides MCP tools for each endpoint defined in the OpenAPI specification:

${operations.map(op => `- **${op.operationId}**: ${op.summary}`).join('\n')}

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

## Next Steps

The generated tools contain TODO comments where you need to implement the actual API calls.
You may want to add an HTTP client library like \`axios\` or \`node-fetch\` to make the API requests.
`;

  writeFileSync(join(outputDir, 'README.md'), readmeContent);
}

function generateServer(options) {
  const { spec, output, serverName = 'Generated MCP Server', authEnvVar = 'API_TOKEN' } = options;
  
  console.log(`Generating MCP server from ${spec}...`);
  console.log(`Output directory: ${output}`);
  
  try {
    // Parse OpenAPI spec
    const apiSpec = parseOpenApiSpec(spec);
    
    // Extract operations
    const operations = extractOperations(apiSpec);
    console.log(`Found ${operations.length} API operations`);
    
    // Extract auth info
    const authInfo = extractAuthInfo(apiSpec);
    console.log(`Authentication: ${authInfo.hasAuth ? authInfo.type : 'none'}`);
    
    // Generate files
    generateFiles(output, operations, authInfo, options);
    
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

function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  
  validateOptions(options);
  generateServer(options);
}

main();