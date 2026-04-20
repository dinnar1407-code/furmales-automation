# Task: Shopify API Integration & Real Operations

**Priority**: P2  
**Status**: Open  
**Created**: 2026-04-19

---

## 🎯 Objective

Connect the Shopify MCP to the real FurMates Shopify store and test end-to-end operations.

## 📋 Tasks

### 1. Get Shopify API Credentials
- [ ] Get Storefront API token from Shopify Admin
- [ ] Get Admin API access token
- [ ] Configure environment variables

### 2. Test Real Operations
- [ ] Test list_products with real products
- [ ] Test get_order with real orders
- [ ] Test update_inventory

### 3. Connect to OpenClaw
- [ ] Register shopify-mcp in mcporter.json
- [ ] Test from Playfish
- [ ] Document any API limitations

### 4. Create Test Workflow
- [ ] Run real API tests in CI/CD
- [ ] Document rate limits

## 🔧 Credentials Needed

```
SHOPIFY_STORE_DOMAIN=xcwpr0-du.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=xxxxx
SHOPIFY_ACCESS_TOKEN=xxxxx
```

## ✅ Success Criteria

- [ ] Playfish can list real products
- [ ] Playfish can see real orders
- [ ] No API errors in production

## 📁 Reference

- Shopify MCP: `mcp/shopify-mcp/`
- Credentials: Ask Terry or check 1Password
