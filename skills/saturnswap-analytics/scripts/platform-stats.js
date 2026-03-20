#!/usr/bin/env node
import { getTotalStats } from "../../../scripts/saturnswap-client.js";

const data = await getTotalStats();
const stats = data.totalStats.edges[0]?.node;

if (!stats) {
  console.error("No stats returned from API");
  process.exit(1);
}

console.log("=== SaturnSwap Platform Stats ===");
console.log(`Total TVL:           ${stats.total_tvl} ADA`);
console.log(`Volume 24h:          ${stats.total_volume_24h} ADA`);
console.log(`Volume 7d:           ${stats.total_volume_7d} ADA`);
console.log(`Volume 30d:          ${stats.total_volume_30d} ADA`);
console.log(`Total Pools:         ${stats.total_pools}`);
console.log(`Total Tokens:        ${stats.total_tokens}`);
console.log(`Transactions 24h:    ${stats.total_transactions_24h}`);
