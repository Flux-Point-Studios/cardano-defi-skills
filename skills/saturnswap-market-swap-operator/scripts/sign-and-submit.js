#!/usr/bin/env node
import { signTransaction } from "../../../scripts/saturnswap-signer.js";
import { submitOrderTransaction } from "../../../scripts/saturnswap-client.js";

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const address = getArg("address");
const txId = getArg("txid");
const unsignedHex = getArg("hex");

if (!address || !txId || !unsignedHex) {
  console.error("Usage: sign-and-submit.js --address <bech32> --txid <transactionId> --hex <unsignedHex>");
  process.exit(1);
}

// Step 1: Sign
console.log(`Signing transaction ${txId}...`);
let signedHex;
try {
  signedHex = await signTransaction(unsignedHex);
} catch (err) {
  console.error(`Signing failed: ${err.message}`);
  process.exit(1);
}
console.log("Transaction signed successfully.");

// Step 2: Submit
console.log(`Submitting transaction ${txId}...`);
const data = await submitOrderTransaction(address, [txId], [signedHex]);
const result = data.submitOrderTransaction;

if (result.error?.message) {
  console.error(`Submit error: ${result.error.message}`);
  process.exit(1);
}

const submitted = result.successTransactions;
if (submitted && submitted.length > 0) {
  for (const tx of submitted) {
    console.log(`Submitted! Transaction ID: ${tx.transactionId}`);
  }
} else {
  console.error("No transaction confirmation returned");
  process.exit(1);
}
