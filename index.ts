import process from "node:process";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import * as dotenv from "dotenv";

dotenv.config();

const server = new McpServer({
  name: "alexa-llvm-mcp-server",
  version: "1.0.0"
});

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
  }
});

server.tool(
  "get_llvm_commits",
  "Fetches the latest LLVM compiler commits for a specific author and returns a natural voice summary.",
  {
    author: z.string().describe("The GitHub username of the author (e.g., 'dnmohanty')"),
    limit: z.number().min(1).max(10).default(3).describe("Number of commits to return")
  },
  async ({ author, limit }) => {
    try {
      const response = await fetch(`https://api.github.com/search/commits?q=repo:llvm/llvm-project+author:${author}&sort=author-date&order=desc&per_page=${limit}`, {
        headers: {
          "User-Agent": "Alexa-MCP-Server/1.0",
          "Accept": "application/vnd.github.v3+json"
        }
      });
      
      if (!response.ok) {
        return { content: [{ type: "text", text: `API Error: ${response.statusText}` }] };
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return { content: [{ type: "text", text: `No recent LLVM commits found for author ${author}.` }] };
      }

      const rawCommits = data.items.map((item: any) => {
        const message = item.commit.message.split('\n')[0];
        return `- [${item.sha.substring(0, 7)}] ${message} (Date: ${item.commit.author.date})`;
      }).join('\n');

      const prompt = `You are an AI DevOps assistant. Summarize these recent GitHub commits by author ${author} into one concise, natural-sounding sentence suitable for a voice assistant like Alexa to read out loud. Do not list the commit hashes. \n\nCommits:\n${rawCommits}`;

      const command = new ConverseCommand({
        modelId: "amazon.nova-micro-v1:0",
        messages: [
          {
            role: "user",
            content: [{ text: prompt }]
          }
        ],
        inferenceConfig: {
          maxTokens: 150,
          temperature: 0.2
        }
      });

      const bedrockResponse = await bedrockClient.send(command);
      const aiSummary = bedrockResponse.output?.message?.content?.[0]?.text || "Failed to parse AI response.";

      return {
        content: [{ type: "text", text: aiSummary }]
      };
    } catch (error: any) {
      return { content: [{ type: "text", text: `Failed to fetch or summarize commits: ${error.message}` }] };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("LLVM MCP Server with AWS Bedrock running on stdio..."); 
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});