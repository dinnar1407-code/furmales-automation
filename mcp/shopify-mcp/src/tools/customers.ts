/**
 * Customer Tools for FurMates Shopify MCP
 * Handles: list, get, update customer info + search
 */

import { ShopifyClient } from "../utils/shopify-client.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("customers");

export const customerTools = [
  // ─── list_customers ──────────────────────────────────────────────────
  {
    name: "list_customers",
    description:
      "List customers from the Shopify store. Returns customer ID, email, name, order count, and total spend.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Max number of customers (1-250, default 50)",
          default: 50,
        },
        email: {
          type: "string",
          description: "Filter by exact email address",
        },
      },
    },
  },

  // ─── search_customers ────────────────────────────────────────────────
  {
    name: "search_customers",
    description:
      "Search for customers by name, email, phone, or other attributes. More flexible than list_customers for finding specific customers.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query, e.g. 'john@example.com', 'John Smith', 'tag:vip'",
        },
      },
      required: ["query"],
    },
  },

  // ─── get_customer ────────────────────────────────────────────────────
  {
    name: "get_customer",
    description:
      "Get full details of a specific customer including addresses, order history, and tags.",
    inputSchema: {
      type: "object",
      properties: {
        customer_id: {
          type: "string",
          description: "Shopify customer ID",
        },
      },
      required: ["customer_id"],
    },
  },

  // ─── update_customer ─────────────────────────────────────────────────
  {
    name: "update_customer",
    description:
      "Update customer information such as name, email, phone, tags, notes, and marketing preferences.",
    inputSchema: {
      type: "object",
      properties: {
        customer_id: {
          type: "string",
          description: "Shopify customer ID to update",
        },
        first_name: { type: "string" },
        last_name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        note: {
          type: "string",
          description: "Internal customer note",
        },
        tags: {
          type: "string",
          description: "Comma-separated tags, e.g. 'vip, angel-customer, repeat-buyer'",
        },
        accepts_marketing: {
          type: "boolean",
          description: "Whether customer accepts marketing emails",
        },
      },
      required: ["customer_id"],
    },
  },
];

export async function handleCustomerTool(
  name: string,
  args: Record<string, unknown>,
  client: ShopifyClient
) {
  log.info(`Executing tool: ${name}`, { args });

  switch (name) {
    case "list_customers": {
      const { limit, email } = args as { limit?: number; email?: string };
      const result = await client.listCustomers({ limit, email });
      log.info(`Listed ${result.customers.length} customers`);
      return {
        content: [{ type: "text", text: JSON.stringify(result.customers, null, 2) }],
      };
    }

    case "search_customers": {
      const { query } = args as { query: string };
      const result = await client.searchCustomers(query);
      log.info(`Found ${result.customers.length} customers for query: ${query}`);
      return {
        content: [{ type: "text", text: JSON.stringify(result.customers, null, 2) }],
      };
    }

    case "get_customer": {
      const { customer_id } = args as { customer_id: string };
      const result = await client.getCustomer(customer_id);
      log.info(`Got customer: ${result.customer.email}`);
      return {
        content: [{ type: "text", text: JSON.stringify(result.customer, null, 2) }],
      };
    }

    case "update_customer": {
      const { customer_id, ...updateData } = args as {
        customer_id: string;
        [key: string]: unknown;
      };
      const result = await client.updateCustomer(customer_id, updateData as any);
      log.info(`Updated customer: ${customer_id}`);
      return {
        content: [
          {
            type: "text",
            text: `✅ Customer ${customer_id} updated successfully!\n\n${JSON.stringify(result.customer, null, 2)}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown customer tool: ${name}`);
  }
}
