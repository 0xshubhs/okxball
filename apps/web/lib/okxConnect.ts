"use client";

import { createConnector } from "wagmi";
import { getAddress, type Address } from "viem";
import { defaultChain, xLayerTestnet } from "./chains";

/**
 * Custom wagmi connector wrapping the OKX Connect SDK (@okxconnect/ui).
 * There's no official wagmi adapter, so this bridges OKXUniversalConnectUI
 * (init → openModal[eip155] → request with a CAIP chain) into wagmi's connector
 * contract, so all existing useAccount / useReadContract / useWriteContract
 * hooks keep working. The SDK shows OKX's own modal (extension + mobile QR).
 */

type OkxUI = {
  session?: { namespaces?: Record<string, { accounts?: string[]; defaultChain?: string }> };
  openModal: (opts: unknown) => Promise<OkxUI["session"] | undefined>;
  request: <T = unknown>(args: { method: string; params?: unknown }, chain?: string) => Promise<T>;
  disconnect: () => Promise<void>;
  on?: (event: string, listener: (...a: unknown[]) => void) => void;
};

const CAIP = (id: number) => `eip155:${id}`;
const RPC: Record<number, string> = {
  [xLayerTestnet.id]: xLayerTestnet.rpcUrls.default.http[0],
};

let uiPromise: Promise<OkxUI> | null = null;
async function getUI(): Promise<OkxUI> {
  if (!uiPromise) {
    uiPromise = (async () => {
      const mod = await import("@okxconnect/ui");
      const icon =
        typeof window !== "undefined" ? `${window.location.origin}/favicon.ico` : "";
      return (await mod.OKXUniversalConnectUI.init({
        dappMetaData: { name: "OkxBall", icon },
      })) as unknown as OkxUI;
    })();
  }
  return uiPromise;
}

function accountsOf(session: OkxUI["session"]): Address[] {
  const accs = session?.namespaces?.eip155?.accounts ?? [];
  return accs
    .map((a) => {
      const parts = a.split(":");
      try {
        return getAddress(parts[2] ?? "");
      } catch {
        return undefined;
      }
    })
    .filter((a): a is Address => !!a);
}

function chainIdOf(session: OkxUI["session"]): number | undefined {
  const accs = session?.namespaces?.eip155?.accounts ?? [];
  if (accs[0]) return Number(accs[0].split(":")[1]);
  const dc = session?.namespaces?.eip155?.defaultChain;
  return dc ? Number(dc) : undefined;
}

type Provider = {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
  on: (...a: unknown[]) => void;
  removeListener: (...a: unknown[]) => void;
};

export function okxConnect() {
  let current: number = defaultChain.id;

  return createConnector<Provider>((config) => ({
    id: "okxConnect",
    name: "OKX Wallet",
    type: "okxConnect",

    async connect({ chainId } = {}) {
      const ui = await getUI();
      current = chainId ?? defaultChain.id;
      let session = ui.session;
      if (!accountsOf(session).length) {
        session = await ui.openModal({
          namespaces: {
            eip155: {
              chains: [CAIP(xLayerTestnet.id)],
              defaultChain: String(xLayerTestnet.id),
              rpcMap: RPC,
            },
          },
        });
      }
      const accounts = accountsOf(session);
      if (!accounts.length) throw new Error("OKX Connect: connection cancelled");
      current = chainIdOf(session) ?? current;

      ui.on?.("session_delete", () => config.emitter.emit("disconnect"));
      ui.on?.("session_update", async () => {
        const s = (await getUI()).session;
        config.emitter.emit("change", { accounts: accountsOf(s) });
      });

      // cast past wagmi's withCapabilities-generic connect return type
      return { accounts, chainId: current } as never;
    },

    async disconnect() {
      try {
        const ui = await getUI();
        await ui.disconnect();
      } catch {
        /* ignore */
      }
    },

    async getAccounts() {
      const ui = await getUI();
      return accountsOf(ui.session);
    },

    async getChainId() {
      const ui = await getUI();
      return chainIdOf(ui.session) ?? current;
    },

    async getProvider() {
      const ui = await getUI();
      return {
        request: ({ method, params }) =>
          ui.request({ method, params }, CAIP(current)),
        on: () => {},
        removeListener: () => {},
      };
    },

    async isAuthorized() {
      try {
        const ui = await getUI();
        return accountsOf(ui.session).length > 0;
      } catch {
        return false;
      }
    },

    async switchChain({ chainId }) {
      const ui = await getUI();
      await ui.request(
        {
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        },
        CAIP(chainId)
      );
      current = chainId;
      const chain = config.chains.find((c) => c.id === chainId);
      if (!chain) throw new Error("Chain not configured");
      config.emitter.emit("change", { chainId });
      return chain;
    },

    onAccountsChanged(accounts) {
      if (!accounts.length) config.emitter.emit("disconnect");
      else
        config.emitter.emit("change", {
          accounts: accounts.map((a) => getAddress(a)),
        });
    },
    onChainChanged(chainId) {
      current = Number(chainId);
      config.emitter.emit("change", { chainId: current });
    },
    onDisconnect() {
      config.emitter.emit("disconnect");
    },
  }));
}
