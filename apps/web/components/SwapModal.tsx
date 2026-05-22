"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftRight, X } from "lucide-react";

const OkxSwapWidget = dynamic(() => import("./OkxSwapWidget"), { ssr: false });

export default function SwapModal({
  open,
  onClose,
  fromToken,
  toToken,
}: {
  open: boolean;
  onClose: () => void;
  fromToken?: string;
  toToken?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="glass w-full max-w-[420px] overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-neon" />
                <h3 className="font-display font-bold">Swap via OKX DEX</h3>
                <span className="chip !px-2 !py-0.5 !text-[10px] text-white/50">
                  X Layer
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-white/50 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-[560px] bg-pitch-950">
              <OkxSwapWidget
                fromToken={fromToken}
                toToken={toToken}
                className="h-[560px] w-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
