/**
 * On-chain bindings. Addresses are read from env after deploying the `contracts`
 * package to X Layer; ABIs are the minimal surface the frontend touches.
 */

import type { Address } from "viem";

const z = "0x0000000000000000000000000000000000000000" as Address;

export const CONTRACTS = {
  playerNFT: (process.env.NEXT_PUBLIC_PLAYER_NFT_ADDRESS as Address) || z,
  fantasyLeague:
    (process.env.NEXT_PUBLIC_FANTASY_LEAGUE_ADDRESS as Address) || z,
  scoringOracle:
    (process.env.NEXT_PUBLIC_SCORING_ORACLE_ADDRESS as Address) || z,
  payoutVault: (process.env.NEXT_PUBLIC_PAYOUT_VAULT_ADDRESS as Address) || z,
} as const;

export const isDeployed = (addr: Address) => addr !== z;

export const playerNFTAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "payable",
    inputs: [{ name: "rarity", type: "uint8" }],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "function",
    name: "train",
    stateMutability: "payable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "levelOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const fantasyLeagueAbi = [
  {
    type: "function",
    name: "joinLeague",
    stateMutability: "payable",
    inputs: [{ name: "leagueId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "submitLineup",
    stateMutability: "nonpayable",
    inputs: [
      { name: "leagueId", type: "uint256" },
      { name: "tokenIds", type: "uint256[]" },
      { name: "captain", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "scoreOf",
    stateMutability: "view",
    inputs: [
      { name: "leagueId", type: "uint256" },
      { name: "manager", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const payoutVaultAbi = [
  {
    type: "function",
    name: "claim",
    stateMutability: "nonpayable",
    inputs: [{ name: "leagueId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "claimable",
    stateMutability: "view",
    inputs: [{ name: "manager", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/** Mint price tiers (OKB) keyed by rarity index, mirrors PlayerNFT.sol. */
export const MINT_PRICES = [0.05, 0.12, 0.3, 0.7, 1.5];
export const TRAIN_PRICE = 0.02;
