#!/usr/bin/env node
import { getLiquidityPositions } from "../../../scripts/saturnswap-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const address = getArg("address", null);
const first = parseInt(getArg("first", "20"), 10);

if (!address) {
  console.error("Usage: my-liquidity.js --address <bech32-address> [--first N]");
  process.exit(1);
}

const data = await getLiquidityPositions(address, { first });
const positions = data.liquidityPoolContracts.edges.map((e) => e.node);

if (positions.length === 0) {
  console.log("No liquidity positions found.");
  process.exit(0);
}

for (const lp of positions) {
  const pool = lp.pool;
  const t1 = pool?.token_project_one?.ticker || "ADA";
  const t2 = pool?.token_project_two?.ticker || "?";
  const stats = lp.liquidity_pool_contract_stats;

  console.log(`--- ${t1}/${t2} (pool: ${pool?.id}) ---`);
  console.log(`  Contract: ${lp.id}`);
  if (stats) {
    console.log(`  ADA deposited: ${stats.ada_order_token_one_amount}`);
    console.log(`  Token deposited: ${stats.order_token_two_amount}`);
    console.log(`  ADA waiting: ${stats.waiting_token_one_amount}`);
    console.log(`  Token waiting: ${stats.waiting_token_two_amount}`);
    console.log(`  Avg price: ${stats.average_price}`);
    console.log(`  Bid: ${stats.highest_bid}  Ask: ${stats.lowest_ask}`);
  }
  if (lp.liquidity_contract) {
    console.log(`  Script address: ${lp.liquidity_contract.liquidity_contract_address_with_stake}`);
  }
  console.log();
}
