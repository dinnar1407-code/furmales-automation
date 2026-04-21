#!/usr/bin/env node
/**
 * FurMates WhatsApp Business MCP Server
 * Issue #6 — 5 tools via Twilio WhatsApp API
 *
 * Env vars required:
 *   TWILIO_ACCOUNT_SID   — AC...
 *   TWILIO_AUTH_TOKEN    — your auth token
 *   TWILIO_WHATSAPP_FROM — whatsapp:+14155238886
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createTwilioClientFromEnv } from './twilio-client.js';
import { whatsappTools, handleWhatsAppTool } from './tools.js';

async function main() {
  process.stderr.write(JSON.stringify({ ts: new Date().toISOString(), msg: 'Starting FurMates WhatsApp MCP...' }) + '\n');

  const client = createTwilioClientFromEnv();
  process.stderr.write(JSON.stringify({ ts: new Date().toISOString(), msg: 'Twilio client ready', from: process.env.TWILIO_WHATSAPP_FROM, tools: whatsappTools.length }) + '\n');

  const server = new Server(
    { name: 'furmales-whatsapp-mcp', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: whatsappTools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    const a = (args ?? {}) as Record<string, unknown>;
    process.stderr.write(JSON.stringify({ ts: new Date().toISOString(), tool: name }) + '\n');
    try {
      return await handleWhatsAppTool(name, a, client);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(JSON.stringify({ ts: new Date().toISOString(), error: msg, tool: name }) + '\n');
      return { content: [{ type: 'text', text: `❌ ${name}: ${msg}` }], isError: true };
    }
  });

  await server.connect(new StdioServerTransport());
  process.stderr.write(JSON.stringify({ ts: new Date().toISOString(), msg: 'WhatsApp MCP running', tools: whatsappTools.length }) + '\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
