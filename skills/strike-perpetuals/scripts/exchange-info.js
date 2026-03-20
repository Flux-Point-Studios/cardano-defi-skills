#!/usr/bin/env node
import { getExchangeInfo } from "../../../scripts/strike-client.js";

const info = await getExchangeInfo();

console.log("=== Strike Finance Exchange Info ===");
console.log(`Server Time: ${info.serverTime}`);
console.log(`Timezone: ${info.timezone}`);

if (info.symbols?.length) {
  console.log(`\nTrading Pairs (${info.symbols.length}):`);
  for (const s of info.symbols) {
    console.log(
      `  ${s.symbol}  status=${s.status}  leverage=${s.maxLeverage || "?"}x  ` +
        `pricePrecision=${s.pricePrecision}  qtyPrecision=${s.quantityPrecision}`
    );
  }
}
