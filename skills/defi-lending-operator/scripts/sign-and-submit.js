#!/usr/bin/env node
import { signTransaction } from "../../../scripts/saturnswap-signer.js";

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

console.log("Signing lending transaction...");
let signedHex;
try {
  signedHex = await signTransaction(cbor);
} catch (err) {
  console.error(`Signing failed: ${err.message}`);
  process.exit(1);
}

console.log("Transaction signed.");
console.log(`Signed CBOR: ${signedHex.substring(0, 80)}...`);
console.log("\nSubmit via Blockfrost, Ogmios, or your preferred submit endpoint.");
