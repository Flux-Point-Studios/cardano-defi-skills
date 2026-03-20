#!/usr/bin/env node
import { sellPosition } from "../../../scripts/bodega-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const marketId = getArg("market", null);
const side = getArg("side", null);
const amount = parseFloat(getArg("amount", "0"));
const slippage = parseFloat(getArg("slippage", "0.05"));
const address = getArg("address", null);

if (!marketId || !side || !amount || !address) {
  console.error("Usage: sell.js --market <id> --side Yes|No --amount <shares> --slippage 0.05 --address <bech32>");
  process.exit(1);
}

console.log(`Selling ${amount} ${side} shares on ${marketId}...`);
const result = await sellPosition({ id: marketId, side, amount, slippage, address });

console.log("\nTransaction built:");
console.log(JSON.stringify(result, null, 2).substring(0, 500));
console.log("\n→ Sign and submit via bodega-markets-operator");
