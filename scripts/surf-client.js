/**
 * Surf Finance Lending/Borrowing Client
 * Direct API — https://surflending.org
 */
const BASE_URL = process.env.SURF_API_URL || "https://surflending.org";
async function surfRequest(path, { method = "GET", body } = {}) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  if (!res.ok) throw new Error(`Surf API error: ${res.status}`);
  return res.json();
}
export async function getAllPools() { return surfRequest("/api/getAllPoolInfos"); }
export async function depositLiquidity(params) {
  return surfRequest("/api/depositLiquidity", { method: "POST", body: { request: { poolId: params.poolId, address: params.address, amount: params.amount } } });
}
export async function borrow(params) {
  return surfRequest("/api/borrow", { method: "POST", body: { request: { poolId: params.poolId, address: params.address, amount: params.amount, collateralAmount: params.collateralAmount } } });
}
