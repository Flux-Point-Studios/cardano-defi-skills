#!/usr/bin/env node
import { depositCdp, withdrawCdp, mintCdp, burnCdp, closeCdp } from "../../../scripts/indigo-client.js";

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const address = getArg("address");
const action = getArg("action");
const txHash = getArg("tx-hash");
const outputIndex = parseInt(getArg("output-index") || "0", 10);
const amount = getArg("amount");

if (!address || !action || !txHash) {
  console.error("Usage: manage-cdp.js --address <bech32> --action deposit|withdraw|mint|burn|close --tx-hash <hash> --output-index <idx> [--amount <units>]");
  process.exit(1);
}

let result;
switch (action) {
  case "deposit":
    result = await depositCdp(address, txHash, outputIndex, amount);
    break;
  case "withdraw":
    result = await withdrawCdp(address, txHash, outputIndex, amount);
    break;
  case "mint":
    result = await mintCdp(address, txHash, outputIndex, amount);
    break;
  case "burn":
    result = await burnCdp(address, txHash, outputIndex, amount);
    break;
  case "close":
    result = await closeCdp(address, txHash, outputIndex);
    break;
  default:
    console.error(`Unknown action: ${action}`);
    process.exit(1);
}

if (result.tx) {
  console.log(`${action} CBOR OK (${result.tx.length} chars)`);
  console.log("→ Sign and submit via indigo-cdp-operator");
} else {
  console.log("Response:", JSON.stringify(result, null, 2));
}
