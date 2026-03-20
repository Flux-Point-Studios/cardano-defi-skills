#!/usr/bin/env node
import { signTransaction } from "../../../scripts/saturnswap-signer.js";

const args = process.argv.slice(2);
const cbor = args.indexOf("--cbor") !== -1 ? args[args.indexOf("--cbor") + 1] : null;

if (!cbor) { console.error("Usage: sign-and-submit.js --cbor <unsignedHex>"); process.exit(1); }

console.log("Signing Indigo CDP transaction...");
const signedHex = await signTransaction(cbor);
console.log(`Signed (${signedHex.length} chars). Submit via Blockfrost or Ogmios.`);
