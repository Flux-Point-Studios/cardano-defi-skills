#!/usr/bin/env node
import { createOrder, findToken } from "../../../scripts/uex-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const from = getArg("from", null);
const to = getArg("to", null);
const amount = getArg("amount", null);
const destination = getArg("destination", null);
const source = getArg("source", undefined);
const slippage = parseFloat(getArg("slippage", "2.5"));

// Full form
const fromChain = getArg("from-chain", null);
const fromToken = getArg("from-token", null);
const toChain = getArg("to-chain", null);
const toToken = getArg("to-token", null);

if (!amount || !destination) {
  console.error(
    "Usage:\n" +
      "  create-order.js --from ADA --to ETH --amount 500 --destination 0xYourAddress\n" +
      "  create-order.js --from-chain cardano-mainnet --from-token ADA@ADA --to-chain ethereum-mainnet --to-token ETH@ETH --amount 500 --destination 0xAddr"
  );
  process.exit(1);
}

let orderParams;
if (fromChain && fromToken && toChain && toToken) {
  orderParams = {
    fromChainId: fromChain,
    fromTokenId: fromToken,
    toChainId: toChain,
    toTokenId: toToken,
    amountIn: amount,
    destinationAddress: destination,
    slippageTolerance: slippage,
  };
} else if (from && to) {
  const fromMatches = await findToken(from);
  const toMatches = await findToken(to);
  if (!fromMatches.length) { console.error(`Token "${from}" not found`); process.exit(1); }
  if (!toMatches.length) { console.error(`Token "${to}" not found`); process.exit(1); }
  const f = fromMatches.find((m) => m.token.isNative) || fromMatches[0];
  const t = toMatches.find((m) => m.token.isNative) || toMatches[0];
  orderParams = {
    fromChainId: f.chain.id,
    fromTokenId: f.token.id,
    toChainId: t.chain.id,
    toTokenId: t.token.id,
    amountIn: amount,
    destinationAddress: destination,
    slippageTolerance: slippage,
  };
} else {
  console.error("Provide --from/--to symbols or full chain/token params");
  process.exit(1);
}

if (source) orderParams.sourceAddress = source;

const order = await createOrder(orderParams);

console.log(`=== Cross-Chain Order Created ===`);
console.log(`Order ID:        ${order.orderId}`);
console.log(`Deposit Chain:   ${order.depositChainId}`);
console.log(`Deposit Token:   ${order.depositTokenId}`);
console.log(`Deposit Address: ${order.depositAddress}`);
console.log(`Deposit Amount:  ${order.depositAmount}`);
console.log(`Expected Out:    ${order.expectedAmountOut}`);
console.log(`Destination:     ${destination}`);

if (order.requiresSignature) {
  console.log(`\nRequires Cardano TX signing!`);
  console.log(`Unsigned CBOR: ${order.unsignedTxCbor?.substring(0, 80)}...`);
  console.log(`→ Sign with saturnswap-market-swap-operator and submit`);
} else {
  console.log(`\n→ Send EXACTLY ${order.depositAmount} to ${order.depositAddress}`);
  console.log(`→ Tokens will arrive at ${destination} after confirmations`);
}
