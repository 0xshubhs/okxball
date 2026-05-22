/**
 * Mock domain data for the Agentic Fantasy Football OS demo — World Cup edition.
 * Players are national-team stars (the `club` field carries the national side).
 *
 * In production these come from:
 *   - Player NFTs  -> PlayerNFT (ERC-721) on X Layer
 *   - Live stats   -> ScoringOracle fed by a sports-data oracle
 *   - Fixtures      -> off-chain schedule mirrored on-chain at lock time
 *
 * For the hackathon demo everything is local so the full flow is navigable
 * without a funded wallet.
 */

export type Position = "GK" | "DEF" | "MID" | "FWD";
export type Rarity = "common" | "rare" | "epic" | "legendary" | "icon";

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  defending: number;
  physical: number;
}

export interface Player {
  id: string;
  tokenId: number;
  name: string;
  club: string; // national team (World Cup edition)
  country: string;
  flag: string;
  position: Position;
  rating: number; // overall, drives projected points
  stats: PlayerStats;
  rarity: Rarity;
  level: number;
  xp: number; // 0..xpToNext
  xpToNext: number;
  form: number; // 1..10, recent performance
  price: number; // OKB
  fixtureOpponent: string;
  fixtureDifficulty: 1 | 2 | 3 | 4 | 5; // 1 easy, 5 hard
  owned: boolean;
  accent: string; // gradient hue
}

export const RARITY_META: Record<
  Rarity,
  { label: string; ring: string; chip: string; glow: string; mult: number }
> = {
  common: {
    label: "Common",
    ring: "ring-white/20",
    chip: "bg-white/10 text-white/70",
    glow: "rgba(255,255,255,0.15)",
    mult: 1.0,
  },
  rare: {
    label: "Rare",
    ring: "ring-electric/50",
    chip: "bg-electric/15 text-electric",
    glow: "rgba(45,212,255,0.35)",
    mult: 1.1,
  },
  epic: {
    label: "Epic",
    ring: "ring-magenta/50",
    chip: "bg-magenta/15 text-magenta",
    glow: "rgba(255,77,141,0.4)",
    mult: 1.25,
  },
  legendary: {
    label: "Legendary",
    ring: "ring-gold/60",
    chip: "bg-gold/15 text-gold",
    glow: "rgba(255,211,92,0.45)",
    mult: 1.45,
  },
  icon: {
    label: "Icon",
    ring: "ring-neon/60",
    chip: "bg-neon/15 text-neon",
    glow: "rgba(62,240,139,0.5)",
    mult: 1.7,
  },
};

export const POSITION_META: Record<Position, { label: string; color: string }> = {
  GK: { label: "Goalkeeper", color: "#ffd35c" },
  DEF: { label: "Defender", color: "#2dd4ff" },
  MID: { label: "Midfielder", color: "#3ef08b" },
  FWD: { label: "Forward", color: "#ff4d8d" },
};

/** Formations: position slots laid out on a vertical pitch (x%, y% from top). */
export interface Slot {
  id: string;
  position: Position;
  x: number;
  y: number;
}

export const FORMATIONS: Record<string, Slot[]> = {
  "4-3-3": [
    { id: "gk", position: "GK", x: 50, y: 90 },
    { id: "lb", position: "DEF", x: 16, y: 70 },
    { id: "lcb", position: "DEF", x: 38, y: 74 },
    { id: "rcb", position: "DEF", x: 62, y: 74 },
    { id: "rb", position: "DEF", x: 84, y: 70 },
    { id: "lcm", position: "MID", x: 30, y: 50 },
    { id: "cm", position: "MID", x: 50, y: 46 },
    { id: "rcm", position: "MID", x: 70, y: 50 },
    { id: "lw", position: "FWD", x: 20, y: 24 },
    { id: "st", position: "FWD", x: 50, y: 18 },
    { id: "rw", position: "FWD", x: 80, y: 24 },
  ],
  "4-4-2": [
    { id: "gk", position: "GK", x: 50, y: 90 },
    { id: "lb", position: "DEF", x: 16, y: 70 },
    { id: "lcb", position: "DEF", x: 38, y: 74 },
    { id: "rcb", position: "DEF", x: 62, y: 74 },
    { id: "rb", position: "DEF", x: 84, y: 70 },
    { id: "lm", position: "MID", x: 18, y: 48 },
    { id: "lcm", position: "MID", x: 40, y: 52 },
    { id: "rcm", position: "MID", x: 60, y: 52 },
    { id: "rm", position: "MID", x: 82, y: 48 },
    { id: "lst", position: "FWD", x: 38, y: 22 },
    { id: "rst", position: "FWD", x: 62, y: 22 },
  ],
  "3-5-2": [
    { id: "gk", position: "GK", x: 50, y: 90 },
    { id: "lcb", position: "DEF", x: 30, y: 74 },
    { id: "cb", position: "DEF", x: 50, y: 76 },
    { id: "rcb", position: "DEF", x: 70, y: 74 },
    { id: "lwb", position: "MID", x: 12, y: 52 },
    { id: "lcm", position: "MID", x: 36, y: 54 },
    { id: "cm", position: "MID", x: 50, y: 48 },
    { id: "rcm", position: "MID", x: 64, y: 54 },
    { id: "rwb", position: "MID", x: 88, y: 52 },
    { id: "lst", position: "FWD", x: 40, y: 22 },
    { id: "rst", position: "FWD", x: 60, y: 22 },
  ],
};

