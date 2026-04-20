# FurMates Shopify MCP Server

AI-powered control of Shopify store via Model Context Protocol (MCP).

## Features

- **Products**: List products, get details, update inventory
- **Orders**: List orders, get details, update status
- **Customers**: Customer management
- **Inventory**: Stock level monitoring

## Installation

```bash
cd mcp/shopify-mcp
npm install
```

## Configuration

Set these environment variables:

```bash
SHOPIFY_STORE_DOMAIN=xcwpr0-du.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_admin_api_access_token
```

## Usage

```bash
# Build
npm run build

# Run
npm start

# Development
npm run dev
```

## Tools Available

| Tool | Description |
|------|-------------|
| `list_products` | List all products |
| `get_product` | Get product details |
| `update_inventory` | Update inventory level |
| `list_orders` | List orders |
| `get_order` | Get order details |
| `update_order_status` | Update order status |

## Connect to Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "furmales-shopify": {
      "command": "node",
      "args": ["/path/to/furmales-automation/mcp/shopify-mcp/dist/index.js"],
      "env": {
        "SHOPIFY_STORE_DOMAIN": "xcwpr0-du.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "your_token"
      }
    }
  }
}
```

## Connect to OpenClaw

Add to mcporter config:

```json
{
  "mcpServers": {
    "shopify-furmales": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "SHOPIFY_STORE_DOMAIN": "xcwpr0-du.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "your_token"
      }
    }
  }
}
```

---

*Built by the FurMates AI Agent Team*
