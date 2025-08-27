import { readFileSync } from "fs";
import yaml from "js-yaml";
import { parseAuthInfo } from "./auth-parser.js";
import { TemplateProcessor } from "./template-processor.js";

export class OpenApiMcpGenerator {
  constructor() {
    this.templateProcessor = new TemplateProcessor();
  }

  async generateServer(specPath, outputDir, options = {}) {
    const { serverName = "Generated MCP Server", authEnvVar = "API_TOKEN" } =
      options;

    // Load and parse OpenAPI spec
    const spec = this.loadSpec(specPath);
    const operations = this.extractOperations(spec);
    const authInfo = parseAuthInfo(spec);
    const baseUrl = this.extractBaseUrl(spec);

    console.log(`Generating MCP server from ${specPath}...`);
    console.log(`Output directory: ${outputDir}`);
    console.log(`Found ${operations.length} API operations`);
    console.log(`Authentication: ${authInfo.type || "none"}`);
    console.log(`Base URL: ${baseUrl}`);

    // Generate files using templates
    await this.templateProcessor.generateFiles(outputDir, {
      operations,
      authInfo,
      serverName,
      authEnvVar,
      packageName: serverName.toLowerCase().replace(/\s+/g, "-"),
      baseUrl,
    });

    console.log(`\nMCP Server generated successfully in: ${outputDir}`);
    console.log(`\nTo run the server:`);
    console.log(`  cd ${outputDir}`);
    console.log(`  npm install`);
    console.log(`  npm start -- --token your_token --base-url ${baseUrl}`);
  }

  loadSpec(specPath) {
    try {
      const content = readFileSync(specPath, "utf8");

      if (specPath.endsWith(".json")) {
        return JSON.parse(content);
      } else {
        return yaml.load(content);
      }
    } catch (error) {
      throw new Error(`Failed to load OpenAPI spec: ${error.message}`);
    }
  }

  extractOperations(spec) {
    const operations = [];

    if (!spec.paths) {
      throw new Error("No paths found in OpenAPI specification");
    }

    for (const [path, pathItem] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (
          ["get", "post", "put", "patch", "delete", "head", "options"].includes(
            method
          )
        ) {
          const operationId =
            operation.operationId ||
            `${method}${path.replace(/[^a-zA-Z0-9]/g, "")}`;

          operations.push({
            operationId,
            method: method.toUpperCase(),
            path,
            summary: operation.summary || `${method.toUpperCase()} ${path}`,
            description: operation.description || "",
            parameters: operation.parameters || [],
            requestBody: operation.requestBody,
            responses: operation.responses || {},
            security: operation.security || spec.security || [],
          });
        }
      }
    }

    return operations;
  }

  extractBaseUrl(spec) {
    if (spec.servers && spec.servers.length > 0) {
      return spec.servers[0].url;
    }
    return "http://localhost:3000"; // Default if no servers are defined
  }
}
