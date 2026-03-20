/**
 * Strike Finance v2 Perpetuals Client
 *
 * Trade leveraged long/short positions on Cardano tokens via Strike's v2 API.
 * Direct API — https://api.strikefinance.org
 *
 * Environment variables:
 *   STRIKE_API_URL           — Trade API (default: https://api.strikefinance.org)
 *   STRIKE_PRICE_URL         — Market data (default: https://api.strikefinance.org/price)
 *   STRIKE_API_PUBLIC_KEY    — Ed25519 public key (64 hex chars)
 *   STRIKE_API_PRIVATE_KEY   — Ed25519 private key (64 hex chars)
 */

import { webcrypto } from "crypto";

const PRICE_URL = process.env.STRIKE_PRICE_URL || "https://api.strikefinance.org/price";
const TRADE_URL = process.env.STRIKE_API_URL || "https://api.strikefinance.org";
const PUB_KEY = process.env.STRIKE_API_PUBLIC_KEY || "";
const PRIV_KEY = process.env.STRIKE_API_PRIVATE_KEY || "";

// ─── Ed25519 Signing ─────────────────────────────────────────────────────────

async function signRequest(method, path, body) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = webcrypto.randomUUID();
  const bodyHash = body
    ? Buffer.from(
        await webcrypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(body)))
      ).toString("hex")
    : "";
  const message = `${method}:${path}:${timestamp}:${nonce}:${bodyHash}`;

  const keyBytes = Buffer.from(PRIV_KEY.slice(0, 64), "hex");
  const key = await webcrypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "Ed25519" },
    false,
    ["sign"]
  );
  const sig = Buffer.from(
    await webcrypto.subtle.sign("Ed25519", key, new TextEncoder().encode(message))
  ).toString("hex");

  return {
    "X-API-Wallet-Public-Key": PUB_KEY,
    "X-API-Wallet-Signature": sig,
    "X-API-Wallet-Timestamp": timestamp,
    "X-API-Wallet-Nonce": nonce,
  };
}

async function strikeTradeRequest(path, { method = "GET", body } = {}) {
  if (!PUB_KEY || !PRIV_KEY) {
    throw new Error("STRIKE_API_PUBLIC_KEY and STRIKE_API_PRIVATE_KEY required for trading");
  }
  const url = `${TRADE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(await signRequest(method, path, body)),
  };
  const opts = { method, headers };
  if (body && method !== "GET") opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) {
    const msg = typeof data === "object" ? (data.msg || data.error || JSON.stringify(data)) : data;
    throw new Error(`Strike API ${res.status}: ${msg}`);
  }
  return data;
}

// ─── Market Data (public, no auth) ───────────────────────────────────────────

/**
 * Get exchange info — all trading pairs, rules, filters.
 */
export async function getExchangeInfo() {
  const res = await fetch(`${PRICE_URL}/v2/exchangeInfo`);
  return res.json();
}

/**
 * Get order book depth.
 * @param {string} symbol - e.g. "BTC-USD", "ADA-USD"
 * @param {number} [limit=20]
 */
export async function getOrderBook(symbol, limit = 20) {
  const res = await fetch(`${PRICE_URL}/v2/depth?symbol=${encodeURIComponent(symbol)}&limit=${limit}`);
  return res.json();
}

// ─── Positions & Orders (auth required, direct to Strike) ────────────────────

export async function getPositions(symbol) {
  const params = symbol ? `?symbol=${encodeURIComponent(symbol)}` : "";
  return strikeTradeRequest(`/v2/positions${params}`);
}

export async function getClosedPositions(opts = {}) {
  const params = new URLSearchParams();
  if (opts.symbol) params.set("symbol", opts.symbol);
  if (opts.limit) params.set("limit", String(opts.limit));
  const qs = params.toString() ? `?${params}` : "";
  return strikeTradeRequest(`/v2/closedPositions${qs}`);
}

export async function getOpenOrders(symbol) {
  const params = symbol ? `?symbol=${encodeURIComponent(symbol)}` : "";
  return strikeTradeRequest(`/v2/openOrders${params}`);
}

// ─── Trading (auth required, direct to Strike) ──────────────────────────────

export async function createOrder(order) {
  return strikeTradeRequest("/v2/order", { method: "POST", body: order });
}

export async function createStrategyOrder(strategy) {
  return strikeTradeRequest("/v2/order/strategy", { method: "POST", body: strategy });
}

export async function cancelOrder(orderId, symbol) {
  return strikeTradeRequest("/v2/order/cancel", {
    method: "DELETE",
    body: { order_id: orderId, symbol },
  });
}

export async function cancelAllOrders(symbol) {
  return strikeTradeRequest("/v2/order/cancel-all", {
    method: "DELETE",
    body: symbol ? { symbol } : {},
  });
}

export async function setLeverage(symbol, leverage) {
  return strikeTradeRequest("/v2/leverage", {
    method: "POST",
    body: { symbol, leverage },
  });
}

export async function setMarginMode(symbol, marginMode) {
  return strikeTradeRequest("/v2/marginMode", {
    method: "POST",
    body: { symbol, marginMode },
  });
}
