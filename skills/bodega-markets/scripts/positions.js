#!/usr/bin/env node
import { getPositions } from "../../../scripts/bodega-client.js";

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const marketId = getArg("market");
const address = getArg("address");

if (!marketId || !address) {
  console.error("Usage: positions.js --market <marketId> --address <bech32>");
  process.exit(1);
}

const positions = await getPositions(marketId, address);
const items = Array.isArray(positions) ? positions : [positions];

if (items.length === 0) {
  console.log("No positions found for this market/address.");
  process.exit(0);
}

console.log(`=== Positions on ${marketId} ===\n`);
for (const p of items) {
  console.log(JSON.stringify(p, null, 2));
}
