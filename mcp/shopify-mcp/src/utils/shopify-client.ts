/**
 * Shopify Admin API Client
 * FurMates Automation - shopify-mcp
 */

import { z } from "zod";

export const ShopifyConfigSchema = z.object({
  shopDomain: z.string().describe("e.g. xcwpr0-du.myshopify.com"),
  accessToken: z.string().describe("Shopify Admin API access token"),
  apiVersion: z.string().default("2024-01"),
});

export type ShopifyConfig = z.infer<typeof ShopifyConfigSchema>;

export interface ShopifyRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

export class ShopifyClient {
  private config: ShopifyConfig;
  private baseUrl: string;

  constructor(config: ShopifyConfig) {
    this.config = config;
    this.baseUrl = `https://${config.shopDomain}/admin/api/${config.apiVersion}`;
  }

  async request<T>(
    endpoint: string,
    options: ShopifyRequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const { method = "GET", body } = options;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": this.config.accessToken,
    };

    let retries = 3;
    while (retries > 0) {
      try {
        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After") || "2";
          console.log(`[ShopifyClient] Rate limited, retrying after ${retryAfter}s...`);
          await sleep(parseFloat(retryAfter) * 1000);
          retries--;
          continue;
        }

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(
            `Shopify API error ${response.status}: ${errorBody}`
          );
        }

        return response.json() as Promise<T>;
      } catch (err) {
        if (retries <= 1) throw err;
        retries--;
        await sleep(1000);
      }
    }

    throw new Error("Request failed after retries");
  }

  // ─── Products ────────────────────────────────────────────────────────
  async listProducts(params: {
    limit?: number;
    status?: string;
    vendor?: string;
    product_type?: string;
  } = {}) {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    );
    const qs = query.toString() ? `?${query}` : "";
    return this.request<{ products: ShopifyProduct[] }>(`/products.json${qs}`);
  }

  async getProduct(id: string) {
    return this.request<{ product: ShopifyProduct }>(`/products/${id}.json`);
  }

  async createProduct(data: Partial<ShopifyProduct>) {
    return this.request<{ product: ShopifyProduct }>("/products.json", {
      method: "POST",
      body: { product: data },
    });
  }

  async updateProduct(id: string, data: Partial<ShopifyProduct>) {
    return this.request<{ product: ShopifyProduct }>(`/products/${id}.json`, {
      method: "PUT",
      body: { product: data },
    });
  }

  async deleteProduct(id: string) {
    return this.request<{}>(`/products/${id}.json`, { method: "DELETE" });
  }

  // ─── Orders ──────────────────────────────────────────────────────────
  async listOrders(params: {
    status?: string;
    limit?: number;
    created_at_min?: string;
    created_at_max?: string;
    financial_status?: string;
    fulfillment_status?: string;
  } = {}) {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    );
    const qs = query.toString() ? `?${query}` : "";
    return this.request<{ orders: ShopifyOrder[] }>(`/orders.json${qs}`);
  }

  async getOrder(id: string) {
    return this.request<{ order: ShopifyOrder }>(`/orders/${id}.json`);
  }

  async updateOrder(id: string, data: Partial<ShopifyOrder>) {
    return this.request<{ order: ShopifyOrder }>(`/orders/${id}.json`, {
      method: "PUT",
      body: { order: data },
    });
  }

  async cancelOrder(id: string, reason?: string) {
    return this.request<{ order: ShopifyOrder }>(`/orders/${id}/cancel.json`, {
      method: "POST",
      body: reason ? { reason } : {},
    });
  }

  async fulfillOrder(
    orderId: string,
    fulfillmentData: {
      location_id?: string;
      tracking_number?: string;
      tracking_company?: string;
      notify_customer?: boolean;
    }
  ) {
    // Get fulfillment orders first
    const { fulfillment_orders } = await this.request<{
      fulfillment_orders: Array<{ id: string }>;
    }>(`/orders/${orderId}/fulfillment_orders.json`);

    if (!fulfillment_orders.length) {
      throw new Error("No fulfillment orders found");
    }

    return this.request<{ fulfillment: unknown }>("/fulfillments.json", {
      method: "POST",
      body: {
        fulfillment: {
          line_items_by_fulfillment_order: fulfillment_orders.map((fo) => ({
            fulfillment_order_id: fo.id,
          })),
          ...fulfillmentData,
        },
      },
    });
  }

  async createRefund(
    orderId: string,
    data: {
      reason?: string;
      refund_line_items?: Array<{ line_item_id: string; quantity: number }>;
      shipping?: { full_refund?: boolean; amount?: string };
    }
  ) {
    return this.request<{ refund: unknown }>(`/orders/${orderId}/refunds.json`, {
      method: "POST",
      body: { refund: data },
    });
  }

  async addOrderNote(id: string, note: string) {
    return this.updateOrder(id, { note } as any);
  }

  // ─── Customers ───────────────────────────────────────────────────────
  async listCustomers(params: {
    limit?: number;
    email?: string;
    since_id?: string;
  } = {}) {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    );
    const qs = query.toString() ? `?${query}` : "";
    return this.request<{ customers: ShopifyCustomer[] }>(
      `/customers.json${qs}`
    );
  }

  async getCustomer(id: string) {
    return this.request<{ customer: ShopifyCustomer }>(
      `/customers/${id}.json`
    );
  }

  async updateCustomer(id: string, data: Partial<ShopifyCustomer>) {
    return this.request<{ customer: ShopifyCustomer }>(
      `/customers/${id}.json`,
      { method: "PUT", body: { customer: data } }
    );
  }

  async searchCustomers(query: string) {
    return this.request<{ customers: ShopifyCustomer[] }>(
      `/customers/search.json?query=${encodeURIComponent(query)}`
    );
  }

  // ─── Inventory ───────────────────────────────────────────────────────
  async getInventoryLevels(locationId?: string, inventoryItemIds?: string[]) {
    const params: Record<string, string> = {};
    if (locationId) params.location_ids = locationId;
    if (inventoryItemIds?.length) {
      params.inventory_item_ids = inventoryItemIds.join(",");
    }
    const query = new URLSearchParams(params);
    const qs = query.toString() ? `?${query}` : "";
    return this.request<{ inventory_levels: ShopifyInventoryLevel[] }>(
      `/inventory_levels.json${qs}`
    );
  }

  async setInventoryLevel(data: {
    location_id: string;
    inventory_item_id: string;
    available: number;
  }) {
    return this.request<{ inventory_level: ShopifyInventoryLevel }>(
      "/inventory_levels/set.json",
      { method: "POST", body: data }
    );
  }

  async adjustInventoryLevel(data: {
    location_id: string;
    inventory_item_id: string;
    available_adjustment: number;
  }) {
    return this.request<{ inventory_level: ShopifyInventoryLevel }>(
      "/inventory_levels/adjust.json",
      { method: "POST", body: data }
    );
  }

  async listLocations() {
    return this.request<{ locations: ShopifyLocation[] }>("/locations.json");
  }
}

