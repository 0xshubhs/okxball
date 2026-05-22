"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";

/** Pings the server to learn whether OKX DEX REST keys are configured. */
export function useDexConfigured() {
  const [configured, setConfigured] = useState(false);
  useEffect(() => {
    let on = true;
    fetch("/api/dex/status")
      .then((r) => r.json())
      .then((d) => on && setConfigured(!!d.configured))
      .catch(() => on && setConfigured(false));
    return () => {
      on = false;
    };
  }, []);
  return configured;
}

/**
 * Convert OKB winnings to a stablecoin via the OKX DEX aggregator. Fetches a
 * signed swap tx from our server route, then signs+broadcasts with the wallet.
 */
export function useConvertWinnings() {
  const { address } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = useCallback(
    async (okbAmount: number, toTokenAddress: string) => {
      setError(null);
      if (!address) {
        setError("Connect your wallet first");
        return undefined;
      }
      const amount = parseEther(String(okbAmount)).toString();
      setPending(true);
      try {
        const res = await fetch(
          `/api/dex/swap?amount=${amount}&toTokenAddress=${toTokenAddress}&userWalletAddress=${address}`
        );
        const json = await res.json();
        const tx = json?.data?.[0]?.tx;
        if (!tx) throw new Error(json?.error || json?.msg || "No swap route found");
        return await sendTransactionAsync({
          to: tx.to as `0x${string}`,
          value: BigInt(tx.value ?? "0"),
          data: tx.data as `0x${string}`,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Swap failed");
        return undefined;
      } finally {
        setPending(false);
      }
    },
    [address, sendTransactionAsync]
  );

  return { convert, pending, error };
}
