#!/usr/bin/env node
import { getCdpHealth } from "../../../scripts/indigo-client.js";

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const txHash = getArg("tx-hash");
const outputIndex = parseInt(getArg("output-index") || "0", 10);

if (!txHash) {
  console.error("Usage: cdp-health.js --tx-hash <hash> --output-index <idx>");
  process.exit(1);
}

const data = await getCdpHealth(txHash, outputIndex);
console.log("=== CDP Health Analysis ===");
console.log(JSON.stringify(data, null, 2));
