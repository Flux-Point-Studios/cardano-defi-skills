#!/usr/bin/env node
import { getPositions, getOpenOrders } from "../../../scripts/strike-client.js";

const args = process.argv.slice(2);
const symbol = args.indexOf("--symbol") !== -1 ? args[args.indexOf("--symbol") + 1] : undefined;

const posData = await getPositions(symbol);
const positions = posData.positions || [];
console.log(`=== Open Positions (${positions.length}) ===`);
for (const p of positions) {
  console.log(
    `  ${p.symbol}  ${p.Side}  size=${p.Size}  entry=${p.EntryPrice}  ` +
      `lev=${p.Leverage}x  upnl=${p.upnl}  liq=${p.liquidation_price}`
  );
}
if (positions.length === 0) console.log("  None");

try {
  const orderData = await getOpenOrders(symbol);
  const orders = orderData.orders || [];
  if (orders.length > 0) {
    console.log(`\n=== Open Orders (${orders.length}) ===`);
    for (const o of orders) {
      console.log(`  ${o.Symbol || o.symbol}  ${o.Side}  ${o.Type}  size=${o.Size}  price=${o.Price}`);
    }
  }
} catch (_e) {}
