"use client";

import { useEffect, useRef } from "react";
import {
  createOkxSwapWidget,
  type OkxSwapWidgetHandler,
} from "@okxweb3/dex-widget";
import { defaultChain } from "@/lib/chains";

/**
 * Embedded OKX DEX swap widget. Follows the app's active chain (locked to X
 * Layer testnet). Reuses the connected OKX Wallet / injected provider so swaps
 * sign in-app. No API key needed — this is the iframe widget, not REST.
 */
export default function OkxSwapWidget({
  fromToken,
  toToken,
  className,
}: {
  fromToken?: string;
  toToken?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handlerRef = useRef<OkxSwapWidgetHandler | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const w = window as unknown as { okxwallet?: unknown; ethereum?: unknown };
    const provider = (w.okxwallet ?? w.ethereum) as never;

    const chainId = String(defaultChain.id);
    const params: Record<string, unknown> = {
      chainIds: [chainId],
      theme: "dark",
      providerType: "EVM",
      tradeType: "swap",
      lang: "en",
      feeConfig: {},
    };
    if (fromToken || toToken) {
      params.tokenPair = {
        fromChain: chainId,
        toChain: chainId,
        fromToken,
        toToken,
      };
    }

    handlerRef.current = createOkxSwapWidget(containerRef.current, {
      params,
      provider,
    });

    return () => {
      handlerRef.current?.destroy();
      handlerRef.current = null;
    };
  }, [fromToken, toToken]);

  return <div ref={containerRef} className={className} />;
}
