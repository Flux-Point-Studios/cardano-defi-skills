#!/usr/bin/env node
import { getTokenProjects } from "../../../scripts/saturnswap-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const ticker = getArg("ticker", null);
const first = parseInt(getArg("first", "20"), 10);
const orderField = getArg("order", "volume_24h");

const order = `{ ${orderField}: DESC }`;
const where = ticker
  ? `{ ticker: { contains: "${ticker.toUpperCase()}" } }`
  : undefined;

const data = await getTokenProjects({ first, order, where });
const tokens = data.tokenProjects.edges.map((e) => e.node);

for (const t of tokens) {
  console.log(
    `${t.ticker}  price=${t.price || "N/A"} ADA  ` +
      `vol24h=${t.volume_24h || 0}  mcap=${t.market_cap || "N/A"}  ` +
      `decimals=${t.decimals}  policy=${t.policy_id}`
  );
}
