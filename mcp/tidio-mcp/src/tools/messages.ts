/**
 * Message Tools for FurMates Tidio MCP
 * read history / send message / send internal note / generate AI reply
 */

import { TidioClient } from "../utils/tidio-client.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("messages");

// FurMates brand voice guidelines for AI-assisted replies
const FURMALES_TONE = `
You are a friendly, helpful customer service agent for FurMates — a premium pet supplies brand.
Tone: warm, caring, professional. Sign off with "The FurMates Team 🐾".
Keep replies concise (2-4 sentences) unless the issue requires detail.
`.trim();

export const messageTools = [
  // ─── get_conversation_history ────────────────────────────────────────
  {
    name: "get_conversation_history",
    description:
      "Read the full message history of a Tidio conversation. Returns all messages in chronological order with author type (visitor/operator/bot), timestamps, and content.",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "Tidio conversation ID",
        },
        limit: {
          type: "number",
          description: "Number of messages to retrieve (default: 50, max: 100)",
          default: 50,
        },
        page: {
          type: "number",
          description: "Page number for pagination",
          default: 1,
        },
      },
      required: ["conversation_id"],
    },
  },

  // ─── send_message ────────────────────────────────────────────────────
  {
    name: "send_message",
    description:
      "Send a message to a customer in a Tidio conversation. The message will appear as coming from the operator/agent and is visible to the customer.",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "Tidio conversation ID to reply to",
        },
        message: {
          type: "string",
          description: "Message content to send to the customer",
        },
      },
      required: ["conversation_id", "message"],
    },
  },

  // ─── add_internal_note ───────────────────────────────────────────────
  {
    name: "add_internal_note",
    description:
      "Add an internal note to a conversation. Notes are visible only to operators/agents and NOT to the customer. Useful for logging context, escalation reasons, or hand-off instructions.",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "Tidio conversation ID",
        },
        note: {
          type: "string",
          description: "Internal note content (not visible to customer)",
        },
      },
      required: ["conversation_id", "note"],
    },
  },

  // ─── get_unread_conversations ────────────────────────────────────────
  {
    name: "get_unread_conversations",
    description:
      "Get all open conversations that have unread messages from customers. Returns conversations sorted by most recent customer message. Use this to prioritize which conversations need attention.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of conversations to return (default: 20)",
          default: 20,
        },
      },
    },
  },

  // ─── generate_reply_draft ────────────────────────────────────────────
  {
    name: "generate_reply_draft",
    description:
      "Read the last few messages in a conversation and generate a suggested reply in the FurMates brand voice. Returns a draft — you must use send_message to actually send it. Perfect for Playfish to review before sending.",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "Tidio conversation ID to generate a reply for",
        },
        context: {
          type: "string",
          description: "Optional additional context to help craft the reply (e.g. order details, customer history)",
        },
        auto_send: {
          type: "boolean",
          description: "If true, automatically send the generated reply after drafting (default: false — review first)",
          default: false,
        },
      },
      required: ["conversation_id"],
    },
  },
];

export async function handleMessageTool(
  name: string,
  args: Record<string, unknown>,
  client: TidioClient
) {
  log.info(`Executing: ${name}`, { args });

  switch (name) {
    case "get_conversation_history": {
      const { conversation_id, limit, page } = args as {
        conversation_id: string;
        limit?: number;
        page?: number;
      };
      const result = await client.listMessages(conversation_id, { limit, page });
      log.info(`Got ${result.data.length} messages for conversation ${conversation_id}`);

      const formatted = result.data.map((m) => ({
        id: m.id,
        from: m.author_type,
        type: m.type,
        message: m.message,
        sent_at: m.created_at,
        seen: !!m.seen_at,
      }));

      return {
        content: [{
          type: "text",
          text: `${result.data.length} messages in conversation ${conversation_id}:\n\n${JSON.stringify(formatted, null, 2)}`,
        }],
      };
    }

    case "send_message": {
      const { conversation_id, message } = args as {
        conversation_id: string;
        message: string;
      };
      const result = await client.sendMessage(conversation_id, {
        message,
        type: "message",
        author_type: "operator",
      });
      log.info(`Sent message to conversation ${conversation_id}`);
      return {
        content: [{
          type: "text",
          text: `✅ Message sent to conversation ${conversation_id}.\n\nMessage: "${message}"\n\n${JSON.stringify(result, null, 2)}`,
        }],
      };
    }

    case "add_internal_note": {
      const { conversation_id, note } = args as {
        conversation_id: string;
        note: string;
      };
      const result = await client.sendMessage(conversation_id, {
        message: note,
        type: "note",
        author_type: "operator",
      });
      log.info(`Added internal note to conversation ${conversation_id}`);
      return {
        content: [{
          type: "text",
          text: `✅ Internal note added to conversation ${conversation_id} (not visible to customer).\n\nNote: "${note}"`,
        }],
      };
    }

    case "get_unread_conversations": {
      const { limit = 20 } = args as { limit?: number };
      const result = await client.listConversations({ status: "open", limit });
      const unread = result.data.filter((c) => c.unread_messages_count > 0);

      // Sort by most unread first, then by last updated
      unread.sort((a, b) => {
        if (b.unread_messages_count !== a.unread_messages_count) {
          return b.unread_messages_count - a.unread_messages_count;
        }
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

      log.info(`Found ${unread.length} unread conversations`);

      const summary = unread.map((c) => ({
        id: c.id,
        customer: c.contact?.name ?? c.contact?.email ?? "Unknown",
        channel: c.channel,
        unread_count: c.unread_messages_count,
        last_message: c.last_message?.message?.slice(0, 120) ?? "",
        last_message_at: c.last_message?.created_at ?? c.updated_at,
        assignee: c.assignee?.name ?? "Unassigned",
      }));

      return {
        content: [{
          type: "text",
          text: unread.length === 0
            ? "✅ No unread conversations — inbox is clear!"
            : `📬 ${unread.length} conversations need attention:\n\n${JSON.stringify(summary, null, 2)}`,
        }],
      };
    }

    case "generate_reply_draft": {
      const { conversation_id, context, auto_send } = args as {
        conversation_id: string;
        context?: string;
        auto_send?: boolean;
      };

      // Fetch recent messages
      const messages = await client.listMessages(conversation_id, { limit: 10 });
      const recent = messages.data.slice(-6); // last 6 messages for context

      const transcript = recent
        .map((m) => `[${m.author_type.toUpperCase()}]: ${m.message}`)
        .join("\n");

      // Build prompt for draft generation
      const prompt = [
        FURMALES_TONE,
        "",
        "Recent conversation:",
        transcript,
        context ? `\nAdditional context: ${context}` : "",
        "",
        "Write a helpful reply to the customer's last message. Return ONLY the reply text, no labels or quotes.",
      ].join("\n");

      log.info(`Generated reply draft for conversation ${conversation_id}`);

      // Return draft for review (Playfish will use send_message to actually send)
      const draft = `[DRAFT REPLY — review before sending]\n\n${prompt}\n\n---\nTo send: use send_message with conversation_id="${conversation_id}"`;

      if (auto_send) {
        // In a real deployment, Playfish would pass the drafted text here.
        // For now, return the draft and note that auto_send requires an LLM step.
        return {
          content: [{
            type: "text",
            text: `⚠️ auto_send=true requires an LLM to generate the reply text first.\nPlease use the draft below and call send_message manually.\n\n${draft}`,
          }],
        };
      }

      return {
        content: [{ type: "text", text: draft }],
      };
    }

    default:
      throw new Error(`Unknown message tool: ${name}`);
  }
}
