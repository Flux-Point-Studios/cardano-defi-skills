#!/usr/bin/env node
import { getAssets, getAdaPrice, getIndyPrice } from "../../../scripts/indigo-client.js";

const [assets, adaPrice, indyPrice] = await Promise.all([
  getAssets(),
  getAdaPrice().catch(() => null),
  getIndyPrice().catch(() => null),
]);

console.log("=== Indigo Prices ===\n");
if (adaPrice) console.log(`ADA: $${adaPrice.price || JSON.stringify(adaPrice)}`);
if (indyPrice) console.log(`INDY: ${JSON.stringify(indyPrice)}`);

const items = Array.isArray(assets) ? assets : assets?.assets || [assets];
console.log("\niAssets:");
for (const a of items) {
  console.log(`  ${a.asset || a.name || "?"}  price=$${a.price || "?"}  minted=${a.totalMinted || "?"}  minRatio=${a.minCollateralRatio || "?"}%`);
}
