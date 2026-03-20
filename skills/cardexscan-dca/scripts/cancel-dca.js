#!/usr/bin/env node
import { cancelDcaOrder } from "../../../scripts/cardexscan-client.js";
const args = process.argv.slice(2);
function getArg(n) { const i = args.indexOf(`--${n}`); return i !== -1 && args[i+1] ? args[i+1] : null; }
const addr = getArg("address"); const id = getArg("order-id");
if (!addr || !id) { console.error("Usage: cancel-dca.js --address <bech32> --order-id <txHash#outputIndex>"); process.exit(1); }
const result = await cancelDcaOrder(addr, id);
console.log("=== DCA Order Cancelled ===");
console.log(JSON.stringify(result, null, 2));
