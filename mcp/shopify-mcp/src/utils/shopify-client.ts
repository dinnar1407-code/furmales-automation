/**
 * Shopify Admin API Client - FurMates MCP
 */
import { z } from "zod";
export const ShopifyConfigSchema = z.object({shopDomain:z.string(),accessToken:z.string(),apiVersion:z.string().default("2024-01")});
export type ShopifyConfig = z.infer<typeof ShopifyConfigSchema>;
export interface ShopifyProduct{id:string;title:string;body_html:string;vendor:string;product_type:string;status:"active"|"draft"|"archived";tags:string;variants:any[];images:any[];created_at:string;updated_at:string}
export interface ShopifyOrder{id:string;o$Tder_number:number;email:string;financial_status:string;fulfillment_status:string|null;total_price:string;currency:string;created_at:string;line_items:any[];customer:any;shipping_address:any;note:string|null;tags:string}
export interface ShopifyCustomer{id:string;email:string;first_name:string;last_name:string;phone:string|null;orders_count:number;total_spent:string;tags:string;note:string|null;accepts_marketing:boolean;addresses:any[]{created_at:string;updated_at:string}
export interface ShopifyInventoryLevel{inventory_item_id:string;location_id:string;available:number;updated_at:string}
export interface ShopifyLocation{id:string;name:string;address1:string;city:string;country:string;active:boolean}
export class ShopifyClient{
  private config:ShopifyConfig;
  private baseUrl:string;
  constructor(config:ShopifyConfig){this.config=config;this.baseUrl=`https://${config.shopDomain}/admin/api/${config.apiVersion}`;}
  async request<T>(endpoint:string,options:{method?:string;body?:unknown}>{}):Promise<T>{
    const url=this.baseUrl+endpoint;
    const {method='GET',body}=options;
    const headers:Record<string,string>={'Content-Type':'application/json','X-Shopify-Access-Token':this.config.accessToken};
    let retries=3;
    while(retries>0){try{const response=await fetch(url,{method,headers,body:body?JSON.stringify(body):undefined});if(response.status===429){await new Promise(r=>setTimeout(r,(parseFloat(response.headers.get('Retry-After')||'2'))*1000));retries--;continue;}if(!response.ok){throw new Error(`Shopify API error ${response.status}: ${await response.text()}`);}return await response.json() as T;}catch(err){if(retries<=1)throw err;retries--;await new Promise(r=>setTimeout(r,1000));}}
    throw new Error('Request failed after retries');
  }
  async listProducts(params:{limit?:number;status?:string;vendor?:string;product_type?:string}>{}){const qs=new URLSearchParams(Object.entries(params).filter(([,v])=>v!=null).map(([q,v])=>[q,String(v)])).toString();return this.request<{products:ShopifyProduct[]}>(`/products.json${qs?'?'+qs:'}`);}
  async getProduct(id:string){return this.request<{product:ShopifyProduct}>(`/products/${id}.json`);}
  async createProduct(d:Partial<ShopifyProduct>){return this.request<{product:ShopifyProduct}>('/products.json',{method:'POST',body:{product:d}});}
  async updateProduct(id:string,d:Partial<ShopifyProduct>){return this.request<{product:ShopifyProduct}>(`/products/${id}.json`,{method:'PUT',body:{product:d}});}
  async deleteProduct(id:string){return this.request<{}>(`/products/${id}.json`,{method:'DELETE'});}
  async listOrders(params:{status?:string;limit?:number;created_at_min?:string;created_at_max?:string;financial_status?:string;fulfillment_status?:string}={}){const qs=new URLSearchParams(Object.entries(params).filter(([,v])=>v!=null).map(([q,v])=>[q,String(v)])).toString();return this.request<{orders:ShopifyOrder[]}>(`/orders.json${qs?'?'+qs:''}`);}
  async getOrder(id:string){return this.request<{order:ShopifyOrder}>(`/orders/${id}.json`);}
  async updateOrder(id:string,d:Partial<ShopifyOrder>){return this.request<{order:ShopifyOrder}>(`/orders/${id}.json`,{method:'PUT',body:{order:d}});}
  async cancelOrder(id:string,reason?:string){return this.request<{order:ShopifyOrder}>(`/orders/${id}/cancel.json`,{method:'POST',body:reason?{reason}:{}});}
  async fulfillOrder(orderId:string,d:any){const {fulfillment_orders}=await this.request<{fulfillment_orders:any[]}>(`/orders/${orderId}/fulfillment_orders.json`);if(!fulfillment_orders.length)throw new Error('No fulfillment orders');return this.request('/fulfillments.json',{method:'POST',body:{fulfillment:{line_items_by_fulfillment_order:fulfillment_orders.map(fo=>({fulfillment_order_id:fo.id})),...d}}});}
  async createRefund(orderId:string,d:any){return this.request(`/orders/${orderId}/refunds.json`,{method:'POST',body:{refund:d}});}
  async addOrderNote(id:string,note:string){return this.updateOrder(id,{note} as any);}
  async listCustomers(params?{limit?:number;email?:string}){const qs=new URLSearchParams(Object.entries(params||{}).filter(([,v])=>v!=null).map(([q,v])=>[q,String(v)])).toString();return this.request<{customers:ShopifyCustomer[]}>(`/customers.json${qs?'?'+qs:''}`);}
  async getCustomer(id:string){return this.request<{customer:ShopifyCustomer}>(`/customers/${id}.json`);}
  async updateCustomer(id:string,d:Partial<ShopifyCustomer>){return this.request<{customer:ShopifyCustomer}>(`/customers/${id}.json`,{method:'PUT',body:{customer:d}});}
  async searchCustomers(q:string){return this.request<{customers:ShopifyCustomer[]}>(`/customers/search.json?query=${encodeURIComponent(q)}`);}
  async getInventoryLevels(locationId?:string,inventoryItemIds?:string[]){const p:Record<string,string>={};if(locationId)p.location_ids=locationId;if(inventoryItemIds?.length)p.inventory_item_ids=inventoryItemIds.join(',');const qs=new URLSearchParams(p).toString();return this.request<{inventory_levels:ShopifyInventoryLevel[]}>(`/inventory_levels.json${qs?'?'+qs:''}`);}
  async setInventoryLevel(d:{location_id:string;inventory_item_id:string;available:number}){return this.request<{inventory_level:ShopifyInventoryLevel}>('/inventory_levels/set.json',{method:'POST',body:d});}
  async adjustInventoryLevel(d:{location_id:string;inventory_item_id:string;available_adjustment:number}){return this.request<{inventory_level:ShopifyInventoryLevel}>('/inventory_levels/adjust.json',{method:'POST',body:d});}
  async listLocations(){return this.request<{locations:ShopifyLocation[]}>('/locations.json');}
}
export function createShopifyClientFromEnv():ShopifyClient{const shopDomain=process.env.SHOPIFY_SHOP_DOMAIN;const accessToken=process.env.SHOPIFY_ACCESS_TOKEN;const apiVersion=process.env.SHOPIFY_API_VERSION||"2024-01";if(!shopDomain||!accessToken)throw new Error("Missing required env vars: SHOPIFY_SHOP_DOMAIN, SHOPIFY_ACCESS_TOKEN");return new ShopifyClient({shopDomain,accessToken,apiVersion});}
