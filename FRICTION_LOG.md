# Amazon Alexa+ Hackathon: Friction Log

### Date: Oct 7
* **Goal:** Test `get_llvm_commits` tool via MCP Inspector.
* **Expected:** Tool fetches public commits from GitHub API successfully using a standard Node `fetch` request.
* **Actual:** MCP server returned `API Error: Internal Server Error`. The Node `fetch` lacked a User-Agent, which GitHub silently rejects/fails on.
* **Workaround:** Manually injected `"User-Agent": "Alexa-MCP-Server/1.0"` and `"Accept": "application/vnd.github.v3+json"` into the fetch headers.

### Date: Oct 7
* **Goal:** Filter massive monorepo (`llvm/llvm-project`) commits by author via MCP.
* **Expected:** Standard `/commits` GitHub API endpoint seamlessly filters the data.
* **Actual:** Hitting the standard `/commits` endpoint with an author filter on a massive repo causes GitHub's API to time out, returning a `500 Internal Server Error` to the MCP server.
* **Workaround:** Rewrote the tool to route the query through GitHub's `/search/commits` API endpoint instead, which instantly returns the filtered data without timing out.

### Date: Oct 8
* **Goal:** Generate a natural voice summary of GitHub commits using Amazon Bedrock.
* **Expected:** The `amazon.titan-text-express-v1` model processes the text successfully.
* **Actual:** The API returned an end-of-life error because the older Titan model version was retired and rejected the request.
* **Workaround:** Upgraded the implementation to use the modern `ConverseCommand` API and routed the prompt to the active `amazon.nova-micro-v1:0` model.

### Date: Oct 9
* **Goal:** Create an MCP server skill using the new Alexa+ Add-ons developer console.
* **Expected:** The Alexa+ dashboard loads a UI to directly configure the MCP server endpoint and system prompt
* **Actual:** The specific Alexa+ Add-ons URL returned a blank white page (restricted beta wall), preventing MCP setup via the intended UI.
* **Workaround:** Bypassed the beta URL, routed through the standard Alexa Custom Skill developer console, and selected "Provision your own" custom hosting instead

### Date: Oct 9
* **Goal:** Connect the Alexa Simulator to the local MCP server via the ngrok tunnel
* **Expected:** Alexa communicates natively with the MCP SDK's Server-Sent Events (SSE) GET endpoint.
* **Actual:** Standard Alexa Custom Skills send POST JSON webhooks. This protocol mismatch caused the local server to reject the request, throwing a "problem with the requested skill's response" error in the simulator.
* **Workaround:** Engineered a custom Express.js adapter layer (app.post('/sse')) to intercept the standard Alexa POST webhooks, manually execute the AWS Bedrock AI logic, and return a properly formatted standard Alexa JSON response

### Date: Oct 9
* **Goal:** Maintain a persistent connection between the Alexa console and the local environment during testing.
* **Expected:** The ngrok tunnel remains mapped to the Alexa endpoint across local restart
* **Actual:** Restarting the ngrok terminal generated a brand-new forwarding URL, which silently broke the connection and caused the simulator to fail since Alexa was still pinging the dead URL.
* **Workaround:** Manually copied the new ngrok URL and pasted it into the Alexa Developer Console's Build > Endpoint tab after every tunnel reset.

