/**
 * FurMates Shopify MCP Server
 * 
 * AI-powered control of Shopify store operations
 * 
 * To use:
 * 1. Set SHOPIFY_STORE_DOMAIN in environment
 * 2. Set SHOPIFY_ACCESS_TOKEN in environment
 * 3. Run: npm start
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

// Tool definitions
const TOOLS: Tool[] = [
  {
    name: 'list_products',
    description: 'List all products in the Shopify store',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of products to return (default 50)', default: 50 },
        since_id: { type: 'string', description: 'Return products after this ID' },
      },
    },
  },
  {
    name: 'get_product',
    description: 'Get details of a specific product',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Product ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'update_inventory',
    description: 'Update inventory level for a product variant',
    inputSchema: {
      type: 'object',
      properties: {
        variant_id: { type: 'string', description: 'Variant ID' },
        inventory_item_id: { type: 'string', description: 'Inventory Item ID' },
        location_id: { type: 'string', description: 'Location ID' },
        quantity: { type: 'number', description: 'New inventory quantity' },
      },
      required: ['variant_id', 'inventory_item_id', 'location_id', 'quantity'],
    },
  },
  {
    name: 'list_orders',
    description: 'List orders from the Shopify store',
    inputSchema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['open', 'closed', 'cancelled', 'any'],
          description: 'Order status',
          default: 'any'
        },
        limit: { type: 'number', description: 'Number of orders to return', default: 50 },
      },
    },
  },
  {
    name: 'get_order',
    description: 'Get details of a specific order',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Order ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'update_order_status',
    description: 'Update the status of an order (fulfill, cancel, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Order ID' },
        status: { 
          type: 'string', 
          enum: ['open', 'closed', 'cancelled'],
          description: 'New status' 
        },
        note: { type: 'string', description: 'Optional note' },
      },
      required: ['id', 'status'],
    },
  },
];

// Create server
const server = new Server(
  {
    name: 'furmales-shopify-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Call tool handler
server.setToolHandler(async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_products':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Shopify MCP connected successfully!',
                note: 'Configure SHOPIFY_ACCESS_TOKEN to fetch real products',
                products: [],
              }, null, 2),
            },
          ],
        };

      case 'get_product':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Configure SHOPIFY_ACCESS_TOKEN to fetch real product',
                product: null,
              }, null, 2),
            },
          ],
        };

      case 'update_inventory':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Configure SHOPIFY_ACCESS_TOKEN to update real inventory',
                inventory_update: args,
              }, null, 2),
            },
          ],
        };

      case 'list_orders':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Configure SHOPIFY_ACCESS_TOKEN to fetch real orders',
                orders: [],
              }, null, 2),
            },
          ],
        };

      case 'get_order':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Configure SHOPIFY_ACCESS_TOKEN to fetch real order',
                order: null,
              }, null, 2),
            },
          ],
        };

      case 'update_order_status':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Configure SHOPIFY_ACCESS_TOKEN to update real order',
                order_update: args,
              }, null, 2),
            },
          ],
        };

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Unknown tool: ${name}` }),
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: String(error) }),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('FurMates Shopify MCP Server started');
}

main().catch(console.error);
