/**
 * Contact Tools for FurMates Tidio MCP
 * list / search / get / update contacts + Angel Customer workflow
 */

import { TidioClient } from "../utils/tidio-client.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("contacts");

// FurMates Angel Customer tag
const ANGEL_TAG = "angel-customer";
const VIP_TAG = "vip";

export const contactTools = [
  // ─── list_contacts ───────────────────────────────────────────────────
  {
    name: "list_contacts",
    description:
      "List all Tidio contacts (customers who have interacted via chat). Returns name, email, phone, tags, and conversation count.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Number of contacts to return (default: 30, max: 100)",
          default: 30,
        },
        page: {
          type: "number",
          description: "Page number for pagination",
          default: 1,
        },
        email: {
          type: "string",
          description: "Filter by exact email address",
        },
      },
    },
  },

  // ─── search_contacts ─────────────────────────────────────────────────
  {
    name: "search_contacts",
    description:
      "Search Tidio contacts by name, email, or other attributes. More flexible than list_contacts for finding specific customers.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (name, email, phone, etc.)",
        },
      },
      required: ["query"],
    },
  },

  // ─── get_contact ─────────────────────────────────────────────────────
  {
    name: "get_contact",
    description:
      "Get full contact details including custom properties, tags, and conversation history count.",
    inputSchema: {
      type: "object",
      properties: {
        contact_id: {
          type: "string",
          description: "Tidio contact ID",
        },
      },
      required: ["contact_id"],
    },
  },

  // ─── update_contact ──────────────────────────────────────────────────
  {
    name: "update_contact",
    description:
      "Update a contact's information: name, email, phone, tags, or custom properties. Used to enrich customer profiles.",
    inputSchema: {
      type: "object",
      properties: {
        contact_id: {
          type: "string",
          description: "Tidio contact ID",
        },
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Contact tags e.g. ['vip', 'angel-customer', 'repeat-buyer']",
        },
        custom_properties: {
          type: "object",
          description: "Custom key-value properties for the contact",
          additionalProperties: true,
        },
      },
      required: ["contact_id"],
    },
  },

  // ─── get_contact_conversations ───────────────────────────────────────
  {
    name: "get_contact_conversations",
    description:
      "Get all past conversations for a specific contact. Useful for understanding customer history before responding.",
    inputSchema: {
      type: "object",
      properties: {
        contact_id: {
          type: "string",
          description: "Tidio contact ID",
        },
        limit: {
          type: "number",
          description: "Number of conversations to return (default: 10)",
          default: 10,
        },
      },
      required: ["contact_id"],
    },
  },

  // ─── tag_angel_customer ──────────────────────────────────────────────
  {
    name: "tag_angel_customer",
    description:
      "Tag a contact as a FurMates Angel Customer. Angel Customers are high-value, loyal customers who get priority service, early access, and special perks. This adds the 'angel-customer' and 'vip' tags to their profile.",
    inputSchema: {
      type: "object",
      properties: {
        contact_id: {
          type: "string",
          description: "Tidio contact ID to tag as Angel Customer",
        },
        reason: {
          type: "string",
          description: "Reason for Angel Customer status (stored as a custom property)",
        },
      },
      required: ["contact_id"],
    },
  },

  // ─── detect_customer_intent ──────────────────────────────────────────
  {
    name: "detect_customer_intent",
    description:
      "Analyze the last messages in a conversation to detect customer intent: complaint, order_inquiry, refund_request, product_question, shipping_inquiry, compliment, or other. Use to route conversations appropriately.",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "Tidio conversation ID to analyze",
        },
      },
      required: ["conversation_id"],
    },
  },
];

