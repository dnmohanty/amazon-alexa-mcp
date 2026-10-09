# 🎙️ Alexa LLVM DevOps Assistant

A voice-native Model Context Protocol (MCP) server that connects Amazon Alexa to GitHub and AWS Bedrock to provide real-time, AI-summarized insights into compiler development.

Built for the **Build, Ship, Shape: Amazon Developer Hackathon 2026**.

## 🧠 The Concept
DevOps is traditionally screen-heavy. This project bridges voice interfaces with developer tools using the Model Context Protocol (MCP). By asking Alexa, developers can instantly triage commits in massive monorepos (like `llvm-project`) hands-free—getting natural language summaries powered by AWS Bedrock instead of listening to raw JSON or commit hashes.

## 🏗 Architecture
- **Voice Interface:** Amazon Alexa Custom Skill (with Custom Intents & Slots)
- **AI/LLM:** AWS Bedrock (`amazon.nova-micro-v1:0`)
- **Backend:** Node.js / Express 
- **Protocol:** Model Context Protocol (MCP) via Server-Sent Events (SSE)
- **Data Source:** GitHub REST API (`/search/commits`)

## ✨ Key Features
- **Voice-Activated Insights:** Ask Alexa for the latest commits by any author in the massive `llvm/llvm-project` monorepo.
- **Dynamic VUI Parsing:** Features custom regex logic (`.replace(/\s+/g, '')`) to seamlessly handle speech-to-text anomalies (e.g., Alexa misinterpreting "dnmohanty" as "d n mohanty").
- **AI Summarization:** Routes raw commit data through AWS Bedrock Nova Micro with a strict system prompt to generate concise, natural-sounding summaries while actively suppressing unreadable data like SHA hashes.
- **The Alexa-MCP Adapter:** Features a custom Express middleware layer engineered to bridge the protocol gap between standard Alexa POST webhooks and MCP-compatible SSE streams.

## 🛠 Hackathon Note: The Protocol Adapter
During development, we identified a protocol mismatch: standard Alexa Custom Skills send POST JSON webhooks, while the MCP SDK expects Server-Sent Events (SSE) via GET. To maintain the end-to-end voice experience, we engineered an Express adapter (`app.post('/sse')`) to intercept the legacy webhook, manually execute the AWS Bedrock/GitHub logic, and return a properly formatted Alexa JSON response. 

**Read more about our architectural decisions and platform feedback in our [Friction Log](FRICTION_LOG.md).**

## 💻 Local Development
1. Clone the repository and run `npm install`.
2. Configure `.env` with your `AWS_REGION`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY`.
3. Start the local MCP server: `npx tsx index.ts`
4. Expose the server to the Alexa Developer Console using ngrok: `npx ngrok http 3000`
5. Update the Alexa Skill Endpoint with your active ngrok URL (append `/sse`).
