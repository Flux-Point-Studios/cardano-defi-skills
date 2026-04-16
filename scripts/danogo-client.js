/**
 * Danogo CL DEX & Lending Client
 *
 * Query on-chain pool state via Ogmios for stablecoin swap quotes,
 * pool prices, and lending pool information.
 *
 * Environment variables:
 *   OGMIOS_URL — Ogmios WebSocket/HTTP endpoint (default: http://localhost:1337)
 *
 * Usage:
 *   node danogo-client.js pools                  — List known pool addresses
 *   node danogo-client.js price <pair>           — Get current price (e.g., USDA/DJED)
 *   node danogo-client.js quote <pair> <amount>  — Get swap quote
 *   node danogo-client.js lending-pools          — List lending pools
 *   node danogo-client.js lending-rate <pool>    — Get lending APY
 */

const OGMIOS_URL = process.env.OGMIOS_URL || "http://localhost:1337";

// ─── Known Pool Addresses (Mainnet) ──────────────────────────────────────────

const POOLS = {
  "USDA/DJED": {
    scriptAddress: "addr1_DANOGO_USDA_DJED_POOL", // Replace with actual
    feeRate: 5, // 0.05% in basis points
    tokenA: "USDA",
    tokenB: "DJED",
  },
  "USDA/iUSD": {
    scriptAddress: "addr1_DANOGO_USDA_IUSD_POOL",
    feeRate: 5,
    tokenA: "USDA",
    tokenB: "iUSD",
  },
  "USDCx/USDA": {
    scriptAddress: "addr1_DANOGO_USDCX_USDA_POOL",
    feeRate: 5,
    tokenA: "USDCx",
    tokenB: "USDA",
  },
  "USDM/USDA": {
    scriptAddress: "addr1_DANOGO_USDM_USDA_POOL",
    feeRate: 10, // 0.1%
    tokenA: "USDM",
    tokenB: "USDA",
  },
};

// ─── Ogmios Query ────────────────────────────────────────────────────────────

async function queryUtxos(address) {
  const resp = await fetch(OGMIOS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "queryLedgerState/utxo",
      params: { addresses: [address] },
      id: "danogo-query",
    }),
  });
  const data = await resp.json();
  return data.result || [];
}

// ─── Price Math ──────────────────────────────────────────────────────────────

/**
 * Convert sqrtPrice from pool datum to actual price ratio.
 * IMPORTANT: The datum stores sqrt(price) in Q64.64 fixed-point.
 * To get the actual price, SQUARE it. Do NOT take sqrt again.
 */
function sqrtPriceToPrice(sqrtPriceBigInt) {
  const sqrtPriceNum = Number(sqrtPriceBigInt) / 2 ** 64;
  return sqrtPriceNum * sqrtPriceNum; // Square it
}

/**
 * Calculate swap output amount given input, price, and fee.
 */
function calculateSwapOutput(inputAmount, price, feeRateBps) {
  const feeMultiplier = 1 - feeRateBps / 10000;
  return inputAmount * price * feeMultiplier;
}

// ─── Commands ────────────────────────────────────────────────────────────────

async function listPools() {
  console.log("Known Danogo CL Pools (Mainnet):\n");
  for (const [pair, pool] of Object.entries(POOLS)) {
    console.log(`  ${pair}`);
    console.log(`    Address: ${pool.scriptAddress}`);
    console.log(`    Fee: ${(pool.feeRate / 100).toFixed(2)}%`);
    console.log();
  }
  console.log("Note: Replace placeholder addresses with actual mainnet addresses.");
  console.log("Query pool UTxOs via Ogmios to get live state.");
}

async function getPrice(pair) {
  const pool = POOLS[pair] || POOLS[pair.split("/").reverse().join("/")];
  if (!pool) {
    console.error(`Unknown pair: ${pair}. Known pairs: ${Object.keys(POOLS).join(", ")}`);
    process.exit(1);
  }

  console.log(`Querying ${pair} pool at ${pool.scriptAddress}...`);
  try {
    const utxos = await queryUtxos(pool.scriptAddress);
    if (utxos.length === 0) {
      console.log("No UTxOs found. Check pool address and Ogmios connection.");
      return;
    }
    // In production: decode CBOR datum, extract sqrtPrice, compute price
    console.log(`Found ${utxos.length} UTxO(s) at pool address.`);
    console.log("Decode datum to extract sqrtPrice, then: price = sqrtPrice^2");
  } catch (err) {
    console.error(`Ogmios query failed: ${err.message}`);
    console.log("Ensure OGMIOS_URL is set and Ogmios is running.");
  }
}

async function getQuote(pair, amount) {
  const pool = POOLS[pair];
  if (!pool) {
    console.error(`Unknown pair: ${pair}`);
    process.exit(1);
  }
  // Placeholder — in production, query live pool state
  console.log(`Quote for ${amount} ${pool.tokenA} → ${pool.tokenB}:`);
  console.log(`  Pool: ${pair} (${(pool.feeRate / 100).toFixed(2)}% fee)`);
  console.log(`  Note: Query live pool state for accurate quote.`);
  console.log(`  Formula: output = input * (sqrtPrice^2) * (1 - fee)`);
}

async function listLendingPools() {
  console.log("Danogo Lending Pools:\n");
  console.log("  Query lending pool script addresses via Ogmios.");
  console.log("  Supported assets: USDA, DJED, iUSD, USDCx");
  console.log("  Rates vary with utilization (higher utilization = higher borrow rate).");
}

// ─── CLI ─────────────────────────────────────────────────────────────────────

const [cmd, ...args] = process.argv.slice(2);

switch (cmd) {
  case "pools":
    listPools();
    break;
  case "price":
    getPrice(args[0] || "USDA/DJED");
    break;
  case "quote":
    getQuote(args[0] || "USDA/DJED", parseFloat(args[1]) || 100);
    break;
  case "lending-pools":
    listLendingPools();
    break;
  case "lending-rate":
    console.log(`Lending rate for ${args[0] || "USDA"}: query pool datum for live rate.`);
    break;
  default:
    console.log("Usage: node danogo-client.js <command> [args]");
    console.log("Commands: pools, price <pair>, quote <pair> <amount>, lending-pools, lending-rate <pool>");
}
