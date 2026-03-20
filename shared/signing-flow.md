# SaturnSwap Transaction Signing Flow

## Overview

Every write operation (swap, limit order, liquidity) follows a strict 3-step flow:

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  1. CREATE       │────▶│  2. SIGN         │────▶│  3. SUBMIT       │
│  (API builds tx) │     │  (local wallet)  │     │  (API broadcasts)│
└──────────────────┘     └──────────────────┘     └──────────────────┘
     GraphQL mutation         CSL / MeshJS            GraphQL mutation
     Returns unsigned         Signs with skey         Returns txHash
     hex + txId               Returns signed hex      Confirms on-chain
```

## Step 1: Create Transaction

Call the appropriate `Create*Transaction` mutation with your wallet address and parameters.

### Market Swap Example
```graphql
mutation {
  createOrderTransaction(input: {
    paymentAddress: "addr1q..."
    marketSwapComponents: [{
      poolId: "uuid-of-pool"
      tokenAmountSell: 10          # 10 ADA (DISPLAY units!)
      slippagePercent: 3
    }]
  }) {
    successTransactions {
      transactionId
      hexTransaction                # Unsigned CBOR hex
    }
    error { message }
  }
}
```

### Limit Order Example
```graphql
mutation {
  createOrderTransaction(input: {
    paymentAddress: "addr1q..."
    limitOrderComponents: [{
      poolId: "uuid-of-pool"
      policyId: ""                  # Empty = selling ADA
      assetName: ""
      tokenAmountSell: 50           # 50 ADA
      tokenAmountBuy: 1000000       # Want 1M tokens (display units)
    }]
  }) {
    successTransactions {
      transactionId
      hexTransaction
    }
    error { message }
  }
}
```

### Add Liquidity Example
```graphql
mutation {
  createLiquidityTransaction(input: {
    paymentAddress: "addr1q..."
    addLiquidityComponents: [{
      liquidityPoolContractId: "uuid"
      policyId: ""                  # Adding ADA side
      assetName: ""
      tokenAmount: 100              # 100 ADA
      useDefaults: true             # Auto chunk sizing
    }]
  }) {
    successTransactions {
      transactionId
      hexTransaction
    }
    error { message }
  }
}
```

## Step 2: Sign Transaction (Local)

Sign the unsigned hex using your wallet's private key. **Never send your private key to the API.**

### Using CSL (Cardano Serialization Library)
```javascript
import CSL from "@emurgo/cardano-serialization-lib-nodejs";

function signTransaction(unsignedHex, paymentSkeyHex) {
  const txBytes = Buffer.from(unsignedHex, "hex");
  const fixedTx = CSL.FixedTransaction.from_bytes(txBytes);
  const txHash = fixedTx.transaction_hash();
  const privateKey = CSL.PrivateKey.from_normal_bytes(
    Buffer.from(paymentSkeyHex, "hex")
  );
  const witness = CSL.make_vkey_witness(txHash, privateKey);

  const witnessSet = fixedTx.witness_set();
  const vkeys = CSL.Vkeywitnesses.new();
  vkeys.add(witness);
  witnessSet.set_vkeys(vkeys);

  const signedTx = CSL.FixedTransaction.new(
    fixedTx.raw_body(),
    witnessSet.to_bytes(),
    true
  );
  return Buffer.from(signedTx.to_bytes()).toString("hex");
}
```

### Using MeshJS
```javascript
import { MeshWallet } from "@meshsdk/core";

const wallet = new MeshWallet({
  networkId: 1,
  key: { type: "cli", payment: paymentCborHex },
});
await wallet.init();
const signedHex = await wallet.signTx(unsignedHex);
```

## Step 3: Submit Transaction

```graphql
mutation {
  submitOrderTransaction(input: {
    paymentAddress: "addr1q..."
    transactionIds: ["txid-from-step-1"]
    hexTransactions: ["signed-hex-from-step-2"]
  }) {
    successTransactions { transactionId }
    error { message }
  }
}
```

## Cancel Order Flow

Cancelling a limit order follows the same Create → Sign → Submit pattern:

```graphql
mutation {
  createOrderTransaction(input: {
    paymentAddress: "addr1q..."
    cancelOrderComponents: [{
      poolUtxoIds: ["utxo-uuid-1", "utxo-uuid-2"]
    }]
  }) {
    successTransactions {
      transactionId
      hexTransaction
    }
    error { message }
  }
}
```

## Safety Rules

1. **Always preview before signing** — show the user amounts, fees, and destination
2. **One confirmation per transaction** — never batch sign without explicit approval
3. **Verify network** — mainnet assumed; never sign testnet txs on mainnet keys
4. **Display units only** — the API handles base unit conversion internally
5. **Check for errors** — a successful HTTP 200 can still contain `error` in the payload
