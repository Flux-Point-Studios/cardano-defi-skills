# Cardano DeFi Skills (Open Source)

Open-source agent skills for Cardano's DeFi ecosystem. Direct protocol access — no gateway, no middleman. Trade, lend, mint synthetic assets, predict, and leverage across 9 protocols.

## Quick Start

### Agent Skills CLI
```bash
npx skills add Flux-Point-Studios/cardano-defi-skills
```

### OpenClaw
```bash
openclaw plugins install @fluxpointstudios/cardano-defi-skills
```

### npm
```bash
npm install @fluxpointstudios/cardano-defi-skills
```

## Protocols

| Protocol | Category | What You Can Do |
|---|---|---|
| [SaturnSwap](https://saturnswap.io) | DEX | Market swaps, limit orders, liquidity, cross-chain (119 chains) |
| [DexHunter](https://dexhunter.io) | Aggregator | Best-rate routing across all Cardano DEXes |
| [CardexScan/Hydra](https://cardexscan.com) | Aggregator + P2P + DCA | DEX aggregation, P2P OTC trades, dollar cost averaging |
| [Indigo Protocol](https://indigoprotocol.io) | Synthetics | CDPs, mint iUSD/iBTC/iETH/iSOL, stability pools, INDY staking |
| [Surf Finance](https://surflending.org) | Lending | Supply for APY, borrow against collateral |
| [FluidTokens](https://fluidtokens.com) | Lending | Borrow against collateral, create lending pools |
| [Bodega Markets](https://bodegamarket.io) | Prediction | Buy/sell Yes/No outcome shares |
| [Strike Finance](https://strikefinance.org) | Perpetuals | Leveraged long/short (1-125x), BTC-USD, ADA-USD |

## 28 Skills

### Guidance Skills
| Skill | Scripts |
|---|---|
| `saturnswap-pools` | `list-pools` `get-pool` `order-book` `search-tokens` |
| `saturnswap-portfolio` | `my-orders` `my-liquidity` |
| `saturnswap-analytics` | `platform-stats` `top-pools` `api-status` |
| `saturnswap-market-swap` | `preview-swap` `create-swap` |
| `saturnswap-limit-orders` | `preview-limit` `create-limit` `create-cancel` |
| `saturnswap-liquidity` | `create-add-liquidity` `create-withdraw-liquidity` |
| `saturnswap-cross-chain` | `list-chains` `find-token` `get-quote` `create-order` |
| `dexhunter-swap` | `search-tokens` `estimate-swap` `build-swap` |
| `cardexscan-swap` | `estimate` `build` `trending` |
| `cardexscan-p2p` | `offers` `my-offers` `create-offer` `fill-offer` `cancel-offer` |
| `cardexscan-dca` | `my-orders` `create-dca` `cancel-dca` |
| `indigo-cdp` | `my-cdps` `cdp-health` `open-cdp` `manage-cdp` `prices` |
| `indigo-stability` | `pools` `my-accounts` `manage-sp` |
| `indigo-staking` | `staking-info` `my-staking` `manage-staking` |
| `indigo-analytics` | `stats` `apr` `dex-yields` `governance` |
| `defi-lending` | `list-pools` `supply` `borrow` |
| `fluid-lending` | `borrow` `create-pool` |
| `bodega-markets` | `list-markets` `positions` `buy` `sell` `claim` |
| `strike-perpetuals` | `exchange-info` `order-book` `my-positions` `place-order` `strategy-order` `set-leverage` |
| `defi-portfolio` | `portfolio` |

### Operator Skills (require user confirmation)
| Skill | Purpose |
|---|---|
| `saturnswap-*-operator` (3) | Sign/submit DEX transactions |
| `dexhunter-swap-operator` | Sign/submit aggregated swaps |
| `indigo-cdp-operator` | Sign/submit CDP transactions |
| `defi-lending-operator` | Sign/submit lending transactions |
| `bodega-markets-operator` | Sign/submit prediction market transactions |
| `strike-perpetuals-operator` | Place/cancel Strike v2 orders |

## Environment Variables

| Variable | Protocol | Default |
|---|---|---|
| `SATURNSWAP_API_URL` | SaturnSwap | `https://api.saturnswap.io/v1/graphql/` |
| `DEXHUNTER_BASE_URL` | DexHunter | `https://api-us.dexhunterv3.app` |
| `DEXHUNTER_PARTNER_ID` | DexHunter | Optional (X-Partner-Id header) |
| `CARDEXSCAN_API_URL` | CardexScan | `https://cardexscan.com` |
| `CARDEXSCAN_API_KEY` | CardexScan | Required |
| `INDIGO_API_URL` | Indigo | `https://analytics.indigoprotocol.io/api/v1` |
| `SURF_API_URL` | Surf | `https://surflending.org` |
| `FLUID_API_URL` | FluidTokens | `https://qa.fluidtokens.com` |
| `BODEGA_API_URL` | Bodega | `https://v3.bodegamarket.io` |
| `STRIKE_API_URL` | Strike | `https://api.strikefinance.org` |
| `STRIKE_PRICE_URL` | Strike | `https://api.strikefinance.org/price` |
| `STRIKE_API_PUBLIC_KEY` | Strike | Ed25519 public key (trading) |
| `STRIKE_API_PRIVATE_KEY` | Strike | Ed25519 private key (trading) |
| `PAYMENT_SKEY_HEX` | All (signing) | Raw ed25519 key hex |
| `PAYMENT_SKEY_CBOR` | All (signing) | CBOR key from cardano-cli |

## Unit Conventions

| Protocol | Units |
|---|---|
| SaturnSwap | Display units (5 ADA, not 5000000) |
| DexHunter | Display units (10 = 10 ADA) |
| CardexScan | Base units (lovelace for ADA) |
| Indigo | Lovelace for ADA; iAsset base units (iUSD=6, iBTC=8, iETH=18, iSOL=9 decimals) |
| Surf | Lovelace (5000000 = 5 ADA) |
| Bodega | Shares + price in micro-units (500000 = 0.5 ADA/share) |
| Strike v2 | Contract units (see exchangeInfo) |

## Transaction Flow

All write operations return unsigned CBOR hex:

```
Protocol API → unsigned CBOR → sign locally (CSL/MeshJS) → submit to network
```

Private keys never leave your machine.

## Contributing

PRs welcome! See individual protocol docs for API details.

## License

MIT
