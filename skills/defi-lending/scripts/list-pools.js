#!/usr/bin/env node
import { getAllPools } from "../../../scripts/surf-client.js";

const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
}

const sortField = getArg("sort", "supplyApy");

const pools = await getAllPools();

if (!pools || pools.length === 0) {
  console.log("No lending pools available");
  process.exit(0);
}

const sorted = [...pools].sort(
  (a, b) => parseFloat(b[sortField] || 0) - parseFloat(a[sortField] || 0)
);

console.log(`=== Lending Pools (sorted by ${sortField}) ===\n`);
for (const p of sorted) {
  console.log(`${p.poolId}  ${p.lendToken || p.asset || "?"}`);
  console.log(
    `  Supply APY: ${p.supplyApy || p.apyPct || "?"}%  ` +
      `Borrow APR: ${p.borrowAprPct || "?"}%  ` +
      `Max LTV: ${p.maxLtvPct || p.maxLtv || "?"}%`
  );
  console.log(
    `  Liquidity: ${p.liquidity}  Available: ${p.available}` +
      (p.termHours ? `  Term: ${p.termHours}h` : "  Term: flexible")
  );
  console.log();
}
