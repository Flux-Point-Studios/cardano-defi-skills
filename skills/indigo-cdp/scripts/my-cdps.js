#!/usr/bin/env node
import { getCdps } from "../../../scripts/indigo-client.js";

const args = process.argv.slice(2);
const owner = args.indexOf("--owner") !== -1 ? args[args.indexOf("--owner") + 1] : null;
const asset = args.indexOf("--asset") !== -1 ? args[args.indexOf("--asset") + 1] : undefined;

const data = await getCdps(owner, asset);
const cdps = Array.isArray(data) ? data : data?.loans || data?.cdps || [data];

console.log(`=== CDPs${owner ? ` (owner: ${owner.slice(0, 20)}...)` : ""} ===\n`);
for (const c of cdps) {
  console.log(`  ${c.id || c.txHash || "?"}  asset=${c.asset}  collateral=${c.collateral}  minted=${c.minted}  ratio=${c.ratio}%`);
}
if (cdps.length === 0) console.log("  None found");
