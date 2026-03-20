/**
 * Cardano DeFi Skills — OpenClaw Plugin
 *
 * Registers tools and commands for 8 DeFi protocols:
 * SaturnSwap, DexHunter, Indigo, Surf, FluidTokens, Bodega, Strike, Cross-chain
 */
import { Type } from "@sinclair/typebox";
import axios from "axios";

// ─── Protocol Clients ────────────────────────────────────────────────────────

const SATURN_URL = process.env.SATURNSWAP_API_URL || "https://api.saturnswap.io/v1/graphql/";
const DEXHUNTER_URL = process.env.DEXHUNTER_BASE_URL || "https://api-us.dexhunterv3.app";
const INDIGO_URL = process.env.INDIGO_API_URL || "https://analytics.indigoprotocol.io/api/v1";
const SURF_URL = process.env.SURF_API_URL || "https://surflending.org";
const FLUID_URL = process.env.FLUID_API_URL || "https://qa.fluidtokens.com";
const CDS_URL = process.env.CARDEXSCAN_API_URL || "https://cardexscan.com";
const CDS_KEY = process.env.CARDEXSCAN_API_KEY || "";
const BODEGA_URL = process.env.BODEGA_API_URL || "https://v3.bodegamarket.io";
const STRIKE_PRICE_URL = process.env.STRIKE_PRICE_URL || "https://api.strikefinance.org/price";
const UEX_URL = "https://saturnswap.io/api/uex";

function text(s: string) {
  return { content: [{ type: "text" as const, text: s }] };
}

function fmt(label: string, value: any) {
  return `**${label}:** ${value}`;
}

// ─── OpenClaw Register ───────────────────────────────────────────────────────

