#!/usr/bin/env node
import { borrow } from "../../../scripts/surf-client.js";

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const address = getArg("address");
const poolId = getArg("pool");
const amount = getArg("amount");
const collateral = getArg("collateral");

if (!address || !poolId || !amount || !collateral) {
  console.error("Usage: borrow.js --address <bech32> --pool <poolId> --amount <lovelace> --collateral <lovelace>");
  process.exit(1);
}

console.log(`Borrowing ${amount} from pool ${poolId} with ${collateral} collateral...`);
const result = await borrow({
  poolId,
  address,
  amount: parseInt(amount),
  collateralAmount: parseInt(collateral),
});

const cbor = typeof result === "string" ? result : JSON.stringify(result);
console.log(`\nUnsigned CBOR: ${cbor.substring(0, 80)}...`);
console.log("\n→ Sign and submit via defi-lending-operator");
