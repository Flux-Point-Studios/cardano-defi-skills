#!/usr/bin/env node
import { createLimitOrder } from "../../../scripts/saturnswap-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const address = getArg("address", null);
const poolId = getArg("pool", null);
const policyId = getArg("policy", "");
const assetName = getArg("asset", "");
const tokenAmountSell = parseFloat(getArg("sell", "0"));
const tokenAmountBuy = parseFloat(getArg("buy", "0"));

if (!address || !poolId || !tokenAmountSell || !tokenAmountBuy) {
  console.error(
    "Usage: create-limit.js --address <bech32> --pool <uuid> " +
      "--policy <policyId> --asset <assetName> --sell <amount> --buy <amount>"
  );
  console.error("\nFor limit BUY (selling ADA): --policy '' --asset '' --sell <ADA> --buy <tokens>");
  console.error("For limit SELL (selling tokens): --policy <id> --asset <name> --sell <tokens> --buy <ADA>");
  process.exit(1);
}

console.log(`Creating limit order: sell=${tokenAmountSell} buy=${tokenAmountBuy} pool=${poolId}`);

const data = await createLimitOrder(address, {
  poolId,
  policyId,
  assetName,
  tokenAmountSell,
  tokenAmountBuy,
});

const result = data.createOrderTransaction;
if (result.error?.message) {
  console.error(`API Error: ${result.error.message}`);
  process.exit(1);
}

const txs = result.successTransactions;
if (!txs || txs.length === 0) {
  console.error("No transaction returned — verify amounts and pool");
  process.exit(1);
}

for (const tx of txs) {
  console.log(`\nTransaction ID: ${tx.transactionId}`);
  console.log(`Unsigned Hex: ${tx.hexTransaction.substring(0, 80)}...`);
}

console.log("\n→ Sign and submit via saturnswap-limit-orders-operator");
