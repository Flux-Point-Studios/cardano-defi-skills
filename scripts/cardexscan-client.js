/**
 * CardexScan (CDS/Hydra) Aggregator Client
 * Direct API — https://cardexscan.com
 *
 * DEX aggregator + P2P marketplace + DCA orders.
 * Requires API key via x-api-key header.
 *
 * Environment variables:
 *   CARDEXSCAN_API_URL  — API base (default: https://cardexscan.com)
 *   CARDEXSCAN_API_KEY  — Required API key
 */

const BASE_URL = process.env.CARDEXSCAN_API_URL || "https://cardexscan.com";
const API_KEY = process.env.CARDEXSCAN_API_KEY || "";

async function cdsGet(path) {
  if (!API_KEY) throw new Error("CARDEXSCAN_API_KEY is required");
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "x-api-key": API_KEY },
  });
  if (!res.ok) throw new Error(`CDS API error: ${res.status}`);
  return res.json();
}

async function cdsPost(path, body) {
  if (!API_KEY) throw new Error("CARDEXSCAN_API_KEY is required");
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`CDS API error: ${res.status} — ${await res.text().catch(() => "")}`);
  return res.json();
}

// ─── Swap Aggregation ────────────────────────────────────────────────────────

/**
 * Get aggregated swap estimate across DEXes.
 * @param {object} params
 * @param {number} params.tokenInAmount  - Amount in (lovelace for ADA)
 * @param {number} [params.slippage=1]   - Slippage percentage
 * @param {string|object} params.tokenIn - "lovelace" for ADA, or {policyId, assetName}
 * @param {object} params.tokenOut       - {policyId, assetName}
 * @param {string[]} [params.blacklistedDexes] - DEXes to exclude
 */
export async function estimateSwap(params) {
  return cdsPost("/api/cds/swap/aggregate", {
    tokenInAmount: params.tokenInAmount,
    slippage: params.slippage ?? 1,
    tokenIn: params.tokenIn || "lovelace",
    tokenOut: params.tokenOut,
    blacklisted_dexes: params.blacklistedDexes || [],
  });
}

/**
 * Build swap transaction. Returns unsigned CBOR.
 * @param {object} params - Same as estimateSwap + userAddress
 * @param {string} params.userAddress - Wallet bech32 address
 */
export async function buildSwap(params) {
  return cdsPost("/api/cds/swap/cbor/build", {
    tokenInAmount: params.tokenInAmount,
    slippage: params.slippage ?? 1,
    tokenIn: params.tokenIn || "lovelace",
    tokenOut: params.tokenOut,
    userAddress: params.userAddress,
    blacklisted_dexes: params.blacklistedDexes || [],
  });
}

// ─── Token Data ──────────────────────────────────────────────────────────────

/** Get trending tokens. */
export async function getTrendingTokens(timeframe = "24h", count = 20) {
  return cdsGet(`/api/tokens/trending?timeframe=${timeframe}&count=${count}`);
}

/** Get all token trades. */
export async function getAllTrades(timeframe = "24h", limit = 50, order = "desc") {
  return cdsGet(`/api/token/trades/all?timeframe=${timeframe}&limit=${limit}&order=${order}`);
}

// ─── Order History ───────────────────────────────────────────────────────────

/** Get order history for a wallet. */
export async function getOrderHistory(address) {
  return cdsGet(`/api/orders?address=${encodeURIComponent(address)}`);
}

// ─── P2P OTC Marketplace ─────────────────────────────────────────────────────

/** Get P2P offers (all, open, filled, cancelled). */
export async function getOffers(status = "open") {
  return cdsGet(`/api/otc/offers?status=${status}`);
}

/** Get my P2P offers. */
export async function getMyOffers(walletAddress) {
  return cdsGet(`/api/otc/offers/my?walletAddress=${encodeURIComponent(walletAddress)}`);
}

/**
 * Create a P2P OTC offer. Returns unsigned CBOR.
 * @param {object} params
 * @param {string} params.walletAddress
 * @param {number} params.offerAmount      - Amount you're offering
 * @param {number} params.requestAmount    - Amount you want in return
 * @param {object} [params.offerAsset]     - {policyId, assetName} or omit for ADA
 * @param {object} [params.requestAsset]   - {policyId, assetName} or omit for ADA
 * @param {boolean} [params.allowPartial]  - Allow partial fills
 * @param {number} [params.expirationHours] - Hours until expiry
 */
export async function createOffer(params) {
  return cdsPost("/api/otc/offers/create", params);
}

/** Fill a P2P offer. Returns unsigned CBOR. */
export async function fillOffer(walletAddress, offerId) {
  return cdsPost("/api/otc/offers/fill", { walletAddress, offerId });
}

/** Cancel a P2P offer. Returns unsigned CBOR. */
export async function cancelOffer(walletAddress, offerId) {
  return cdsPost("/api/otc/offers/cancel", { walletAddress, offerId });
}

// ─── DCA (Dollar Cost Averaging) ─────────────────────────────────────────────

/** Get my DCA orders. */
export async function getMyDcaOrders(walletAddress) {
  return cdsGet(`/api/dca/orders?walletAddress=${encodeURIComponent(walletAddress)}`);
}

/** Get all active DCA orders. */
export async function getAllDcaOrders() {
  return cdsGet("/api/dca/orders/all");
}

/**
 * Create a DCA order. Returns unsigned CBOR.
 * @param {object} params
 * @param {string} params.walletAddress
 * @param {string|object} params.tokenIn  - "lovelace" or {policyId, assetName}
 * @param {object} params.tokenOut        - {policyId, assetName}
 * @param {number} params.perOrderAmount  - Amount per DCA execution
 * @param {number} params.numOrders       - Total number of executions
 * @param {number} [params.intervalMs]    - Interval between executions (default: 1 hour)
 * @param {number} [params.slippageBps]   - Slippage in basis points (default: 50)
 */
export async function createDcaOrder(params) {
  return cdsPost("/api/dca/orders/create", params);
}

/** Cancel a DCA order. Returns unsigned CBOR. */
export async function cancelDcaOrder(walletAddress, orderId) {
  return cdsPost("/api/dca/orders/cancel", { walletAddress, orderId });
}
