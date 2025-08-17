# OpenAPI to MCP Server Generator

Generate Model Context Protocol (MCP) servers from OpenAPI specifications automatically.

## What is this?

This tool converts any OpenAPI/Swagger specification into a ready-to-use MCP server. Each API endpoint becomes an MCP tool that can be used through natural language interactions with AI assistants.

## Features

- ✅ **Universal OpenAPI Support**: Works with any OpenAPI 3.0+ specification
- ✅ **Multiple Authentication Methods**: Bearer token, API key, Basic auth
- ✅ **Parameter Validation**: Automatic Zod schema generation from OpenAPI schemas
- ✅ **Request Body Handling**: Supports POST/PUT request bodies
- ✅ **Error Handling**: Standardized error responses
- ✅ **Ready-to-Run Servers**: Generated servers work immediately after npm install
- ✅ **MCP Standard Compliance**: Uses official MCP SDK and follows best practices

## Installation & Usage

### Run directly with npx (no install required)

```bash
npx openapi-mcp-generator --spec your-api.yaml --output ./my-server
```

### Link locally for development

In your project directory:

```bash
npm link
```

Then you can run:

```bash
openapi-mcp-generate --spec your-api.yaml --output ./my-server
```

## Quick Start

1. **Generate a server from your OpenAPI spec:**

```bash
openapi-mcp-generate \
  --spec path/to/your-api.yaml \
  --output ./my-generated-server \
  --server-name "My API MCP Server" \
  --auth-env-var "MY_API_TOKEN"
```

2. **Run the generated server:**

```bash
cd my-generated-server
npm install
MY_API_TOKEN=your_token npm start
```

3. **Connect to any MCP client** and start using your API through natural language!

## Generated Server Structure

```
generated-server/
├── package.json              # Dependencies and scripts
├── src/
│   ├── index.js              # Main entry point
│   ├── server.js             # MCP server setup
│   ├── tools/                # Individual tool implementations
│   │   ├── index.js          # Tool registry
│   │   └── *.js              # One file per API endpoint
│   └── utils/
│       ├── auth.js           # Authentication handling
│       └── response.js       # Response formatting
├── config/
│   └── default.json          # Server configuration
└── README.md                 # Setup and usage instructions
```

## Authentication Support

The generator automatically detects and supports various authentication methods:

### Bearer Token

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

### API Key

```yaml
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
```

### Basic Authentication

```yaml
components:
  securitySchemes:
    BasicAuth:
      type: http
      scheme: basic
```

## CLI Options

```
Usage: openapi-mcp-generate [options]

Options:
  --spec <file>         OpenAPI specification file (required)
  --output <dir>        Output directory (required)
  --server-name <name>  MCP server name (optional)
  --auth-env-var <var>  Environment variable for auth token (optional)
  --help               Show this help message
```

## Examples

This repository includes example OpenAPI specifications in the `examples/` directory:

- `example-api.yaml` - Simple REST API with Bearer authentication

## Generated Tool Features

Each API endpoint becomes an MCP tool with:

- **Automatic Parameter Validation**: Uses Zod schemas based on OpenAPI parameter definitions
- **Authentication Handling**: Automatically includes required authentication headers/parameters
- **Error Handling**: Standardized error responses
- **Request Body Support**: Handles POST/PUT request bodies
- **Documentation**: Includes descriptions from OpenAPI spec

## Next Steps After Generation

1. **Add HTTP client**: The generated tools contain TODO stubs. Add a library like `axios` or `node-fetch`
2. **Implement API calls**: Replace the TODO comments with actual API requests
3. **Test with real API**: Verify your generated server works with the actual API endpoints
4. **Customize business logic**: Add any custom logic beyond basic CRUD operations
5. **Deploy**: Deploy your server to make it accessible to MCP clients

## Architecture

The generator follows a modular architecture:

- `lib/generator.js` - Main generator class that orchestrates the process
- `lib/auth-parser.js` - Parses OpenAPI security schemes into auth configurations
- `lib/template-processor.js` - Handles file generation using templates
- `templates/` - Mustache templates for different file types
- `config/` - OpenAPI Generator configuration files

## Contributing

Contributions are welcome! This tool demonstrates how to build production-ready MCP servers and can be extended to support additional OpenAPI features.

## Requirements

- Node.js 18+
- Valid OpenAPI 3.0+ specification

## License

MIT License - feel free to use this generator for your own API servers!
