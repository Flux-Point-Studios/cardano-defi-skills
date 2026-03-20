#!/usr/bin/env node
import { getPool, getOrderBookAsks, getOrderBookBids } from "../../../scripts/saturnswap-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const poolId = getArg("pool", null);
const side = getArg("side", "buy");
const price = parseFloat(getArg("price", "0"));
const amount = parseFloat(getArg("amount", "0"));

if (!poolId || !price || !amount) {
  console.error("Usage: preview-limit.js --pool <uuid> --side buy|sell --price <ada-per-token> --amount <display-units>");
  process.exit(1);
}

const poolData = await getPool(poolId);
const pool = poolData.pool;
if (!pool) { console.error("Pool not found"); process.exit(1); }

const t2 = pool.token_project_two?.ticker || "?";
const marketPrice = parseFloat(pool.token_project_two?.price || 0);

console.log(`Pool: ADA/${t2}  Market price: ${marketPrice} ADA`);

if (side === "buy") {
  const tokensExpected = price > 0 ? (amount / price).toFixed(6) : "N/A";
  const diff = marketPrice > 0 ? (((price - marketPrice) / marketPrice) * 100).toFixed(1) : "N/A";
  console.log(`\nLimit BUY: Spend ${amount} ADA at ${price} ADA/${t2}`);
  console.log(`Expected: ~${tokensExpected} ${t2}`);
  console.log(`vs market: ${diff}%`);

  const askData = await getOrderBookAsks(poolId, { first: 3 });
  const asks = askData.orderBookSellPoolUtxos.edges.map((e) => e.node);
  if (asks.length) console.log(`Best ask: ${asks[0].price} ADA`);
  if (Math.abs(parseFloat(diff)) > 20) console.log("⚠ WARNING: Price is >20% from market");
} else {
  const adaExpected = (amount * price).toFixed(6);
  const diff = marketPrice > 0 ? (((price - marketPrice) / marketPrice) * 100).toFixed(1) : "N/A";
  console.log(`\nLimit SELL: Sell ${amount} ${t2} at ${price} ADA/${t2}`);
  console.log(`Expected: ~${adaExpected} ADA`);
  console.log(`vs market: ${diff}%`);

  const bidData = await getOrderBookBids(poolId, { first: 3 });
  const bids = bidData.orderBookBuyPoolUtxos.edges.map((e) => e.node);
  if (bids.length) console.log(`Best bid: ${bids[0].price} ADA`);
  if (Math.abs(parseFloat(diff)) > 20) console.log("⚠ WARNING: Price is >20% from market");
}
