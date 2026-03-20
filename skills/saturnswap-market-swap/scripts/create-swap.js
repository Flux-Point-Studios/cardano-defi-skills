#!/usr/bin/env node
import { createMarketSwap } from "../../../scripts/saturnswap-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const address = getArg("address", null);
const poolId = getArg("pool", null);
const amount = parseFloat(getArg("amount", "0"));
const slippage = parseFloat(getArg("slippage", "3"));

if (!address || !poolId || !amount) {
  console.error("Usage: create-swap.js --address <bech32> --pool <uuid> --amount <display-units> [--slippage 3]");
  process.exit(1);
}

if (slippage > 10) {
  console.warn(`WARNING: Slippage set to ${slippage}% — this is unusually high`);
}

console.log(`Creating market swap: ${amount} display units, pool=${poolId}, slippage=${slippage}%`);

const data = await createMarketSwap(address, {
  poolId,
  tokenAmountSell: amount,
  slippagePercent: slippage,
});

const result = data.createOrderTransaction;
if (result.error?.message) {
  console.error(`API Error: ${result.error.message}`);
  process.exit(1);
}

const txs = result.successTransactions;
if (!txs || txs.length === 0) {
  console.error("No transaction returned — check amount and pool availability");
  process.exit(1);
}

for (const tx of txs) {
  console.log(`\nTransaction ID: ${tx.transactionId}`);
  console.log(`Unsigned Hex: ${tx.hexTransaction.substring(0, 80)}...`);
}

console.log("\n→ Sign this transaction locally, then submit via saturnswap-market-swap-operator");
