import process from "node:process";
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
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
    author: z.string().describe("The GitHub username of the author"),
    limit: z.number().min(1).max(10).default(3).describe("Number of commits to return")
  },
  async ({ author, limit }) => {
    return { content: [{ type: "text", text: "Tool executed." }] };
  }
);

const app = express();
app.use(express.json()); 

let transport: SSEServerTransport;

app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/message", res);
  await server.connect(transport);
});

app.post("/message", async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(500).send("SSE transport not initialized");
  }
});

app.post("/sse", async (req, res) => {
  console.log("🎙️ Received voice request from Alexa Simulator!");
  
  try {
    let author = "dnmohanty"; 
    const requestType = req.body?.request?.type;

    if (requestType === "IntentRequest") {
       const slots = req.body?.request?.intent?.slots;
       if (slots && slots.author && slots.author.value) {
           author = slots.author.value.replace(/\s+/g, ''); 
       }
    }
    
    const limit = 3;

    const githubResponse = await fetch(`https://api.github.com/search/commits?q=repo:llvm/llvm-project+author:${author}&sort=author-date&order=desc&per_page=${limit}`, {
      headers: { 
        "User-Agent": "Alexa-MCP-Server/1.0",
        "Accept": "application/vnd.github.v3+json"
      }
    });
    
    const data = await githubResponse.json();
    let rawCommits = "No commits found.";
    
    if (data.items && data.items.length > 0) {
      rawCommits = data.items.map((item: any) => `- ${item.commit.message.split('\n')[0]}`).join('\n');
    }

    const prompt = `You are an AI DevOps assistant. Summarize these recent GitHub commits by author ${author} into one concise, natural-sounding sentence suitable for a voice assistant like Alexa to read out loud. Do not list the commit hashes. \n\nCommits:\n${rawCommits}`;
    
    const command = new ConverseCommand({
      modelId: "amazon.nova-micro-v1:0",
      messages: [{ role: "user", content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens: 150, temperature: 0.2 }
    });

    const bedrockResponse = await bedrockClient.send(command);
    const aiSummary = bedrockResponse.output?.message?.content?.[0]?.text || "Failed to generate summary.";

    console.log(`🤖 Bedrock says: ${aiSummary}`);

    res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: aiSummary
        },
        shouldEndSession: true
      }
    });

  } catch (error: any) {
    console.error("Error:", error.message);
    res.json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "Sorry, I encountered an error checking the commits."
        },
        shouldEndSession: true
      }
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 HTTP Server running on http://localhost:${PORT}`);
  console.log(`Listening for Alexa via ngrok...`);
});