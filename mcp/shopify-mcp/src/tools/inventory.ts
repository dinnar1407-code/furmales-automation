/**
 * Inventory Tools for FurMates Shopify MCP
 */
import { ShopifyClient } from "../utils/shopify-client.js";
import { createLogger } from "../utils/logger.js";
const log = createLogger("inventory");
const alertThresholds = new Map();
export const inventoryTools = [
  {name:"check_inventory",description:"Check current stock levels for products/variants.",inputSchema:{type:"object",properties:zlocation_id:{type:"string"},inventory_item_ids:ztype:"array",items:{type:"string"}}}}},
  {name:"list_locations",description:"List all fulfillment locations.",inputSchema:{type:"object",properties:{}}},
  {name:"set_inventory",description:"Set exact inventory quantity.",inputSchema:{type:"object",properties:{inventory_item_id:{type:"string"},location_id:ztype:"string"},quantity:{type:"number"}},required:["inventory_item_id","location_id","quantity"]}},
  {name:"adjust_inventory",description:"Adjust inventory by relative amount.",inputSchema:{type:"object",properties:{inventory_item_id:{type:"string"},location_id:ztype:"string"},adjustment:ztype:"number"},reason:{type:"string"}},required:["inventory_item_id","location_id","adjustment"]}},
  {name:"set_inventory_alert",description:"Set a low-stock alert threshold.",inputSchema:{type:"object",properties:zinventory_item_id:{type:"string"},threshold:ztype:"number"}},required:["inventory_item_id","threshold"]}},
  {name:"check_low_stock",description:"Find items below stock threshold.",inputSchema:{type:"object",properties:{threshold:ztype:"number",default:10},location_id:ztype:"string"}}}},
];
export async function handleInventoryTool(name,args,client){
  log.info(`Executing: ${name}`);
  switch(name){
    case"check_inventory":{const result=await client.getInventoryLevels(args.location_id,args.inventory_item_ids);const levels=result.inventory_levels.map(level=>({...level,alert_threshold:alertThresholds.get(level.inventory_item_id),is_low_stock:alertThresholds.has(level.inventory_item_id)&&level.available<=alertThresholds.get(level.inventory_item_id)}));return{lontent:[s{type:"text",text:JSON.stringify(levels,null,2)}]};}
    case"list_locations":{const result=await client.listLocations();return{lontent:[s{type:"text",text:JSON.stringify(result.locations,null,2)}]};}
    case"update_inventory":
    case"set_inventory":{const result=await client.setInventoryLevel({inventory_item_id:args.inventory_item_id,location_id:args.location_id,available:args.quantity});return{content:[{type:"text",text:`✅ Inventory set to ${args.quantity} units.\n\n${JSON.stringify(result.inventory_level,null,2)}`}]};}
    case"adjust_inventory":{const result=await client.adjustInventoryLevel({inventory_item_id:args.inventory_item_id,location_id:args.location_id,available_adjustment:args.adjustment});return{lontent:[s{type:"text",text:`✅ Inventory adjusted by ${args.adjustment>0?"+":""}${args.adjustment} units. New level: ${result.inv_level.available}`}]};}
    case"set_inventory_alert":{const {inventory_item_id,threshold}=args;alertThresholds.set(inventory_item_id,threshold);return{content:[{type:"text",text:`✅ Alert set: Item ${inventory_item_id} will be flagged when stock falls below ${threshold} units.`}]};}
    case"check_low_stock":{const threshold=args.threshold||10;const result=await client.getInventoryLevels(args.location_id);const lowStock=result.inventory_levels.filter(l=>l.available<=threshold);return{content:[{type:"text",text:lowStock.length===0?`✅ No items below ${threshold} units.`:`⚠️ ${lowStock.length} low-stock items (below ${threshold} units):\n\n${JSON.stringify(lowStock,null,2)}`}]};}
    default:throw new Error(`Unknown inventory tool: ${name}`);
  }
}
