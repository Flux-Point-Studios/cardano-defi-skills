#!/usr/bin/env node
import { getProtocolParams, getPolls } from "../../../scripts/indigo-client.js";

const [params, polls] = await Promise.all([
  getProtocolParams().catch(() => null),
  getPolls().catch(() => null),
]);

if (params) {
  console.log("=== Protocol Parameters ===");
  console.log(JSON.stringify(params, null, 2));
}

if (polls) {
  const items = Array.isArray(polls) ? polls : polls?.polls || [polls];
  console.log(`\n=== Governance Polls (${items.length}) ===`);
  for (const p of items) {
    console.log(`  ${p.id || "?"}  ${p.title || p.question || "?"}  status=${p.status || "?"}`);
  }
}
