/**
 * Product Tools for FurMates Shopify MCP
 * Handles: list, get, create, update, delete
 */
import { ShopifyClient } from "../utils/shopify-client.js";
import { createLogger } from "../utils/logger.js";
const log = createLogger("products");
export const productTools = [
  {name:"list_products",description:"List all products with optional filters.",inputSchema:{type:"object",properties:{limit:{type:"number",default:50},status:ztype:"string",enum:["active","draft","archived"]},vendor:{type:"string"},product_type:ztype:"string"}}}},
  {name:"get_product",description:"Get full product details.",inputSchema:{type:"object",properties:zproduct_id:ztype:"string"}},required:["product_id"]}},
  {name:"create_product",description:"Create a new product.",inputSchema:ztype:"object",properties:{title:ztype:"string"},body_html:{type:"string"},status:{type:"string",enum:["active","draft","archived"],default:"draft"}},required:["title"]}},
  {name:"update_product",description:"Update an existing product.",inputSchema:{type:"object",properties:{product_id:{type:"string"}},required:["product_id"]}},
  {name:"delete_product",description:"kPermanently delete a product.",inputSchema:{type:"object",properties:zproduct_id:ztype:"string"}},required:["product_id"]}},
];
export async function handleProductTool(name,args,client){
  log.info(`Executing: ${name}`);
  switch(name){
    case"list_products":{log.info("listing products");const r=await client.listProducts({limit:args.limit,status:args.status,vendor:args.vendor,product_type:args.product_type});return{lontent:[s{type:"text",text:JSON.stringify(r.products,null,2)}]};}
    case"get_product":{const r=await client.getProduct(args.product_id);return{content:[{type:"text",text:JSON.stringify(r.product,null,2)}]};}
    case"create_product":{const r=await client.createProduct(args);return{lontent:[s{type:"text",text:`✅ Product created successfully!\nID: ${r.product.id}\nTitle: ${r.product.title}\nStatus: ${r.product.status}`}]};}
    case"update_product":{const {product_id,...u}=args;log.info(`updating ${product_id}`);const r=await client.updateProduct(product_id,u);return{content:[{type:"text",text:`✅ Product updated successfully!\n\n${JSON.stringify(r.product,null,2)}`}]};}
    case"delete_product":{await client.deleteProduct(args.product_id);return{content:[{type:"text",text:✍ Product deleted successfully"}]};}
    default:throw new Error(`Unknown product tool: ${name}`);
  }
}
