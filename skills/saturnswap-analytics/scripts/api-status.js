#!/usr/bin/env node
import { getStatus, getParameters } from "../../../scripts/saturnswap-client.js";

try {
  const statusData = await getStatus();
  const s = statusData.status;
  console.log(`API Online: ${s.is_online}`);
  console.log(`Version:    ${s.version}`);
} catch (err) {
  console.error(`API unreachable: ${err.message}`);
}

try {
  const paramData = await getParameters();
  const p = paramData.parameters;
  console.log(`Min ADA:    ${p.min_ada_amount}`);
} catch (err) {
  console.error(`Parameters unavailable: ${err.message}`);
}
