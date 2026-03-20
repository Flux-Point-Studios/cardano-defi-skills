#!/usr/bin/env node
import { claimReward } from "../../../scripts/bodega-client.js";

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const marketId = getArg("market");
const address = getArg("address");

if (!marketId || !address) {
  console.error("Usage: claim.js --market <marketId> --address <bech32>");
  process.exit(1);
}

console.log(`Claiming rewards for market ${marketId}...`);
const result = await claimReward(address, marketId);

console.log("\nTransaction built:");
console.log(JSON.stringify(result, null, 2).substring(0, 500));
console.log("\n→ Sign and submit via bodega-markets-operator");
