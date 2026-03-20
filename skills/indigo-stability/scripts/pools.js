#!/usr/bin/env node
import { getStabilityPools } from "../../../scripts/indigo-client.js";

const data = await getStabilityPools();
const pools = Array.isArray(data) ? data : data?.pools || [data];

console.log("=== Indigo Stability Pools ===\n");
for (const p of pools) {
  console.log(`  ${p.asset || "?"}  deposited=${p.totalDeposited || "?"}  rewards=${p.totalRewards || "?"}  accounts=${p.accountCount || "?"}`);
}
