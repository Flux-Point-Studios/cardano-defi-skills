#!/usr/bin/env node
import { depositLiquidity } from "../../../scripts/surf-client.js";

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const address = getArg("address");
const poolId = getArg("pool");
const amount = getArg("amount");

if (!address || !poolId || !amount) {
  console.error("Usage: supply.js --address <bech32> --pool <poolId> --amount <lovelace>");
  process.exit(1);
}

console.log(`Supplying ${amount} to pool ${poolId}...`);
const result = await depositLiquidity({ poolId, address, amount: parseInt(amount) });

const cbor = typeof result === "string" ? result : JSON.stringify(result);
console.log(`\nUnsigned CBOR: ${cbor.substring(0, 80)}...`);
console.log("\n→ Sign and submit via defi-lending-operator");
