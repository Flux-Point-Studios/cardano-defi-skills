---
name: danogo-clmm
description: |
  Use this skill when the user wants to swap stablecoins on Cardano via Danogo's
  concentrated-liquidity DEX. Triggers on: "swap USDA", "swap DJED", "stablecoin swap",
  "Danogo", "concentrated liquidity", "CL pool", "stablecoin arbitrage", "provide liquidity",
  "LP position". Danogo pools are on-chain UTxOs queryable via Ogmios with sqrt-price math.
version: 1.0.0
---

# Danogo Concentrated-Liquidity Stablecoin DEX

Swap between Cardano stablecoins (USDA, DJED, iUSD, USDCx, USDM) using Danogo's on-chain CL pools.

## Prerequisites

- **Ogmios** endpoint for UTxO queries (e.g., `http://localhost:1337`)
- **Cardano submit-api** or MCP for transaction submission
- Payment signing key for executing swaps

## How it works

Danogo uses Uniswap V3-style concentrated liquidity on Cardano:
- Pool state lives in UTxOs at a known script address
- Each pool datum contains `sqrtPrice`, `liquidity`, `currentTick`, `feeRate`
- Price = `sqrtPrice^2` (the datum stores the square root, not the price itself)
- Swaps consume the pool UTxO and produce a new one with updated state

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/danogo-client.js quote` | Get swap quote from on-chain pool state |
| `scripts/danogo-client.js pools` | List known stablecoin pool addresses |
| `scripts/danogo-client.js price <pair>` | Current price for a stablecoin pair |

## Safety rules

1. **Always query fresh pool state** before building a swap. Pool UTxOs change after every transaction — using a stale `outRef` causes "UTxO not found" errors.
2. **Do NOT double-sqrt**: The datum stores `sqrtPrice`. Square it to get the price ratio. Do not apply `Math.sqrt()` — that was a known SDK bug.
3. **Slippage**: Use 0.5-1% for stablecoin pairs. Tighter than typical DEX swaps because stablecoins have low volatility.
4. **Minimum swap**: Each pool has a `minSwap` field in the datum. Swaps below this amount fail validation.
5. **Confirm network** (mainnet vs preprod) before querying — pool addresses differ.

## Swap flow

```
1. Query pool UTxO via Ogmios (queryLedgerState/utxo at pool script address)
2. Decode CBOR datum → extract sqrtPrice, liquidity, feeRate
3. Calculate: price = sqrtPrice^2, outputAmount = inputAmount * price * (1 - fee)
4. Build swap transaction with pool UTxO as input + swap redeemer
5. Sign and submit
```

## Known stablecoin pairs (mainnet)

| Pair | Fee | Notes |
|------|-----|-------|
| USDA/DJED | 0.05% | Tightest spread, highest volume |
| USDA/iUSD | 0.05% | Indigo synthetic USD |
| USDCx/USDA | 0.05% | Wrapped USDC bridge |
| USDM/USDA | 0.1% | Moneta stablecoin |

## Liquidity provision

1. Choose a tick range (price band) for concentrated liquidity
2. Calculate token amounts needed for the chosen range
3. Build add-liquidity transaction → receive LP NFT
4. Earn trading fees proportional to your share of active liquidity
5. Remove liquidity by burning the LP NFT

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Price ~0.0001 instead of ~1.0 | Double-sqrt bug | Square sqrtPrice, don't sqrt it |
| "UTxO not found" on swap | Stale pool outRef | Re-query pool UTxO immediately before building tx |
| Swap tx fails validation | Below minSwap | Check pool datum minSwap field |
| Large slippage on small swap | Low liquidity in tick range | Check active liquidity at current tick |
