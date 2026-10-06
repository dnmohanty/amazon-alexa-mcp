import process from "node:process";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "alexa-llvm-mcp-server",
  version: "1.0.0"
});

server.tool(
  "get_llvm_commits",
  "Fetches the latest LLVM compiler commits for a specific author to summarize optimization patches.",
  {
    author: z.string().describe("The GitHub username of the author (e.g., 'dnmohanty')"),
    limit: z.number().min(1).max(10).default(3).describe("Number of commits to return")
  },
  async ({ author, limit }) => {
    try {
      const response = await fetch(`https://api.github.com/repos/llvm/llvm-project/commits?author=${author}&per_page=${limit}`);
      
      if (!response.ok) {
        return { content: [{ type: "text", text: `API Error: ${response.statusText}` }] };
      }

      const commits = await response.json();
      
      if (commits.length === 0) {
        return { content: [{ type: "text", text: `No recent LLVM commits found for author ${author}.` }] };
      }

      const summary = commits.map((c: any) => {
        const message = c.commit.message.split('\n')[0]; // Grab just the title of the commit
        return `- [${c.sha.substring(0, 7)}] ${message} (Date: ${c.commit.author.date})`;
      }).join('\n');

      return {
        content: [{ type: "text", text: `Here are the latest LLVM commits for ${author}:\n${summary}` }]
      };
    } catch (error: any) {
      return { content: [{ type: "text", text: `Failed to fetch commits: ${error.message}` }] };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("LLVM MCP Server running on stdio. Waiting for Alexa requests..."); 
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});