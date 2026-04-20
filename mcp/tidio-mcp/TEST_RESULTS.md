# FurMates Tidio MCP - Test Results

**Date**: 2026-04-20  
**Version**: 1.0.0  
**Environment**: Mock (unit tests — real API requires live Tidio credentials)

---

## Summary

| Category | Tools | Tests | Status |
|----------|-------|-------|--------|
| Conversations | 7 | 10 | ✅ All Pass |
| Messages | 5 | 7 | ✅ All Pass |
| Contacts | 7 | 9 | ✅ All Pass |
| **Total** | **19** | **26** | ✅ **26/26 Pass** |

---

## Conversations Tools

| Tool | Test | Result |
|------|------|--------|
| `list_conversations` | Returns open conversations with customer & unread info | ✅ Pass |
| `list_conversations` | Shows last message preview | ✅ Pass |
| `get_conversation` | Returns full conversation detail | ✅ Pass |
| `close_conversation` | Closes without optional message | ✅ Pass |
| `close_conversation` | Sends closing message before closing | ✅ Pass |
| `reopen_conversation` | Sets status to open | ✅ Pass |
| `assign_conversation` | Assigns to operator by ID | ✅ Pass |
| `unassign_conversation` | Removes assignment | ✅ Pass |
| `list_operators` | Returns agents with IDs and status | ✅ Pass |
| Error handling | Unknown tool throws error | ✅ Pass |

## Messages Tools

| Tool | Test | Result |
|------|------|--------|
| `get_conversation_history` | Returns messages with author/timestamp | ✅ Pass |
| `send_message` | Sends operator message to customer | ✅ Pass |
| `add_internal_note` | Sends note type (not visible to customer) | ✅ Pass |
| `get_unread_conversations` | Filters and sorts by unread count | ✅ Pass |
| `get_unread_conversations` | Reports clear inbox when no unread | ✅ Pass |
| `generate_reply_draft` | Fetches messages, returns FurMates-branded draft | ✅ Pass |
| `generate_reply_draft` | auto_send=true warns appropriately | ✅ Pass |

## Contacts Tools

| Tool | Test | Result |
|------|------|--------|
| `list_contacts` | Returns paginated contact list | ✅ Pass |
| `search_contacts` | Finds contacts by query | ✅ Pass |
| `get_contact` | Returns full contact detail | ✅ Pass |
| `update_contact` | Updates tags and properties | ✅ Pass |
| `get_contact_conversations` | Returns conversation history | ✅ Pass |
| `tag_angel_customer` | Adds angel-customer + vip tags | ✅ Pass |
| `tag_angel_customer` | Preserves existing tags (no overwrite) | ✅ Pass |
| `detect_customer_intent` | Identifies shipping inquiry → auto_respond | ✅ Pass |
| `detect_customer_intent` | Identifies complaint/refund → escalate_to_human | ✅ Pass |
| `detect_customer_intent` | Handles conversation with no messages | ✅ Pass |

---

## Integration Checklist

> Requires live Tidio credentials (Plus/Premium plan)

- [ ] Server starts via stdio
- [ ] `list_conversations` returns real FurMates conversations
- [ ] `get_unread_conversations` correctly identifies unread chats
- [ ] `send_message` delivers message to real customer
- [ ] `add_internal_note` visible only in operator view
- [ ] `tag_angel_customer` updates contact in Tidio dashboard
- [ ] `detect_customer_intent` correctly routes test conversations
- [ ] OpenClaw mcporter connection confirmed
- [ ] Playfish can execute end-to-end customer service flow

---

## Intent Detection Coverage

The `detect_customer_intent` tool uses rule-based classification:

| Intent | Keywords | Routing |
|--------|----------|---------|
| `refund_request` | refund, money back, reimburse | escalate_to_human |
| `shipping_inquiry` | track, shipped, delivery, package | auto_respond |
| `order_inquiry` | order + number, my order | auto_respond |
| `complaint` | broken, damaged, wrong, missing | escalate_to_human |
| `product_question` | how does, recommend, which, best | auto_respond |
| `compliment` | love, amazing, great, thank you | acknowledge_and_close |
| `cancellation` | cancel, stop, unsubscribe | escalate_to_human |
| `other` | (default) | general_support |
