#!/usr/bin/env node
import { fillOffer } from "../../../scripts/cardexscan-client.js";
const args = process.argv.slice(2);
function getArg(n) { const i = args.indexOf(`--${n}`); return i !== -1 && args[i+1] ? args[i+1] : null; }
const addr = getArg("address"); const id = getArg("offer-id");
if (!addr || !id) { console.error("Usage: fill-offer.js --address <bech32> --offer-id <id>"); process.exit(1); }
const result = await fillOffer(addr, id);
console.log("=== Offer Filled ===");
console.log(JSON.stringify(result, null, 2));
