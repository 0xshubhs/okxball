import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { injected } from "wagmi/connectors";
import { xLayer, xLayerTestnet } from "./chains";

/**
 * wagmi config for X Layer.
 *
 * OKX Wallet exposes an EIP-1193 provider at `window.okxwallet`. We register a
 * dedicated injected connector that targets it, plus a generic injected
 * fallback so MetaMask / other wallets still work for testing.
 */
export const okxConnector = injected({
  target() {
    const okx =
      typeof window !== "undefined"
        ? (window as unknown as { okxwallet?: unknown }).okxwallet
        : undefined;
    return {
      id: "okxwallet",
      name: "OKX Wallet",
      provider: okx as never,
    };
  },
  shimDisconnect: true,
});

export const wagmiConfig = createConfig({
  chains: [xLayerTestnet, xLayer],
  connectors: [okxConnector, injected({ shimDisconnect: true })],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [xLayer.id]: http(),
    [xLayerTestnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
