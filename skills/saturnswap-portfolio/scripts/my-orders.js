#!/usr/bin/env node
import { getUserOrders } from "../../../scripts/saturnswap-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const address = getArg("address", null);
const poolId = getArg("pool", undefined);
const first = parseInt(getArg("first", "20"), 10);

if (!address) {
  console.error("Usage: my-orders.js --address <bech32-address> [--pool <pool-uuid>] [--first N]");
  process.exit(1);
}

const data = await getUserOrders(address, { first, poolId });
const orders = data.poolUtxos.edges.map((e) => e.node);

if (orders.length === 0) {
  console.log("No open orders found.");
  process.exit(0);
}

for (const o of orders) {
  const pair = o.pool
    ? `${o.pool.token_project_one?.ticker || "ADA"}/${o.pool.token_project_two?.ticker || "?"}`
    : o.pool_id || "unknown";
  console.log(
    `${o.id}  ${pair}  type=${o.active_type}  status=${o.active_status}/${o.spend_status}  ` +
      `price=${o.price}  sell=${o.token_amount_sell}  buy=${o.token_amount_buy}  ` +
      `created=${o.created_at}`
  );
}
