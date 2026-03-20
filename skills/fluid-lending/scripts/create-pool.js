#!/usr/bin/env node
import { createPool } from "../../../scripts/fluid-client.js";
const args = process.argv.slice(2);
function getArg(name, def) { const i = args.indexOf(`--${name}`); return i !== -1 && args[i + 1] ? args[i + 1] : def; }
const address = getArg("address", null);
const lendToken = getArg("lend-token", "ADA");
const lendAmount = parseInt(getArg("amount", "0"), 10);
const lendInterestRate = parseFloat(getArg("rate", "4.65"));
const marketsStr = getArg("markets", "FLDT");
const markets = marketsStr.split(",");
const period = parseInt(getArg("period", "168"), 10);
const isPerpetualPool = args.includes("--perpetual");
const interestRateIncCoe = parseInt(getArg("rate-inc", "28"), 10);
const isPermissionedPool = args.includes("--permissioned");
if (!address || !lendAmount) {
  console.error("Usage: create-pool.js --address <bech32> --lend-token ADA --amount <units> --rate 4.65 --markets FLDT,Snek --period 168 [--perpetual] [--permissioned]");
  process.exit(1);
}
console.log(`Creating ${lendToken} lending pool: ${lendAmount} units, ${lendInterestRate}% rate, ${period}h term...`);
const result = await createPool({ address, lendToken, lendAmount, lendInterestRate, markets, period, isPerpetualPool, interestRateIncCoe, isPermissionedPool });
if (result.success && result.unsignedTxs) {
  console.log(`\n${result.unsignedTxs.length} tx(s) to sign in sequence:`);
  result.unsignedTxs.forEach((tx, i) => console.log(`  tx${i + 1}: ${tx.substring(0, 60)}... (${tx.length} chars)`));
} else {
  console.log(`Error: ${result.error || JSON.stringify(result)}`);
}
