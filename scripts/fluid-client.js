/**
 * FluidTokens Lending/Borrowing Client
 * Direct API — https://qa.fluidtokens.com (QA) / production TBD
 *
 * Borrow tokens against collateral or create lending pools.
 * Supports: ADA, FLDT, Snek, USDM, USDA, STRIKE, WMTX, HOSKY, wUSDC, wBTC, cAP3X
 *
 * Environment variables:
 *   FLUID_API_URL  — API base URL (default: https://qa.fluidtokens.com)
 */

const BASE_URL = process.env.FLUID_API_URL || "https://qa.fluidtokens.com";

async function fluidRequest(path, { method = "POST", body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`FluidTokens API error: ${res.status} — ${text}`);
  }
  return res.json();
}

/**
 * Borrow tokens against collateral. Server auto-selects best pools.
 * Returns array of unsigned CBOR txs to sign in sequence.
 *
 * @param {object} params
 * @param {string} params.address           - Wallet bech32 address
 * @param {number} params.borrowAmount      - Amount to borrow (smallest units)
 * @param {string} params.collateralPolicyId - Collateral token policy ID
 * @param {string} params.collateralAssetName - Collateral token asset name (hex)
 * @param {number} params.collateralAmount  - Collateral amount (smallest units)
 * @param {string} [params.borrowToken]     - Token name: ADA, FLDT, Snek, USDM, USDA, STRIKE, WMTX, HOSKY
 * @param {string} [params.principalPolicyId] - Alternative: policy ID directly ("" for ADA)
 * @returns {Promise<{ success: boolean, unsignedTxs?: string[], error?: string }>}
 */
export async function borrow(params) {
  return fluidRequest("/api/pools/borrow", { body: params });
}

/**
 * Create a new lending pool. Returns unsigned CBOR txs.
 *
 * @param {object} params
 * @param {string} params.address            - Wallet bech32 address
 * @param {string} params.lendToken          - Token to lend (ADA, FLDT, USDM, etc.)
 * @param {number} params.lendAmount         - Amount to lend (smallest units)
 * @param {number} params.lendInterestRate   - Base interest rate (e.g. 4.65 for 4.65%)
 * @param {string[]} params.markets          - Accepted collateral markets
 * @param {number} params.period             - Loan period in hours
 * @param {boolean} params.isPerpetualPool   - Allow perpetual loans
 * @param {number} params.interestRateIncCoe - Interest rate increase coefficient
 * @param {boolean} params.isPermissionedPool - Require permissions
 * @returns {Promise<{ success: boolean, unsignedTxs?: string[], error?: string }>}
 */
export async function createPool(params) {
  return fluidRequest("/api/pools/create", { body: params });
}
