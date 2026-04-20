#!/usr/bin/env node
/**
 * FurMates Tidio MCP Server
 * ─────────────────────────────────────────────────────────────────────────────
 * Enables AI agents (Playfish / Claude Code) to autonomously manage
 * FurMates customer service conversations via Tidio OpenAPI.
 *
 * Usage:
 *   TIDIO_CLIENT_ID=ci_xxx \
 *   TIDIO_CLIENT_SECRET=cs_xxx \
 *   node dist/index.js
 *
 * Auth docs: https://developers.tidio.com/docs/openapi-authorization
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { createTidioClientFromEnv } from "./utils/tidio-client.js";
import { createLogger } from "./utils/logger.js";

import { conversationTools, handleConversationTool } from "./tools/conversations.js";
import { messageTools, handleMessageTool } from "./tools/messages.js";
import { contactTools, handleContactTool } from "./tools/contacts.js";

const log = createLogger("tidio-mcp");

// ─── Tool registry ────────────────────────────────────────────────────────────

const ALL_TOOLS = [...conversationTools, ...messageTools, ...contactTools];

const CONVERSATION_TOOL_NAMES = new Set(conversationTools.map((t) => t.name));
const MESSAGE_TOOL_NAMES      = new Set(messageTools.map((t) => t.name));
const CONTACT_TOOL_NAMES      = new Set(contactTools.map((t) => t.name));

// ─── Server bootstrap ─────────────────────────────────────────────────────────

async function main() {
  log.info("Starting FurMates Tidio MCP Server...");

  let tidioClient: ReturnType<typeof createTidioClientFromEnv>;
  try {
    tidioClient = createTidioClientFromEnv();
    log.info("Tidio client initialized", {
      clientId: process.env.TIDIO_CLIENT_ID?.slice(0, 10) + "...",
    });
  } catch (err) {
    log.error("Failed to initialize Tidio client", { error: String(err) });
    process.exit(1);
  }

  const server = new Server(
    { name: "furmales-tidio-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  // ─── List tools ─────────────────────────────────────────────────────
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    log.info(`Listing ${ALL_TOOLS.length} available tools`);
    return { tools: ALL_TOOLS };
  });

  // ─── Call tool ──────────────────────────────────────────────────────
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const toolArgs = (args ?? {}) as Record<string, unknown>;

    log.info(`Tool called: ${name}`, { args: toolArgs });

    try {
      if (CONVERSATION_TOOL_NAMES.has(name)) {
        return await handleConversationTool(name, toolArgs, tidioClient);
      }
      if (MESSAGE_TOOL_NAMES.has(name)) {
        return await handleMessageTool(name, toolArgs, tidioClient);
      }
      if (CONTACT_TOOL_NAMES.has(name)) {
        return await handleContactTool(name, toolArgs, tidioClient);
      }
      throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      log.error(`Tool execution failed: ${name}`, { error: msg });
      return {
        content: [{ type: "text", text: `❌ Error executing ${name}: ${msg}` }],
        isError: true,
      };
    }
  });

  // ─── Connect stdio transport ─────────────────────────────────────────
  const transport = new StdioServerTransport();
  await server.connect(transport);

  log.info("FurMates Tidio MCP Server running", {
    total_tools: ALL_TOOLS.length,
    transport: "stdio",
    categories: {
      conversations: conversationTools.length,
      messages: messageTools.length,
      contacts: contactTools.length,
    },
  });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
