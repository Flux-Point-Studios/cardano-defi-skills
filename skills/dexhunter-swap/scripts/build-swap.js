#!/usr/bin/env node
import { buildSwap } from "../../../scripts/dexhunter-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const address = getArg("address", null);
const tokenIn = getArg("token-in", "");
const tokenOut = getArg("token-out", null);
const amountIn = getArg("amount", null);
const slippage = parseFloat(getArg("slippage", "1"));

if (!address || !tokenOut || !amountIn) {
  console.error("Usage: build-swap.js --address <bech32> --token-in <id|''> --token-out <id> --amount <base-units> [--slippage 1]");
  process.exit(1);
}

const result = await buildSwap({ buyerAddress: address, tokenIn, tokenOut, amountIn, slippage });

console.log(`Status: ${result.status}`);
if (result.expected_output) console.log(`Expected Output: ${result.expected_output}`);
if (result.dexes) console.log(`DEXes: ${result.dexes.join(", ")}`);
console.log(`\nUnsigned CBOR: ${result.cbor?.substring(0, 80)}...`);
console.log("\n→ Sign and submit via dexhunter-swap-operator");
