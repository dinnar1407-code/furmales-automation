# Task: Tidio MCP Development

**Created**: 2026-04-19
**Status**: Open
**Priority**: P1
**Assignee**: Claude Code (Mac A)

---

## 🎯 Objective

Create an MCP server that allows AI agents to autonomously manage Tidio customer support conversations. This will enable automated customer service with AI-powered responses.

---

## 📋 Requirements

### Core Capabilities

1. **Conversations**
   - List active conversations
   - Get conversation details and messages
   - Mark conversation as read/closed
   - Assign conversation to agent

2. **Messages**
   - Read conversation history
   - Send new message (agent or automated)
   - Mark message as seen

3. **Automation**
   - Trigger auto-responders
   - Set up chat routing rules
   - Detect customer intent

4. **Contacts**
   - Get contact information
   - Update contact properties
   - Get contact conversation history

### Technical Requirements

- Use Node.js >= 18
- Follow MCP SDK specification
- Support Tidio REST API v2
- Handle webhook events (if supported)

### Integration

- Must work with OpenClaw mcporter
- Should trigger Playfish for complex queries
- Should integrate with FurMates Angel Customer workflow

---

## 🔧 Implementation Steps

1. **Set up project structure**
   ```
   furmales-tidio-mcp/
   ├── src/
   │   ├── index.ts
   │   ├── tools/
   │   │   ├── conversations.ts
   │   │   ├── messages.ts
   │   │   └── contacts.ts
   │   └── utils/
   ├── package.json
   └── tsconfig.json
   ```

2. **Implement Tidio API client**
   - Authenticate with Tidio API
   - Handle pagination
   - Handle rate limiting

3. **Implement MCP tools**
   - Register all tools with MCP SDK
   - Define input/output schemas
   - Add AI-friendly descriptions

4. **Test integration**
   - Connect to OpenClaw
   - Test conversation flows
   - Verify message sending

---

## 📁 Deliverables

1. `/tmp/furmales-automation/mcp/tidio-mcp/` - Complete MCP server
2. `CONFIG.md` - Setup with Tidio API credentials
3. `TEST_RESULTS.md` - Test results

---

## 🚫 Constraints

- Do NOT commit API credentials
- Do NOT modify MiniAIpdf codebase
- Focus on FurMates customer service workflow

---

## 🤖 Success Criteria

- [ ] List active conversations
- [ ] Read conversation messages
- [ ] Send message to customer
- [ ] Get contact information
- [ ] Connected to OpenClaw mcporter
- [ ] Playfish can execute customer service tasks

---

**Labels**: enhancement, mcp, tidio, customer-service
