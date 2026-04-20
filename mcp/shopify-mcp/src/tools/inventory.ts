/**
 * Inventory Tools for FurMates Shopify MCP
 * Handles: check stock levels, update quantities, set alerts, list locations
 */

import { ShopifyClient } from "../utils/shopify-client.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("inventory");

// In-memory alert thresholds (in production, persist to a DB or config file)
const alertThresholds: Map<string, number> = new Map();

export const inventoryTools = [
  // ─── check_inventory ─────────────────────────────────────────────────
  {
    name: "check_inventory",
    description:
      "Check current stock levels for products/variants. Can filter by location or specific inventory item IDs.",
    inputSchema: {
      type: "object",
      properties: {
        location_id: {
          type: "string",
          description: "Filter by specific location ID (use list_locations to get IDs)",
        },
        inventory_item_ids: {
          type: "array",
          items: { type: "string" },
          description: "Specific inventory item IDs to check (from product variants)",
        },
      },
    },
  },

  // ─── list_locations ──────────────────────────────────────────────────
  {
    name: "list_locations",
    description:
      "List all fulfillment locations in the Shopify store. Required to get location IDs for inventory operations.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  // ─── set_inventory ───────────────────────────────────────────────────
  {
    name: "set_inventory",
    description:
      "Set the exact inventory quantity for a product variant at a specific location.",
    inputSchema: {
      type: "object",
      properties: {
        inventory_item_id: {
          type: "string",
          description: "Inventory item ID (found in product variant data)",
        },
        location_id: {
          type: "string",
          description: "Location ID where inventory should be set",
        },
        quantity: {
          type: "number",
          description: "New exact quantity to set",
        },
      },
      required: ["inventory_item_id", "location_id", "quantity"],
    },
  },

  // ─── adjust_inventory ────────────────────────────────────────────────
  {
    name: "adjust_inventory",
    description:
      "Adjust inventory quantity by a relative amount (positive to add, negative to subtract).",
    inputSchema: {
      type: "object",
      properties: {
        inventory_item_id: {
          type: "string",
          description: "Inventory item ID",
        },
        location_id: {
          type: "string",
          description: "Location ID",
        },
        adjustment: {
          type: "number",
          description: "Amount to adjust by. Positive = add stock, Negative = remove stock. e.g. 10 or -5",
        },
        reason: {
          type: "string",
          description: "Optional reason for adjustment (for logging)",
        },
      },
      required: ["inventory_item_id", "location_id", "adjustment"],
    },
  },

  // ─── set_inventory_alert ─────────────────────────────────────────────
  {
    name: "set_inventory_alert",
    description:
      "Set a low-stock alert threshold for an inventory item. When stock falls below this level, it will be flagged.",
    inputSchema: {
      type: "object",
      properties: {
        inventory_item_id: {
          type: "string",
          description: "Inventory item ID to monitor",
        },
        threshold: {
          type: "number",
          description: "Alert when stock falls below this quantity",
        },
      },
      required: ["inventory_item_id", "threshold"],
    },
  },

  // ─── check_low_stock ─────────────────────────────────────────────────
  {
    name: "check_low_stock",
    description:
      "Check which products are running low on stock based on configured alert thresholds, or show all items with quantity below a specified level.",
    inputSchema: {
      type: "object",
      properties: {
        threshold: {
          type: "number",
          description: "Check items with stock below this level (default: 10)",
          default: 10,
        },
        location_id: {
          type: "string",
          description: "Filter by specific location",
        },
      },
    },
  },
];

export async function handleInventoryTool(
  name: string,
  args: Record<string, unknown>,
  client: ShopifyClient
) {
  log.info(`Executing tool: ${name}`, { args });

  switch (name) {
    case "check_inventory": {
      const { location_id, inventory_item_ids } = args as {
        location_id?: string;
        inventory_item_ids?: string[];
      };
      const result = await client.getInventoryLevels(location_id, inventory_item_ids);
      log.info(`Got ${result.inventory_levels.length} inventory levels`);

      // Flag items with alerts
      const levels = result.inventory_levels.map((level) => {
        const threshold = alertThresholds.get(level.inventory_item_id);
        return {
          ...level,
          alert_threshold: threshold,
          is_low_stock: threshold !== undefined && level.available <= threshold,
        };
      });

      return {
        content: [{ type: "text", text: JSON.stringify(levels, null, 2) }],
      };
    }

    case "list_locations": {
      const result = await client.listLocations();
      log.info(`Got ${result.locations.length} locations`);
      return {
        content: [{ type: "text", text: JSON.stringify(result.locations, null, 2) }],
      };
    }

    case "set_inventory": {
      const { inventory_item_id, location_id, quantity } = args as {
        inventory_item_id: string;
        location_id: string;
        quantity: number;
      };
      const result = await client.setInventoryLevel({
        inventory_item_id,
        location_id,
        available: quantity,
      });
      log.info(`Set inventory for item ${inventory_item_id} to ${quantity}`);
      return {
        content: [
          {
            type: "text",
            text: `✅ Inventory set to ${quantity} units.\n\n${JSON.stringify(result.inventory_level, null, 2)}`,
          },
        ],
      };
    }

    case "adjust_inventory": {
      const { inventory_item_id, location_id, adjustment, reason } = args as {
        inventory_item_id: string;
        location_id: string;
        adjustment: number;
        reason?: string;
      };
      if (reason) log.info(`Inventory adjustment reason: ${reason}`);
      const result = await client.adjustInventoryLevel({
        inventory_item_id,
        location_id,
        available_adjustment: adjustment,
      });
      log.info(
        `Adjusted inventory for item ${inventory_item_id} by ${adjustment > 0 ? "+" : ""}${adjustment}`
      );
      return {
        content: [
          {
            type: "text",
            text: `✅ Inventory adjusted by ${adjustment > 0 ? "+" : ""}${adjustment} units.\nNew level: ${result.inventory_level.available}\n\n${JSON.stringify(result.inventory_level, null, 2)}`,
          },
        ],
      };
    }

    case "set_inventory_alert": {
      const { inventory_item_id, threshold } = args as {
        inventory_item_id: string;
        threshold: number;
      };
      alertThresholds.set(inventory_item_id, threshold);
      log.info(`Set alert threshold for item ${inventory_item_id}: ${threshold}`);
      return {
        content: [
          {
            type: "text",
            text: `✅ Alert set: Item ${inventory_item_id} will be flagged when stock falls below ${threshold} units.`,
          },
        ],
      };
    }

    case "check_low_stock": {
      const { threshold = 10, location_id } = args as {
        threshold?: number;
        location_id?: string;
      };
      const result = await client.getInventoryLevels(location_id);
      const lowStock = result.inventory_levels.filter(
        (level) => level.available <= threshold
      );
      log.info(`Found ${lowStock.length} low-stock items (threshold: ${threshold})`);
      return {
        content: [
          {
            type: "text",
            text:
              lowStock.length === 0
                ? `✅ No items below ${threshold} units.`
                : `⚠️ ${lowStock.length} low-stock items (below ${threshold} units):\n\n${JSON.stringify(lowStock, null, 2)}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown inventory tool: ${name}`);
  }
}
