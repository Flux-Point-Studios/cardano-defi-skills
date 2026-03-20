/**
 * DexHunter Swap Aggregator Client
 * Direct API — https://api-us.dexhunterv3.app
 * Amounts in display units (10 = 10 ADA). X-Partner-Id optional.
 */
const BASE_URL = process.env.DEXHUNTER_BASE_URL || "https://api-us.dexhunterv3.app";
const PARTNER_ID = process.env.DEXHUNTER_PARTNER_ID;
async function dexRequest(path, { method = "POST", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (PARTNER_ID) headers["X-Partner-Id"] = PARTNER_ID;
  const opts = { method, headers };
  if (body && method !== "GET") opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  if (!res.ok) throw new Error(`DexHunter API error: ${res.status}`);
  return res.json();
}
export async function searchTokens(query) { return dexRequest(`/swap/tokens?query=${encodeURIComponent(query)}`, { method: "GET" }); }
export async function getToken(tokenId) { return dexRequest(`/swap/token/${encodeURIComponent(tokenId)}`, { method: "GET" }); }
export async function estimateSwap(p) { return dexRequest("/swap/estimate", { body: { token_in: p.tokenIn ?? "", token_out: p.tokenOut, amount_in: p.amountIn, slippage: p.slippage ?? 1, include_routes: true } }); }
export async function buildSwap(p) {
  try { await dexRequest("/swap/wallet", { body: { addresses: [p.buyerAddress], is_stake: false } }); } catch (_) {}
  return dexRequest("/swap/build", { body: { buyer_address: p.buyerAddress, token_in: p.tokenIn ?? "", token_out: p.tokenOut, amount_in: p.amountIn, slippage: p.slippage ?? 1, tx_optimization: true } });
}
export async function signSwap(txCbor, sigs) { return dexRequest("/swap/sign", { body: { txCbor, Signatures: Array.isArray(sigs) ? sigs[0] : sigs } }); }
export async function registerWallet(addr, isStake = false) { return dexRequest("/swap/wallet", { body: { addresses: [addr], is_stake: isStake } }); }
export async function getAveragePrice(base, quote) {
  const b = (!base || base.toLowerCase() === "lovelace") ? "ADA" : base;
  const q = (!quote || quote.toLowerCase() === "lovelace") ? "ADA" : quote;
  return dexRequest(`/swap/averagePrice/${encodeURIComponent(b)}/${encodeURIComponent(q)}`, { method: "GET" });
}