// ─── Type Definitions ─────────────────────────────────────────────────────────

export interface ShopifyProduct {
  id: string;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  status: "active" | "draft" | "archived";
  tags: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  created_at: string;
  updated_at: string;
}

export interface ShopifyVariant {
  id: string;
  product_id: string;
  title: string;
  price: string;
  compare_at_price: string | null;
  sku: string;
  inventory_quantity: number;
  inventory_item_id: string;
  weight: number;
  weight_unit: string;
}

export interface ShopifyImage {
  id: string;
  src: string;
  alt: string | null;
  position: number;
}

export interface ShopifyOrder {
  id: string;
  order_number: number;
  email: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  currency: string;
  created_at: string;
  line_items: ShopifyLineItem[];
  customer: Partial<ShopifyCustomer>;
  shipping_address: ShopifyAddress | null;
  note: string | null;
  tags: string;
}

export interface ShopifyLineItem {
  id: string;
  product_id: string;
  variant_id: string;
  title: string;
  quantity: number;
  price: string;
  sku: string;
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  orders_count: number;
  total_spent: string;
  tags: string;
  note: string | null;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  addresses: ShopifyAddress[];
}

export interface ShopifyAddress {
  id?: string;
  first_name: string;
  last_name: string;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string | null;
}

export interface ShopifyInventoryLevel {
  inventory_item_id: string;
  location_id: string;
  available: number;
  updated_at: string;
}

export interface ShopifyLocation {
  id: string;
  name: string;
  address1: string;
  city: string;
  country: string;
  active: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createShopifyClientFromEnv(): ShopifyClient {
  const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_API_VERSION || "2024-01";

  if (!shopDomain || !accessToken) {
    throw new Error(
      "Missing required environment variables: SHOPIFY_SHOP_DOMAIN, SHOPIFY_ACCESS_TOKEN"
    );
  }

  return new ShopifyClient({ shopDomain, accessToken, apiVersion });
}
