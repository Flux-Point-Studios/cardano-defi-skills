/**
 * Indigo Protocol Client
 * Direct API — https://analytics.indigoprotocol.io/api/v1
 * CDPs, stability pools, INDY staking, synthetic assets (iUSD, iBTC, iETH, iSOL).
 */
const BASE = process.env.INDIGO_API_URL || "https://analytics.indigoprotocol.io/api/v1";
async function iGet(p) { const r = await fetch(`${BASE}${p}`, { headers: { Accept: "application/json" } }); if (!r.ok) throw new Error(`Indigo: ${r.status}`); return r.json(); }
async function iPost(p, b) { const r = await fetch(`${BASE}${p}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }); if (!r.ok) throw new Error(`Indigo: ${r.status}`); return r.json(); }
export async function getAssets() { return iGet("/assets/"); }
export async function getAdaPrice() { return iPost("/ada-price/", {}); }
export async function getIndyPrice() { return iPost("/indy-price/", {}); }
export async function getTvl() { return iGet("/analytics/tvl"); }
export async function getAprRewards() { return iGet("/apr/"); }
export async function getDexYields() { return iGet("/dex/yields"); }
export async function getCdps(owner, asset) { const p = new URLSearchParams(); if (owner) p.set("owner", owner); if (asset) p.set("asset", asset); return iGet(`/loans/${p.toString() ? "?" + p : ""}`); }
export async function getCdpHealth(tx, idx) { return iGet(`/loans/?txHash=${tx}&outputIndex=${idx}`); }
export async function openCdp(addr, asset, col) { return iPost("/cdps/open", { address: addr, asset, collateralAmount: col }); }
export async function depositCdp(addr, tx, idx, col) { return iPost("/cdps/deposit", { address: addr, cdpTxHash: tx, cdpOutputIndex: idx, collateralAmount: col }); }
export async function withdrawCdp(addr, tx, idx, col) { return iPost("/cdps/withdraw", { address: addr, cdpTxHash: tx, cdpOutputIndex: idx, collateralAmount: col }); }
export async function closeCdp(addr, tx, idx) { return iPost("/cdps/close", { address: addr, cdpTxHash: tx, cdpOutputIndex: idx }); }
export async function mintCdp(addr, tx, idx, amt) { return iPost("/cdps/mint", { address: addr, cdpTxHash: tx, cdpOutputIndex: idx, amount: amt }); }
export async function burnCdp(addr, tx, idx, amt) { return iPost("/cdps/burn", { address: addr, cdpTxHash: tx, cdpOutputIndex: idx, amount: amt }); }
export async function getStabilityPools() { return iGet("/stability-pools/"); }
export async function getStabilityAccounts(owner) { return iGet(`/stability-pools/?owner=${encodeURIComponent(owner)}`); }
export async function createSpAccount(addr, asset, amt) { return iPost("/stability-pools/create", { address: addr, asset, amount: amt }); }
export async function adjustSpAccount(addr, asset, amt, tx, idx) { return iPost("/stability-pools/adjust", { address: addr, asset, amount: amt, accountTxHash: tx, accountOutputIndex: idx }); }
export async function closeSpAccount(addr, tx, idx) { return iPost("/stability-pools/close", { address: addr, accountTxHash: tx, accountOutputIndex: idx }); }
export async function getStakingInfo() { return iGet("/staking/"); }
export async function getStakingPositions(owner) { return iGet(`/staking-positions/${owner ? "?owner=" + encodeURIComponent(owner) : ""}`); }
export async function openStakingPosition(addr, amt) { return iPost("/staking/open", { address: addr, amount: amt }); }
export async function adjustStakingPosition(addr, tx, idx, amt) { return iPost("/staking/adjust", { address: addr, stakingTxHash: tx, stakingOutputIndex: idx, amount: amt }); }
export async function closeStakingPosition(addr, tx, idx) { return iPost("/staking/close", { address: addr, stakingTxHash: tx, stakingOutputIndex: idx }); }
export async function getProtocolParams() { return iGet("/protocol-params/"); }
export async function getPolls() { return iGet("/polls/"); }
export async function getOrderBook(asset) { return iGet(`/order-book/${asset ? "?asset=" + encodeURIComponent(asset) : ""}`); }
