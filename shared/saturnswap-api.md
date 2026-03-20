# SaturnSwap API Reference

## Endpoint

```
POST https://api.saturnswap.io/v1/graphql/
Content-Type: application/json
```

## Critical: Display Units

**ALL GraphQL inputs use DISPLAY units, NOT base units.**

| You want to swap | You send | NOT |
|---|---|---|
| 5 ADA | `tokenAmountSell: 5` | `tokenAmountSell: 5000000` |
| 100 MNT | `tokenAmountSell: 100` | `tokenAmountSell: 100000000` |

The backend multiplies by `10^decimals` internally. If you pass lovelace (base units), the value hits the 25K ADA ceiling and silently returns an empty result with **no error**.

## Authentication

Most read queries are public. Mutations that build transactions require a `paymentAddress` (the wallet's Bech32 address) — no auth token needed.

## Transaction Flow (Create → Sign → Submit)

Every transaction on SaturnSwap follows a 3-step pattern:

1. **Create** — Call `CreateOrderTransaction` (or `CreateLiquidityTransaction`, etc.) with the wallet address and order parameters. Returns unsigned transaction hex (`hexTransaction`) and a `transactionId`.

2. **Sign** — Sign the hex transaction locally using the wallet's private key (via CSL, MeshJS, or MCP). Never send private keys to the API.

3. **Submit** — Call `SubmitOrderTransaction` (or `SubmitLiquidityTransaction`, etc.) with the signed hex. The backend submits to the Cardano network.

## Pagination

All list queries use cursor-based pagination:
```graphql
pools(first: 10, after: "cursor") {
  edges {
    node { ... }
    cursor
  }
  pageInfo {
    hasNextPage
    endCursor
  }
}
```

## Filtering

Filters use HotChocolate syntax:
```graphql
pools(where: { token_project_two: { ticker: { eq: "MNT" } } }) { ... }
```

Common operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `contains`, `in`.

## Ordering

```graphql
pools(order: { volume_24h: DESC }) { ... }
```

## Key Types

### Pool
A trading pair (always paired with ADA as token_project_one).
- `id` — UUID
- `token_project_one` — ADA (always)
- `token_project_two` — the other token
- `smart_contract` — the Plutus script governing this pool

### PoolUtxo
An individual order sitting in the pool's smart contract.
- `price` — price per token in ADA
- `token_amount_buy` / `token_amount_sell` — order amounts (in base units in DB)
- `active_type` — `LimitBuyOrder`, `LimitSellOrder`, `MarketBuyOrder`, `MarketSellOrder`
- `spend_status` — `None`, `CreatingTransaction`, `AwaitingSignature`, `Pending`, `Complete`, `Failed`

### LiquidityPoolContract
A user's liquidity position in a specific pool.
- `user_address` — the LP's wallet address
- `pool` — the pool this position is in
- `liquidity_pool_contract_stats` — current amounts, average price, earnings

### TokenProject
Metadata about a token.
- `ticker` — e.g. "MNT"
- `policy_id` + `asset_name` — on-chain identifiers
- `decimals` — for unit conversion
- `price` — current price in ADA
