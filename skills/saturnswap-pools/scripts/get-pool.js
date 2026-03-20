#!/usr/bin/env node
import { getPool, getPoolByTokens } from "../../../scripts/saturnswap-client.js";

const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

const id = getArg("id");
const policy = getArg("policy");
const asset = getArg("asset");

let data;
if (id) {
  data = await getPool(id);
  const p = data.pool;
  if (!p) {
    console.error(`Pool ${id} not found`);
    process.exit(1);
  }
  printPool(p);
} else if (policy) {
  data = await getPoolByTokens(policy, asset || "");
  const p = data.poolByTokens;
  if (!p) {
    console.error(`No pool found for policy=${policy} asset=${asset || ""}`);
    process.exit(1);
  }
  printPool(p);
} else {
  console.error("Usage: get-pool.js --id <uuid>  OR  --policy <policyId> [--asset <assetName>]");
  process.exit(1);
}

function printPool(p) {
  const t1 = p.token_project_one?.ticker || "ADA";
  const t2 = p.token_project_two?.ticker || "???";
  console.log(`Pool: ${p.id}`);
  console.log(`Pair: ${t1}/${t2}`);
  console.log(`TVL: ${p.tvl}`);
  console.log(`Volume 24h: ${p.volume_24h}  7d: ${p.volume_7d}  30d: ${p.volume_30d}`);
  console.log(`Price: ${p.token_project_two?.price || "N/A"} ADA`);
  console.log(`Best Bid: ${p.token_project_two?.highest_bid_price || "N/A"} ADA`);
  console.log(`Best Ask: ${p.token_project_two?.lowest_ask_price || "N/A"} ADA`);
  if (p.smart_contract) {
    console.log(`Script: ${p.smart_contract.script_address}`);
  }
}
