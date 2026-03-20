#!/usr/bin/env node
import { openCdp } from "../../../scripts/indigo-client.js";

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const address = getArg("address");
const asset = getArg("asset");
const collateral = getArg("collateral");

if (!address || !asset || !collateral) {
  console.error("Usage: open-cdp.js --address <bech32> --asset iUSD|iBTC|iETH|iSOL --collateral <lovelace>");
  process.exit(1);
}

console.log(`Opening ${asset} CDP with ${collateral} lovelace collateral...`);
const result = await openCdp(address, asset, collateral);

if (result.tx) {
  console.log(`\nCBOR OK (${result.tx.length} chars)`);
  console.log("→ Sign and submit via indigo-cdp-operator");
} else {
  console.log("Response:", JSON.stringify(result, null, 2));
}
