/**
 * Bodega Markets Prediction Market Client
 * Direct API — https://v3.bodegamarket.io
 * Buy/sell requires price field (micro-units). {request:{...}} wrapper.
 */
const BASE_URL = (process.env.BODEGA_API_URL || "https://v3.bodegamarket.io").replace(/\/$/, "");
function hdrs(mid) { return { "Content-Type": "application/json", Accept: "application/json", Origin: BASE_URL, Referer: mid ? `${BASE_URL}/marketDetails?id=${mid}` : BASE_URL, "User-Agent": "Mozilla/5.0", "Sec-Fetch-Site": "same-origin", "Sec-Fetch-Mode": "cors" }; }
async function bGet(path) { const r = await fetch(`${BASE_URL}/api${path}`, { headers: hdrs() }); return r.json(); }
async function bPost(path, body, mid) { const r = await fetch(`${BASE_URL}/api${path}`, { method: "POST", headers: hdrs(mid), body: JSON.stringify(body) }); if (!r.ok) throw new Error(`Bodega: ${r.status}`); return r.json(); }
export async function getMarkets() { return bPost("/getMarketConfigs", {}); }
export async function getRecentActivity() { return bGet("/stats/getRecentActivity"); }
export async function getTopVolumes() { return bGet("/stats/getTopVolumes"); }
export async function getTopProfits() { return bGet("/stats/getTopProfits"); }
export async function getPredictionsHistory(id) { return bGet(`/getPredictionsHistory?id=${encodeURIComponent(id)}`); }
export async function getPositions(id, addr) { return bGet(`/getPositions?id=${encodeURIComponent(id)}&address=${encodeURIComponent(addr)}`); }
export async function buyPosition(p) { return bPost("/buyPosition", { request: { id: p.id, option: p.option ?? 0, side: p.side, amount: p.amount, price: p.price, slippage: p.slippage ?? 0.05, address: p.address, canonical: false } }, p.id); }
export async function sellPosition(p) { return bPost("/sellPosition", { request: { id: p.id, option: p.option ?? 0, side: p.side, amount: p.amount, price: p.price, slippage: p.slippage ?? 0.05, address: p.address, canonical: false } }, p.id); }
export async function cancelPosition(p) { return bPost("/cancelPosition", { address: p.address, id: p.id, outRef: { txHash: p.txHash, outputIndex: p.outputIndex } }, p.id); }
export async function claimReward(addr, id) { return bPost("/rewardPosition", { address: addr, id }, id); }
