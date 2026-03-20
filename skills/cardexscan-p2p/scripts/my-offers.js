#!/usr/bin/env node
import { getMyOffers } from "../../../scripts/cardexscan-client.js";
const addr = process.argv.indexOf("--address") !== -1 ? process.argv[process.argv.indexOf("--address") + 1] : null;
if (!addr) { console.error("Usage: my-offers.js --address <bech32>"); process.exit(1); }
const result = await getMyOffers(addr);
console.log("=== My P2P Offers ===");
console.log(JSON.stringify(result, null, 2));
