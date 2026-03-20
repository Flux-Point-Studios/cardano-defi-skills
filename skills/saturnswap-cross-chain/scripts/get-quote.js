#!/usr/bin/env node
import { getQuote, quickQuote } from "../../../scripts/uex-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const from = getArg("from", null);
const to = getArg("to", null);
const amount = getArg("amount", null);
const slippage = parseFloat(getArg("slippage", "2.5"));

// Full form
const fromChain = getArg("from-chain", null);
const fromToken = getArg("from-token", null);
const toChain = getArg("to-chain", null);
const toToken = getArg("to-token", null);

if (!amount) {
  console.error(
    "Usage:\n" +
      "  get-quote.js --from ADA --to ETH --amount 500\n" +
      "  get-quote.js --from-chain cardano-mainnet --from-token ADA@ADA --to-chain ethereum-mainnet --to-token ETH@ETH --amount 500"
  );
  process.exit(1);
}

let quote;
if (fromChain && fromToken && toChain && toToken) {
  quote = await getQuote({
    fromChainId: fromChain,
    fromTokenId: fromToken,
    toChainId: toChain,
    toTokenId: toToken,
    amountIn: amount,
    slippageTolerance: slippage,
  });
} else if (from && to) {
  quote = await quickQuote(from, to, amount, slippage);
} else {
  console.error("Provide either --from/--to symbols or full --from-chain/--from-token/--to-chain/--to-token");
  process.exit(1);
}

console.log(`=== Cross-Chain Quote ===`);
console.log(`${from || fromToken} → ${to || toToken}`);
console.log(`Amount In:       ${amount}`);
console.log(`Amount Out:      ${quote.amountOutEstimate}`);
console.log(`Rate:            ${quote.rate}`);
if (quote.feeAmount) console.log(`Fee:             ${quote.feeAmount}`);
if (quote.feePercent) console.log(`Fee %:           ${quote.feePercent}%`);
if (quote.minAmountIn) console.log(`Min Amount:      ${quote.minAmountIn}`);
if (quote.maxAmountIn) console.log(`Max Amount:      ${quote.maxAmountIn}`);
if (quote.requiredSlippagePercent) console.log(`Required Slip:   ${quote.requiredSlippagePercent}%`);
if (quote.warnings?.length) {
  console.log(`\nWarnings:`);
  for (const w of quote.warnings) console.log(`  ⚠ ${w}`);
}
