# FurMates Shopify MCP - Configuration Guide

## Prerequisites

- Node.js >= 18
- A Shopify store with Admin API access
- Shopify Admin API access token (Private App or Custom App)

---

## Environment Variables

Create a `.env` file or set these in your shell / Claude Code environment:

```bash
# Required
SHOPIFY_SHOP_DOMAIN=xcwpr0-du.myshopify.com      # Your Shopify store domain
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxx   # Admin API access token

# Optional
SHOPIFY_API_VERSION=2024-01   # Default: 2024-01
DEBUG=true                     # Enable verbose debug logging
MCP_HTTP_PORT=3000             # (future) HTTP transport port
```

> ⚠️ **NEVER commit these values to Git.** Use environment variables only.

---

## Getting a Shopify Access Token

1. Go to your Shopify Admin → **Settings** → **Apps and sales channels**
2. Click **Develop apps** → **Create an app**
3. Name it `FurMates MCP`
4. Under **Configuration** → **Admin API access scopes**, enable:
   - `read_products`, `write_products`
   - `read_orders`, `write_orders`
   - `read_customers`, `write_customers`
   - `read_inventory`, `write_inventory`
   - `read_locations`
5. Click **Install app** → **Install**
6. Copy the **Admin API access token** — you only see it once!

---

## Installation

```bash
cd mcp/shopify-mcp
npm install
npm run build
```

---

## Running the Server

### Stdio (default — for Claude Code / MCP clients)

```bash
SHOPIFY_SHOP_DOMAIN=xcwpr0-du.myshopify.com \
SHOPIFY_ACCESS_TOKEN=shpat_xxx \
node dist/index.js
```

### Claude Code mcporter Integration

Add to your Claude Code MCP config:

```json
{
  "mcpServers": {
    "furmales-shopify": {
      "command": "node",
      "args": ["/path/to/mcp/shopify-mcp/dist/index.js"],
      "env": {
        "SHOPIFY_SHOP_DOMAIN": "xcwpr0-du.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_xxx"
      }
    }
  }
}
```

---

## Available Tools (18 total)

### Products (5 tools)
| Tool | Description |
|------|-------------|
| `list_products` | List all products with optional filters |
| `get_product` | Get product details by ID |
| `create_product` | Create a new product |
| `update_product` | Update existing product |
| `delete_product` | Delete a product |

### Orders (6 tools)
| Tool | Description |
|------|-------------|
| `list_orders` | List orders with filters |
| `get_order` | Get order details |
| `fulfill_order` | Mark order as fulfilled + add tracking |
| `cancel_order` | Cancel an order |
| `refund_order` | Create full or partial refund |
| `add_order_note` | Add internal note to order |

### Customers (4 tools)
| Tool | Description |
|------|-------------|
| `list_customers` | List customers |
| `search_customers` | Search customers by any attribute |
| `get_customer` | Get customer details |
| `update_customer` | Update customer info, tags, notes |

### Inventory (4 tools)
| Tool | Description |
|------|-------------|
| `check_inventory` | Check current stock levels |
| `list_locations` | List fulfillment locations |
| `set_inventory` | Set exact inventory quantity |
| `adjust_inventory` | Adjust inventory by amount |
| `check_low_stock` | Find low-stock items |
| `set_inventory_alert` | Configure stock alert thresholds |

---

## Troubleshooting

**`Missing required environment variables`** → Set `SHOPIFY_SHOP_DOMAIN` and `SHOPIFY_ACCESS_TOKEN`.

**`Shopify API error 401`** → Check your access token is correct and not expired.

**`Shopify API error 403`** → Check your app has the required API scopes (see above).

**`Shopify API error 429`** → Rate limited. The client automatically retries — no action needed.
