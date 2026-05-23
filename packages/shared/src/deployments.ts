import type { Address } from "viem";
import raw from "./deployments.json";
import { DEFAULT_NETWORK } from "./chains";

export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as Address;

export const isDeployed = (addr: Address) =>
  !!addr && addr.toLowerCase() !== ZERO_ADDRESS;

const env = (key: string): string | undefined =>
  typeof process !== "undefined" ? process.env[key] : undefined;

type Addrs = {
  playerNFT: string;
  fantasyLeague: string;
  scoringOracle: string;
  payoutVault: string;
};

/**
 * HARDCODED deployed addresses (live on X Layer). This guarantees the app runs
 * in "Live" mode with zero config / no .env. NEXT_PUBLIC_* env or a fresh
 * deployments.json (written by the deploy script) still take precedence.
 */
const HARDCODED: Record<string, Addrs> = {
  testnet: {
    playerNFT: "0x08a25a794639a6cA03b0A7C655B2c36d82fF144a",
    scoringOracle: "0x9d3ccbE19D1A6e37A9F67868ae7eE8452069d697",
    payoutVault: "0x30E7EC0E595091adA9c8c85A969c6bA9a995e4D6",
    fantasyLeague: "0x3297baE90BbD190de4F275cEAE71568428e794f0",
  },
  mainnet: {
    playerNFT: ZERO_ADDRESS,
    scoringOracle: ZERO_ADDRESS,
    payoutVault: ZERO_ADDRESS,
    fantasyLeague: ZERO_ADDRESS,
  },
};

const file = (raw as Record<string, Partial<Addrs>>)[DEFAULT_NETWORK] ?? {};
const hard = HARDCODED[DEFAULT_NETWORK] ?? HARDCODED.testnet;

/** Treat a zero/empty value as "unset" so we fall through to the hardcoded one. */
const nz = (v?: string) =>
  v && v.toLowerCase() !== ZERO_ADDRESS ? v : undefined;

const pick = (
  envKey: string,
  fileVal: string | undefined,
  hardVal: string
): Address => (env(envKey) || nz(fileVal) || hardVal) as Address;

export const CONTRACTS = {
  playerNFT: pick("NEXT_PUBLIC_PLAYER_NFT_ADDRESS", file.playerNFT, hard.playerNFT),
  fantasyLeague: pick(
    "NEXT_PUBLIC_FANTASY_LEAGUE_ADDRESS",
    file.fantasyLeague,
    hard.fantasyLeague
  ),
  scoringOracle: pick(
    "NEXT_PUBLIC_SCORING_ORACLE_ADDRESS",
    file.scoringOracle,
    hard.scoringOracle
  ),
  payoutVault: pick(
    "NEXT_PUBLIC_PAYOUT_VAULT_ADDRESS",
    file.payoutVault,
    hard.payoutVault
  ),
} as const;
