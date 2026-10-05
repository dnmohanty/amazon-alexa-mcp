import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import process from "node:process";

const server = new McpServer({
  name: "alexa-mcp-server",
  version: "1.0.0"
});

server.tool(
  "hello_world",
  "Returns a simple greeting to verify the MCP server is working",
  {
    name: z.string().describe("The name of the user to greet")
  },
  async ({ name }: { name: string }) => {
    return {
      content: [{ type: "text", text: `Hello, ${name}! The Alexa+ MCP server is operational.` }]
    };
  }
);


async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Alexa+ MCP Server running on stdio"); 
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});