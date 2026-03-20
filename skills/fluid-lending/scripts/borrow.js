#!/usr/bin/env node
import { borrow } from "../../../scripts/fluid-client.js";
const args = process.argv.slice(2);
function getArg(name, def) { const i = args.indexOf(`--${name}`); return i !== -1 && args[i + 1] ? args[i + 1] : def; }
const address = getArg("address", null);
const borrowToken = getArg("borrow-token", "ADA");
const borrowAmount = parseInt(getArg("borrow-amount", "0"), 10);
const collateralPolicyId = getArg("collateral-policy", "");
const collateralAssetName = getArg("collateral-asset", "");
const collateralAmount = parseInt(getArg("collateral-amount", "0"), 10);
if (!address || !borrowAmount || !collateralAmount) {
  console.error("Usage: borrow.js --address <bech32> --borrow-token ADA --borrow-amount <units> --collateral-policy <id> --collateral-asset <hex> --collateral-amount <units>");
  process.exit(1);
}
console.log(`Borrowing ${borrowAmount} ${borrowToken} against ${collateralAmount} collateral...`);
const result = await borrow({ address, borrowAmount, borrowToken, collateralPolicyId, collateralAssetName, collateralAmount });
if (result.success && result.unsignedTxs) {
  console.log(`\n${result.unsignedTxs.length} tx(s) to sign in sequence:`);
  result.unsignedTxs.forEach((tx, i) => console.log(`  tx${i + 1}: ${tx.substring(0, 60)}... (${tx.length} chars)`));
} else {
  console.log(`Error: ${result.error || JSON.stringify(result)}`);
}
