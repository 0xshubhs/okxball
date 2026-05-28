/**
 * Chain config lives in the shared workspace package (`@okball/shared`) so the web
 * app and contracts deploy never drift. This file re-exports it for local imports.
 */
export {
  xLayer,
  xLayerTestnet,
  DEFAULT_NETWORK,
  defaultChain,
  chainAddParams,
} from "@okball/shared";
export type { Network } from "@okball/shared";
