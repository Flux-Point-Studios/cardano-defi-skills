#!/usr/bin/env node
import { estimateSwap } from "../../../scripts/dexhunter-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const tokenIn = getArg("token-in", "");
const tokenOut = getArg("token-out", null);
const amountIn = getArg("amount", null);
const slippage = parseFloat(getArg("slippage", "1"));

if (!tokenOut || !amountIn) {
  console.error("Usage: estimate-swap.js --token-in <id|''> --token-out <id> --amount <base-units> [--slippage 1]");
  process.exit(1);
}

const est = await estimateSwap({ tokenIn, tokenOut, amountIn, slippage });

console.log("=== DexHunter Swap Estimate ===");
console.log(`Total Output:    ${est.total_output}`);
console.log(`Net Price:       ${est.net_price}`);
console.log(`Average Price:   ${est.average_price}`);
console.log(`Total Fee:       ${est.total_fee}`);

if (est.splits?.length) {
  console.log(`\nRouting (${est.splits.length} split(s)):`);
  for (const s of est.splits) {
    console.log(
      `  ${s.dex}: in=${s.amount_in} out=${s.expected_output} impact=${s.price_impact || "N/A"}`
    );
  }
}
