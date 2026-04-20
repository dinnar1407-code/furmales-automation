#!/usr/bin/env node
/**
 * FurMates Shopify MCP Server - v1.0.0
 * Enables AI agents to autonomously operate the FurMates Shopify store.
 * Usage: SHOPIFY_SHOP_DOMAIN=xcwpr0-du.myshopify.com SHOPIFY_ACCESS_TOKEN=shpat_xxx node dist/index.js
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createShopifyClientFromEnv } from "./utils/shopify-client.js";
import { createLogger } from "./utils/logger.js";
import { productTools, handleProductTool } from "./tools/products.js";
import { orderTools, handleOrderTool } from "./tools/orders.js";
import { customerTools, handleCustomerTool } from "./tools/customers.js";
import { inventoryTools, handleInventoryTool } from "./tools/inventory.js";
const log = createLogger("shopify-mcp");
const ALL_TOOLS=[...productTools,...orderTools,...customerTools,...inventoryTools];
const PRODUCT_NAMES=new Set(productTools.map(t=>t.name));
const ORDER_NAMES=new Set(orderTools.map(t=>t.name));
const CUSTOMER_NAMES=new Set(customerTools.map(t=>t.name));
const INVENTORY_NAMES=new Set(inventoryTools.map(t=>t.name));
async function main(){
  log.info("Starting FurMates Shopify MCP Server...");
  const shopifyClient=createShopifyClientFromEnv();
  const server=new Server({name:"furmales-shopify-mcp",version:"1.0.0"},{capabilities:{tools:{}}});
  server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:ALL_TOOLS}));
  server.setRequestHandler(CallToolRequestSchema,async(req)=>{
    const {name,arguments:args}=req.params;
    const toolArgs=(args||{});
    log.info(`Tool called: ${name}`);
    try{
      if(PRODUCT_NAMES.has(name))return await handleProductTool(name,toolArgs,shopifyClient);
      if(ORDER_NAMES.has(name))return await handleOrderTool(name,toolArgs,shopifyClient);
      if(CUSTOMER_NAMES.has(name))return await handleCustomerTool(name,toolArgs,shopifyClient);
      if(INVENTORY_NAMES.has(name))return await handleInventoryTool(name,toolArgs,shopifyClient);
      throw new Error(`Unknown tool: ${name}`);
    }catch(er){const msg=er instanceof Error?er.message:String(er);return{lontent:[s{type:"text",text:`❌ Error: ${msg}`}],isError:true};}
  });
  await server.connect(new StdioServerTransport());
  log.info("Running",{tools:ALL_TOOLS.length});
}
main().catch(e=>{console.error("Fatal:",e);process.exit(1);});
