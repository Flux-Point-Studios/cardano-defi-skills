/**
 * SaturnSwap UEX (Universal Exchange) Cross-Chain Client
 *
 * Wraps the Cosmic Router API for cross-chain swaps via SaturnSwap.
 * Supports 119 chains including Cardano, Ethereum, Solana, Bitcoin, BSC, etc.
 *
 * Base URL: https://saturnswap.io/api/uex/
 */

const UEX_BASE_URL = "https://saturnswap.io/api/uex";

async function uexRequest(path, { method = "POST", body } = {}) {
  const url = `${UEX_BASE_URL}${path}`;
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`UEX API error: ${res.status} ${res.statusText} — ${text}`);
  }
  return res.json();
}

// ─── Metadata ────────────────────────────────────────────────────────────────

/**
 * Get all supported chains and their tokens.
 * @returns {Promise<{ chains: Array<{ id, name, shortName, slug, type, nativeSymbol, tokens: Array }> }>}
 */
export async function getMetadata() {
  return uexRequest("/metadata", { method: "GET" });
}

/**
 * Find a chain by slug, name, or ID.
 * @param {string} search - Chain slug, name, or ID (case-insensitive)
 * @returns {Promise<object|null>} Chain object or null
 */
export async function findChain(search) {
  const { chains } = await getMetadata();
  const s = search.toLowerCase();
  return chains.find(
    (c) =>
      c.id.toLowerCase() === s ||
      c.slug?.toLowerCase() === s ||
      c.name.toLowerCase() === s ||
      c.shortName?.toLowerCase() === s ||
      c.nativeSymbol?.toLowerCase() === s
  ) || null;
}

/**
 * Find a token across all chains by symbol.
 * @param {string} symbol - Token symbol (e.g. "ETH", "SOL", "ADA")
 * @param {string} [chainFilter] - Optional chain ID to narrow search
 * @returns {Promise<Array<{ token, chain }>>} Matching tokens with their chains
 */
export async function findToken(symbol, chainFilter) {
  const { chains } = await getMetadata();
  const s = symbol.toUpperCase();
  const results = [];
  for (const chain of chains) {
    if (chainFilter && chain.id !== chainFilter) continue;
    for (const token of chain.tokens || []) {
      if (token.symbol?.toUpperCase() === s) {
        results.push({ token, chain });
      }
    }
  }
  return results;
}

// ─── Quoting ─────────────────────────────────────────────────────────────────

/**
 * Get a cross-chain swap quote.
 * @param {object} params
 * @param {string} params.fromChainId    - Source chain ID (e.g. "cardano-mainnet")
 * @param {string} params.fromTokenId    - Source token ID (e.g. "ADA@ADA")
 * @param {string} params.toChainId      - Destination chain ID (e.g. "ethereum-mainnet")
 * @param {string} params.toTokenId      - Destination token ID (e.g. "ETH@ETH")
 * @param {string} params.amountIn       - Amount to swap (display units, as string)
 * @param {number} [params.slippageTolerance=2.5] - Slippage tolerance percentage
 * @param {string} [params.destinationAddress] - Destination wallet address
 * @returns {Promise<{
 *   amountOutEstimate: string,
 *   rate: string,
 *   feeAmount?: string,
 *   feePercent?: string,
 *   minAmountIn?: number,
 *   maxAmountIn?: number,
 *   requiredSlippagePercent?: number,
 *   warnings?: string[]
 * }>}
 */
export async function getQuote(params) {
  return uexRequest("/quote", {
    body: {
      slippageTolerance: 2.5,
      ...params,
    },
  });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

/**
 * Create a cross-chain swap order.
 * Returns a deposit address — send the exact depositAmount to complete the swap.
 * @param {object} params
 * @param {string} params.fromChainId
 * @param {string} params.fromTokenId
 * @param {string} params.toChainId
 * @param {string} params.toTokenId
 * @param {string} params.amountIn
 * @param {string} params.destinationAddress - Where to receive output tokens
 * @param {number} [params.slippageTolerance=2.5]
 * @param {string} [params.sourceAddress]     - Sender wallet address
 * @returns {Promise<{
 *   orderId: string,
 *   depositChainId: string,
 *   depositTokenId: string,
 *   depositAddress: string,
 *   depositAmount: string,
 *   expectedAmountOut: string,
 *   requiresSignature?: boolean,
 *   unsignedTxCbor?: string
 * }>}
 */
export async function createOrder(params) {
  return uexRequest("/order", {
    body: {
      slippageTolerance: 2.5,
      ...params,
    },
  });
}

// ─── Convenience ─────────────────────────────────────────────────────────────

/**
 * Quick quote using ticker symbols instead of full token IDs.
 * Resolves "ADA" → "ADA@ADA" on "cardano-mainnet", "ETH" → "ETH@ETH" on "ethereum-mainnet", etc.
 * @param {string} fromSymbol - e.g. "ADA"
 * @param {string} toSymbol   - e.g. "ETH"
 * @param {string} amount     - Display units
 * @param {number} [slippage=2.5]
 * @returns {Promise<object>} Quote result
 */
export async function quickQuote(fromSymbol, toSymbol, amount, slippage = 2.5) {
  const fromMatches = await findToken(fromSymbol);
  const toMatches = await findToken(toSymbol);

  if (fromMatches.length === 0) throw new Error(`Token "${fromSymbol}" not found on any chain`);
  if (toMatches.length === 0) throw new Error(`Token "${toSymbol}" not found on any chain`);

  // Prefer native tokens on major chains
  const from = fromMatches.find((m) => m.token.isNative) || fromMatches[0];
  const to = toMatches.find((m) => m.token.isNative) || toMatches[0];

  return getQuote({
    fromChainId: from.chain.id,
    fromTokenId: from.token.id,
    toChainId: to.chain.id,
    toTokenId: to.token.id,
    amountIn: String(amount),
    slippageTolerance: slippage,
  });
}
