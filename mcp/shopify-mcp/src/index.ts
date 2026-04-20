#!/usr/bin/env node
/**
 * FurMates Shopify MCP Server
 * ─────────────────────────────────────────────────────────────────────────────
 * Enables AI agents (Playfish / Claude Code) to autonomously operate
 * the FurMates Shopify store via the Model Context Protocol.
 *
 * Usage:
 *   SHOPIFY_SHOP_DOMAIN=xcwpr0-du.myshopify.com \
 *   SHOPIFY_ACCESS_TOKEN=shpat_xxx \
 *   node dist/index.js
 *
 * Transport: stdio (default) | HTTP (set MCP_HTTP_PORT)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { createShopifyClientFromEnv } from "./utils/shopify-client.js";
import { createLogger } from "./utils/logger.js";

import { productTools, handleProductTool } from "./tools/products.js";
import { orderTools, handleOrderTool } from "./tools/orders.js";
import { customerTools, handleCustomerTool } from "./tools/customers.js";
import { inventoryTools, handleInventoryTool } from "./tools/inventory.js";

const log = createLogger("shopify-mcp");

// ─── All tools combined ───────────────────────────────────────────────────────

const ALL_TOOLS = [
  ...productTools,
  ...orderTools,
  ...customerTools,
  ...inventoryTools,
];

const PRODUCT_TOOL_NAMES = new Set(productTools.map((t) => t.name));
const ORDER_TOOL_NAMES = new Set(orderTools.map((t) => t.name));
const CUSTOMER_TOOL_NAMES = new Set(customerTools.map((t) => t.name));
const INVENTORY_TOOL_NAMES = new Set(inventoryTools.map((t) => t.name));

// ─── Server Setup ─────────────────────────────────────────────────────────────

async function main() {
  log.info("Starting FurMates Shopify MCP Server...");

  // Validate Shopify credentials on startup
  let shopifyClient: ReturnType<typeof createShopifyClientFromEnv>;
  try {
    shopifyClient = createShopifyClientFromEnv();
    log.info("Shopify client initialized", {
      domain: process.env.SHOPIFY_SHOP_DOMAIN,
      apiVersion: process.env.SHOPIFY_API_VERSION || "2024-01",
    });
  } catch (err) {
    log.error("Failed to initialize Shopify client", { error: String(err) });
    process.exit(1);
  }

  // Create MCP server
  const server = new Server(
    {
      name: "furmales-shopify-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // ─── List Tools ─────────────────────────────────────────────────────
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    log.info(`Listing ${ALL_TOOLS.length} available tools`);
    return { tools: ALL_TOOLS };
  });

  // ─── Call Tool ──────────────────────────────────────────────────────
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const toolArgs = (args || {}) as Record<string, unknown>;

    log.info(`Tool called: ${name}`, { args: toolArgs });

    try {
      if (PRODUCT_TOOL_NAMES.has(name)) {
        return await handleProductTool(name, toolArgs, shopifyClient);
      }

      if (ORDER_TOOL_NAMES.has(name)) {
        return await handleOrderTool(name, toolArgs, shopifyClient);
      }

      if (CUSTOMER_TOOL_NAMES.has(name)) {
        return await handleCustomerTool(name, toolArgs, shopifyClient);
      }

      if (INVENTORY_TOOL_NAMES.has(name)) {
        return await handleInventoryTool(name, toolArgs, shopifyClient);
      }

      throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error(`Tool execution failed: ${name}`, { error: errorMessage });
      return {
        content: [
          {
            type: "text",
            text: `❌ Error executing ${name}: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  // ─── Transport ──────────────────────────────────────────────────────
  const transport = new StdioServerTransport();
  await server.connect(transport);

  log.info("FurMates Shopify MCP Server running", {
    tools: ALL_TOOLS.length,
    transport: "stdio",
    categories: {
      products: productTools.length,
      orders: orderTools.length,
      customers: customerTools.length,
      inventory: inventoryTools.length,
    },
  });
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
