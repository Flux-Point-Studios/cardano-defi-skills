# SaturnSwap UEX Cross-Chain API Reference

## Base URL

```
https://saturnswap.io/api/uex/
```

## Endpoints

### GET /metadata

Returns all supported chains and tokens.

**Response:**
```json
{
  "chains": [
    {
      "id": "cardano-mainnet",
      "name": "Cardano",
      "shortName": "Cardano",
      "slug": "cardano",
      "type": "cardano",
      "nativeSymbol": "ADA",
      "tokens": [
        {
          "id": "ADA@ADA",
          "name": "ADA",
          "symbol": "ADA",
          "chainId": "cardano-mainnet",
          "decimals": 6,
          "isNative": true
        }
      ]
    },
    {
      "id": "ethereum-mainnet",
      "name": "Ethereum",
      "type": "evm",
      "nativeSymbol": "ETH",
      "chainIdHex": "0x1",
      "tokens": [
        {
          "id": "ETH@ETH",
          "symbol": "ETH",
          "decimals": 18,
          "isNative": true
        }
      ]
    }
  ]
}
```

**Chain types:** `cardano`, `evm`, `solana`, `other`

**Token ID format:** `SYMBOL@CHAIN_SYMBOL` (e.g. `ADA@ADA`, `ETH@ETH`, `SOL@SOL`)

**Cardano native tokens:** `cardano:<policyId><assetName>` (e.g. `cardano:6f0d19b...42524557`)

### POST /quote

Get a swap quote with rate and fees.

**Request:**
```json
{
  "fromChainId": "cardano-mainnet",
  "fromTokenId": "ADA@ADA",
  "toChainId": "ethereum-mainnet",
  "toTokenId": "ETH@ETH",
  "amountIn": "500",
  "slippageTolerance": 2.5,
  "destinationAddress": "0x..."
}
```

Required: `fromChainId`, `fromTokenId`, `toChainId`, `toTokenId`, `amountIn`
Optional: `slippageTolerance` (default varies), `destinationAddress`

**Response:**
```json
{
  "amountOutEstimate": "0.07529190",
  "rate": "0.000122737309",
  "feeAmount": "0.00015",
  "minAmountIn": "113.91",
  "maxAmountIn": "22729257"
}
```

Optional response fields: `feePercent`, `requiredSlippagePercent`, `routeSlippagePercent`, `warnings[]`

**Error:** `{"message": "Unsupported pair"}` if route not available.

### POST /order

Create a cross-chain swap order. Returns a deposit address.

**Request:**
```json
{
  "fromChainId": "cardano-mainnet",
  "fromTokenId": "ADA@ADA",
  "toChainId": "ethereum-mainnet",
  "toTokenId": "ETH@ETH",
  "amountIn": "500",
  "destinationAddress": "0xYourEthAddress",
  "slippageTolerance": 2.5,
  "sourceAddress": "addr1q..."
}
```

Required: all quote params + `destinationAddress`
Optional: `sourceAddress`, `notificationPreference`

**Response:**
```json
{
  "orderId": "ez0EDhxNHtoA",
  "depositChainId": "cardano-mainnet",
  "depositTokenId": "ADA@ADA",
  "depositAddress": "addr1v93m30c6hm30a5aslgfyf5n8wd48hmy7d4ac5e83h5le43c7kqme9",
  "depositAmount": "500",
  "expectedAmountOut": "0.0610052"
}
```

For Cardano-source swaps that require signing: `requiresSignature: true`, `unsignedTxCbor: "hex..."`

## Supported Chains (119 total)

Major chains include:
- **Cardano** (1036 tokens) — type: `cardano`
- **Ethereum** (145 tokens) — type: `evm`
- **BSC** (113 tokens) — type: `other`
- **Solana** (25 tokens) — type: `solana`
- **Bitcoin** (2 tokens) — type: `other`
- **Polygon, Arbitrum, Base, Optimism** — type: `evm`
- **Avalanche, DOGE, TRX, Lightning** — type: `other`

## Important Notes

- All amounts are in **display units** (human-readable)
- Deposit address is **unique per order** — send the EXACT amount
- Cross-chain swaps take 5-30 minutes depending on chain confirmations
- The quote is an estimate — actual output may vary slightly
- Check `minAmountIn` / `maxAmountIn` before creating an order
