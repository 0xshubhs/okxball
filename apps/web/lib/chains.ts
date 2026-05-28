/**
 * Chain config lives in the shared workspace package (`@okxball/shared`). The
 * web app is locked to X Layer testnet (1952): wallet connect kept failing
 * when OKX Connect was offered both chains, and live contracts only exist on
 * testnet.
 */
import { xLayerTestnet, chainAddParams } from "@okxball/shared";

export { xLayerTestnet, chainAddParams };
export const defaultChain = xLayerTestnet;
