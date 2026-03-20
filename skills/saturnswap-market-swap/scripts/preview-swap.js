#!/usr/bin/env node
import { getPool, getOrderBookAsks, getOrderBookBids } from "../../../scripts/saturnswap-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const poolId = getArg("pool", null);
const amount = parseFloat(getArg("amount", "0"));
const side = getArg("side", "buy"); // buy = spending ADA to get tokens; sell = selling tokens for ADA

if (!poolId || !amount) {
  console.error("Usage: preview-swap.js --pool <uuid> --amount <display-units> [--side buy|sell]");
  process.exit(1);
}

const poolData = await getPool(poolId);
const pool = poolData.pool;
if (!pool) {
  console.error(`Pool ${poolId} not found`);
  process.exit(1);
}

const t1 = pool.token_project_one?.ticker || "ADA";
const t2 = pool.token_project_two?.ticker || "?";
const price = parseFloat(pool.token_project_two?.price || 0);

console.log(`Pool: ${t1}/${t2}`);
console.log(`Current price: ${price} ADA per ${t2}`);

if (side === "buy") {
  // Spending ADA to buy tokens — check asks
  const askData = await getOrderBookAsks(poolId, { first: 5 });
  const asks = askData.orderBookSellPoolUtxos.edges.map((e) => e.node);
  const bestAsk = asks[0]?.price || price;
  const estimatedTokens = price > 0 ? (amount / price).toFixed(6) : "N/A";
  console.log(`\nBuying ${t2} with ${amount} ADA`);
  console.log(`Best ask: ${bestAsk} ADA`);
  console.log(`Estimated output: ~${estimatedTokens} ${t2} (before slippage)`);
} else {
  // Selling tokens for ADA — check bids
  const bidData = await getOrderBookBids(poolId, { first: 5 });
  const bids = bidData.orderBookBuyPoolUtxos.edges.map((e) => e.node);
  const bestBid = bids[0]?.price || price;
  const estimatedAda = (amount * price).toFixed(6);
  console.log(`\nSelling ${amount} ${t2} for ADA`);
  console.log(`Best bid: ${bestBid} ADA`);
  console.log(`Estimated output: ~${estimatedAda} ADA (before slippage)`);
}
