import express from 'express';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SseClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const app = express();
const port = 3001;

app.use(express.json());

/**
 * Helper to execute an MCP tool on a specific server
 * This version supports both SSE (remote) and Stdio (npx) transports
 */
async function executeMcpAction(config) {
  const { serverUrl, serverCommand, serverArgs, toolName, toolArguments, envVars } = config;
  
  const client = new Client({
    name: "talentflow-bridge-client",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  let transport;
  if (serverUrl) {
    // If it starts with http, assume SSE
    transport = new SseClientTransport(new URL(serverUrl));
  } else if (serverCommand) {
    // Otherwise use Stdio (npx/local)
    transport = new StdioClientTransport({
      command: serverCommand,
      args: serverArgs || [],
      env: { ...process.env, ...envVars }
    });
  } else {
    throw new Error("Invalid MCP server configuration: No URL or Command provided");
  }

  try {
    await client.connect(transport);
    const result = await client.callTool({
      name: toolName,
      arguments: toolArguments || {}
    });
    return result;
  } finally {
    try {
      // Cleanup
      if (transport.close) await transport.close();
    } catch (err) {
      console.error("Error closing transport:", err);
    }
  }
}

// GET /health
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'mcp-bridge'
  });
});

/**
 * POST /gmail/fetch
 * Connects to Gmail MCP and fetches relevant emails
 */
app.post('/gmail/fetch', async (req, res) => {
  console.log(`[mcp-bridge] Handling /gmail/fetch...`);
  try {
    const token = process.env.GMAIL_OAUTH_TOKEN;
    if (!token) throw new Error("GMAIL_OAUTH_TOKEN not set");

    // We assume the Gmail MCP server provides a 'fetch-emails' tool
    // If it's the standard one, we might need multiple calls, 
    // but the prompt asks for a direct tool call result mapping.
    const result = await executeMcpAction({
      serverCommand: "npx",
      serverArgs: ["-y", "@modelcontextprotocol/server-gmail"],
      envVars: { GMAIL_OAUTH_TOKEN: token },
      toolName: "fetch-emails", // As requested by user
      toolArguments: {
        q: "has:attachment (resume OR CV OR application)",
        max_results: 10
      }
    });

    console.log(`[mcp-bridge] Gmail fetch completed. Count: ${result.content?.length || 0}`);
    res.json(result.content || []);
  } catch (error) {
    console.error(`[mcp-bridge] Gmail error:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /indeed/fetch
 * Connects to Indeed MCP and fetches applicants
 */
app.post('/indeed/fetch', async (req, res) => {
  console.log(`[mcp-bridge] Handling /indeed/fetch...`);
  try {
    const token = process.env.INDEED_MCP_TOKEN;
    if (!token) throw new Error("INDEED_MCP_TOKEN not set");

    const result = await executeMcpAction({
      serverCommand: "npx",
      serverArgs: ["-y", "@modelcontextprotocol/server-indeed"], // Placeholder for real indeed server
      envVars: { INDEED_API_KEY: token },
      toolName: "fetch-applicants",
      toolArguments: {}
    });

    console.log(`[mcp-bridge] Indeed fetch completed. Count: ${result.content?.length || 0}`);
    res.json(result.content || []);
  } catch (error) {
    console.error(`[mcp-bridge] Indeed error:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /calendar/create
 * Creates an interview event with Google Meet link
 */
app.post('/calendar/create', async (req, res) => {
  console.log(`[mcp-bridge] Handling /calendar/create...`);
  try {
    const token = process.env.GCAL_OAUTH_TOKEN;
    const { summary, description, start_time, end_time, candidate_email } = req.body;

    if (!token) throw new Error("GCAL_OAUTH_TOKEN not set");

    const result = await executeMcpAction({
      serverCommand: "npx",
      serverArgs: ["-y", "@modelcontextprotocol/server-google-calendar"],
      envVars: { GOOGLE_CALENDAR_ID: "primary" }, 
      toolName: "create-event",
      toolArguments: {
        summary: summary || "TalentFlow Interview",
        description: description || "Interview scheduled via TalentFlow",
        start: start_time,
        end: end_time,
        attendees: [{ email: candidate_email }],
        conference_data: {
          create_request: { request_id: Date.now().toString() }
        }
      }
    });

    // Extract meet_url from GCAL event structure if possible
    const event = result.content?.[0] || {};
    res.json({
      meet_url: event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || null,
      event_id: event.id,
      event_link: event.htmlLink
    });
  } catch (error) {
    console.error(`[mcp-bridge] Calendar error:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`MCP Bridge running on port ${port}`);
});
