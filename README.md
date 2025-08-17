# MCP Server with OpenAPI Generator

This repository contains a Model Context Protocol (MCP) server for the Build.io API, along with a powerful tool to generate MCP servers from any OpenAPI specification.

## Features

### 1. Build.io MCP Server
A complete MCP server implementation for the Build.io API that demonstrates best practices for:
- Tool registration and handler implementation
- Authentication with Bearer tokens
- Parameter validation using Zod
- Standardized error handling and response formatting

### 2. OpenAPI to MCP Generator 🚀
A CLI tool that automatically generates MCP servers from OpenAPI/Swagger specifications.

```bash
openapi-mcp-generate \
  --spec your-api.yaml \
  --output ./generated-server \
  --server-name "Your API MCP Server" \
  --auth-env-var "YOUR_API_TOKEN"
```

**Supports:**
- ✅ Bearer token authentication
- ✅ API key authentication (header/query)  
- ✅ Basic authentication
- ✅ Parameter validation with Zod
- ✅ Request body handling
- ✅ Auto-generated documentation
- ✅ Ready-to-run server structure

## Quick Start

### Using the Build.io Server

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run with your Build.io token:
   ```bash
   BUILD_IO_TOKEN=your_token npm start
   ```

### Generating a New MCP Server

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate a server from your OpenAPI spec:
   ```bash
   npx openapi-mcp-generate \
     --spec path/to/your-api.yaml \
     --output ./my-generated-server \
     --server-name "My API MCP Server" \
     --auth-env-var "MY_API_TOKEN"
   ```

3. Run your generated server:
   ```bash
   cd my-generated-server
   npm install
   MY_API_TOKEN=your_token npm start
   ```

## Tools Included

### Build.io Server Tools
- `whoAmI` - Get current user information
- `getTeams` - List teams for current user
- `createApp` - Create new apps
- `buildRequest` - Trigger builds
- `getApps`, `configVars`, `namespaces` - And many more!

### Generated Server Tools
Each API endpoint in your OpenAPI spec becomes an MCP tool with:
- Automatic parameter validation
- Authentication handling
- Error handling
- Documentation from API spec

## Documentation

- **[OpenAPI Generator Guide](./OPENAPI_GENERATOR.md)** - Complete guide to using the generator
- **[Example APIs](./example-api.yaml)** - Sample OpenAPI specifications
- **[Build.io Example](./build-io-example.yaml)** - Build.io-style API spec

## Architecture

The servers follow a consistent pattern:

```
src/
├── index.js           # Main entry point
├── server.js          # MCP server setup
├── tools/             # Individual tool implementations
│   ├── index.js       # Tool registry
│   └── *.js           # One file per tool
└── utils/
    ├── auth.js        # Authentication logic
    └── response.js    # Response formatting
```

Each tool exports:
- `name`: Tool identifier
- `schema`: Input validation schema
- `handler`: Implementation function

## Examples

### Generated Server Structure
```javascript
// Generated tool example
export default {
  name: "getUsers",
  schema: {
    title: "Get Users",
    description: "Retrieve a list of users",
    inputSchema: {
      limit: z.number().optional()
    },
  },
  handler: async ({ limit }) => {
    // Auto-generated authentication
    const authConfig = getAuthConfig();
    
    // TODO: Implement API call
    return formatResponse({
      message: "Users retrieved successfully",
      data: users
    });
  },
};
```

### Authentication Examples
```javascript
// Bearer Token
export EXAMPLE_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// API Key  
export BUILD_IO_TOKEN=your_api_key_here

// Basic Auth (uses USERNAME and PASSWORD)
export API_USERNAME=user
export API_PASSWORD=pass
```

## Contributing

This repository demonstrates how to:
1. Build production-ready MCP servers
2. Handle authentication and validation
3. Structure tools for maintainability
4. Generate servers automatically from API specs

Feel free to use the patterns and generator for your own APIs!

## Requirements

- Node.js 18+
- npm or yarn
- Valid OpenAPI 3.0+ specification (for generator)

## License

MIT License - feel free to use this code for your own MCP servers!