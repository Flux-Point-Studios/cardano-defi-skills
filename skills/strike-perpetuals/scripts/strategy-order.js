#!/usr/bin/env node
import { createStrategyOrder } from "../../../scripts/strike-client.js";
import { webcrypto } from "crypto";

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
const tpPrice = getArg("tp-price", undefined);
const slPrice = getArg("sl-price", undefined);

if (!symbol || !side || !size || (!tpPrice && !slPrice)) {
  console.error(
    "Usage: strategy-order.js --symbol ADA-USD --side buy --type market --size 100 " +
      "[--price 0.45] --tp-price 0.50 --sl-price 0.40"
  );
  process.exit(1);
}

const strategy = {
  strategy_id: webcrypto.randomUUID(),
  symbol,
  side,
  type,
  size: Number(size),
};
if (price) strategy.price = Number(price);
if (tpPrice) {
  strategy.tp_order = {
    type: "take_profit",
    stop_price: Number(tpPrice),
    size: Number(size),
  };
}
if (slPrice) {
  strategy.sl_order = {
    type: "stop",
    stop_price: Number(slPrice),
    size: Number(size),
  };
}

console.log(`Placing ${type} ${side} ${size} ${symbol} with TP=${tpPrice || "none"} SL=${slPrice || "none"}...`);
const result = await createStrategyOrder(strategy);
console.log("Strategy order created:", JSON.stringify(result, null, 2));