export type FormationName = keyof typeof FORMATIONS;

function mkStats(p: Partial<PlayerStats>): PlayerStats {
  return { pace: 70, shooting: 70, passing: 70, defending: 70, physical: 70, ...p };
}

export const PLAYERS: Player[] = [
  // Forwards
  {
    id: "p1", tokenId: 1, name: "Kaze Mbala", club: "France", country: "France", flag: "🇫🇷",
    position: "FWD", rating: 94, rarity: "icon", level: 7, xp: 320, xpToNext: 500, form: 9,
    price: 4.2, fixtureOpponent: "BRA", fixtureDifficulty: 2, owned: true, accent: "#ff4d8d",
    stats: mkStats({ pace: 96, shooting: 93, passing: 82, defending: 38, physical: 78 }),
  },
  {
    id: "p2", tokenId: 2, name: "Leo Sterling", club: "England", country: "England", flag: "🏴",
    position: "FWD", rating: 90, rarity: "legendary", level: 5, xp: 180, xpToNext: 400, form: 8,
    price: 3.4, fixtureOpponent: "USA", fixtureDifficulty: 2, owned: true, accent: "#ffd35c",
    stats: mkStats({ pace: 90, shooting: 89, passing: 84, defending: 40, physical: 75 }),
  },
  {
    id: "p3", tokenId: 3, name: "Diego Sol", club: "Spain", country: "Spain", flag: "🇪🇸",
    position: "FWD", rating: 88, rarity: "epic", level: 4, xp: 90, xpToNext: 350, form: 7,
    price: 2.8, fixtureOpponent: "GER", fixtureDifficulty: 3, owned: false, accent: "#ff4d8d",
    stats: mkStats({ pace: 88, shooting: 87, passing: 80, defending: 35, physical: 80 }),
  },
  {
    id: "p4", tokenId: 4, name: "Tariq Bello", club: "Nigeria", country: "Nigeria", flag: "🇳🇬",
    position: "FWD", rating: 85, rarity: "rare", level: 3, xp: 220, xpToNext: 300, form: 8,
    price: 2.1, fixtureOpponent: "ARG", fixtureDifficulty: 4, owned: false, accent: "#2dd4ff",
    stats: mkStats({ pace: 91, shooting: 83, passing: 76, defending: 42, physical: 84 }),
  },
  {
    id: "p5", tokenId: 5, name: "Noah Frost", club: "Germany", country: "Germany", flag: "🇩🇪",
    position: "FWD", rating: 83, rarity: "common", level: 2, xp: 60, xpToNext: 250, form: 6,
    price: 1.4, fixtureOpponent: "ESP", fixtureDifficulty: 3, owned: false, accent: "#ffffff",
    stats: mkStats({ pace: 85, shooting: 82, passing: 74, defending: 38, physical: 79 }),
  },
  // Midfielders
  {
    id: "p6", tokenId: 6, name: "Marco Vento", club: "Italy", country: "Italy", flag: "🇮🇹",
    position: "MID", rating: 91, rarity: "legendary", level: 6, xp: 410, xpToNext: 450, form: 9,
    price: 3.6, fixtureOpponent: "URU", fixtureDifficulty: 3, owned: true, accent: "#ffd35c",
    stats: mkStats({ pace: 78, shooting: 84, passing: 93, defending: 72, physical: 80 }),
  },
  {
    id: "p7", tokenId: 7, name: "Ayo Carter", club: "England", country: "England", flag: "🏴",
    position: "MID", rating: 89, rarity: "epic", level: 5, xp: 300, xpToNext: 400, form: 8,
    price: 3.0, fixtureOpponent: "USA", fixtureDifficulty: 2, owned: true, accent: "#ff4d8d",
    stats: mkStats({ pace: 82, shooting: 80, passing: 90, defending: 78, physical: 82 }),
  },
  {
    id: "p8", tokenId: 8, name: "Hiro Tanaka", club: "Japan", country: "Japan", flag: "🇯🇵",
    position: "MID", rating: 87, rarity: "epic", level: 4, xp: 140, xpToNext: 350, form: 7,
    price: 2.6, fixtureOpponent: "CRO", fixtureDifficulty: 3, owned: false, accent: "#ff4d8d",
    stats: mkStats({ pace: 80, shooting: 78, passing: 89, defending: 74, physical: 76 }),
  },
  {
    id: "p9", tokenId: 9, name: "Sam Okoro", club: "Nigeria", country: "Nigeria", flag: "🇳🇬",
    position: "MID", rating: 84, rarity: "rare", level: 3, xp: 110, xpToNext: 300, form: 7,
    price: 1.9, fixtureOpponent: "ARG", fixtureDifficulty: 4, owned: true, accent: "#2dd4ff",
    stats: mkStats({ pace: 83, shooting: 76, passing: 85, defending: 70, physical: 81 }),
  },
  {
    id: "p10", tokenId: 10, name: "Luca Ferri", club: "Italy", country: "Italy", flag: "🇮🇹",
    position: "MID", rating: 82, rarity: "common", level: 2, xp: 40, xpToNext: 250, form: 6,
    price: 1.3, fixtureOpponent: "URU", fixtureDifficulty: 3, owned: false, accent: "#ffffff",
    stats: mkStats({ pace: 76, shooting: 74, passing: 84, defending: 73, physical: 78 }),
  },
  // Defenders
  {
    id: "p11", tokenId: 11, name: "Theo Vance", club: "France", country: "France", flag: "🇫🇷",
    position: "DEF", rating: 90, rarity: "legendary", level: 5, xp: 250, xpToNext: 400, form: 8,
    price: 2.9, fixtureOpponent: "BRA", fixtureDifficulty: 2, owned: true, accent: "#ffd35c",
    stats: mkStats({ pace: 84, shooting: 55, passing: 80, defending: 91, physical: 88 }),
  },
  {
    id: "p12", tokenId: 12, name: "Kwame Mensah", club: "Ghana", country: "Ghana", flag: "🇬🇭",
    position: "DEF", rating: 87, rarity: "epic", level: 4, xp: 160, xpToNext: 350, form: 8,
    price: 2.4, fixtureOpponent: "POR", fixtureDifficulty: 4, owned: true, accent: "#ff4d8d",
    stats: mkStats({ pace: 86, shooting: 48, passing: 78, defending: 88, physical: 86 }),
  },
  {
    id: "p13", tokenId: 13, name: "Erik Holm", club: "Sweden", country: "Sweden", flag: "🇸🇪",
    position: "DEF", rating: 85, rarity: "rare", level: 3, xp: 130, xpToNext: 300, form: 7,
    price: 2.0, fixtureOpponent: "MEX", fixtureDifficulty: 3, owned: true, accent: "#2dd4ff",
    stats: mkStats({ pace: 79, shooting: 45, passing: 82, defending: 86, physical: 84 }),
  },
  {
    id: "p14", tokenId: 14, name: "Pablo Cruz", club: "Spain", country: "Spain", flag: "🇪🇸",
    position: "DEF", rating: 84, rarity: "rare", level: 3, xp: 90, xpToNext: 300, form: 6,
    price: 1.8, fixtureOpponent: "GER", fixtureDifficulty: 3, owned: false, accent: "#2dd4ff",
    stats: mkStats({ pace: 80, shooting: 50, passing: 84, defending: 84, physical: 80 }),
  },
  {
    id: "p15", tokenId: 15, name: "Jonas Reed", club: "England", country: "England", flag: "🏴",
    position: "DEF", rating: 81, rarity: "common", level: 2, xp: 30, xpToNext: 250, form: 6,
    price: 1.2, fixtureOpponent: "USA", fixtureDifficulty: 2, owned: false, accent: "#ffffff",
    stats: mkStats({ pace: 77, shooting: 42, passing: 75, defending: 83, physical: 85 }),
  },
  {
    id: "p16", tokenId: 16, name: "Andrei Pop", club: "Romania", country: "Romania", flag: "🇷🇴",
    position: "DEF", rating: 83, rarity: "rare", level: 3, xp: 75, xpToNext: 300, form: 7,
    price: 1.7, fixtureOpponent: "SUI", fixtureDifficulty: 3, owned: false, accent: "#2dd4ff",
    stats: mkStats({ pace: 78, shooting: 44, passing: 79, defending: 85, physical: 83 }),
  },
  // Goalkeepers
  {
    id: "p17", tokenId: 17, name: "Viktor Stahl", club: "Germany", country: "Germany", flag: "🇩🇪",
    position: "GK", rating: 90, rarity: "legendary", level: 5, xp: 280, xpToNext: 400, form: 9,
    price: 2.7, fixtureOpponent: "ESP", fixtureDifficulty: 3, owned: true, accent: "#ffd35c",
    stats: mkStats({ pace: 58, shooting: 30, passing: 76, defending: 92, physical: 86 }),
  },
  {
    id: "p18", tokenId: 18, name: "Rui Costa", club: "Portugal", country: "Portugal", flag: "🇵🇹",
    position: "GK", rating: 85, rarity: "epic", level: 4, xp: 120, xpToNext: 350, form: 7,
    price: 1.9, fixtureOpponent: "GHA", fixtureDifficulty: 3, owned: false, accent: "#ff4d8d",
    stats: mkStats({ pace: 55, shooting: 28, passing: 72, defending: 87, physical: 82 }),
  },
  {
    id: "p19", tokenId: 19, name: "Iker Mendez", club: "Spain", country: "Spain", flag: "🇪🇸",
    position: "GK", rating: 82, rarity: "common", level: 2, xp: 50, xpToNext: 250, form: 6,
    price: 1.1, fixtureOpponent: "GER", fixtureDifficulty: 4, owned: false, accent: "#ffffff",
    stats: mkStats({ pace: 52, shooting: 25, passing: 70, defending: 84, physical: 80 }),
  },
];

