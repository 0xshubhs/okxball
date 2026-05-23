"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Copy, LogOut, Wallet, Zap } from "lucide-react";
import { defaultChain, xLayer, xLayerTestnet } from "@/lib/chains";

const SUPPORTED = [xLayer.id, xLayerTestnet.id] as const;

function short(addr?: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectAsync, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onWrongChain = isConnected && !SUPPORTED.includes(chainId as never);

  async function handleConnect() {
    const w =
      typeof window !== "undefined"
        ? (window as unknown as { okxwallet?: unknown; ethereum?: unknown })
        : undefined;
    const hasOkxNs = !!w?.okxwallet;

    const okxConnectC = connectors.find((c) => c.id === "okxConnect");
    // Injected fallback: window.okxwallet → EIP-6963 OKX → generic injected.
    const fallback =
      (hasOkxNs ? connectors.find((c) => c.id === "okxwallet") : undefined) ||
      connectors.find((c) => c.id !== "okxwallet" && /okx/i.test(c.name)) ||
      connectors.find((c) => c.id === "injected") ||
      connectors.find((c) => c.type === "injected") ||
      connectors[0];

    // Try the OKX Connect SDK modal first (extension + mobile QR); if it
    // fails/cancels, fall back to the injected extension so you're never stuck.
    if (okxConnectC) {
      try {
        await connectAsync({ connector: okxConnectC, chainId: defaultChain.id });
        return;
      } catch {
        /* fall through to injected */
      }
    }
    if (fallback) connect({ connector: fallback, chainId: defaultChain.id });
    else window.open("https://www.okx.com/web3", "_blank");
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button onClick={handleConnect} disabled={isPending} className="btn-neon">
          <Wallet className="h-4 w-4" />
          {isPending ? "Connecting…" : "Connect OKX Wallet"}
        </button>
        {error && (
          <span className="text-[11px] text-magenta/90">
            {error.message.slice(0, 60)}
          </span>
        )}
      </div>
    );
  }

  if (onWrongChain) {
    return (
      <button
        onClick={() => switchChain({ chainId: defaultChain.id })}
        className="btn-neon !bg-gold"
      >
        <Zap className="h-4 w-4" />
        Switch to {defaultChain.name}
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-neon/30 bg-neon/10 px-3 py-2 text-sm font-semibold text-neon transition hover:bg-neon/15"
      >
        <span className="h-2 w-2 animate-pulseGlow rounded-full bg-neon" />
        {short(address)}
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="glass absolute right-0 z-50 mt-2 w-64 p-4"
          >
            <div className="label-mono mb-1">Connected wallet</div>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-sm">{short(address)}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(address ?? "");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                }}
                className="text-white/50 hover:text-neon"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            {copied && (
              <div className="mb-2 text-[11px] text-neon">Copied to clipboard</div>
            )}

            <div className="glass mb-3 flex items-center justify-between rounded-xl px-3 py-2">
              <span className="text-xs text-white/60">Balance</span>
              <span className="font-mono text-sm font-semibold">
                {balance ? Number(balance.formatted).toFixed(4) : "0.0000"}{" "}
                {balance?.symbol ?? "OKB"}
              </span>
            </div>

            <div className="mb-3 flex items-center gap-2 text-xs text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-electric" />
              {chainId === xLayer.id
                ? "X Layer"
                : chainId === xLayerTestnet.id
                  ? "X Layer Testnet"
                  : `Chain ${chainId}`}
            </div>

            <button
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2 text-sm text-white/80 hover:border-magenta/40 hover:text-magenta"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
