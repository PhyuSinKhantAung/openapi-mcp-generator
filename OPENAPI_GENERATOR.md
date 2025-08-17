# OpenAPI to MCP Server Generator

This repository now includes a powerful tool to generate MCP (Model Context Protocol) stdio servers from OpenAPI specifications.

## Overview

The generator creates fully functional MCP servers that follow the same patterns as the existing Build.io server in this repository. Each API endpoint becomes an MCP tool that can be used through natural language interaction.

## Installation

```bash
npm install
```

## Usage

```bash
openapi-mcp-generate \
  --spec <openapi-spec-file> \
  --output <output-directory> \
  --server-name "<server-name>" \
  --auth-env-var "<auth-env-variable>"
```

### Options

- `--spec`: Path to OpenAPI specification file (YAML or JSON)
- `--output`: Directory where the MCP server will be generated
- `--server-name`: Human-readable name for the generated server
- `--auth-env-var`: Environment variable name for authentication token

### Examples

#### Basic API with Bearer Token
```bash
openapi-mcp-generate \
  --spec api-spec.yaml \
  --output ./my-mcp-server \
  --server-name "My API MCP Server" \
  --auth-env-var "API_TOKEN"
```

#### Build.io-style API
```bash
openapi-mcp-generate \
  --spec build-io-example.yaml \
  --output ./build-io-server \
  --server-name "Build.io MCP Server" \
  --auth-env-var "BUILD_IO_TOKEN"
```

## Generated Server Structure

```
generated-server/
├── package.json              # NPM package configuration
├── README.md                 # Generated documentation
├── src/
│   ├── index.js              # Main entry point
│   ├── server.js             # MCP server setup
│   ├── tools/                # Tool implementations
│   │   ├── index.js          # Tool registry
│   │   ├── operationId1.js   # Individual tool files
│   │   └── operationId2.js   # One per API endpoint
│   └── utils/
│       ├── auth.js           # Authentication logic
│       └── response.js       # Response formatting
└── config/
    └── default.json          # Configuration file
```

## Authentication Support

The generator supports multiple authentication methods based on the OpenAPI security schemes:

### Bearer Token Authentication
```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

### API Key Authentication
```yaml
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header  # or query
      name: Authorization
```

### Basic Authentication
```yaml
components:
  securitySchemes:
    BasicAuth:
      type: http
      scheme: basic
```

## Generated Tool Features

Each API endpoint becomes an MCP tool with:

- **Automatic Parameter Validation**: Uses Zod schemas based on OpenAPI parameter definitions
- **Authentication Handling**: Automatically includes required authentication headers/parameters
- **Error Handling**: Standardized error responses
- **Request Body Support**: Handles POST/PUT request bodies
- **Documentation**: Includes descriptions from OpenAPI spec

## Running Generated Servers

1. Navigate to the generated server directory:
   ```bash
   cd my-generated-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set authentication token:
   ```bash
   export API_TOKEN=your_token_here
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Customization

The generated servers are templates that need API implementation. Each tool contains TODO comments indicating where to add actual API calls:

```javascript
// TODO: Implement actual API call to GET /users
// You'll need to add an HTTP client library and implement the actual API calls
```

### Adding HTTP Client

To implement actual API calls, add an HTTP client library:

```bash
npm install axios
# or
npm install node-fetch
```

Then implement the API calls in each tool file.

## Example OpenAPI Specifications

The repository includes example specifications:

- `example-api.yaml`: Simple API with Bearer authentication
- `build-io-example.yaml`: Build.io-style API with API Key authentication

## Generated vs Hand-written Comparison

| Feature | Generated Server | Hand-written (Build.io) |
|---------|------------------|-------------------------|
| Tool Structure | ✅ Same pattern | ✅ Reference implementation |
| Authentication | ✅ Auto-generated | ✅ Custom implementation |
| Parameter Validation | ✅ Zod schemas | ✅ Zod schemas |
| Error Handling | ✅ Standardized | ✅ Standardized |
| Response Formatting | ✅ Same utility | ✅ Same utility |
| API Implementation | ⚠️ TODO stubs | ✅ Full implementation |

## Limitations

1. **API Implementation**: Generated tools contain stubs - actual API calls need to be implemented
2. **Complex Authentication**: Only supports basic auth schemes from OpenAPI spec
3. **Schema References**: Complex schema references are simplified to generic objects
4. **Custom Logic**: Business logic beyond basic CRUD operations needs manual implementation

## Next Steps After Generation

1. Add HTTP client library (axios, node-fetch, etc.)
2. Implement actual API calls in tool handlers
3. Test with real API endpoints
4. Add custom business logic if needed
5. Update documentation

The generated server provides a solid foundation that follows MCP best practices and can be customized for specific API requirements.