export async function handleContactTool(
  name: string,
  args: Record<string, unknown>,
  client: TidioClient
) {
  log.info(`Executing: ${name}`, { args });

  switch (name) {
    case "list_contacts": {
      const { limit, page, email } = args as {
        limit?: number;
        page?: number;
        email?: string;
      };
      const result = await client.listContacts({ limit, page, email });
      log.info(`Listed ${result.data.length} contacts`);
      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
      };
    }

    case "search_contacts": {
      const { query } = args as { query: string };
      const result = await client.searchContacts(query);
      log.info(`Found ${result.data.length} contacts matching: "${query}"`);
      return {
        content: [{
          type: "text",
          text: `Found ${result.data.length} contacts:\n\n${JSON.stringify(result.data, null, 2)}`,
        }],
      };
    }

    case "get_contact": {
      const { contact_id } = args as { contact_id: string };
      const result = await client.getContact(contact_id);
      log.info(`Got contact: ${result.email ?? contact_id}`);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    case "update_contact": {
      const { contact_id, ...updateData } = args as {
        contact_id: string;
        [key: string]: unknown;
      };
      const result = await client.updateContact(contact_id, updateData as any);
      log.info(`Updated contact: ${contact_id}`);
      return {
        content: [{
          type: "text",
          text: `✅ Contact ${contact_id} updated.\n\n${JSON.stringify(result, null, 2)}`,
        }],
      };
    }

    case "get_contact_conversations": {
      const { contact_id, limit } = args as {
        contact_id: string;
        limit?: number;
      };
      const result = await client.getContactConversations(contact_id, { limit });
      log.info(`Got ${result.data.length} conversations for contact ${contact_id}`);

      const summary = result.data.map((c) => ({
        id: c.id,
        status: c.status,
        channel: c.channel,
        updated_at: c.updated_at,
        last_message: c.last_message?.message?.slice(0, 100) ?? "",
      }));

      return {
        content: [{
          type: "text",
          text: `${result.data.length} conversations for contact ${contact_id}:\n\n${JSON.stringify(summary, null, 2)}`,
        }],
      };
    }

    case "tag_angel_customer": {
      const { contact_id, reason } = args as {
        contact_id: string;
        reason?: string;
      };

      // Fetch existing tags first so we don't overwrite
      const existing = await client.getContact(contact_id);
      const existingTags = existing.tags ?? [];
      const newTags = Array.from(new Set([...existingTags, ANGEL_TAG, VIP_TAG]));

      const updatePayload: any = { tags: newTags };
      if (reason) {
        updatePayload.custom_properties = {
          ...(existing.custom_properties ?? {}),
          angel_customer_reason: reason,
          angel_customer_since: new Date().toISOString().split("T")[0],
        };
      }

      const result = await client.updateContact(contact_id, updatePayload);
      log.info(`Tagged contact ${contact_id} as Angel Customer`);

      return {
        content: [{
          type: "text",
          text: `🌟 Contact ${contact_id} (${result.email ?? "unknown email"}) is now a FurMates Angel Customer!\nTags: ${newTags.join(", ")}${reason ? `\nReason: ${reason}` : ""}\n\n${JSON.stringify(result, null, 2)}`,
        }],
      };
    }

    case "detect_customer_intent": {
      const { conversation_id } = args as { conversation_id: string };

      // Fetch last 5 messages from the customer
      const messages = await client.listMessages(conversation_id, { limit: 10 });
      const customerMessages = messages.data
        .filter((m) => m.author_type === "visitor")
        .slice(-3)
        .map((m) => m.message)
        .join(" | ");

      if (!customerMessages) {
        return {
          content: [{
            type: "text",
            text: "No customer messages found in this conversation yet.",
          }],
        };
      }

      // Rule-based intent detection (lightweight, no LLM call needed)
      const text = customerMessages.toLowerCase();
      let intent = "other";
      let confidence = "low";
      let routing = "general_support";

      if (/refund|money back|reimburs/i.test(text)) {
        intent = "refund_request"; confidence = "high"; routing = "escalate_to_human";
      } else if (/where.*order|track|shipped|delivery|arrival|package/i.test(text)) {
        intent = "shipping_inquiry"; confidence = "high"; routing = "auto_respond";
      } else if (/order.*\d|#\d{4,}|my order/i.test(text)) {
        intent = "order_inquiry"; confidence = "medium"; routing = "auto_respond";
      } else if (/broken|damaged|wrong|missing|defect/i.test(text)) {
        intent = "complaint"; confidence = "high"; routing = "escalate_to_human";
      } else if (/how does|what is|recommend|best|which|can i use/i.test(text)) {
        intent = "product_question"; confidence = "medium"; routing = "auto_respond";
      } else if (/love|amazing|great|excellent|thank|happy|perfect/i.test(text)) {
        intent = "compliment"; confidence = "medium"; routing = "acknowledge_and_close";
      } else if (/cancel|stop|unsubscribe/i.test(text)) {
        intent = "cancellation"; confidence = "high"; routing = "escalate_to_human";
      }

      log.info(`Detected intent for conversation ${conversation_id}: ${intent}`);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            conversation_id,
            detected_intent: intent,
            confidence,
            recommended_routing: routing,
            analyzed_text: customerMessages.slice(0, 200),
            actions: {
              auto_respond:   routing === "auto_respond",
              needs_human:    routing === "escalate_to_human",
              can_auto_close: routing === "acknowledge_and_close",
            },
          }, null, 2),
        }],
      };
    }

    default:
      throw new Error(`Unknown contact tool: ${name}`);
  }
}
