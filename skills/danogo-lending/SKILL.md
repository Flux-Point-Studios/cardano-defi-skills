---
name: danogo-lending
description: |
  Use this skill when the user wants to lend or borrow stablecoins on Cardano via
  Danogo's lending pools. Triggers on: "Danogo lending", "borrow USDA", "lend DJED",
  "stablecoin lending", "collateral ratio", "Danogo borrow", "lending pool".
  Lending state is on-chain UTxOs queryable via Ogmios.
version: 1.0.0
---

# Danogo Stablecoin Lending

Lend and borrow Cardano stablecoins through Danogo's on-chain lending pools.

## Prerequisites

- **Ogmios** endpoint for UTxO queries
- **Cardano submit-api** or MCP for transaction submission
- Payment signing key for executing transactions

## How it works

Danogo lending pools are Plutus scripts holding stablecoin reserves:
- Lenders deposit stablecoins and receive interest-bearing receipt tokens
- Borrowers deposit collateral and borrow up to a maximum loan-to-value ratio
- Interest accrues per-epoch, paid from borrower fees to lender receipts
- Liquidation occurs when collateral drops below the minimum health factor

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/danogo-client.js lending-pools` | List available lending pools and rates |
| `scripts/danogo-client.js lending-rate <pool>` | Current supply/borrow APY |

## Safety rules

1. **Monitor health factor**: Borrowers must maintain collateral above the liquidation threshold. Check health factor before and after every action.
2. **Collateral ratios are enforced on-chain**: Under-collateralized borrows fail at the Plutus validator level.
3. **Interest accrues per epoch**: Rates can change as utilization shifts. Don't assume fixed rates.
4. **Withdrawal limits**: If pool utilization is near 100%, lenders may not be able to withdraw immediately.

## Lending flow

```
1. Query lending pool UTxO via Ogmios
2. Decode datum → extract reserves, utilization, interest rate parameters
3. For lending: build deposit tx → receive receipt token
4. For borrowing: build collateral deposit + borrow tx
5. Sign and submit
```

## Supported assets

| Asset | Lending | Borrowing | Notes |
|-------|---------|-----------|-------|
| USDA | Yes | Yes | Primary stablecoin |
| DJED | Yes | Yes | Algorithmic stablecoin |
| iUSD | Yes | Yes | Indigo synthetic |
| USDCx | Yes | Yes | Wrapped USDC |

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Borrow tx fails | Under-collateralized | Increase collateral or reduce borrow amount |
| Can't withdraw deposit | Pool fully utilized | Wait for borrowers to repay or utilization to drop |
| Interest rate spiked | High utilization | Normal — rates auto-adjust with supply/demand |
