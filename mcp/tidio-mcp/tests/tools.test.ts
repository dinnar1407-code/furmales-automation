/**
 * FurMates Tidio MCP - Test Suite
 * 26 tests covering all 19 tools with mock TidioClient
 */

import { TidioClient } from "../src/utils/tidio-client";
import { handleConversationTool } from "../src/tools/conversations";
import { handleMessageTool } from "../src/tools/messages";
import { handleContactTool } from "../src/tools/contacts";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockConversation = {
  id: "conv_001",
  status: "open" as const,
  created_at: "2026-04-20T10:00:00Z",
  updated_at: "2026-04-20T10:30:00Z",
  channel: "live_chat",
  unread_messages_count: 2,
  contact: { id: "contact_001", name: "Jane Smith", email: "jane@example.com" },
  assignee: null,
  last_message: {
    message: "Where is my order?",
    created_at: "2026-04-20T10:30:00Z",
    author_type: "visitor" as const,
  },
  tags: [],
};

const mockMessage = {
  id: "msg_001",
  conversation_id: "conv_001",
  message: "Where is my order? I ordered 3 days ago.",
  type: "message" as const,
  author_type: "visitor" as const,
  created_at: "2026-04-20T10:30:00Z",
  seen_at: null,
};

const mockOperatorMessage = {
  id: "msg_002",
  conversation_id: "conv_001",
  message: "Hi! Let me check that for you.",
  type: "message" as const,
  author_type: "operator" as const,
  created_at: "2026-04-20T10:31:00Z",
  seen_at: "2026-04-20T10:32:00Z",
};

const mockContact = {
  id: "contact_001",
  email: "jane@example.com",
  name: "Jane Smith",
  phone: "+1234567890",
  city: "Los Angeles",
  country: "US",
  custom_properties: {},
  tags: ["repeat-buyer"],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-04-20T10:00:00Z",
  conversations_count: 3,
};

const mockOperator = {
  id: "op_001",
  name: "Terry",
  email: "terry@furmales.com",
  status: "online" as const,
  role: "admin" as const,
};

function createMockClient(): jest.Mocked<TidioClient> {
  return {
    listConversations: jest.fn().mockResolvedValue({ data: [mockConversation] }),
    getConversation: jest.fn().mockResolvedValue(mockConversation),
    updateConversation: jest.fn().mockResolvedValue({ ...mockConversation, status: "solved" }),
    closeConversation: jest.fn().mockResolvedValue({ ...mockConversation, status: "solved" }),
    assignConversation: jest.fn().mockResolvedValue({ ...mockConversation, assignee: { id: "op_001", name: "Terry" } }),
    unassignConversation: jest.fn().mockResolvedValue({ ...mockConversation, assignee: null }),
    listMessages: jest.fn().mockResolvedValue({ data: [mockMessage, mockOperatorMessage] }),
    sendMessage: jest.fn().mockResolvedValue({ ...mockMessage, id: "msg_new", author_type: "operator", message: "Hello!" }),
    listContacts: jest.fn().mockResolvedValue({ data: [mockContact] }),
    getContact: jest.fn().mockResolvedValue(mockContact),
    updateContact: jest.fn().mockResolvedValue({ ...mockContact, tags: ["repeat-buyer", "vip", "angel-customer"] }),
    searchContacts: jest.fn().mockResolvedValue({ data: [mockContact] }),
    getContactConversations: jest.fn().mockResolvedValue({ data: [mockConversation] }),
    listOperators: jest.fn().mockResolvedValue({ data: [mockOperator] }),
    request: jest.fn(),
  } as unknown as jest.Mocked<TidioClient>;
}

// ─── Conversation Tool Tests ──────────────────────────────────────────────────

