/**
 * FurMates Shopify MCP - Test Suite
 * Tests all 21 tools with a mock Shopify client
 */

import { ShopifyClient } from "../src/utils/shopify-client";
import { handleProductTool } from "../src/tools/products";
import { handleOrderTool } from "../src/tools/orders";
import { handleCustomerTool } from "../src/tools/customers";
import { handleInventoryTool } from "../src/tools/inventory";

// ─── Mock Shopify Client ──────────────────────────────────────────────────────

const mockProduct = {
  id: "prod_001",
  title: "FurMates Premium Dog Collar",
  body_html: "<p>Premium collar for dogs</p>",
  vendor: "FurMates",
  product_type: "Accessories",
  status: "active",
  tags: "dog,collar,premium",
  variants: [
    {
      id: "var_001",
      product_id: "prod_001",
      title: "Small",
      price: "29.99",
      compare_at_price: "39.99",
      sku: "FM-COL-S",
      inventory_quantity: 50,
      inventory_item_id: "inv_001",
      weight: 0.2,
      weight_unit: "kg",
    },
  ],
  images: [],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-04-01T00:00:00Z",
};

const mockOrder = {
  id: "order_001",
  order_number: 1001,
  email: "customer@example.com",
  financial_status: "paid",
  fulfillment_status: null,
  total_price: "29.99",
  currency: "USD",
  created_at: "2026-04-01T00:00:00Z",
  line_items: [
    {
      id: "li_001",
      product_id: "prod_001",
      variant_id: "var_001",
      title: "FurMates Premium Dog Collar - Small",
      quantity: 1,
      price: "29.99",
      sku: "FM-COL-S",
    },
  ],
  customer: { id: "cust_001", email: "customer@example.com" },
  shipping_address: null,
  note: null,
  tags: "",
};

const mockCustomer = {
  id: "cust_001",
  email: "jane@example.com",
  first_name: "Jane",
  last_name: "Doe",
  phone: null,
  orders_count: 3,
  total_spent: "89.97",
  tags: "vip",
  note: null,
  accepts_marketing: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-04-01T00:00:00Z",
  addresses: [],
};

const mockInventoryLevel = {
  inventory_item_id: "inv_001",
  location_id: "loc_001",
  available: 50,
  updated_at: "2026-04-01T00:00:00Z",
};

const mockLocation = {
  id: "loc_001",
  name: "FurMates Warehouse",
  address1: "123 Pet St",
  city: "Los Angeles",
  country: "US",
  active: true,
};

function createMockClient(): jest.Mocked<ShopifyClient> {
  return {
    listProducts: jest.fn().mockResolvedValue({ products: [mockProduct] }),
    getProduct: jest.fn().mockResolvedValue({ product: mockProduct }),
    createProduct: jest.fn().mockResolvedValue({ product: { ...mockProduct, id: "prod_new" } }),
    updateProduct: jest.fn().mockResolvedValue({ product: { ...mockProduct, title: "Updated" } }),
    deleteProduct: jest.fn().mockResolvedValue({}),
    listOrders: jest.fn().mockResolvedValue({ orders: [mockOrder] }),
    getOrder: jest.fn().mockResolvedValue({ order: mockOrder }),
    updateOrder: jest.fn().mockResolvedValue({ order: mockOrder }),
    cancelOrder: jest.fn().mockResolvedValue({ order: { ...mockOrder, financial_status: "voided" } }),
    fulfillOrder: jest.fn().mockResolvedValue({ fulfillment: {} }),
    createRefund: jest.fn().mockResolvedValue({ refund: {} }),
    addOrderNote: jest.fn().mockResolvedValue({ order: { ...mockOrder, note: "Test note" } }),
    listCustomers: jest.fn().mockResolvedValue({ customers: [mockCustomer] }),
    getCustomer: jest.fn().mockResolvedValue({ customer: mockCustomer }),
    updateCustomer: jest.fn().mockResolvedValue({ customer: { ...mockCustomer, tags: "vip,angel" } }),
    searchCustomers: jest.fn().mockResolvedValue({ customers: [mockCustomer] }),
    getInventoryLevels: jest.fn().mockResolvedValue({ inventory_levels: [mockInventoryLevel] }),
    setInventoryLevel: jest.fn().mockResolvedValue({ inventory_level: { ...mockInventoryLevel, available: 100 } }),
    adjustInventoryLevel: jest.fn().mockResolvedValue({ inventory_level: { ...mockInventoryLevel, available: 60 } }),
    listLocations: jest.fn().mockResolvedValue({ locations: [mockLocation] }),
    request: jest.fn(),
  } as unknown as jest.Mocked<ShopifyClient>;
}

