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
const stopPrice = getArg("stop-price", undefined);
const reduceOnly = args.includes("--reduce-only");

if (!symbol || !side || !size) {
  console.error("Usage: place-order.js --symbol ADA-USD --side buy|sell --type market|limit --size 100 [--price 0.45] [--stop-price 0.40] [--reduce-only]");
  process.exit(1);
}

const order = { symbol, side, type, size: Number(size) };
if (price) order.price = Number(price);
if (stopPrice) order.stop_price = Number(stopPrice);
if (reduceOnly) order.reduce_only = true;

console.log(`Placing ${type} ${side} ${size} ${symbol}${price ? ` @ ${price}` : ""}...`);
const result = await createOrder(order);
console.log("Order created:", JSON.stringify(result, null, 2));
