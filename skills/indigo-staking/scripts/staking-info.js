#!/usr/bin/env node
import { getStakingInfo } from "../../../scripts/indigo-client.js";

const data = await getStakingInfo();
console.log("=== INDY Staking Overview ===");
console.log(JSON.stringify(data, null, 2));