export function playerById(id: string) {
  return PLAYERS.find((p) => p.id === id);
}

export function ownedPlayers() {
  return PLAYERS.filter((p) => p.owned);
}

/** Difficulty label + color for fixture chips. */
export function difficulty(d: number) {
  const map: Record<number, { label: string; color: string }> = {
    1: { label: "Very easy", color: "#3ef08b" },
    2: { label: "Easy", color: "#7ff7b4" },
    3: { label: "Even", color: "#ffd35c" },
    4: { label: "Hard", color: "#ff9b4d" },
    5: { label: "Very hard", color: "#ff4d8d" },
  };
  return map[d] ?? map[3];
}

export interface Fixture {
  id: string;
  home: string;
  away: string;
  kickoff: string;
  status: "upcoming" | "live" | "ft";
  minute?: number;
  homeScore?: number;
  awayScore?: number;
}

/** World Cup group-stage matchups. */
export const FIXTURES: Fixture[] = [
  { id: "f1", home: "FRA", away: "BRA", kickoff: "Sat 12:30", status: "live", minute: 67, homeScore: 2, awayScore: 0 },
  { id: "f2", home: "ESP", away: "GER", kickoff: "Sat 15:00", status: "live", minute: 54, homeScore: 1, awayScore: 1 },
  { id: "f3", home: "ARG", away: "NGA", kickoff: "Sat 17:30", status: "upcoming" },
  { id: "f4", home: "ENG", away: "USA", kickoff: "Sun 16:15", status: "upcoming" },
  { id: "f5", home: "ITA", away: "URU", kickoff: "Sun 18:30", status: "upcoming" },
];

