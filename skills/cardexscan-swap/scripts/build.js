#!/usr/bin/env node
import { buildSwap } from "../../../scripts/cardexscan-client.js";
const args = process.argv.slice(2);
function getArg(n, d) { const i = args.indexOf(`--${n}`); return i !== -1 && args[i+1] ? args[i+1] : d; }
const address = getArg("address", null);
const tokenIn = getArg("token-in", "lovelace");
const policy = getArg("token-out-policy", null);
const asset = getArg("token-out-asset", "");
const amount = parseInt(getArg("amount", "0"), 10);
if (!address || !policy || !amount) { console.error("Usage: build.js --address <bech32> --token-in lovelace --token-out-policy <id> --token-out-asset <hex> --amount <base-units>"); process.exit(1); }
const result = await buildSwap({ userAddress: address, tokenInAmount: amount, tokenIn, tokenOut: { policyId: policy, assetName: asset } });
console.log("=== CardexScan Build Swap ===");
console.log(JSON.stringify(result, null, 2));
