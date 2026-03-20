#!/usr/bin/env node
import { createOrder } from "../../../scripts/strike-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const symbol = getArg("symbol", null);
const side = getArg("side", null);
const type = getArg("type", "market");
const size = getArg("size", null);
const price = getArg("price", undefined);

if (!symbol || !side || !size) {
  console.error("Usage: confirm-and-place.js --symbol ADA-USD --side buy --type market --size 100 [--price 0.45]");
  process.exit(1);
}

console.log(`\n=== CONFIRM ORDER ===`);
console.log(`Symbol:  ${symbol}`);
console.log(`Side:    ${side}`);
console.log(`Type:    ${type}`);
console.log(`Size:    ${size}`);
if (price) console.log(`Price:   ${price}`);
console.log(`\nPlacing order...`);

const order = { symbol, side, type, size: Number(size) };
if (price) order.price = Number(price);

const result = await createOrder(order);
console.log("\nOrder placed:", JSON.stringify(result, null, 2));
