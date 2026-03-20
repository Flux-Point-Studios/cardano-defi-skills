#!/usr/bin/env node
import { openStakingPosition, adjustStakingPosition, closeStakingPosition } from "../../../scripts/indigo-client.js";

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const address = getArg("address");
const action = getArg("action");
const amount = getArg("amount");
const txHash = getArg("tx-hash");
const outputIndex = parseInt(getArg("output-index") || "0", 10);

if (!address || !action) {
  console.error("Usage: manage-staking.js --address <bech32> --action open|adjust|close [--amount <units>] [--tx-hash <hash>] [--output-index <idx>]");
  process.exit(1);
}

let result;
if (action === "open") result = await openStakingPosition(address, amount);
else if (action === "adjust") result = await adjustStakingPosition(address, txHash, outputIndex, amount);
else if (action === "close") result = await closeStakingPosition(address, txHash, outputIndex);
else { console.error(`Unknown action: ${action}`); process.exit(1); }

if (result.tx) console.log(`${action} CBOR OK (${result.tx.length} chars)\n→ Sign via indigo-cdp-operator`);
else console.log("Response:", JSON.stringify(result, null, 2));
