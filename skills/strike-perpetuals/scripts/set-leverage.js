#!/usr/bin/env node
import { setLeverage } from "../../../scripts/strike-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const symbol = getArg("symbol", null);
const leverage = parseInt(getArg("leverage", "0"), 10);

if (!symbol || !leverage) {
  console.error("Usage: set-leverage.js --symbol ADA-USD --leverage 10");
  process.exit(1);
}

if (leverage > 10) {
  console.warn(`WARNING: ${leverage}x leverage carries significant liquidation risk`);
}

console.log(`Setting ${symbol} leverage to ${leverage}x...`);
const result = await setLeverage(symbol, leverage);
console.log("Leverage set:", JSON.stringify(result, null, 2));
