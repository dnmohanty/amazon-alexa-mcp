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