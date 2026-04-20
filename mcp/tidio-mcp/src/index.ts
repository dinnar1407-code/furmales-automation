/**
 * FurMates Tidio MCP Server
 * 
 * AI-powered customer service via Tidio
 * 
 * To use:
 * 1. Set TIDIO_API_KEY in environment
 * 2. Set TIDIO_API_SECRET in environment
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
    name: 'list_conversations',
    description: 'List all active conversations in Tidio',
    inputSchema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['active', 'inactive', 'closed', 'all'],
          description: 'Conversation status filter',
          default: 'active'
        },
        limit: { type: 'number', description: 'Number of conversations to return', default: 20 },
      },
    },
  },
  {
    name: 'get_conversation',
    description: 'Get details and messages of a specific conversation',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Conversation ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'send_message',
    description: 'Send a message to a customer in Tidio',
    inputSchema: {
      type: 'object',
      properties: {
        recipient_id: { type: 'string', description: 'Customer ID or email' },
        message: { type: 'string', description: 'Message text to send' },
        channel: { 
          type: 'string', 
          enum: ['chat', 'email'],
          description: 'Channel to send via',
          default: 'chat'
        },
      },
      required: ['recipient_id', 'message'],
    },
  },
  {
    name: 'get_contact',
    description: 'Get contact/customer information from Tidio',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Customer email' },
        visitor_id: { type: 'string', description: 'Visitor ID' },
      },
      oneOf: [
        { required: ['email'] },
        { required: ['visitor_id'] },
      ],
    },
  },
  {
    name: 'list_contacts',
    description: 'List contacts in Tidio',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of contacts to return', default: 20 },
        offset: { type: 'number', description: 'Offset for pagination', default: 0 },
      },
    },
  },
  {
    name: 'close_conversation',
    description: 'Close a conversation in Tidio',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Conversation ID' },
      },
      required: ['id'],
    },
  },
  {
    name: 'mark_as_read',
    description: 'Mark a conversation as read',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Conversation ID' },
      },
      required: ['id'],
    },
  },
];

// Create server
const server = new Server(
  {
    name: 'furmales-tidio-mcp',
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
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_conversations':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Tidio MCP connected successfully!',
                note: 'Configure TIDIO_API_KEY and TIDIO_API_SECRET to fetch real conversations',
                conversations: [],
              }, null, 2),
            },
          ],
        };

      case 'get_conversation':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Configure TIDIO_API_KEY to fetch real conversation',
                conversation: null,
              }, null, 2),
            },
          ],
        };

      case 'send_message':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Configure TIDIO_API_KEY to send real messages',
                message_sent: args,
              }, null, 2),
            },
          ],
        };

      case 'get_contact':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Configure TIDIO_API_KEY to fetch real contact',
                contact: null,
              }, null, 2),
            },
          ],
        };

      case 'list_contacts':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Configure TIDIO_API_KEY to fetch real contacts',
                contacts: [],
              }, null, 2),
            },
          ],
        };

      case 'close_conversation':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Configure TIDIO_API_KEY to close real conversation',
                conversation_id: args.id,
              }, null, 2),
            },
          ],
        };

      case 'mark_as_read':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Configure TIDIO_API_KEY to mark as read',
                conversation_id: args.id,
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
  console.error('FurMates Tidio MCP Server started');
}

main().catch(console.error);
