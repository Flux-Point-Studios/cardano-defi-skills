#!/usr/bin/env node
import { searchTokens } from "../../../scripts/dexhunter-client.js";

const args = process.argv.slice(2);
const query = args.indexOf("--query") !== -1 ? args[args.indexOf("--query") + 1] : args[0];

if (!query) {
  console.error("Usage: search-tokens.js --query <ticker or name>");
  process.exit(1);
}

const tokens = await searchTokens(query);

if (!tokens || tokens.length === 0) {
  console.log(`No tokens found for "${query}"`);
  process.exit(0);
}

for (const t of Array.isArray(tokens) ? tokens : [tokens]) {
  console.log(
    `${t.ticker || t.symbol || "?"}  decimals=${t.decimals || "?"}  ` +
      `id=${t.policyId || ""}${t.assetName || ""}`
  );
}
