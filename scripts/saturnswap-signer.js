/**
 * SaturnSwap Transaction Signer
 *
 * Provides local signing of unsigned transactions returned by the SaturnSwap API.
 * Supports both CSL (Cardano Serialization Library) and MeshJS.
 *
 * Environment variables:
 *   PAYMENT_SKEY_HEX   — Raw ed25519 private key (hex, 64 chars)
 *   PAYMENT_SKEY_CBOR  — CBOR-wrapped signing key (from cardano-cli)
 */

/**
 * Sign a transaction using CSL (Cardano Serialization Library).
 * @param {string} unsignedHex - CBOR hex of the unsigned transaction
 * @param {string} paymentSkeyHex - Raw ed25519 private key hex (32 bytes / 64 chars)
 * @returns {string} Signed transaction CBOR hex
 */
export async function signWithCSL(unsignedHex, paymentSkeyHex) {
  const CSL = await import("@emurgo/cardano-serialization-lib-nodejs");

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

/**
 * Sign a transaction using MeshJS.
 * @param {string} unsignedHex - CBOR hex of the unsigned transaction
 * @param {string} paymentCborHex - CBOR-wrapped signing key hex (from cardano-cli)
 * @param {number} [networkId=1] - 1 = mainnet, 0 = testnet
 * @returns {Promise<string>} Signed transaction CBOR hex
 */
export async function signWithMesh(unsignedHex, paymentCborHex, networkId = 1) {
  const { MeshWallet } = await import("@meshsdk/core");

  const wallet = new MeshWallet({
    networkId,
    key: { type: "cli", payment: paymentCborHex },
  });
  await wallet.init();
  return wallet.signTx(unsignedHex);
}

/**
 * Auto-detect key format and sign.
 * Uses PAYMENT_SKEY_HEX or PAYMENT_SKEY_CBOR from environment if key not provided.
 * @param {string} unsignedHex - CBOR hex of the unsigned transaction
 * @param {object} [opts] - Options
 * @param {string} [opts.skeyHex] - Raw ed25519 private key hex
 * @param {string} [opts.skeyCbor] - CBOR-wrapped signing key hex
 * @returns {Promise<string>} Signed transaction CBOR hex
 */
export async function signTransaction(unsignedHex, opts = {}) {
  const skeyHex = opts.skeyHex || process.env.PAYMENT_SKEY_HEX;
  const skeyCbor = opts.skeyCbor || process.env.PAYMENT_SKEY_CBOR;

  if (skeyHex) {
    return signWithCSL(unsignedHex, skeyHex);
  }
  if (skeyCbor) {
    return signWithMesh(unsignedHex, skeyCbor);
  }
  throw new Error(
    "No signing key found. Set PAYMENT_SKEY_HEX or PAYMENT_SKEY_CBOR, " +
      "or pass { skeyHex } or { skeyCbor } in options."
  );
}
