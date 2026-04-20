/**
 * Product Tools for FurMates Shopify MCP
 * Handles: list, get, create, update, delete products + image management
 */

import { z } from "zod";
import { ShopifyClient } from "../utils/shopify-client.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("products");

export const productTools = [
  // ─── list_products ──────────────────────────────────────────────────
  {
    name: "list_products",
    description:
      "List all products in the Shopify store with optional filters. Returns product ID, title, status, variants, pricing, and inventory info.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Max number of products to return (1-250, default 50)",
          default: 50,
        },
        status: {
          type: "string",
          enum: ["active", "draft", "archived"],
          description: "Filter by product status",
        },
        vendor: {
          type: "string",
          description: "Filter by vendor name",
        },
        product_type: {
          type: "string",
          description: "Filter by product type",
        },
      },
    },
  },

  // ─── get_product ─────────────────────────────────────────────────────
  {
    name: "get_product",
    description:
      "Get full details of a specific product by its Shopify ID, including all variants, images, and metafields.",
    inputSchema: {
      type: "object",
      properties: {
        product_id: {
          type: "string",
          description: "Shopify product ID",
        },
      },
      required: ["product_id"],
    },
  },

  // ─── create_product ──────────────────────────────────────────────────
  {
    name: "create_product",
    description:
      "Create a new product in the Shopify store. Supports title, description, pricing, images, variants, and more.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Product title (required)" },
        body_html: {
          type: "string",
          description: "Product description in HTML",
        },
        vendor: { type: "string", description: "Product vendor/brand" },
        product_type: { type: "string", description: "Product type/category" },
        tags: {
          type: "string",
          description: "Comma-separated product tags",
        },
        status: {
          type: "string",
          enum: ["active", "draft", "archived"],
          description: "Product status (default: draft)",
          default: "draft",
        },
        variants: {
          type: "array",
          description: "Product variants with pricing and inventory",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              price: { type: "string", description: "e.g. '29.99'" },
              compare_at_price: { type: "string" },
              sku: { type: "string" },
              inventory_quantity: { type: "number" },
              weight: { type: "number" },
              weight_unit: { type: "string", enum: ["lb", "kg", "g", "oz"] },
            },
          },
        },
        images: {
          type: "array",
          description: "Product images",
          items: {
            type: "object",
            properties: {
              src: { type: "string", description: "Image URL" },
              alt: { type: "string", description: "Alt text" },
            },
          },
        },
      },
      required: ["title"],
    },
  },

  // ─── update_product ──────────────────────────────────────────────────
  {
    name: "update_product",
    description:
      "Update an existing product. Can update any combination of title, description, status, tags, variants, and images.",
    inputSchema: {
      type: "object",
      properties: {
        product_id: {
          type: "string",
          description: "Shopify product ID to update",
        },
        title: { type: "string" },
        body_html: { type: "string" },
        vendor: { type: "string" },
        product_type: { type: "string" },
        tags: { type: "string" },
        status: {
          type: "string",
          enum: ["active", "draft", "archived"],
        },
        variants: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "Variant ID (required to update existing variant)" },
              price: { type: "string" },
              compare_at_price: { type: "string" },
              sku: { type: "string" },
            },
          },
        },
      },
      required: ["product_id"],
    },
  },

  // ─── delete_product ──────────────────────────────────────────────────
  {
    name: "delete_product",
    description: "Permanently delete a product from the Shopify store. This action cannot be undone.",
    inputSchema: {
      type: "object",
      properties: {
        product_id: {
          type: "string",
          description: "Shopify product ID to delete",
        },
      },
      required: ["product_id"],
    },
  },
];

export async function handleProductTool(
  name: string,
  args: Record<string, unknown>,
  client: ShopifyClient
) {
  log.info(`Executing tool: ${name}`, { args });

  switch (name) {
    case "list_products": {
      const { limit, status, vendor, product_type } = args as {
        limit?: number;
        status?: string;
        vendor?: string;
        product_type?: string;
      };
      const result = await client.listProducts({ limit, status, vendor, product_type });
      log.info(`Listed ${result.products.length} products`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.products, null, 2),
          },
        ],
      };
    }

    case "get_product": {
      const { product_id } = args as { product_id: string };
      const result = await client.getProduct(product_id);
      log.info(`Got product: ${result.product.title}`);
      return {
        content: [{ type: "text", text: JSON.stringify(result.product, null, 2) }],
      };
    }

    case "create_product": {
      const productData = args as any;
      const result = await client.createProduct(productData);
      log.info(`Created product: ${result.product.id} - ${result.product.title}`);
      return {
        content: [
          {
            type: "text",
            text: `✅ Product created successfully!\nID: ${result.product.id}\nTitle: ${result.product.title}\nStatus: ${result.product.status}\n\n${JSON.stringify(result.product, null, 2)}`,
          },
        ],
      };
    }

    case "update_product": {
      const { product_id, ...updateData } = args as { product_id: string; [key: string]: unknown };
      const result = await client.updateProduct(product_id, updateData as any);
      log.info(`Updated product: ${result.product.id}`);
      return {
        content: [
          {
            type: "text",
            text: `✅ Product updated successfully!\n\n${JSON.stringify(result.product, null, 2)}`,
          },
        ],
      };
    }

    case "delete_product": {
      const { product_id } = args as { product_id: string };
      await client.deleteProduct(product_id);
      log.info(`Deleted product: ${product_id}`);
      return {
        content: [
          {
            type: "text",
            text: `✅ Product ${product_id} deleted successfully.`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown product tool: ${name}`);
  }
}
