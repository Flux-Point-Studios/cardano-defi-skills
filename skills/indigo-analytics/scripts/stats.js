#!/usr/bin/env node
import { getTvl, getProtocolStats } from "../../../scripts/indigo-client.js";

const [tvl, stats] = await Promise.all([getTvl(), getProtocolStats().catch(() => null)]);

console.log("=== Indigo Protocol Stats ===");
console.log("\nTVL:", JSON.stringify(tvl, null, 2));
if (stats) console.log("\nProtocol:", JSON.stringify(stats, null, 2));
