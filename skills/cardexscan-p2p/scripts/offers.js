#!/usr/bin/env node
import { getOffers } from "../../../scripts/cardexscan-client.js";
const status = process.argv.indexOf("--status") !== -1 ? process.argv[process.argv.indexOf("--status") + 1] : "open";
const result = await getOffers(status);
console.log(`=== P2P Offers (${status}) ===`);
console.log(JSON.stringify(result, null, 2));
