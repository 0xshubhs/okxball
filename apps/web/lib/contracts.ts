/**
 * On-chain bindings re-exported from the shared workspace package (`@okxball/shared`).
 * Addresses resolve from NEXT_PUBLIC_* env, then the deploy-generated
 * deployments.json, then the zero address.
 */
export {
  CONTRACTS,
  isDeployed,
  ZERO_ADDRESS,
  playerNFTAbi,
  fantasyLeagueAbi,
  scoringOracleAbi,
  payoutVaultAbi,
  MINT_PRICES,
  TRAIN_PRICE,
  RARITIES,
  rarityIndex,
  OPENING_LEAGUE_ID,
  LEAGUE_ENTRY_FEE_OKB,
  GAMEWEEK,
} from "@okxball/shared";
export type { Rarity } from "@okxball/shared";
