import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

export class TemplateProcessor {
  async generateFiles(outputDir, context) {
    const {
      operations,
      authInfo,
      serverName,
      authEnvVar,
      packageName,
      baseUrl,
    } = context;

    // Create directory structure
    mkdirSync(join(outputDir, "src"), { recursive: true });
    mkdirSync(join(outputDir, "src", "tools"), { recursive: true });
    mkdirSync(join(outputDir, "src", "utils"), { recursive: true });
    mkdirSync(join(outputDir, "config"), { recursive: true });

    // Generate package.json
    this.generatePackageJson(outputDir, { packageName, serverName });

    // Generate source files
    this.generateIndexJs(outputDir);
    this.generateServerJs(outputDir, { packageName });
    this.generateUtilsFiles(outputDir, { authInfo, authEnvVar });
    this.generateToolFiles(outputDir, {
      operations,
      authInfo,
      authEnvVar,
      baseUrl,
    });
    this.generateConfig(outputDir, { serverName, authEnvVar });
    this.generateReadme(outputDir, {
      serverName,
      authEnvVar,
      operations,
      baseUrl,
    });
  }

  generatePackageJson(outputDir, { packageName, serverName }) {
    const packageJson = {
      name: packageName,
      version: "1.0.0",
      description: serverName,
      type: "module",
      bin: {
        [packageName]: "./src/index.js",
      },
      files: ["src", "config"],
      scripts: {
        start: "node src/index.js",
      },
      dependencies: {
        "@modelcontextprotocol/sdk": "^1.15.0",
        zod: "^3.22.4",
        "node-fetch": "^3.3.2",
      },
    };
    writeFileSync(
      join(outputDir, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );
  }

  generateIndexJs(outputDir) {
    const indexJs = `#!/usr/bin/env node

import "./server.js";
`;
    writeFileSync(join(outputDir, "src", "index.js"), indexJs);
  }

  generateServerJs(outputDir, { packageName }) {
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
    writeFileSync(join(outputDir, "src", "server.js"), serverJs);
  }

  generateUtilsFiles(outputDir, { authInfo, authEnvVar }) {
    // Generate response.js
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
    writeFileSync(join(outputDir, "src", "utils", "response.js"), responseJs);

    // Generate auth.js
    let authJs = "";
    if (authInfo.hasAuth) {
      if (authInfo.type === "bearer") {
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
      } else if (authInfo.type === "apiKey") {
        const headerName = authInfo.name || "Authorization";
        authJs = `export function getAuthConfig() {
  const token = process.env.${authEnvVar};
  if (!token) {
    return null;
  }
  return {
    type: 'apiKey',
    token: token
  };
}

export function getAuthHeaders() {
  const config = getAuthConfig();
  if (!config) {
    return {};
  }
  return {
    '${headerName}': config.token
  };
}
`;
      } else {
        authJs = `export function getAuthConfig() {
  const token = process.env.${authEnvVar};
  if (!token) {
    return null;
  }
  return {
    type: 'token',
    token: token
  };
}

export function getAuthHeaders() {
  const config = getAuthConfig();
  if (!config) {
    return {};
  }
  return {
    'Authorization': config.token
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
    writeFileSync(join(outputDir, "src", "utils", "auth.js"), authJs);
  }

  generateToolFiles(outputDir, { operations, authInfo, authEnvVar, baseUrl }) {
    // Generate individual tool files
    for (const operation of operations) {
      this.generateToolFile(
        outputDir,
        operation,
        authInfo,
        authEnvVar,
        baseUrl
      );
    }

    // Generate tools index
    const toolsIndex = `${operations
      .map((op) => `import ${op.operationId} from './${op.operationId}.js';`)
      .join("\n")}

export default [
  ${operations.map((op) => op.operationId).join(",\n  ")}
];
`;
    writeFileSync(join(outputDir, "src", "tools", "index.js"), toolsIndex);
  }

  generateToolFile(outputDir, operation, authInfo, authEnvVar, baseUrl) {
    const hasAuth = authInfo.hasAuth;
    const hasParams = operation.parameters.length > 0;
    const hasBody = !!operation.requestBody;

    // Build parameter schema
    const paramSchema = this.buildParameterSchema(operation.parameters);
    const bodySchema = hasBody ? "z.object({}).passthrough()" : null;

    // Extract path parameters for URL construction
    const pathParams = operation.parameters.filter((p) => p.in === "path");
    const queryParams = operation.parameters.filter((p) => p.in === "query");

    const toolContent = `import { z } from "zod";
import fetch from "node-fetch";
import { formatResponse } from "../utils/response.js";${
      hasAuth
        ? `
import { getAuthHeaders } from "../utils/auth.js";`
        : ""
    }

export default {
  name: "${operation.operationId}",
  schema: {
    title: "${operation.summary}",
    description: \`${operation.description || operation.summary}\`,
    ${
      hasParams || hasBody
        ? `
    inputSchema: ${this.buildInputSchema(paramSchema, bodySchema)},`
        : ""
    }
  },
  handler: async (${hasParams || hasBody ? "input" : ""}) => {
    try {${
      hasAuth
        ? `
      const authHeaders = getAuthHeaders();
      if (Object.keys(authHeaders).length === 0) {
        return formatResponse({
          type: "error",
          message: "${operation.operationId} failed: No authentication token provided (set ${authEnvVar} environment variable)"
        });
      }`
        : ""
    }
${
  hasParams
    ? `
      const { ${operation.parameters.map((p) => p.name).join(", ")} } = input;`
    : ""
}${
      hasBody
        ? `
      const requestBody = input.body || {};`
        : ""
    }

      // Construct URL with path parameters
      let url = \`\${process.env.API_BASE_URL || '${baseUrl}'}${
      operation.path
    }\`;
      ${
        pathParams.length > 0
          ? `
      // Replace path parameters
      ${pathParams
        .map(
          (p) =>
            `url = url.replace('{${p.name}}', encodeURIComponent(${p.name}));`
        )
        .join("\n      ")}`
          : ""
      }
      
      ${
        queryParams.length > 0
          ? `
      // Add query parameters
      const queryParams = new URLSearchParams();
      ${queryParams
        .map(
          (p) =>
            `if (${p.name} !== undefined) queryParams.append('${p.name}', ${p.name});`
        )
        .join("\n      ")}
      if (queryParams.toString()) {
        url += \`?\${queryParams.toString()}\`;
      }`
          : ""
      }

      // Make the API request
      const headers = {
        'Content-Type': 'application/json',${
          hasAuth
            ? `
        ...authHeaders,`
            : ""
        }
      };

      const requestOptions = {
        method: '${operation.method}',
        headers,
        ${
          hasBody
            ? `
        body: JSON.stringify(requestBody),`
            : ""
        }
      };

      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        return formatResponse({
          type: "error",
          message: \`${
            operation.operationId
          } failed: HTTP \${response.status} - \${response.statusText}\`,
          data: { error: errorText }
        });
      }

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      return formatResponse({
        message: "${operation.operationId} executed successfully",
        data: {
          operation: "${operation.operationId}",
          method: "${operation.method}",
          path: "${operation.path}",
          url: url,
          status: response.status,
          response: data${
            hasParams
              ? `,
          parameters: { ${operation.parameters.map((p) => p.name).join(", ")} }`
              : ""
          }${
      hasBody
        ? `,
          requestBody: requestBody`
        : ""
    }
        }
      });
    } catch (error) {
      console.error(error);
      return formatResponse({
        type: "error",
        message: \`${
          operation.operationId
        } failed: \${error.message || JSON.stringify(error)}\`
      });
    }
  },
};
`;

    writeFileSync(
      join(outputDir, "src", "tools", `${operation.operationId}.js`),
      toolContent
    );
  }

  buildParameterSchema(parameters) {
    if (!parameters || parameters.length === 0) {
      return null;
    }

    const schemaProperties = parameters.map((param) => {
      const type = this.getZodType(param.schema);
      const optional = !param.required ? ".optional()" : "";
      return `${param.name}: ${type}${optional}`;
    });

    return `z.object({ ${schemaProperties.join(", ")} })`;
  }

  buildInputSchema(paramSchema, bodySchema) {
    if (paramSchema && bodySchema) {
      return `${paramSchema}.extend({ body: ${bodySchema} })`;
    } else if (paramSchema) {
      return paramSchema;
    } else if (bodySchema) {
      return `z.object({ body: ${bodySchema} })`;
    }
    return "z.object({})";
  }

  getZodType(schema) {
    if (!schema) return "z.any()";

    switch (schema.type) {
      case "string":
        return "z.string()";
      case "number":
        return "z.number()";
      case "integer":
        return "z.number().int()";
      case "boolean":
        return "z.boolean()";
      case "array":
        return "z.array(z.any())";
      case "object":
        return "z.object({}).passthrough()";
      default:
        return "z.any()";
    }
  }

  generateConfig(outputDir, { serverName, authEnvVar }) {
    const defaultConfig = {
      server: {
        name: serverName,
        version: "1.0.0",
      },
      auth: {
        envVar: authEnvVar,
      },
    };
    writeFileSync(
      join(outputDir, "config", "default.json"),
      JSON.stringify(defaultConfig, null, 2)
    );
  }

  generateReadme(outputDir, { serverName, authEnvVar, operations, baseUrl }) {
    const readmeContent = `# ${serverName}

This MCP server was generated from an OpenAPI specification.

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set your API token and base URL:
   \`\`\`bash
   export ${authEnvVar}=your_token_here
   export API_BASE_URL=${baseUrl}
   \`\`\`

3. Run the server:
   \`\`\`bash
   npm start
   \`\`\`

## Usage

This server provides MCP tools for each endpoint defined in the OpenAPI specification:

${operations.map((op) => `- **${op.operationId}**: ${op.summary}`).join("\n")}

Connect it to any MCP-compatible client to start using the API through natural language.

## Configuration

The server uses the following environment variables:
- \`${authEnvVar}\`: API authentication token
- \`API_BASE_URL\`: Base URL for API requests (defaults to ${baseUrl})

## Generated Files

- \`src/index.js\`: Main entry point
- \`src/server.js\`: MCP server setup
- \`src/tools/\`: Individual tool implementations for each API endpoint
- \`src/utils/auth.js\`: Authentication handling
- \`src/utils/response.js\`: Response formatting utilities

## Next Steps

The generated tools are fully functional and will make actual API calls to your endpoints.
The implementation uses the native \`fetch\` API for HTTP requests and handles authentication automatically.
`;

    writeFileSync(join(outputDir, "README.md"), readmeContent);
  }
}
