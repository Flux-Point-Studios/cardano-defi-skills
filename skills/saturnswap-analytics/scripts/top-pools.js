#!/usr/bin/env node
import { getPoolStats } from "../../../scripts/saturnswap-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const first = parseInt(getArg("first", "10"), 10);
const orderField = getArg("order", "volume_24h");
const order = `{ ${orderField}: DESC }`;

const data = await getPoolStats({ first, order });
const pools = data.poolStats.edges.map((e) => e.node);

console.log(`=== Top ${pools.length} Pools by ${orderField} ===`);
let rank = 1;
for (const p of pools) {
  const t1 = p.pool?.token_project_one?.ticker || "ADA";
  const t2 = p.pool?.token_project_two?.ticker || "?";
  console.log(
    `${rank++}. ${t1}/${t2}  vol24h=${p.volume_24h}  vol7d=${p.volume_7d}  tvl=${p.tvl}`
  );
}
