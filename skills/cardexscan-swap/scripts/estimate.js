#!/usr/bin/env node
import { estimateSwap } from "../../../scripts/cardexscan-client.js";
const args = process.argv.slice(2);
function getArg(n, d) { const i = args.indexOf(`--${n}`); return i !== -1 && args[i+1] ? args[i+1] : d; }
const tokenIn = getArg("token-in", "lovelace");
const policy = getArg("token-out-policy", null);
const asset = getArg("token-out-asset", "");
const amount = parseInt(getArg("amount", "0"), 10);
if (!policy || !amount) { console.error("Usage: estimate.js --token-in lovelace --token-out-policy <id> --token-out-asset <hex> --amount <base-units>"); process.exit(1); }
const tokenOut = { policyId: policy, assetName: asset };
const result = await estimateSwap({ tokenInAmount: amount, tokenIn, tokenOut });
console.log("=== CardexScan Swap Estimate ===");
console.log(JSON.stringify(result, null, 2));
