#!/usr/bin/env node
import { signTransaction } from "../../../scripts/saturnswap-signer.js";
import { signSwap } from "../../../scripts/dexhunter-client.js";

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const cbor = getArg("cbor");
if (!cbor) {
  console.error("Usage: sign-and-submit.js --cbor <unsignedHex>");
  process.exit(1);
}

console.log("Signing transaction...");
let signedHex;
try {
  signedHex = await signTransaction(cbor);
} catch (err) {
  console.error(`Signing failed: ${err.message}`);
  process.exit(1);
}

console.log("Submitting via DexHunter...");
const result = await signSwap(cbor, signedHex);

if (result.tx_hash) {
  console.log(`Submitted! TX Hash: ${result.tx_hash}`);
} else {
  console.log("Submitted. Response:", JSON.stringify(result));
}
