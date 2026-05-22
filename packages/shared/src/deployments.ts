import type { Address } from "viem";
import raw from "./deployments.json";
import { DEFAULT_NETWORK } from "./chains";

export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as Address;

export const isDeployed = (addr: Address) =>
  !!addr && addr.toLowerCase() !== ZERO_ADDRESS;

const env = (key: string): string | undefined =>
  typeof process !== "undefined" ? process.env[key] : undefined;

type Deployment = {
  chainId: number;
  playerNFT: string;
  fantasyLeague: string;
  scoringOracle: string;
  payoutVault: string;
};

const all = raw as Record<string, Partial<Deployment>>;
const file = all[DEFAULT_NETWORK] ?? {};

/**
 * Resolved contract addresses. Precedence: NEXT_PUBLIC_* env override, then the
 * generated `deployments.json` (written by the deploy script), then zero address.
 */
export const CONTRACTS = {
  playerNFT: (env("NEXT_PUBLIC_PLAYER_NFT_ADDRESS") ||
    file.playerNFT ||
    ZERO_ADDRESS) as Address,
  fantasyLeague: (env("NEXT_PUBLIC_FANTASY_LEAGUE_ADDRESS") ||
    file.fantasyLeague ||
    ZERO_ADDRESS) as Address,
  scoringOracle: (env("NEXT_PUBLIC_SCORING_ORACLE_ADDRESS") ||
    file.scoringOracle ||
    ZERO_ADDRESS) as Address,
  payoutVault: (env("NEXT_PUBLIC_PAYOUT_VAULT_ADDRESS") ||
    file.payoutVault ||
    ZERO_ADDRESS) as Address,
} as const;
