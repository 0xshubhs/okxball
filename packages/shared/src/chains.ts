import { defineChain } from "viem";

/**
 * X Layer — OKX's EVM L2 (Polygon CDK / zkEVM stack), native gas token OKB.
 * Single source of truth for chain config across the monorepo.
 * Docs: https://web3.okx.com/xlayer/docs
 *
 * NOTE on chain IDs:
 *   - Mainnet  = 196  (0xc4)   — verified live via eth_chainId
 *   - Testnet  = 1952 (0x7a0)  — verified live via eth_chainId
 * The widely-cited "195" is the DEAD original X1 testnet. Do not use it.
 */

export const xLayer = defineChain({
  id: 196,
  name: "X Layer",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.xlayer.tech", "https://xlayerrpc.okx.com"] },
    public: { http: ["https://rpc.xlayer.tech"] },
  },
  blockExplorers: {
    default: { name: "OKLink", url: "https://www.oklink.com/x-layer" },
  },
  testnet: false,
});

export const xLayerTestnet = defineChain({
  id: 1952,
  name: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        "https://testrpc.xlayer.tech/terigon",
        "https://xlayertestrpc.okx.com/terigon",
      ],
    },
    public: { http: ["https://testrpc.xlayer.tech/terigon"] },
  },
  blockExplorers: {
    default: { name: "OKLink", url: "https://www.oklink.com/x-layer-testnet" },
  },
  testnet: true,
});

export type Network = "mainnet" | "testnet";

export const DEFAULT_NETWORK: Network =
  process.env.NEXT_PUBLIC_DEFAULT_NETWORK === "mainnet" ? "mainnet" : "testnet";

export const defaultChain =
  DEFAULT_NETWORK === "mainnet" ? xLayer : xLayerTestnet;

/** Params shaped for `wallet_addEthereumChain` (used by the OKX connect flow). */
export function chainAddParams(chain: typeof xLayer | typeof xLayerTestnet) {
  return {
    chainId: `0x${chain.id.toString(16)}`,
    chainName: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: chain.rpcUrls.default.http,
    blockExplorerUrls: [chain.blockExplorers!.default.url],
  };
}