// ─── Product Tests ────────────────────────────────────────────────────────────

describe("Product Tools", () => {
  let client: jest.Mocked<ShopifyClient>;
  beforeEach(() => { client = createMockClient(); });

  test("list_products returns product list", async () => {
    const result = await handleProductTool("list_products", { limit: 10, status: "active" }, client);
    expect(client.listProducts).toHaveBeenCalledWith({ limit: 10, status: "active", vendor: undefined, product_type: undefined });
    expect(result.content[0].text).toContain("FurMates Premium Dog Collar");
  });

  test("get_product returns product detail", async () => {
    const result = await handleProductTool("get_product", { product_id: "prod_001" }, client);
    expect(client.getProduct).toHaveBeenCalledWith("prod_001");
    expect(result.content[0].text).toContain("prod_001");
  });

  test("create_product creates and returns new product", async () => {
    const result = await handleProductTool("create_product", {
      title: "New Dog Toy",
      status: "draft",
      vendor: "FurMates",
    }, client);
    expect(client.createProduct).toHaveBeenCalled();
    expect(result.content[0].text).toContain("✅ Product created successfully");
  });

  test("update_product updates product", async () => {
    const result = await handleProductTool("update_product", {
      product_id: "prod_001",
      title: "Updated Title",
    }, client);
    expect(client.updateProduct).toHaveBeenCalledWith("prod_001", { title: "Updated Title" });
    expect(result.content[0].text).toContain("✅ Product updated successfully");
  });

  test("delete_product deletes product", async () => {
    const result = await handleProductTool("delete_product", { product_id: "prod_001" }, client);
    expect(client.deleteProduct).toHaveBeenCalledWith("prod_001");
    expect(result.content[0].text).toContain("deleted successfully");
  });

  test("unknown tool throws error", async () => {
    await expect(handleProductTool("unknown_tool", {}, client)).rejects.toThrow("Unknown product tool");
  });
});

// ─── Order Tests ──────────────────────────────────────────────────────────────

describe("Order Tools", () => {
  let client: jest.Mocked<ShopifyClient>;
  beforeEach(() => { client = createMockClient(); });

  test("list_orders returns order list", async () => {
    const result = await handleOrderTool("list_orders", { status: "open", limit: 20 }, client);
    expect(client.listOrders).toHaveBeenCalled();
    expect(result.content[0].text).toContain("order_001");
  });

  test("get_order returns order detail", async () => {
    const result = await handleOrderTool("get_order", { order_id: "order_001" }, client);
    expect(client.getOrder).toHaveBeenCalledWith("order_001");
    expect(result.content[0].text).toContain("1001");
  });

  test("fulfill_order fulfills with tracking", async () => {
    const result = await handleOrderTool("fulfill_order", {
      order_id: "order_001",
      tracking_number: "1Z999AA10123456784",
      tracking_company: "UPS",
      notify_customer: true,
    }, client);
    expect(client.fulfillOrder).toHaveBeenCalledWith("order_001", {
      tracking_number: "1Z999AA10123456784",
      tracking_company: "UPS",
      notify_customer: true,
      location_id: undefined,
    });
    expect(result.content[0].text).toContain("✅ Order order_001 fulfilled");
  });

  test("cancel_order cancels with reason", async () => {
    const result = await handleOrderTool("cancel_order", {
      order_id: "order_001",
      reason: "customer",
    }, client);
    expect(client.cancelOrder).toHaveBeenCalledWith("order_001", "customer");
    expect(result.content[0].text).toContain("cancelled successfully");
  });

  test("refund_order creates full refund", async () => {
    const result = await handleOrderTool("refund_order", {
      order_id: "order_001",
      reason: "Customer not satisfied",
      refund_shipping: true,
    }, client);
    expect(client.createRefund).toHaveBeenCalled();
    expect(result.content[0].text).toContain("Refund created");
  });

  test("add_order_note adds note", async () => {
    const result = await handleOrderTool("add_order_note", {
      order_id: "order_001",
      note: "Angel customer — expedite",
    }, client);
    expect(client.addOrderNote).toHaveBeenCalledWith("order_001", "Angel customer — expedite");
    expect(result.content[0].text).toContain("Note added");
  });
});

