import crypto from "crypto";

/**
 * Server-only OKX DEX aggregator client. Signs requests with the project's
 * API credentials (HMAC-SHA256) and proxies to the OKX DEX REST API so secrets
 * never reach the browser. Backs the "instant payout via OKX DEX liquidity" flow.
 *
 * Docs: https://web3.okx.com/build/docs/waas/dex-swap
 * Self-service keys: https://web3.okx.com developer portal.
 */

const BASE = "https://web3.okx.com";

function creds() {
  return {
    apiKey: process.env.OKX_DEX_API_KEY,
    secret: process.env.OKX_DEX_SECRET_KEY,
    passphrase: process.env.OKX_DEX_PASSPHRASE,
    projectId: process.env.OKX_DEX_PROJECT_ID,
  };
}

export function isConfigured(): boolean {
  const { apiKey, secret, passphrase, projectId } = creds();
  return !!(apiKey && secret && passphrase && projectId);
}

/** Native gas-token sentinel used by the DEX API (OKB on X Layer). */
export const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const X_LAYER_CHAIN_ID = "196";

type Query = Record<string, string | number | undefined>;

async function dexGet<T = unknown>(path: string, query: Query): Promise<T> {
  const { apiKey, secret, passphrase, projectId } = creds();
  if (!apiKey || !secret || !passphrase || !projectId) {
    throw new Error("OKX DEX API keys not configured");
  }

  const qs = new URLSearchParams(
    Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();
  const requestPath = `${path}${qs ? `?${qs}` : ""}`;

  const timestamp = new Date().toISOString();
  const prehash = timestamp + "GET" + requestPath;
  const sign = crypto
    .createHmac("sha256", secret)
    .update(prehash)
    .digest("base64");

  const res = await fetch(`${BASE}${requestPath}`, {
    headers: {
      "OK-ACCESS-KEY": apiKey,
      "OK-ACCESS-SIGN": sign,
      "OK-ACCESS-TIMESTAMP": timestamp,
      "OK-ACCESS-PASSPHRASE": passphrase,
      "OK-ACCESS-PROJECT": projectId,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`OKX DEX HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const dexQuote = (q: Query) =>
  dexGet("/api/v5/dex/aggregator/quote", { chainId: X_LAYER_CHAIN_ID, ...q });

export const dexSwap = (q: Query) =>
  dexGet("/api/v5/dex/aggregator/swap", { chainId: X_LAYER_CHAIN_ID, ...q });

export const dexSupportedChains = () =>
  dexGet("/api/v5/dex/aggregator/supported/chain", {});
