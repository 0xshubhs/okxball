/** Mint price tiers (OKB) keyed by rarity index, mirrors PlayerNFT.sol. */
export const MINT_PRICES = [0.05, 0.12, 0.3, 0.7, 1.5];

/** Training cost per session (OKB), mirrors PlayerNFT.sol. */
export const TRAIN_PRICE = 0.02;

export const RARITIES = ["common", "rare", "epic", "legendary", "icon"] as const;
export type Rarity = (typeof RARITIES)[number];

/** Map a UI rarity name to the PlayerNFT.Rarity enum index used by mint(). */
export const rarityIndex = (r: Rarity): number => RARITIES.indexOf(r);

/** The opening league created at deploy time (FantasyLeague.nextLeagueId starts at 1). */
export const OPENING_LEAGUE_ID = 1;

/** Entry fee for the opening league (OKB) — mirrors deploy.ts createLeague. Kept
 *  low so the testnet faucet (0.2 OKB/day) covers joining the demo league. */
export const LEAGUE_ENTRY_FEE_OKB = 0.02;

/** Current gameweek for the demo league. */
export const GAMEWEEK = 14;
