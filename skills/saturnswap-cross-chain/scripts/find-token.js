#!/usr/bin/env node
import { findToken } from "../../../scripts/uex-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const symbol = getArg("symbol", null);
const chain = getArg("chain", undefined);

if (!symbol) {
  console.error("Usage: find-token.js --symbol ETH [--chain ethereum-mainnet]");
  process.exit(1);
}

const results = await findToken(symbol, chain);

if (results.length === 0) {
  console.log(`No token found matching "${symbol}"`);
  process.exit(0);
}

console.log(`Found ${results.length} match(es) for "${symbol}":\n`);
for (const { token, chain: c } of results) {
  console.log(`  ${token.id}  on ${c.name} (${c.id})`);
  console.log(`    symbol=${token.symbol}  decimals=${token.decimals}  native=${token.isNative}`);
  if (token.contractAddress) console.log(`    contract=${token.contractAddress}`);
  console.log();
}
