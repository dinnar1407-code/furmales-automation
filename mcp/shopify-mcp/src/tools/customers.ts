/**
 * Customer Tools for FurMates Shopify MCP
 * Handles: list, get, update customer info + search
 */

import { ShopifyClient } from "../utils/shopify-client.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("customers");

export const customerTools = [
  {
    name: "list_customers",
    description: "List customers from the Shopify store.",
    inputSchema: {type: "object", properties: {limit: {type: "number",default:50},email:{type:"string"}}},
  },
  {
    name: "search_customers",
    description: "Search customers by name/email/phone.",
    inputSchema: {type: "object", properties: {query: {type: "string"}}, required: ["query"]},
  },
  {
    name: "get_customer",
    description: "Get full customer details.",
    inputSchema: {type: "object", properties: {customer_id: {type: "string"}}, required: ["customer_id"]},
  },
  {
    name: "update_customer",
    description: "Update customer information.",
    inputSchema: {type: "object", properties: {customer_id: {type: "string"},tags: {type: "string"},note: {type: "string"}}, required: ["customer_id"]},
  },
];

export async function handleCustomerTool(name, args, client) {
  log.info(`Executing tool: ${name}`, { args });
  switch (name) {
    case "list_customers": {
      const { limit, email } = args;
      const result = await client.listCustomers({ limit, email });
      return { content: [{ type: "text", text: JSON.stringify(result.customers, null, 2) }] };
    }
    case "search_customers": { const result = await client.searchCustomers(args.query); return { content: [{ type: "text", text: JSON.stringify(result.customers, null, 2) }] }; }
    case "get_customer": { const result = await client.getCustomer(args.customer_id); return { content: [{ type: "text", text: JSON.stringify(result.customer, null, 2) }] }; }
    case "update_customer": { const { customer_id, ...updateData } = args; const result = await client.updateCustomer(customer_id, updateData); return { content: [{ type: "text", text: `✅ Customer ${customer_id} updated successfully!\n\n${JSON.stringify(result.customer, null, 2)}` }] }; }
    default: throw new Error(`Unknown customer tool: ${name}`);
  }
}
