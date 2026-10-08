# Alexa LLVM DevOps Assistant

A voice-native Model Context Protocol (MCP) server that connects Amazon Alexa to GitHub and AWS Bedrock to provide real-time, AI-summarized insights into compiler development.

## Architecture
- **Voice Interface:** Amazon Alexa Custom Skill
- **AI/LLM:** AWS Bedrock (`amazon.nova-micro-v1:0`)
- **Backend:** Node.js / Express 
- **Protocol:** Model Context Protocol (MCP) via Server-Sent Events (SSE)
- **Data Source:** GitHub REST API

## Features
- **Voice-Activated Insights:** Ask Alexa for the latest commits by any author in the massive `llvm/llvm-project` monorepo.
- **MCP Tool Integration:** Utilizes a custom `get_llvm_commits` MCP tool.
- **AI Summarization:** Routes raw commit data through AWS Bedrock Nova Micro to generate natural, conversational summaries suitable for voice output.
- **Custom Alexa Adapter:** Features an Express middleware layer to translate standard Alexa POST webhooks into MCP-compatible SSE streams.

## Local Development
1. Clone the repository and run `npm install`.
2. Configure `.env` with your `AWS_REGION`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY`.
3. Start the local MCP server: `npx tsx index.ts`
4. Expose the server to the Alexa Developer Console using ngrok: `npx ngrok http 3000`
5. Update the Alexa Skill Endpoint with your active ngrok URL (append `/sse`).
