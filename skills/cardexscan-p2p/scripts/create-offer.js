#!/usr/bin/env node
import { createOffer } from "../../../scripts/cardexscan-client.js";
const args = process.argv.slice(2);
function getArg(n, d) { const i = args.indexOf(`--${n}`); return i !== -1 && args[i+1] ? args[i+1] : d; }
const address = getArg("address", null);
const offerAmount = parseInt(getArg("offer-amount", "0"), 10);
const requestAmount = parseInt(getArg("request-amount", "0"), 10);
const offerPolicy = getArg("offer-policy", undefined);
const requestPolicy = getArg("request-policy", undefined);
const allowPartial = args.includes("--partial");
const expirationHours = parseInt(getArg("expires", "0"), 10) || undefined;
if (!address || !offerAmount || !requestAmount) { console.error("Usage: create-offer.js --address <bech32> --offer-amount <units> --request-amount <units> [--offer-policy <id>] [--request-policy <id>] [--partial] [--expires 24]"); process.exit(1); }
const params = { walletAddress: address, offerAmount, requestAmount, allowPartial };
if (offerPolicy) params.offerAsset = { policyId: offerPolicy, assetName: getArg("offer-asset", "") };
if (requestPolicy) params.requestAsset = { policyId: requestPolicy, assetName: getArg("request-asset", "") };
if (expirationHours) params.expirationHours = expirationHours;
const result = await createOffer(params);
console.log("=== P2P Offer Created ===");
console.log(JSON.stringify(result, null, 2));
