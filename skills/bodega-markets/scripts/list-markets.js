#!/usr/bin/env node
import { getMarkets, getTopVolumes, getRecentActivity } from "../../../scripts/bodega-client.js";

const args = process.argv.slice(2);
const sort = args.indexOf("--sort") !== -1 ? args[args.indexOf("--sort") + 1] : null;

if (sort === "volume") {
  const data = await getTopVolumes();
  console.log("=== Top Markets by Volume ===\n");
  const items = Array.isArray(data) ? data : [data];
  for (const m of items) console.log(JSON.stringify(m, null, 2));
} else if (sort === "recent") {
  const data = await getRecentActivity();
  console.log("=== Recent Market Activity ===\n");
  const items = Array.isArray(data) ? data : [data];
  for (const m of items) console.log(JSON.stringify(m, null, 2));
} else {
  const markets = await getMarkets();
  const items = Array.isArray(markets) ? markets : [markets];
  console.log(`=== Prediction Markets (${items.length}) ===\n`);
  for (const m of items) {
    const id = m.id || m.marketId || "?";
    const title = m.title || m.question || m.name || "?";
    console.log(`${id}  "${title}"`);
    if (m.yesPrice || m.noPrice) console.log(`  Yes: ${m.yesPrice}  No: ${m.noPrice}`);
    if (m.volume) console.log(`  Volume: ${m.volume}`);
    if (m.status) console.log(`  Status: ${m.status}`);
    console.log();
  }
}
