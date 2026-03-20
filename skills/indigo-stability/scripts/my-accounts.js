#!/usr/bin/env node
import { getStabilityAccounts } from "../../../scripts/indigo-client.js";

const owner = process.argv.indexOf("--owner") !== -1 ? process.argv[process.argv.indexOf("--owner") + 1] : null;
if (!owner) { console.error("Usage: my-accounts.js --owner <bech32>"); process.exit(1); }

const data = await getStabilityAccounts(owner);
const accounts = Array.isArray(data) ? data : data?.accounts || [data];

console.log("=== My Stability Pool Accounts ===\n");
for (const a of accounts) {
  console.log(`  ${a.asset || "?"}  deposited=${a.deposited || "?"}  rewards=${a.rewards || "?"}`);
}
if (accounts.length === 0) console.log("  None found");