describe("Conversation Tools", () => {
  let client: jest.Mocked<TidioClient>;
  beforeEach(() => { client = createMockClient(); });

  test("list_conversations returns open conversations", async () => {
    const result = await handleConversationTool("list_conversations", { status: "open", limit: 20 }, client);
    expect(client.listConversations).toHaveBeenCalledWith({ status: "open", limit: 20, page: undefined, assignee_id: undefined });
    expect(result.content[0].text).toContain("conv_001");
    expect(result.content[0].text).toContain("Jane Smith");
  });

  test("list_conversations shows unread count and last message", async () => {
    const result = await handleConversationTool("list_conversations", {}, client);
    expect(result.content[0].text).toContain("Where is my order");
  });

  test("get_conversation returns full detail", async () => {
    const result = await handleConversationTool("get_conversation", { conversation_id: "conv_001" }, client);
    expect(client.getConversation).toHaveBeenCalledWith("conv_001");
    expect(result.content[0].text).toContain("live_chat");
  });

  test("close_conversation closes without message", async () => {
    const result = await handleConversationTool("close_conversation", { conversation_id: "conv_001" }, client);
    expect(client.closeConversation).toHaveBeenCalledWith("conv_001");
    expect(client.sendMessage).not.toHaveBeenCalled();
    expect(result.content[0].text).toContain("✅ Conversation conv_001 closed");
  });

  test("close_conversation sends closing message first", async () => {
    const result = await handleConversationTool("close_conversation", {
      conversation_id: "conv_001",
      closing_message: "Thanks for reaching out! Issue resolved. 🐾",
    }, client);
    expect(client.sendMessage).toHaveBeenCalledWith("conv_001", {
      message: "Thanks for reaching out! Issue resolved. 🐾",
      type: "message",
      author_type: "operator",
    });
    expect(client.closeConversation).toHaveBeenCalledWith("conv_001");
    expect(result.content[0].text).toContain("Closing message sent");
  });

  test("reopen_conversation sets status to open", async () => {
    const result = await handleConversationTool("reopen_conversation", { conversation_id: "conv_001" }, client);
    expect(client.updateConversation).toHaveBeenCalledWith("conv_001", { status: "open" });
    expect(result.content[0].text).toContain("reopened");
  });

  test("assign_conversation assigns to operator", async () => {
    const result = await handleConversationTool("assign_conversation", {
      conversation_id: "conv_001",
      operator_id: "op_001",
    }, client);
    expect(client.assignConversation).toHaveBeenCalledWith("conv_001", "op_001");
    expect(result.content[0].text).toContain("assigned to operator op_001");
  });

  test("unassign_conversation removes assignment", async () => {
    const result = await handleConversationTool("unassign_conversation", { conversation_id: "conv_001" }, client);
    expect(client.unassignConversation).toHaveBeenCalledWith("conv_001");
    expect(result.content[0].text).toContain("unassigned");
  });

  test("list_operators returns agent list", async () => {
    const result = await handleConversationTool("list_operators", {}, client);
    expect(client.listOperators).toHaveBeenCalled();
    expect(result.content[0].text).toContain("Terry");
  });

  test("unknown tool throws error", async () => {
    await expect(handleConversationTool("nonexistent", {}, client)).rejects.toThrow("Unknown conversation tool");
  });
});

// ─── Message Tool Tests ───────────────────────────────────────────────────────

describe("Message Tools", () => {
  let client: jest.Mocked<TidioClient>;
  beforeEach(() => { client = createMockClient(); });

  test("get_conversation_history returns messages", async () => {
    const result = await handleMessageTool("get_conversation_history", {
      conversation_id: "conv_001",
      limit: 50,
    }, client);
    expect(client.listMessages).toHaveBeenCalledWith("conv_001", { limit: 50, page: undefined });
    expect(result.content[0].text).toContain("Where is my order");
    expect(result.content[0].text).toContain("visitor");
  });

  test("send_message sends operator message", async () => {
    const result = await handleMessageTool("send_message", {
      conversation_id: "conv_001",
      message: "Hi! Your order ships today. 🐾",
    }, client);
    expect(client.sendMessage).toHaveBeenCalledWith("conv_001", {
      message: "Hi! Your order ships today. 🐾",
      type: "message",
      author_type: "operator",
    });
    expect(result.content[0].text).toContain("✅ Message sent");
  });

  test("add_internal_note sends note type", async () => {
    const result = await handleMessageTool("add_internal_note", {
      conversation_id: "conv_001",
      note: "Customer is an Angel Customer — priority handling",
    }, client);
    expect(client.sendMessage).toHaveBeenCalledWith("conv_001", {
      message: "Customer is an Angel Customer — priority handling",
      type: "note",
      author_type: "operator",
    });
    expect(result.content[0].text).toContain("Internal note added");
    expect(result.content[0].text).toContain("not visible to customer");
  });

  test("get_unread_conversations filters and sorts by unread count", async () => {
    const result = await handleMessageTool("get_unread_conversations", { limit: 20 }, client);
    expect(client.listConversations).toHaveBeenCalledWith({ status: "open", limit: 20 });
    expect(result.content[0].text).toContain("conv_001"); // has unread_messages_count: 2
  });

  test("get_unread_conversations returns clear message when no unread", async () => {
    client.listConversations.mockResolvedValueOnce({
      data: [{ ...mockConversation, unread_messages_count: 0 }],
    });
    const result = await handleMessageTool("get_unread_conversations", {}, client);
    expect(result.content[0].text).toContain("inbox is clear");
  });

  test("generate_reply_draft fetches messages and returns draft", async () => {
    const result = await handleMessageTool("generate_reply_draft", {
      conversation_id: "conv_001",
      context: "Order #1234 shipped via USPS yesterday",
    }, client);
    expect(client.listMessages).toHaveBeenCalled();
    expect(result.content[0].text).toContain("DRAFT REPLY");
    expect(result.content[0].text).toContain("FurMates");
  });

  test("generate_reply_draft with auto_send warns appropriately", async () => {
    const result = await handleMessageTool("generate_reply_draft", {
      conversation_id: "conv_001",
      auto_send: true,
    }, client);
    expect(result.content[0].text).toContain("auto_send=true requires an LLM");
  });
});

