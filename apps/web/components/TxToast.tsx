"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ExternalLink, Loader2, XCircle } from "lucide-react";
import type { TxPhase } from "@/lib/onchain";

type TxLike = {
  status: TxPhase;
  hash?: `0x${string}`;
  explorerUrl?: string;
  error?: { shortMessage?: string; message?: string } | null;
  isConfirmed: boolean;
  reset: () => void;
};

/**
 * Bottom-centre transaction status toast bound to a `useFantasyTx()` result.
 * Auto-dismisses after success/error and fires `onSuccess` once per tx hash.
 */
export default function TxToast({
  tx,
  labels,
  onSuccess,
}: {
  tx: TxLike;
  labels?: { pending?: string; confirming?: string; success?: string };
  onSuccess?: (hash?: `0x${string}`) => void;
}) {
  const firedFor = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (tx.isConfirmed && tx.hash && firedFor.current !== tx.hash) {
      firedFor.current = tx.hash;
      onSuccess?.(tx.hash);
    }
  }, [tx.isConfirmed, tx.hash, onSuccess]);

  useEffect(() => {
    if (tx.status === "success" || tx.status === "error") {
      const t = setTimeout(() => tx.reset(), 6000);
      return () => clearTimeout(t);
    }
  }, [tx.status, tx]);

  const show = tx.status !== "idle";

  const copy: Record<TxPhase, string> = {
    idle: "",
    pending: labels?.pending ?? "Confirm in your wallet…",
    confirming: labels?.confirming ?? "Transaction submitted — confirming…",
    success: labels?.success ?? "Confirmed on X Layer",
    error:
      tx.error?.shortMessage ??
      tx.error?.message?.split("\n")[0] ??
      "Transaction failed",
  };

  const tone =
    tx.status === "success"
      ? "border-neon/40 text-neon"
      : tx.status === "error"
        ? "border-magenta/40 text-magenta"
        : "border-electric/40 text-electric";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-6 left-1/2 z-[70] flex max-w-[92vw] -translate-x-1/2 items-center gap-3 rounded-xl border bg-pitch-900/95 px-5 py-3 text-sm font-semibold shadow-lg backdrop-blur ${tone}`}
        >
          {tx.status === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : tx.status === "error" ? (
            <XCircle className="h-4 w-4 shrink-0" />
          ) : (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          )}
          <span className="truncate">{copy[tx.status]}</span>
          {tx.explorerUrl && tx.status !== "error" && (
            <a
              href={tx.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-white/60 underline-offset-2 hover:text-white"
            >
              OKLink <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