// ─── Customer Tests ───────────────────────────────────────────────────────────

describe("Customer Tools", () => {
  let client: jest.Mocked<ShopifyClient>;
  beforeEach(() => { client = createMockClient(); });

  test("list_customers returns customer list", async () => {
    const result = await handleCustomerTool("list_customers", { limit: 25 }, client);
    expect(client.listCustomers).toHaveBeenCalledWith({ limit: 25, email: undefined });
    expect(result.content[0].text).toContain("jane@example.com");
  });

  test("search_customers finds by query", async () => {
    const result = await handleCustomerTool("search_customers", { query: "jane" }, client);
    expect(client.searchCustomers).toHaveBeenCalledWith("jane");
    expect(result.content[0].text).toContain("cust_001");
  });

  test("get_customer returns customer detail", async () => {
    const result = await handleCustomerTool("get_customer", { customer_id: "cust_001" }, client);
    expect(client.getCustomer).toHaveBeenCalledWith("cust_001");
    expect(result.content[0].text).toContain("Jane");
  });

  test("update_customer updates tags", async () => {
    const result = await handleCustomerTool("update_customer", {
      customer_id: "cust_001",
      tags: "vip,angel-customer",
    }, client);
    expect(client.updateCustomer).toHaveBeenCalledWith("cust_001", { tags: "vip,angel-customer" });
    expect(result.content[0].text).toContain("✅ Customer cust_001 updated");
  });
});

// ─── Inventory Tests ──────────────────────────────────────────────────────────

describe("Inventory Tools", () => {
  let client: jest.Mocked<ShopifyClient>;
  beforeEach(() => { client = createMockClient(); });

  test("check_inventory returns stock levels", async () => {
    const result = await handleInventoryTool("check_inventory", { location_id: "loc_001" }, client);
    expect(client.getInventoryLevels).toHaveBeenCalledWith("loc_001", undefined);
    expect(result.content[0].text).toContain("inv_001");
  });

  test("list_locations returns locations", async () => {
    const result = await handleInventoryTool("list_locations", {}, client);
    expect(client.listLocations).toHaveBeenCalled();
    expect(result.content[0].text).toContain("FurMates Warehouse");
  });

  test("set_inventory sets exact quantity", async () => {
    const result = await handleInventoryTool("set_inventory", {
      inventory_item_id: "inv_001",
      location_id: "loc_001",
      quantity: 100,
    }, client);
    expect(client.setInventoryLevel).toHaveBeenCalledWith({
      inventory_item_id: "inv_001",
      location_id: "loc_001",
      available: 100,
    });
    expect(result.content[0].text).toContain("Inventory set to 100");
  });

  test("adjust_inventory adjusts by delta", async () => {
    const result = await handleInventoryTool("adjust_inventory", {
      inventory_item_id: "inv_001",
      location_id: "loc_001",
      adjustment: 10,
      reason: "Restocked from supplier",
    }, client);
    expect(client.adjustInventoryLevel).toHaveBeenCalledWith({
      inventory_item_id: "inv_001",
      location_id: "loc_001",
      available_adjustment: 10,
    });
    expect(result.content[0].text).toContain("+10");
  });

  test("set_inventory_alert stores threshold", async () => {
    const result = await handleInventoryTool("set_inventory_alert", {
      inventory_item_id: "inv_001",
      threshold: 5,
    }, client);
    expect(result.content[0].text).toContain("Alert set");
    expect(result.content[0].text).toContain("5");
  });

  test("check_low_stock identifies low items", async () => {
    // Mock returns available: 50, threshold is 100 → item IS low
    const result = await handleInventoryTool("check_low_stock", { threshold: 100 }, client);
    expect(result.content[0].text).toContain("low-stock");
  });

  test("check_low_stock reports no issues when stock is sufficient", async () => {
    // threshold: 10, available: 50 → no low stock
    const result = await handleInventoryTool("check_low_stock", { threshold: 10 }, client);
    expect(result.content[0].text).toContain("No items below");
  });
});