// ─── Contact Tool Tests ───────────────────────────────────────────────────────

describe("Contact Tools", () => {
  let client: jest.Mocked<TidioClient>;
  beforeEach(() => { client = createMockClient(); });

  test("list_contacts returns contact list", async () => {
    const result = await handleContactTool("list_contacts", { limit: 30 }, client);
    expect(client.listContacts).toHaveBeenCalledWith({ limit: 30, page: undefined, email: undefined });
    expect(result.content[0].text).toContain("jane@example.com");
  });

  test("search_contacts finds by query", async () => {
    const result = await handleContactTool("search_contacts", { query: "Jane" }, client);
    expect(client.searchContacts).toHaveBeenCalledWith("Jane");
    expect(result.content[0].text).toContain("contact_001");
  });

  test("get_contact returns full detail", async () => {
    const result = await handleContactTool("get_contact", { contact_id: "contact_001" }, client);
    expect(client.getContact).toHaveBeenCalledWith("contact_001");
    expect(result.content[0].text).toContain("Jane Smith");
  });

  test("update_contact updates properties", async () => {
    const result = await handleContactTool("update_contact", {
      contact_id: "contact_001",
      tags: ["vip", "repeat-buyer"],
    }, client);
    expect(client.updateContact).toHaveBeenCalledWith("contact_001", { tags: ["vip", "repeat-buyer"] });
    expect(result.content[0].text).toContain("✅ Contact contact_001 updated");
  });

  test("get_contact_conversations returns history", async () => {
    const result = await handleContactTool("get_contact_conversations", {
      contact_id: "contact_001",
      limit: 10,
    }, client);
    expect(client.getContactConversations).toHaveBeenCalledWith("contact_001", { limit: 10 });
    expect(result.content[0].text).toContain("conv_001");
  });

  test("tag_angel_customer adds angel + vip tags", async () => {
    const result = await handleContactTool("tag_angel_customer", {
      contact_id: "contact_001",
      reason: "Top 1% customer by spend",
    }, client);
    expect(client.getContact).toHaveBeenCalledWith("contact_001");
    expect(client.updateContact).toHaveBeenCalledWith(
      "contact_001",
      expect.objectContaining({
        tags: expect.arrayContaining(["angel-customer", "vip"]),
      })
    );
    expect(result.content[0].text).toContain("🌟");
    expect(result.content[0].text).toContain("Angel Customer");
  });

  test("tag_angel_customer preserves existing tags", async () => {
    await handleContactTool("tag_angel_customer", { contact_id: "contact_001" }, client);
    const callArgs = (client.updateContact as jest.Mock).mock.calls[0][1];
    // Should include existing "repeat-buyer" tag
    expect(callArgs.tags).toContain("repeat-buyer");
    expect(callArgs.tags).toContain("angel-customer");
    expect(callArgs.tags).toContain("vip");
  });

  test("detect_customer_intent identifies shipping inquiry", async () => {
    client.listMessages.mockResolvedValueOnce({
      data: [{ ...mockMessage, message: "Where is my package? When will it be delivered?" }],
    });
    const result = await handleContactTool("detect_customer_intent", { conversation_id: "conv_001" }, client);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.detected_intent).toBe("shipping_inquiry");
    expect(parsed.actions.auto_respond).toBe(true);
  });

  test("detect_customer_intent identifies refund request", async () => {
    client.listMessages.mockResolvedValueOnce({
      data: [{ ...mockMessage, message: "I want a refund, the product is broken." }],
    });
    const result = await handleContactTool("detect_customer_intent", { conversation_id: "conv_001" }, client);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.detected_intent).toBe("complaint");
    expect(parsed.actions.needs_human).toBe(true);
  });

  test("detect_customer_intent handles no customer messages", async () => {
    client.listMessages.mockResolvedValueOnce({ data: [] });
    const result = await handleContactTool("detect_customer_intent", { conversation_id: "conv_001" }, client);
    expect(result.content[0].text).toContain("No customer messages found");
  });
});
