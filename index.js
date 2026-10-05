"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@modelcontextprotocol/server");
const stdio_1 = require("@modelcontextprotocol/server/stdio");
const zod_1 = require("zod");
// 1. Initialize the server
const server = new server_1.McpServer({
    name: "alexa-mcp-server",
    version: "1.0.0"
});
server.tool("hello_world", "Returns a simple greeting to verify the MCP server is working", {
    name: zod_1.z.string().describe("The name of the user to greet")
}, async ({ name }) => {
    return {
        content: [{ type: "text", text: `Hello, ${name}! The Alexa+ MCP server is operational.` }]
    };
});
async function main() {
    const transport = new stdio_1.StdioServerTransport();
    await server.connect(transport);
    console.error("Alexa+ MCP Server running on stdio"); // Logging to stderr so we don't mess up stdout transport
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map