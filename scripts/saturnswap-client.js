/**
 * SaturnSwap GraphQL Client
 *
 * Core client used by all SaturnSwap agent skills.
 * Handles endpoint configuration, pagination, and error handling.
 *
 * Environment variables:
 *   SATURNSWAP_API_URL  — Override API endpoint (default: https://api.saturnswap.io/v1/graphql/)
 */

const DEFAULT_API_URL = "https://api.saturnswap.io/v1/graphql/";

export function getApiUrl() {
  return process.env.SATURNSWAP_API_URL || DEFAULT_API_URL;
}

export async function query(graphqlQuery, variables = {}) {
  const url = getApiUrl();
  const headers = { "Content-Type": "application/json" };
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ query: graphqlQuery, variables }),
  });

  if (!res.ok) {
    throw new Error(`SaturnSwap API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    const msg = json.errors.map((e) => e.message).join("; ");
    throw new Error(`GraphQL error: ${msg}`);
  }
  return json.data;
}

// ─── Pool Queries ────────────────────────────────────────────────────────────

export async function getPools({ first = 20, where, order } = {}) {
  const args = [`first: ${first}`];
  if (where) args.push(`where: ${where}`);
  if (order) args.push(`order: ${order}`);

  return query(`{
    pools(${args.join(", ")}) {
      edges {
        node {
          id
          volume_24h
          volume_7d
          volume_30d
          tvl
          token_project_one { ticker decimals policy_id asset_name image price }
          token_project_two { ticker decimals policy_id asset_name image price lowest_ask_price highest_bid_price }
          smart_contract { id script_address }
        }
        cursor
      }
      pageInfo { hasNextPage endCursor }
    }
  }`);
}

export async function getPool(id) {
  return query(`{
    pool(id: "${id}") {
      id
      volume_24h volume_7d volume_30d tvl
      token_project_one { ticker decimals policy_id asset_name price }
      token_project_two { ticker decimals policy_id asset_name price lowest_ask_price highest_bid_price }
      smart_contract { id script_address }
    }
  }`);
}

export async function getPoolByTokens(policyId, assetName) {
  return query(`{
    poolByTokens(
      policyIdOne: ""
      assetNameOne: ""
      policyIdTwo: "${policyId}"
      assetNameTwo: "${assetName}"
    ) {
      id
      volume_24h tvl
      token_project_one { ticker decimals policy_id asset_name price }
      token_project_two { ticker decimals policy_id asset_name price lowest_ask_price highest_bid_price }
    }
  }`);
}

// ─── Order Book Queries ──────────────────────────────────────────────────────

export async function getOrderBookAsks(poolId, { first = 20, address = "addr" } = {}) {
  const where = `{ pool_id: { eq: "${poolId}" } }`;
  return query(`{
    orderBookSellPoolUtxos(address: "${address}", first: ${first}, where: ${where}, order: { price: ASC }) {
      edges {
        node { price token_amount_sell token_amount_buy }
      }
    }
  }`);
}

export async function getOrderBookBids(poolId, { first = 20, address = "addr" } = {}) {
  const where = `{ pool_id: { eq: "${poolId}" } }`;
  return query(`{
    orderBookBuyPoolUtxos(address: "${address}", first: ${first}, where: ${where}, order: { price: DESC }) {
      edges {
        node { price token_amount_sell token_amount_buy }
      }
    }
  }`);
}

// ─── Token Queries ───────────────────────────────────────────────────────────

export async function getTokenProjects({ first = 20, where, order } = {}) {
  const args = [`first: ${first}`];
  if (where) args.push(`where: ${where}`);
  if (order) args.push(`order: ${order}`);

  return query(`{
    tokenProjects(${args.join(", ")}) {
      edges {
        node {
          id ticker policy_id asset_name decimals
          price volume_24h market_cap
          image
        }
      }
    }
  }`);
}

// ─── User Orders ─────────────────────────────────────────────────────────────

export async function getUserOrders(address, { first = 20, poolId } = {}) {
  let where = `{ user_address: { eq: "${address}" }, active_status: { in: [PENDING, NONE] }`;
  if (poolId) where += `, pool_id: { eq: "${poolId}" }`;
  where += " }";

  return query(`{
    poolUtxos(first: ${first}, where: ${where}, order: { created_at: DESC }) {
      edges {
        node {
          id tx_hash tx_index
          price token_amount_sell token_amount_buy
          active_type active_status spend_status
          pool { id token_project_one { ticker } token_project_two { ticker } }
          created_at
        }
      }
    }
  }`);
}

// ─── Liquidity Queries ───────────────────────────────────────────────────────

export async function getLiquidityPositions(address, { first = 20 } = {}) {
  const where = `{ user_address: { eq: "${address}" }, is_hidden: { eq: false } }`;
  return query(`{
    liquidityPoolContracts(first: ${first}, where: ${where}, order: { created_at: DESC }) {
      edges {
        node {
          id
          pool {
            id
            token_project_one { ticker decimals price }
            token_project_two { ticker decimals price policy_id asset_name }
          }
          liquidity_pool_contract_stats {
            ada_order_token_one_amount
            order_token_two_amount
            waiting_token_one_amount
            waiting_token_two_amount
            average_price
            highest_bid
            lowest_ask
          }
          liquidity_contract {
            id
            liquidity_contract_address_with_stake
            liquidity_smart_contract { id }
          }
        }
      }
    }
  }`);
}

// ─── Stats Queries ───────────────────────────────────────────────────────────

export async function getTotalStats() {
  return query(`{
    totalStats(first: 1) {
      edges {
        node {
          total_volume_24h total_volume_7d total_volume_30d
          total_tvl
          total_pools total_tokens
          total_transactions_24h
        }
      }
    }
  }`);
}

export async function getPoolStats({ first = 20, order } = {}) {
  const args = [`first: ${first}`];
  if (order) args.push(`order: ${order}`);

  return query(`{
    poolStats(${args.join(", ")}) {
      edges {
        node {
          pool_id
          volume_24h volume_7d volume_30d
          tvl
          pool { token_project_one { ticker } token_project_two { ticker } }
        }
      }
    }
  }`);
}

// ─── Transaction Mutations ───────────────────────────────────────────────────

export async function createMarketSwap(paymentAddress, { poolId, tokenAmountSell, slippagePercent = 3 }) {
  return query(`mutation {
    createOrderTransaction(input: {
      paymentAddress: "${paymentAddress}"
      marketSwapComponents: [{
        poolId: "${poolId}"
        tokenAmountSell: ${tokenAmountSell}
        slippagePercent: ${slippagePercent}
      }]
    }) {
      successTransactions { transactionId hexTransaction }
      error { message }
    }
  }`);
}

export async function createLimitOrder(paymentAddress, { poolId, policyId, assetName, tokenAmountSell, tokenAmountBuy }) {
  return query(`mutation {
    createOrderTransaction(input: {
      paymentAddress: "${paymentAddress}"
      limitOrderComponents: [{
        poolId: "${poolId}"
        policyId: "${policyId || ""}"
        assetName: "${assetName || ""}"
        tokenAmountSell: ${tokenAmountSell}
        tokenAmountBuy: ${tokenAmountBuy}
      }]
    }) {
      successTransactions { transactionId hexTransaction }
      error { message }
    }
  }`);
}

export async function cancelOrder(paymentAddress, poolUtxoIds) {
  const ids = poolUtxoIds.map((id) => `"${id}"`).join(", ");
  return query(`mutation {
    createOrderTransaction(input: {
      paymentAddress: "${paymentAddress}"
      cancelOrderComponents: [{
        poolUtxoIds: [${ids}]
      }]
    }) {
      successTransactions { transactionId hexTransaction }
      error { message }
    }
  }`);
}

export async function submitOrderTransaction(paymentAddress, transactionIds, hexTransactions) {
  const txIds = transactionIds.map((id) => `"${id}"`).join(", ");
  const hexTxs = hexTransactions.map((h) => `"${h}"`).join(", ");
  return query(`mutation {
    submitOrderTransaction(input: {
      paymentAddress: "${paymentAddress}"
      transactionIds: [${txIds}]
      hexTransactions: [${hexTxs}]
    }) {
      successTransactions { transactionId }
      error { message }
    }
  }`);
}

// ─── Liquidity Mutations ─────────────────────────────────────────────────────

export async function createAddLiquidity(paymentAddress, { liquidityPoolContractId, policyId, assetName, tokenAmount, useDefaults = true }) {
  return query(`mutation {
    createLiquidityTransaction(input: {
      paymentAddress: "${paymentAddress}"
      addLiquidityComponents: [{
        liquidityPoolContractId: "${liquidityPoolContractId}"
        policyId: "${policyId || ""}"
        assetName: "${assetName || ""}"
        tokenAmount: ${tokenAmount}
        useDefaults: ${useDefaults}
      }]
    }) {
      successTransactions { transactionId hexTransaction }
      error { message }
    }
  }`);
}

export async function createWithdrawLiquidity(paymentAddress, { liquidityPoolContractId, policyId, assetName, tokenAmount }) {
  return query(`mutation {
    createLiquidityTransaction(input: {
      paymentAddress: "${paymentAddress}"
      cancelLiquidityComponents: [{
        liquidityPoolContractId: "${liquidityPoolContractId}"
        policyId: "${policyId || ""}"
        assetName: "${assetName || ""}"
        tokenAmount: ${tokenAmount}
      }]
    }) {
      successTransactions { transactionId hexTransaction }
      error { message }
    }
  }`);
}

export async function submitLiquidityTransaction(paymentAddress, transactionIds, hexTransactions) {
  const txIds = transactionIds.map((id) => `"${id}"`).join(", ");
  const hexTxs = hexTransactions.map((h) => `"${h}"`).join(", ");
  return query(`mutation {
    submitLiquidityTransaction(input: {
      paymentAddress: "${paymentAddress}"
      transactionIds: [${txIds}]
      hexTransactions: [${hexTxs}]
    }) {
      successTransactions { transactionId }
      error { message }
    }
  }`);
}

// ─── Status ──────────────────────────────────────────────────────────────────

export async function getStatus() {
  return query(`{ status { is_online version } }`);
}

export async function getParameters() {
  return query(`{ parameters { min_ada_amount } }`);
}
