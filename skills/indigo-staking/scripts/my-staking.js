#!/usr/bin/env node
import { getStakingPositions } from "../../../scripts/indigo-client.js";

const owner = process.argv.indexOf("--owner") !== -1 ? process.argv[process.argv.indexOf("--owner") + 1] : null;
const data = await getStakingPositions(owner);
const positions = Array.isArray(data) ? data : data?.positions || [data];

console.log("=== INDY Staking Positions ===\n");
for (const p of positions) {
  console.log(`  staked=${p.stakedAmount || "?"}  rewards=${p.rewardsEarned || "?"}  owner=${(p.owner || "?").slice(0, 20)}...`);
}
if (positions.length === 0) console.log("  None found");
