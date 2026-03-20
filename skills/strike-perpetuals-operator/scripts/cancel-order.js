#!/usr/bin/env node
import { cancelOrder } from "../../../scripts/strike-client.js";

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const orderId = getArg("order-id");
const symbol = getArg("symbol");

if (!orderId || !symbol) {
  console.error("Usage: cancel-order.js --order-id <id> --symbol ADA-USD");
  process.exit(1);
}

console.log(`Cancelling order ${orderId} on ${symbol}...`);
const result = await cancelOrder(orderId, symbol);
console.log("Cancelled:", JSON.stringify(result, null, 2));
