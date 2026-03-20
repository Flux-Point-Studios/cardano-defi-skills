#!/usr/bin/env node
import { getOrderBook } from "../../../scripts/strike-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const symbol = getArg("symbol", "ADA-USD");
const limit = parseInt(getArg("limit", "10"), 10);

const book = await getOrderBook(symbol, limit);

console.log(`=== ${symbol} Order Book ===`);
console.log(`Update ID: ${book.lastUpdateId}`);

if (book.asks?.length) {
  console.log(`\nAsks (${book.asks.length}):`);
  for (const [price, qty] of book.asks.slice(0, limit)) {
    console.log(`  ${price}  qty=${qty}`);
  }
}

if (book.bids?.length) {
  console.log(`\nBids (${book.bids.length}):`);
  for (const [price, qty] of book.bids.slice(0, limit)) {
    console.log(`  ${price}  qty=${qty}`);
  }
}
