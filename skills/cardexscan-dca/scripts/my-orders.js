#!/usr/bin/env node
import { getMyDcaOrders } from "../../../scripts/cardexscan-client.js";
const addr = process.argv.indexOf("--address") !== -1 ? process.argv[process.argv.indexOf("--address") + 1] : null;
if (!addr) { console.error("Usage: my-orders.js --address <bech32>"); process.exit(1); }
const result = await getMyDcaOrders(addr);
console.log("=== My DCA Orders ===");
console.log(JSON.stringify(result, null, 2));
