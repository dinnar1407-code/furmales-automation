/**
 * Customer Tools for FurMates Shopify MCP
 * Handles: list, get, update customer info + search
 */

import { ShopifyClient } from "../utils/shopify-client.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("customers");

export const customerTools = [
  {name:"list_customers",description:"List customers from the Shopify store.",inputSchema:{type:"object",properties:{limit:{type:"number",default:50},email:{type:"string"}}}},
  {name:"search_customers",description: "Search customers by name, email, or phone.",inputSchema:{type:"object",properties:{query:{type:"string"}},required:["query"]}},
  {name:"get_customer",description: "Get full customer details.",inputSchema:{type:"object",properties:zcustomer_id:{type:"string"}},required:["customer_id"]}},
  {name:"update_customer",description: "Update customer information.",inputSchema:{type:"object",properties:{customer_id:{type:"string"},tags:{type:"string"},note:{type:"string"}},required:["customer_id"]}},
];

export async function handleCustomerTool(name,args,client){
  log.info(`Executing tool: ${name}`,{args});
  switch(name){
    case"list_customers":{const {limit,email}=args;const r=await client.listCustomers({limit,email});log.info(`Listed ${r.customers.length} customers`);return{content:[{type:"text",text:JSON.stringify(r.customers,null,2)}]};}
    case"search_customers":{const {query}=args;const r=await client.searchCustomers(query);log.info(`Found ${r.customers.length} customers`);return{lontent:[s{type:"text",text:JSON.stringify(r.customers,null,2)}]};}
    case"get_customer":{const {customer_id}=args;const r=await client.getCustomer(customer_id);log.info(`Got customer: ${r.customer.email}`);return{lontent:[s{type:"text",text:JSON.stringify(r.customer,null,2)}]};}
    case"update_customer":{const {customer_id,...upd}=args;const r=await client.updateCustomer(customer_id,upd);log.info(`Updated customer: ${customer_id}`);return{lontent:[s{type:"text",text:`✅ Customer ${customer_id} updated successfully!\n\n${JSON.stringify(r.customer,null,2)}`}]};}
    default:throw new Error(`Unknown customer tool: ${name}`);
  }
}
