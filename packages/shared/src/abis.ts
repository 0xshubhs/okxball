/**
 * Contract ABIs the frontend touches. Kept hand-authored and minimal here;
 * the contracts package can regenerate fuller ABIs from compiled artifacts.
 */

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
    name: "ratingOf",
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
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
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
  {
    type: "function",
    name: "joined",
    stateMutability: "view",
    inputs: [
      { name: "leagueId", type: "uint256" },
      { name: "manager", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    // public-mapping getter — returns struct fields except the dynamic managers[]
    type: "function",
    name: "leagues",
    stateMutability: "view",
    inputs: [{ name: "leagueId", type: "uint256" }],
    outputs: [
      { name: "entryFee", type: "uint256" },
      { name: "gameweek", type: "uint256" },
      { name: "prizePool", type: "uint256" },
      { name: "locked", type: "bool" },
      { name: "settled", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "managersOf",
    stateMutability: "view",
    inputs: [{ name: "leagueId", type: "uint256" }],
    outputs: [{ name: "", type: "address[]" }],
  },
  {
    type: "function",
    name: "getLineup",
    stateMutability: "view",
    inputs: [
      { name: "leagueId", type: "uint256" },
      { name: "manager", type: "address" },
    ],
    outputs: [
      { name: "tokenIds", type: "uint256[]" },
      { name: "captain", type: "uint256" },
      { name: "submitted", type: "bool" },
    ],
  },
] as const;

export const scoringOracleAbi = [
  {
    type: "function",
    name: "pointsOf",
    stateMutability: "view",
    inputs: [
      { name: "gameweek", type: "uint256" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [{ name: "", type: "int256" }],
  },
  {
    type: "function",
    name: "currentGameweek",
    stateMutability: "view",
    inputs: [],
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
