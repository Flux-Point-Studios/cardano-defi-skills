#!/usr/bin/env node
import { cancelOrder } from "../../../scripts/saturnswap-client.js";

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const address = getArg("address");
const utxoIdsStr = getArg("utxo-ids");

if (!address || !utxoIdsStr) {
  console.error("Usage: create-cancel.js --address <bech32> --utxo-ids <id1,id2,...>");
  process.exit(1);
}

const poolUtxoIds = utxoIdsStr.split(",").map((s) => s.trim());
console.log(`Cancelling ${poolUtxoIds.length} order(s): ${poolUtxoIds.join(", ")}`);

const data = await cancelOrder(address, poolUtxoIds);
const result = data.createOrderTransaction;

if (result.error?.message) {
  console.error(`API Error: ${result.error.message}`);
  process.exit(1);
}

const txs = result.successTransactions;
if (!txs || txs.length === 0) {
  console.error("No cancel transaction returned");
  process.exit(1);
}

for (const tx of txs) {
  console.log(`\nTransaction ID: ${tx.transactionId}`);
  console.log(`Unsigned Hex: ${tx.hexTransaction.substring(0, 80)}...`);
}

console.log("\n→ Sign and submit via saturnswap-limit-orders-operator");
