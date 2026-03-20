#!/usr/bin/env node
/**
 * Unified DeFi Portfolio — queries all protocols in parallel.
 */

const args = process.argv.slice(2);
const address = args.indexOf("--address") !== -1 ? args[args.indexOf("--address") + 1] : null;

if (!address) {
  console.error("Usage: portfolio.js --address <bech32>");
  process.exit(1);
}

console.log(`=== Cardano DeFi Portfolio ===`);
console.log(`Wallet: ${address}\n`);

// Query all protocols in parallel
const results = await Promise.allSettled([
  // SaturnSwap orders
  import("../../../scripts/saturnswap-client.js").then((m) =>
    m.getUserOrders(address, { first: 50 })
  ),
  // SaturnSwap liquidity
  import("../../../scripts/saturnswap-client.js").then((m) =>
    m.getLiquidityPositions(address, { first: 50 })
  ),
  // Strike positions
  import("../../../scripts/strike-client.js").then((m) =>
    m.getPositions(address)
  ),
  // Bodega — requires market ID, skip for now
]);

// SaturnSwap Orders
if (results[0].status === "fulfilled") {
  const orders = results[0].value?.poolUtxos?.edges?.map((e) => e.node) || [];
  console.log(`--- SaturnSwap Orders (${orders.length}) ---`);
  for (const o of orders) {
    const pair = o.pool
      ? `${o.pool.token_project_one?.ticker || "ADA"}/${o.pool.token_project_two?.ticker || "?"}`
      : "?";
    console.log(`  ${pair}  ${o.active_type}  price=${o.price}  sell=${o.token_amount_sell}  buy=${o.token_amount_buy}`);
  }
  if (orders.length === 0) console.log("  None");
  console.log();
} else {
  console.log(`--- SaturnSwap Orders ---\n  Unavailable: ${results[0].reason?.message || "error"}\n`);
}

// SaturnSwap Liquidity
if (results[1].status === "fulfilled") {
  const lps = results[1].value?.liquidityPoolContracts?.edges?.map((e) => e.node) || [];
  console.log(`--- SaturnSwap Liquidity (${lps.length}) ---`);
  for (const lp of lps) {
    const pool = lp.pool;
    const t2 = pool?.token_project_two?.ticker || "?";
    const stats = lp.liquidity_pool_contract_stats;
    console.log(`  ADA/${t2}  ADA=${stats?.ada_order_token_one_amount || "?"}  ${t2}=${stats?.order_token_two_amount || "?"}`);
  }
  if (lps.length === 0) console.log("  None");
  console.log();
} else {
  console.log(`--- SaturnSwap Liquidity ---\n  Unavailable: ${results[1].reason?.message || "error"}\n`);
}

// Strike Perpetuals
if (results[2].status === "fulfilled") {
  const positions = Array.isArray(results[2].value) ? results[2].value : [];
  console.log(`--- Strike Perpetuals (${positions.length}) ---`);
  for (const p of positions) {
    console.log(`  ${JSON.stringify(p)}`);
  }
  if (positions.length === 0) console.log("  None");
  console.log();
} else {
  console.log(`--- Strike Perpetuals ---\n  Unavailable: ${results[2].reason?.message || "error"}\n`);
}

console.log("Note: Bodega positions require a specific market ID. Use bodega-markets skill to query.");
