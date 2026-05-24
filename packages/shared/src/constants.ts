/** Mint price tiers (OKB) keyed by rarity index, mirrors PlayerNFT.sol. */
export const MINT_PRICES = [0.05, 0.12, 0.3, 0.7, 1.5];

/** Training cost per session (OKB), mirrors PlayerNFT.sol. */
export const TRAIN_PRICE = 0.02;

export const RARITIES = ["common", "rare", "epic", "legendary", "icon"] as const;
export type Rarity = (typeof RARITIES)[number];

/** Map a UI rarity name to the PlayerNFT.Rarity enum index used by mint(). */
export const rarityIndex = (r: Rarity): number => RARITIES.indexOf(r);

/**
 * The active league the app joins / submits / claims against. Defaults to the
 * opening league (#1) but is overridable with NEXT_PUBLIC_LEAGUE_ID so the
 * operator can point the app at a freshly-opened league (the open-league script
 * writes this) once an earlier one has been locked & settled.
 */
export const OPENING_LEAGUE_ID = (() => {
  const v =
    typeof process !== "undefined"
      ? Number(process.env.NEXT_PUBLIC_LEAGUE_ID)
      : NaN;
  return Number.isInteger(v) && v > 0 ? v : 1;
})();

/** Entry fee for the opening league (OKB) — mirrors deploy.ts createLeague. Kept
 *  low so the testnet faucet (0.2 OKB/day) covers joining the demo league. */
export const LEAGUE_ENTRY_FEE_OKB = 0.02;

/** Current gameweek for the demo league. */
export const GAMEWEEK = 14;
