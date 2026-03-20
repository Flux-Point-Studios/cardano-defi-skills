#!/usr/bin/env node
import { getDexYields } from "../../../scripts/indigo-client.js";

const data = await getDexYields();
const yields = Array.isArray(data) ? data : data?.yields || [data];

console.log("=== DEX Yields for iAssets ===\n");
for (const y of yields) {
  console.log(`  ${y.pair || "?"}  dex=${y.dex || "?"}  APY=${y.apy || "?"}%  TVL=${y.tvl || "?"}  vol24h=${y.volume24h || "?"}`);
}