export interface LeagueEntry {
  rank: number;
  manager: string;
  address: string;
  points: number;
  gw: number;
  agent: boolean;
  you?: boolean;
}

export const LEADERBOARD: LeagueEntry[] = [
  { rank: 1, manager: "0xPitchGod", address: "0x9a3f…21bd", points: 2418, gw: 88, agent: true },
  { rank: 2, manager: "samurai.eth", address: "0x44c1…9f0a", points: 2390, gw: 76, agent: true },
  { rank: 3, manager: "You", address: "0x12ab…cd34", points: 2375, gw: 91, agent: true, you: true },
  { rank: 4, manager: "midfield_maestro", address: "0x77de…11aa", points: 2351, gw: 64, agent: false },
  { rank: 5, manager: "0xCatenaccio", address: "0xab09…7c22", points: 2333, gw: 70, agent: true },
  { rank: 6, manager: "tikitaka", address: "0x5f8b…00d1", points: 2299, gw: 59, agent: false },
  { rank: 7, manager: "gegen_press", address: "0xc4a2…88e7", points: 2270, gw: 81, agent: true },
  { rank: 8, manager: "park_the_bus", address: "0x6b1c…43f9", points: 2244, gw: 47, agent: false },
];

export const PRIZE_POOL_OKB = 1280;
export const GAMEWEEK = 14;
