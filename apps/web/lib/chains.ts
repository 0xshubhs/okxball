/**
 * Chain config lives in the shared workspace package (`@okxball/shared`) so the web
 * app and contracts deploy never drift. This file re-exports it for local imports.
 */
export {
  xLayer,
  xLayerTestnet,
  DEFAULT_NETWORK,
  defaultChain,
  chainAddParams,
} from "@okxball/shared";
export type { Network } from "@okxball/shared";
