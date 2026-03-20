#!/usr/bin/env node
import { getTrendingTokens } from "../../../scripts/cardexscan-client.js";
const args = process.argv.slice(2);
function getArg(n, d) { const i = args.indexOf(`--${n}`); return i !== -1 && args[i+1] ? args[i+1] : d; }
const timeframe = getArg("timeframe", "24h");
const count = parseInt(getArg("count", "20"), 10);
const result = await getTrendingTokens(timeframe, count);
console.log(`=== Trending Tokens (${timeframe}) ===`);
console.log(JSON.stringify(result, null, 2));
