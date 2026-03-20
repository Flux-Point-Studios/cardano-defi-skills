#!/usr/bin/env node
import { getAprRewards } from "../../../scripts/indigo-client.js";

const data = await getAprRewards();
const aprs = Array.isArray(data) ? data : data?.aprs || [data];

console.log("=== Indigo APR Rewards ===\n");
for (const a of aprs) {
  console.log(`  ${a.pool || a.name || "?"}  asset=${a.asset || "?"}  APR=${a.apr || "?"}%  TVL=${a.tvl || "?"}`);
}
