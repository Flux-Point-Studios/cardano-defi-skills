# Cardano DeFi Skills

Agent skills for 9 Cardano DeFi protocols. This plugin provides 19 MCP tools and 8 slash commands.

## Available Tools

### SaturnSwap (DEX)
- `saturn_pools` — List trading pools with volume and TVL
- `saturn_stats` — Platform statistics (TVL, volume, pool count)

### Cross-Chain (Cosmic Router)
- `crosschain_quote` — Get cross-chain swap quotes (119 chains)

### DexHunter (Aggregator)
- `dexhunter_estimate` — Best swap rate across all Cardano DEXes

### Indigo Protocol (Synthetics)
- `indigo_assets` — List iAssets (iUSD, iBTC, iETH, iSOL) with oracle prices
- `indigo_tvl` — Total value locked
- `indigo_cdps` — Collateralized Debt Positions by owner/asset
- `indigo_staking` — INDY staking overview
- `indigo_stability_pools` — Stability pool information
- `indigo_apr` — APR rewards for pools

### Surf Finance (Lending)
- `surf_pools` — Lending/borrowing pools with APY and APR

### FluidTokens (Lending)
- `fluid_borrow` — Borrow tokens against collateral (auto pool selection)
- `fluid_create_pool` — Create custom lending pools

### Bodega Markets (Prediction)
- `bodega_markets` — Active prediction markets with Yes/No prices

### CardexScan/Hydra (Aggregator + P2P + DCA)
- `cds_estimate_swap` — Aggregated swap estimate across DEXes
- `cds_trending_tokens` — Trending Cardano tokens
- `cds_p2p_offers` — Browse P2P OTC marketplace offers

### Strike Finance (Perpetuals)
- `strike_exchange_info` — Trading pairs and rules
- `strike_orderbook` — Order book depth for a trading pair

## Commands

- `/pools [ticker]` — SaturnSwap pools
- `/quote <from> <to> <amount>` — Cross-chain swap quote
- `/prices` — Indigo iAsset prices
- `/tvl` — Indigo TVL
- `/cdps [owner]` — Indigo CDPs
- `/lending` — Surf lending pools
- `/markets` — Bodega prediction markets
- `/perps` — Strike perpetuals info

## Unit Conventions

- **SaturnSwap**: Display units (5 = 5 ADA)
- **DexHunter**: Display units (10 = 10 ADA)
- **Indigo**: Lovelace for ADA; base units for iAssets
- **Surf**: Lovelace
- **Bodega**: Shares + micro-unit prices
- **Strike v2**: Contract units
