#!/usr/bin/env node
import { getMetadata } from "../../../scripts/uex-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const typeFilter = getArg("type", null);

const { chains } = await getMetadata();

const filtered = typeFilter
  ? chains.filter((c) => c.type === typeFilter)
  : chains;

console.log(`=== Supported Chains (${filtered.length}/${chains.length}) ===\n`);

for (const c of filtered) {
  console.log(
    `${c.id}  "${c.name}"  type=${c.type}  native=${c.nativeSymbol}  tokens=${c.tokens?.length || 0}`
  );
}
