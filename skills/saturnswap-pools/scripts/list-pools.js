#!/usr/bin/env node
import { getPools } from "../../../scripts/saturnswap-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const first = parseInt(getArg("first", "20"), 10);
const orderField = getArg("order", "volume_24h");
const ticker = getArg("ticker", null);

const order = `{ ${orderField}: DESC }`;
const where = ticker
  ? `{ token_project_two: { ticker: { eq: "${ticker}" } } }`
  : undefined;

const data = await getPools({ first, order, where });
const pools = data.pools.edges.map((e) => e.node);

for (const p of pools) {
  const t1 = p.token_project_one?.ticker || "ADA";
  const t2 = p.token_project_two?.ticker || "???";
  console.log(
    `${p.id}  ${t1}/${t2}  ` +
      `vol24h=${p.volume_24h}  vol7d=${p.volume_7d}  tvl=${p.tvl}  ` +
      `price=${p.token_project_two?.price || "N/A"}  ` +
      `bid=${p.token_project_two?.highest_bid_price || "N/A"}  ` +
      `ask=${p.token_project_two?.lowest_ask_price || "N/A"}`
  );
}

if (data.pools.pageInfo?.hasNextPage) {
  console.log(`\n... more results available (cursor: ${data.pools.pageInfo.endCursor})`);
}
