#!/usr/bin/env node
import { getOrderBookAsks, getOrderBookBids } from "../../../scripts/saturnswap-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const poolId = getArg("pool", null);
const side = getArg("side", "both");
const first = parseInt(getArg("first", "20"), 10);

if (!poolId) {
  console.error("Usage: order-book.js --pool <pool-uuid> [--side asks|bids|both] [--first N]");
  process.exit(1);
}

if (side === "asks" || side === "both") {
  const data = await getOrderBookAsks(poolId, { first });
  const asks = data.orderBookSellPoolUtxos.edges.map((e) => e.node);
  console.log(`=== ASKS (${asks.length}) — lowest first ===`);
  for (const a of asks) {
    console.log(`  price=${a.price}  sell=${a.token_amount_sell}  buy=${a.token_amount_buy}`);
  }
}

if (side === "bids" || side === "both") {
  const data = await getOrderBookBids(poolId, { first });
  const bids = data.orderBookBuyPoolUtxos.edges.map((e) => e.node);
  console.log(`=== BIDS (${bids.length}) — highest first ===`);
  for (const b of bids) {
    console.log(`  price=${b.price}  sell=${b.token_amount_sell}  buy=${b.token_amount_buy}`);
  }
}
