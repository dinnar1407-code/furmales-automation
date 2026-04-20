# Task: Shopify Storefront MCP Development

**Created**: 2026-04-19
**Status**: Open
**Priority**: P0
**Assignee**: Claude Code (Mac A)

---

## 🎯 Objective

Create an MCP (Model Context Protocol) server that allows AI agents to autonomously operate a Shopify store. This MCP will enable Playfish (the main agent) to control Shopify operations without manual intervention.

---

## 📋 Requirements

### Core Capabilities

1. **Products**
   - List all products
   - Get product details
   - Create/update/delete products
   - Update inventory
   - Manage product images

2. **Orders**
   - List orders (with filters: status, date, customer)
   - Get order details
   - Update order status (fulfill, cancel, refund)
   - Add order notes

3. **Customers**
   - List customers
   - Get customer details
   - Update customer information

4. **Inventory**
   - Check stock levels
   - Update inventory quantities
   - Set up inventory alerts

### Technical Requirements

- Use Node.js >= 18
- Follow MCP SDK specification
- Support both stdio and HTTP transport
- Include proper error handling
- Log all operations

### Integration

- Must work with OpenClaw mcporter
- Must be compatible with shopify-api-node or @shopify/admin-api
- Should support Shopify Storefront API for public operations

---

## 🔧 Implementation Steps

1. **Set up project structure**
   ```
   furmales-shopify-mcp/
   ├── src/
   │   ├── index.ts
   │   ├── tools/
   │   │   ├── products.ts
   │   │   ├── orders.ts
   │   │   ├── customers.ts
   │   │   └── inventory.ts
   │   └── utils/
   ├── package.json
   └── tsconfig.json
   ```

2. **Implement Shopify API client**
   - Authenticate with Shopify Admin API
   - Handle rate limiting
   - Handle errors gracefully

3. **Implement MCP tools**
   - Register all tools with MCP SDK
   - Define schemas for inputs/outputs
   - Add tool descriptions for AI discovery

4. **Test with Playfish**
   - Connect to OpenClaw mcporter
   - Test each tool
   - Verify end-to-end flows

---

## 📁 Deliverables

1. `/tmp/furmales-automation/mcp/shopify-mcp/` - Complete MCP server
2. `CONFIG.md` - Setup instructions with Shopify API credentials
3. `TEST_RESULTS.md` - Test results for each tool

---

## 🚫 Constraints

- Do NOT commit API credentials (use environment variables)
- Do NOT modify MiniAIpdf codebase
- This is for FurMates project only

---

## 🤖 Success Criteria

- [ ] All 4 product tools work
- [ ] All 3 order tools work
- [ ] All 2 customer tools work
- [ ] Inventory check/update works
- [ ] Connected to OpenClaw mcporter
- [ ] Playfish can execute real operations

---

**Labels**: enhancement, mcp, shopify, automation
