#!/usr/bin/env node
import { createWithdrawLiquidity } from "../../../scripts/saturnswap-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const address = getArg("address", null);
const contractId = getArg("contract", null);
const policyId = getArg("policy", "");
const assetName = getArg("asset", "");
const amount = parseFloat(getArg("amount", "0"));

if (!address || !contractId || !amount) {
  console.error(
    "Usage: create-withdraw-liquidity.js --address <bech32> --contract <id> --amount <display-units> " +
      "[--policy <policyId>] [--asset <assetName>]"
  );
  process.exit(1);
}

const side = policyId ? `token (${policyId.substring(0, 16)}...)` : "ADA";
console.log(`Withdrawing ${amount} ${side} from contract ${contractId}`);

const data = await createWithdrawLiquidity(address, {
  liquidityPoolContractId: contractId,
  policyId,
  assetName,
  tokenAmount: amount,
});

const result = data.createLiquidityTransaction;
if (result.error?.message) {
  console.error(`API Error: ${result.error.message}`);
  process.exit(1);
}

const txs = result.successTransactions;
if (!txs || txs.length === 0) {
  console.error("No transaction returned — check amount and contract ID");
  process.exit(1);
}

for (const tx of txs) {
  console.log(`\nTransaction ID: ${tx.transactionId}`);
  console.log(`Unsigned Hex: ${tx.hexTransaction.substring(0, 80)}...`);
}

console.log("\n→ Sign and submit via saturnswap-liquidity-operator");
