#!/usr/bin/env node
import { createDcaOrder } from "../../../scripts/cardexscan-client.js";
const args = process.argv.slice(2);
function getArg(n, d) { const i = args.indexOf(`--${n}`); return i !== -1 && args[i+1] ? args[i+1] : d; }
const address = getArg("address", null);
const policy = getArg("token-out-policy", null);
const asset = getArg("token-out-asset", "");
const perOrder = parseInt(getArg("per-order", "0"), 10);
const numOrders = parseInt(getArg("num-orders", "0"), 10);
const intervalMs = parseInt(getArg("interval", "3600000"), 10);
if (!address || !policy || !perOrder || !numOrders) { console.error("Usage: create-dca.js --address <bech32> --token-out-policy <id> --token-out-asset <hex> --per-order <lovelace> --num-orders <n> [--interval <ms>]"); process.exit(1); }
const result = await createDcaOrder({ walletAddress: address, tokenIn: "lovelace", tokenOut: { policyId: policy, assetName: asset }, perOrderAmount: perOrder, numOrders, intervalMs });
console.log("=== DCA Order Created ===");
console.log(JSON.stringify(result, null, 2));