export default function register(api: any) {
  const config = api.pluginConfig ?? {};
  const defaultAddress = config.walletAddress || "";
  const partnerId = config.dexhunterPartnerId || process.env.DEXHUNTER_PARTNER_ID || "";

  const dexHeaders: Record<string, string> = { "Content-Type": "application/json" };
  if (partnerId) dexHeaders["X-Partner-Id"] = partnerId;

  // ═══════════════════════════════════════════════════════════════════════════
  // SATURNSWAP TOOLS
  // ═══════════════════════════════════════════════════════════════════════════

  api.registerTool({
    name: "saturn_pools",
    description: "List SaturnSwap trading pools with volume and TVL",
    parameters: Type.Object({
      ticker: Type.Optional(Type.String({ description: "Filter by token ticker" })),
    }),
    execute: async (params: { ticker?: string }) => {
      const where = params.ticker
        ? `where: { token_project_two: { ticker: { eq: "${params.ticker}" } } }`
        : "";
      const query = `{ pools(first: 20, order: { volume_24h: DESC } ${where}) { edges { node { id volume_24h tvl token_project_two { ticker price lowest_ask_price highest_bid_price } } } } }`;
      const { data } = await axios.post(SATURN_URL, { query });
      const pools = data?.data?.pools?.edges?.map((e: any) => e.node) || [];
      const lines = pools.map((p: any) => {
        const t = p.token_project_two;
        return `ADA/${t?.ticker || "?"} — vol24h=${p.volume_24h} tvl=${p.tvl} price=${t?.price || "?"} bid=${t?.highest_bid_price || "-"} ask=${t?.lowest_ask_price || "-"}`;
      });
      return text(`**SaturnSwap Pools (${pools.length})**\n\n${lines.join("\n") || "None found"}`);
    },
  });

  api.registerTool({
    name: "saturn_stats",
    description: "Get SaturnSwap platform statistics (TVL, volume, pools)",
    parameters: Type.Object({}),
    execute: async () => {
      const query = `{ totalStats(first: 1) { edges { node { total_tvl total_volume_24h total_volume_7d total_pools total_tokens total_transactions_24h } } } }`;
      const { data } = await axios.post(SATURN_URL, { query });
      const s = data?.data?.totalStats?.edges?.[0]?.node;
      if (!s) return text("No stats available");
      return text([
        "**SaturnSwap Stats**",
        fmt("TVL", `${s.total_tvl} ADA`),
        fmt("Volume 24h", `${s.total_volume_24h} ADA`),
        fmt("Pools", s.total_pools),
        fmt("Tokens", s.total_tokens),
        fmt("Transactions 24h", s.total_transactions_24h),
      ].join("\n"));
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CROSS-CHAIN TOOLS
  // ═══════════════════════════════════════════════════════════════════════════

  api.registerTool({
    name: "crosschain_quote",
    description: "Get a cross-chain swap quote (119 chains via Cosmic Router)",
    parameters: Type.Object({
      fromChainId: Type.String({ description: "Source chain (e.g. cardano-mainnet)" }),
      fromTokenId: Type.String({ description: "Source token (e.g. ADA@ADA)" }),
      toChainId: Type.String({ description: "Destination chain (e.g. ethereum-mainnet)" }),
      toTokenId: Type.String({ description: "Destination token (e.g. ETH@ETH)" }),
      amountIn: Type.String({ description: "Amount to swap (display units)" }),
    }),
    execute: async (params: any) => {
      const { data } = await axios.post(`${UEX_URL}/quote`, { ...params, slippageTolerance: 2.5 });
      return text([
        "**Cross-Chain Quote**",
        fmt("Amount Out", data.amountOutEstimate),
        fmt("Rate", data.rate),
        data.feeAmount ? fmt("Fee", data.feeAmount) : "",
        data.minAmountIn ? fmt("Min Amount", data.minAmountIn) : "",
      ].filter(Boolean).join("\n"));
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DEXHUNTER TOOLS
  // ═══════════════════════════════════════════════════════════════════════════

  api.registerTool({
    name: "dexhunter_estimate",
    description: "Get best swap rate across all Cardano DEXes (DexHunter aggregator)",
    parameters: Type.Object({
      tokenIn: Type.String({ description: "Token to sell ('' for ADA)" }),
      tokenOut: Type.String({ description: "Token to buy (policyId+assetNameHex)" }),
      amountIn: Type.Number({ description: "Amount in display units (10 = 10 ADA)" }),
    }),
    execute: async (params: any) => {
      const { data } = await axios.post(`${DEXHUNTER_URL}/swap/estimate`, {
        token_in: params.tokenIn, token_out: params.tokenOut,
        amount_in: params.amountIn, slippage: 1, include_routes: true,
      }, { headers: dexHeaders });
      const splits = data.splits?.map((s: any) => `  ${s.dex}: ${s.expected_output} (impact: ${s.price_impact})`).join("\n") || "N/A";
      return text([
        "**DexHunter Estimate**",
        fmt("Total Output", data.total_output),
        fmt("Net Price", data.net_price),
        fmt("Total Fee", data.total_fee),
        data.partner_fee ? fmt("Partner Fee", data.partner_fee) : "",
        `\n**Routing:**\n${splits}`,
      ].filter(Boolean).join("\n"));
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INDIGO TOOLS
  // ═══════════════════════════════════════════════════════════════════════════

  api.registerTool({
    name: "indigo_assets",
    description: "List all Indigo iAssets (iUSD, iBTC, iETH, iSOL) with oracle prices",
    parameters: Type.Object({}),
    execute: async () => {
      const { data } = await axios.get(`${INDIGO_URL}/assets/`);
      const assets = Array.isArray(data) ? data : data?.assets || [data];
      const lines = assets.map((a: any) => `${a.asset || a.name} — price=$${a.price?.price || a.price || "?"}`);
      return text(`**Indigo iAssets (${assets.length})**\n\n${lines.join("\n")}`);
    },
  });

  api.registerTool({
    name: "indigo_tvl",
    description: "Get Indigo Protocol total value locked",
    parameters: Type.Object({}),
    execute: async () => {
      const { data } = await axios.get(`${INDIGO_URL}/analytics/tvl`);
      return text(`**Indigo TVL**\n\n\`\`\`json\n${JSON.stringify(data, null, 2).slice(0, 500)}\n\`\`\``);
    },
  });

  api.registerTool({
    name: "indigo_cdps",
    description: "List CDPs (Collateralized Debt Positions) by owner or asset",
    parameters: Type.Object({
      owner: Type.Optional(Type.String({ description: "Wallet bech32 address" })),
      asset: Type.Optional(Type.String({ description: "iAsset (iUSD, iBTC, iETH, iSOL)" })),
    }),
    execute: async (params: { owner?: string; asset?: string }) => {
      const qs = new URLSearchParams();
      if (params.owner || defaultAddress) qs.set("owner", params.owner || defaultAddress);
      if (params.asset) qs.set("asset", params.asset);
      const { data } = await axios.get(`${INDIGO_URL}/loans/${qs.toString() ? "?" + qs : ""}`);
      const cdps = Array.isArray(data) ? data : data?.loans || [data];
      const lines = cdps.slice(0, 20).map((c: any) =>
        `${c.asset || "?"} — collateral=${c.collateral || "?"} minted=${c.minted || "?"} ratio=${c.ratio || "?"}%`
      );
      return text(`**Indigo CDPs (${cdps.length})**\n\n${lines.join("\n") || "None found"}`);
    },
  });

  api.registerTool({
    name: "indigo_staking",
    description: "Get INDY staking overview (total staked, rewards)",
    parameters: Type.Object({}),
    execute: async () => {
      const { data } = await axios.get(`${INDIGO_URL}/staking/`);
      return text(`**INDY Staking**\n\n${fmt("Total Stake", data.totalStake)}\n${fmt("Snapshot ADA", data.snapshotAda)}`);
    },
  });

  api.registerTool({
    name: "indigo_stability_pools",
    description: "Get Indigo stability pool information",
    parameters: Type.Object({}),
    execute: async () => {
      const { data } = await axios.get(`${INDIGO_URL}/stability-pools/`);
      const pools = Array.isArray(data) ? data : [data];
      return text(`**Stability Pools (${pools.length})**\n\n\`\`\`json\n${JSON.stringify(pools, null, 2).slice(0, 800)}\n\`\`\``);
    },
  });

  api.registerTool({
    name: "indigo_apr",
    description: "Get APR rewards for Indigo pools",
    parameters: Type.Object({}),
    execute: async () => {
      const { data } = await axios.get(`${INDIGO_URL}/apr/`);
      const aprs = Array.isArray(data) ? data : [data];
      const lines = aprs.map((a: any) => `${a.pool || a.name || "?"} — ${a.asset || "?"} APR=${a.apr || "?"}%`);
      return text(`**Indigo APR Rewards**\n\n${lines.join("\n")}`);
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SURF FINANCE TOOLS
  // ═══════════════════════════════════════════════════════════════════════════

  api.registerTool({
    name: "surf_pools",
    description: "List Surf Finance lending/borrowing pools with APY and APR",
    parameters: Type.Object({}),
    execute: async () => {
      const { data } = await axios.get(`${SURF_URL}/api/getAllPoolInfos`);
      const pools = data?.poolInfos || data;
      const entries = typeof pools === "object" ? Object.entries(pools) : [];
      const lines = entries.slice(0, 15).map(([id, p]: [string, any]) =>
        `${p.asset?.ticker || "?"} — supplyAPY=${p.supplyAPY || "?"}% borrowAPR=${p.borrowAprPct || "?"}% available=${p.availableLiquidity || "?"}`
      );
      return text(`**Surf Lending Pools (${entries.length})**\n\n${lines.join("\n") || "None"}`);
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FLUIDTOKENS TOOLS
  // ═══════════════════════════════════════════════════════════════════════════

  api.registerTool({
    name: "fluid_borrow",
    description: "Borrow tokens against collateral on FluidTokens (ADA, USDM, FLDT, Snek, etc.)",
    parameters: Type.Object({
      address: Type.String({ description: "Wallet bech32 address" }),
      borrowToken: Type.String({ description: "Token to borrow: ADA, FLDT, Snek, USDM, USDA, STRIKE, WMTX, HOSKY" }),
      borrowAmount: Type.Number({ description: "Amount to borrow (smallest units)" }),
      collateralPolicyId: Type.String({ description: "Collateral token policy ID" }),
      collateralAssetName: Type.String({ description: "Collateral token asset name (hex)" }),
      collateralAmount: Type.Number({ description: "Collateral amount (smallest units)" }),
    }),
    execute: async (params: any) => {
      const { data } = await axios.post(`${FLUID_URL}/api/pools/borrow`, params);
      if (data.success && data.unsignedTxs) {
        return text(`**FluidTokens Borrow**\n\n${data.unsignedTxs.length} tx(s) to sign in sequence.\nFirst tx: ${data.unsignedTxs[0]?.substring(0, 60)}...`);
      }
      return text(`**FluidTokens Error:** ${data.error || "Unknown error"}`);
    },
  });

  api.registerTool({
    name: "fluid_create_pool",
    description: "Create a lending pool on FluidTokens",
    parameters: Type.Object({
      address: Type.String({ description: "Wallet bech32 address" }),
      lendToken: Type.String({ description: "Token to lend: ADA, FLDT, USDM, USDA, wUSDC, wBTC, etc." }),
      lendAmount: Type.Number({ description: "Amount to lend (smallest units)" }),
      lendInterestRate: Type.Number({ description: "Interest rate (e.g. 4.65 for 4.65%)" }),
      markets: Type.Array(Type.String(), { description: "Accepted collateral markets" }),
      period: Type.Number({ description: "Loan period in hours" }),
      isPerpetualPool: Type.Boolean({ description: "Allow perpetual loans" }),
    }),
    execute: async (params: any) => {
      const { data } = await axios.post(`${FLUID_URL}/api/pools/create`, {
        ...params, interestRateIncCoe: 28, isPermissionedPool: false,
      });
      if (data.success && data.unsignedTxs) {
        return text(`**FluidTokens Pool Created**\n\n${data.unsignedTxs.length} tx(s) to sign in sequence.`);
      }
      return text(`**FluidTokens Error:** ${data.error || "Unknown error"}`);
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BODEGA TOOLS
  // ═══════════════════════════════════════════════════════════════════════════

  api.registerTool({
    name: "bodega_markets",
    description: "List active Bodega prediction markets",
    parameters: Type.Object({}),
    execute: async () => {
      const { data } = await axios.post(`${BODEGA_URL}/api/getMarketConfigs`, {},
        { headers: { Origin: BODEGA_URL, "Content-Type": "application/json" } });
      const markets = data?.marketConfigs || [];
      const active = markets.filter((m: any) => m.status === "Active").slice(0, 15);
      const lines = active.map((m: any) => {
        const opt = m.options?.[0];
        const yesP = opt?.predictionInfo?.prices?.yesPrice;
        const noP = opt?.predictionInfo?.prices?.noPrice;
        return `**${m.id}** — ${m.name?.slice(0, 60)}\n  Yes: ${yesP ? (yesP / 1e6).toFixed(2) : "?"} | No: ${noP ? (noP / 1e6).toFixed(2) : "?"}`;
      });
      return text(`**Bodega Markets (${active.length} active)**\n\n${lines.join("\n\n") || "None"}`);
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CARDEXSCAN TOOLS
  // ═══════════════════════════════════════════════════════════════════════════

  api.registerTool({
    name: "cds_estimate_swap",
    description: "Get aggregated swap estimate via CardexScan/Hydra (alternative to DexHunter)",
    parameters: Type.Object({
      tokenInAmount: Type.Number({ description: "Amount in base units (lovelace for ADA)" }),
      tokenOutPolicyId: Type.String({ description: "Output token policy ID" }),
      tokenOutAssetName: Type.Optional(Type.String({ description: "Output token asset name hex" })),
    }),
    execute: async (params: any) => {
      const cdsHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (CDS_KEY) cdsHeaders["x-api-key"] = CDS_KEY;
      const { data } = await axios.post(`${CDS_URL}/api/cds/swap/aggregate`, {
        tokenInAmount: params.tokenInAmount,
        slippage: 1,
        tokenIn: "lovelace",
        tokenOut: { policyId: params.tokenOutPolicyId, assetName: params.tokenOutAssetName || "" },
      }, { headers: cdsHeaders });
      return text(`**CardexScan Swap Estimate**\n\n\`\`\`json\n${JSON.stringify(data, null, 2).slice(0, 600)}\n\`\`\``);
    },
  });

  api.registerTool({
    name: "cds_trending_tokens",
    description: "Get trending Cardano tokens from CardexScan",
    parameters: Type.Object({
      timeframe: Type.Optional(Type.String({ description: "24h, 7d, 30d (default: 24h)" })),
      count: Type.Optional(Type.Number({ description: "Number of tokens (default: 20)" })),
    }),
    execute: async (params: any) => {
      const cdsHeaders: Record<string, string> = {};
      if (CDS_KEY) cdsHeaders["x-api-key"] = CDS_KEY;
      const { data } = await axios.get(`${CDS_URL}/api/tokens/trending?timeframe=${params.timeframe || "24h"}&count=${params.count || 20}`, { headers: cdsHeaders });
      return text(`**Trending Tokens**\n\n\`\`\`json\n${JSON.stringify(data, null, 2).slice(0, 800)}\n\`\`\``);
    },
  });

  api.registerTool({
    name: "cds_p2p_offers",
    description: "Browse P2P OTC offers on CardexScan marketplace",
    parameters: Type.Object({
      status: Type.Optional(Type.String({ description: "open, all, filled, cancelled (default: open)" })),
    }),
    execute: async (params: any) => {
      const cdsHeaders: Record<string, string> = {};
      if (CDS_KEY) cdsHeaders["x-api-key"] = CDS_KEY;
      const { data } = await axios.get(`${CDS_URL}/api/otc/offers?status=${params.status || "open"}`, { headers: cdsHeaders });
      return text(`**P2P Offers (${params.status || "open"})**\n\n\`\`\`json\n${JSON.stringify(data, null, 2).slice(0, 800)}\n\`\`\``);
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // STRIKE TOOLS
  // ═══════════════════════════════════════════════════════════════════════════

  api.registerTool({
    name: "strike_exchange_info",
    description: "Get Strike Finance perpetuals trading pairs and rules",
    parameters: Type.Object({}),
    execute: async () => {
      const { data } = await axios.get(`${STRIKE_PRICE_URL}/v2/exchangeInfo`);
      const syms = data.symbols || [];
      const lines = syms.map((s: any) => `${s.symbol} — status=${s.status} pricePrecision=${s.pricePrecision}`);
      return text(`**Strike Perpetuals (${syms.length} pairs)**\n\n${lines.join("\n") || "None"}`);
    },
  });

  api.registerTool({
    name: "strike_orderbook",
    description: "Get Strike Finance order book for a trading pair",
    parameters: Type.Object({
      symbol: Type.String({ description: "Trading pair (e.g. ADA-USD, BTC-USD)" }),
      limit: Type.Optional(Type.Number({ description: "Max levels per side (default 10)" })),
    }),
    execute: async (params: { symbol: string; limit?: number }) => {
      const { data } = await axios.get(`${STRIKE_PRICE_URL}/v2/depth?symbol=${params.symbol}&limit=${params.limit || 10}`);
      const bids = (data.bids || []).slice(0, 5).map((b: string[]) => `  ${b[0]} qty=${b[1]}`).join("\n");
      const asks = (data.asks || []).slice(0, 5).map((a: string[]) => `  ${a[0]} qty=${a[1]}`).join("\n");
      return text(`**${params.symbol} Order Book**\n\nAsks:\n${asks || "  empty"}\n\nBids:\n${bids || "  empty"}`);
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMANDS (auto-reply shortcuts)
  // ═══════════════════════════════════════════════════════════════════════════

  api.registerCommand({
    name: "pools",
    description: "List SaturnSwap pools (/pools [ticker])",
    parameters: Type.Object({ ticker: Type.Optional(Type.String()) }),
    execute: async (params: { ticker?: string }) => {
      const result = await api.executeTool("saturn_pools", params);
      return { text: result.content[0].text };
    },
  });

  api.registerCommand({
    name: "quote",
    description: "Cross-chain quote (/quote ADA ETH 100)",
    parameters: Type.Object({
      from: Type.String(), to: Type.String(), amount: Type.String(),
    }),
    execute: async (params: { from: string; to: string; amount: string }) => {
      const result = await api.executeTool("crosschain_quote", {
        fromChainId: "cardano-mainnet", fromTokenId: `${params.from}@${params.from}`,
        toChainId: "ethereum-mainnet", toTokenId: `${params.to}@${params.to}`,
        amountIn: params.amount,
      });
      return { text: result.content[0].text };
    },
  });

  api.registerCommand({
    name: "prices",
    description: "Get all Indigo iAsset prices (/prices)",
    parameters: Type.Object({}),
    execute: async () => {
      const result = await api.executeTool("indigo_assets", {});
      return { text: result.content[0].text };
    },
  });

  api.registerCommand({
    name: "tvl",
    description: "Get Indigo TVL (/tvl)",
    parameters: Type.Object({}),
    execute: async () => {
      const result = await api.executeTool("indigo_tvl", {});
      return { text: result.content[0].text };
    },
  });

  api.registerCommand({
    name: "cdps",
    description: "List CDPs (/cdps [owner])",
    parameters: Type.Object({ owner: Type.Optional(Type.String()) }),
    execute: async (params: { owner?: string }) => {
      const result = await api.executeTool("indigo_cdps", params);
      return { text: result.content[0].text };
    },
  });

  api.registerCommand({
    name: "lending",
    description: "List Surf lending pools (/lending)",
    parameters: Type.Object({}),
    execute: async () => {
      const result = await api.executeTool("surf_pools", {});
      return { text: result.content[0].text };
    },
  });

  api.registerCommand({
    name: "markets",
    description: "List Bodega prediction markets (/markets)",
    parameters: Type.Object({}),
    execute: async () => {
      const result = await api.executeTool("bodega_markets", {});
      return { text: result.content[0].text };
    },
  });

  api.registerCommand({
    name: "perps",
    description: "Get Strike perpetuals info (/perps)",
    parameters: Type.Object({}),
    execute: async () => {
      const result = await api.executeTool("strike_exchange_info", {});
      return { text: result.content[0].text };
    },
  });
}
