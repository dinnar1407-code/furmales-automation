/**
 * Conversation Tools for FurMates Tidio MCP
 * list / get / close / assign / unassign / reopen conversations
 */

import { TidioClient } from "../utils/tidio-client.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("conversations");

export const conversationTools = [
  // ─── list_conversations ──────────────────────────────────────────────
  {
    name: "list_conversations",
    description:
      "List Tidio customer service conversations. Filter by status (open/solved/pending), and paginate results. Returns conversation ID, status, channel, customer info, unread count, and last message preview.",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["open", "solved", "pending"],
          description: "Filter by conversation status (default: open)",
          default: "open",
        },
        limit: {
          type: "number",
          description: "Number of conversations to return (default: 20, max: 100)",
          default: 20,
        },
        page: {
          type: "number",
          description: "Page number for pagination (default: 1)",
          default: 1,
        },
        assignee_id: {
          type: "string",
          description: "Filter by operator ID (only show conversations assigned to this agent)",
        },
      },
    },
  },

  // ─── get_conversation ────────────────────────────────────────────────
  {
    name: "get_conversation",
    description:
      "Get full details of a specific Tidio conversation, including customer info, channel, status, assignee, tags, and unread message count.",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "Tidio conversation ID",
        },
      },
      required: ["conversation_id"],
    },
  },

  // ─── close_conversation ──────────────────────────────────────────────
  {
    name: "close_conversation",
    description:
      "Mark a conversation as solved/closed. Use when the customer issue has been resolved. Optionally send a closing message before closing.",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "Tidio conversation ID to close",
        },
        closing_message: {
          type: "string",
          description: "Optional message to send to the customer before closing (e.g. 'Thanks for reaching out! Your issue has been resolved.')",
        },
      },
      required: ["conversation_id"],
    },
  },

  // ─── reopen_conversation ─────────────────────────────────────────────
  {
    name: "reopen_conversation",
    description: "Reopen a solved/closed conversation, setting its status back to open.",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "Tidio conversation ID to reopen",
        },
      },
      required: ["conversation_id"],
    },
  },

  // ─── assign_conversation ─────────────────────────────────────────────
  {
    name: "assign_conversation",
    description:
      "Assign a conversation to a specific operator/agent. Use list_operators to get available operator IDs.",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "Tidio conversation ID",
        },
        operator_id: {
          type: "string",
          description: "Operator ID to assign the conversation to",
        },
      },
      required: ["conversation_id", "operator_id"],
    },
  },

  // ─── unassign_conversation ───────────────────────────────────────────
  {
    name: "unassign_conversation",
    description: "Remove the current agent assignment from a conversation, returning it to the unassigned queue.",
    inputSchema: {
      type: "object",
      properties: {
        conversation_id: {
          type: "string",
          description: "Tidio conversation ID",
        },
      },
      required: ["conversation_id"],
    },
  },

  // ─── list_operators ──────────────────────────────────────────────────
  {
    name: "list_operators",
    description:
      "List all Tidio agents/operators with their IDs, names, emails, and online status. Use to find operator IDs for conversation assignment.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

export async function handleConversationTool(
  name: string,
  args: Record<string, unknown>,
  client: TidioClient
) {
  log.info(`Executing: ${name}`, { args });

  switch (name) {
    case "list_conversations": {
      const { status, limit, page, assignee_id } = args as {
        status?: "open" | "solved" | "pending";
        limit?: number;
        page?: number;
        assignee_id?: string;
      };
      const result = await client.listConversations({ status, limit, page, assignee_id });
      log.info(`Listed ${result.data.length} conversations`);

      const summary = result.data.map((c) => ({
        id: c.id,
        status: c.status,
        channel: c.channel,
        customer: c.contact?.name ?? c.contact?.email ?? "Unknown",
        unread: c.unread_messages_count,
        assignee: c.assignee?.name ?? "Unassigned",
        last_message: c.last_message?.message?.slice(0, 100) ?? "",
        last_message_from: c.last_message?.author_type ?? "",
        updated_at: c.updated_at,
      }));

      return {
        content: [{
          type: "text",
          text: `Found ${result.data.length} conversations:\n\n${JSON.stringify(summary, null, 2)}`,
        }],
      };
    }

    case "get_conversation": {
      const { conversation_id } = args as { conversation_id: string };
      const result = await client.getConversation(conversation_id);
      log.info(`Got conversation: ${conversation_id} [${result.status}]`);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }

    case "close_conversation": {
      const { conversation_id, closing_message } = args as {
        conversation_id: string;
        closing_message?: string;
      };
      // Optionally send closing message first
      if (closing_message) {
        await client.sendMessage(conversation_id, {
          message: closing_message,
          type: "message",
          author_type: "operator",
        });
        log.info(`Sent closing message to conversation: ${conversation_id}`);
      }
      const result = await client.closeConversation(conversation_id);
      log.info(`Closed conversation: ${conversation_id}`);
      return {
        content: [{
          type: "text",
          text: `✅ Conversation ${conversation_id} closed (status: solved).${closing_message ? `\nClosing message sent: "${closing_message}"` : ""}\n\n${JSON.stringify(result, null, 2)}`,
        }],
      };
    }

    case "reopen_conversation": {
      const { conversation_id } = args as { conversation_id: string };
      const result = await client.updateConversation(conversation_id, { status: "open" });
      log.info(`Reopened conversation: ${conversation_id}`);
      return {
        content: [{
          type: "text",
          text: `✅ Conversation ${conversation_id} reopened.\n\n${JSON.stringify(result, null, 2)}`,
        }],
      };
    }

    case "assign_conversation": {
      const { conversation_id, operator_id } = args as {
        conversation_id: string;
        operator_id: string;
      };
      const result = await client.assignConversation(conversation_id, operator_id);
      log.info(`Assigned conversation ${conversation_id} → operator ${operator_id}`);
      return {
        content: [{
          type: "text",
          text: `✅ Conversation ${conversation_id} assigned to operator ${operator_id}.\n\n${JSON.stringify(result, null, 2)}`,
        }],
      };
    }

    case "unassign_conversation": {
      const { conversation_id } = args as { conversation_id: string };
      const result = await client.unassignConversation(conversation_id);
      log.info(`Unassigned conversation: ${conversation_id}`);
      return {
        content: [{
          type: "text",
          text: `✅ Conversation ${conversation_id} unassigned.\n\n${JSON.stringify(result, null, 2)}`,
        }],
      };
    }

    case "list_operators": {
      const result = await client.listOperators();
      log.info(`Listed ${result.data.length} operators`);
      return {
        content: [{ type: "text", text: JSON.stringify(result.data, null, 2) }],
      };
    }

    default:
      throw new Error(`Unknown conversation tool: ${name}`);
  }
}
