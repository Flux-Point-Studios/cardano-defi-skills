---
name: bodega-markets
description: |
  Use this skill when the user wants to trade prediction markets on Cardano.
  Triggers on: "prediction market", "Bodega", "bet on", "buy Yes shares",
  "buy No shares", "what markets are available", "prediction markets",
  "will X happen", "outcome trading", "event markets".
  Use bodega-markets-operator to execute transactions.
version: 1.0.0
---

# Bodega Prediction Markets

Trade Yes/No outcome shares on prediction markets on Cardano.

## Capabilities

- Browse available prediction markets
- View market activity, volume leaders, and top profits
- Buy or sell Yes/No shares at market or limit prices
- Cancel open orders
- Claim rewards from resolved markets

## Flow

1. **Browse markets** — list available markets and their current odds
2. **Check a market** — view predictions history and current positions
3. **Buy shares** — place a buy order for Yes or No outcome
4. **Monitor** — track position value as odds change
5. **Sell or claim** — sell before resolution or claim after resolution

## Scripts

### List Markets

```bash
node scripts/list-markets.js [--sort volume|recent]
```

### View Market Positions

```bash
node scripts/positions.js --market <marketId> --address <bech32>
```

### Buy Shares

```bash
node scripts/buy.js --market <marketId> --side Yes|No --amount <shares> --slippage 0.05 --address <bech32>
```

### Sell Shares

```bash
node scripts/sell.js --market <marketId> --side Yes|No --amount <shares> --slippage 0.05 --address <bech32>
```

### Claim Rewards

```bash
node scripts/claim.js --market <marketId> --address <bech32>
```

## Key Concepts

- Markets have two outcomes: **Yes** and **No**
- Share prices range from 0 to 1 ADA — price = implied probability
- If you hold the winning side, shares redeem at ~1 ADA each
- Platform fee: ~2 ADA per trade + network fees (~0.4 ADA)
- Slippage is a fraction (0.05 = 5%), not a percentage
- Market IDs look like "C1EA_CLARITY_ACT_CLEA"

## Safety Rules

- Always show current Yes/No prices before trading
- Show total cost including platform fees
- Warn if slippage is set high (>10%)
- Require confirmation before buy/sell
- Note that prediction markets are speculative
