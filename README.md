# ⚽ Agentic Fantasy Football OS — Fantasy World Cup, on-chain

> A fully on-chain **Fantasy World Cup** on **X Layer**. AI agents (Claude) auto-manage your squad of national-team **Player NFTs** from live match stats, scoring streams through an on-chain **oracle**, and winnings pay out in **OKB** with a one-tap swap to stablecoins via **OKX DEX** — all from your **OKX Wallet**.

Built for the **OKX X Cup Hackathon** (World Cup theme · X Layer). Tracks: **GameFi + AI Agent + NFT**.

---

## 🔗 On-chain proof (X Layer)

> Fill these in after running `pnpm deploy:testnet` / `:mainnet` (the deploy script writes them automatically to `packages/shared/src/deployments.json` and `web/.env.local`). Until then the app runs in clearly-labelled **Demo** mode.

| Contract | Address | OKLink |
| --- | --- | --- |
| PlayerNFT (ERC-721) | `0x…` | [verify](https://www.oklink.com/x-layer) |
| ScoringOracle | `0x…` | [verify](https://www.oklink.com/x-layer) |
| FantasyLeague | `0x…` | [verify](https://www.oklink.com/x-layer) |
| PayoutVault | `0x…` | [verify](https://www.oklink.com/x-layer) |

Sample matchday flow (tx hashes): mint → train → joinLeague → submitLineup → reportPoints → settle → claim — `0x…`

**Network:** X Layer is a Polygon CDK **zkEVM**; gas token **OKB**. Mainnet `chainId 196`, testnet `chainId 1952` ("terigon"). See [`apps/contracts/DEPLOY.md`](apps/contracts/DEPLOY.md).

---

## ✨ What it does

| Pillar | How it works |
| --- | --- |
| **AI agent manages your squad** | `AUTO` (optimise on stats) or `PROMPT` ("all-out attack, captain my hottest striker"). A **Claude Opus tool-calling agent** (`/api/agent`) streams its reasoning live and returns a structured XI; one click submits it **on-chain**. Falls back to a deterministic heuristic with no API key. |
| **National-team Player NFTs you can train** | Each footballer is an ERC-721 with on-chain rating/level/XP. `train()` levels them up and boosts projected points + resale value. |
| **On-chain oracle scoring** | `ScoringOracle` takes trusted batch `reportPoints(gw, tokenIds, pts)`; `FantasyLeague.settle()` tallies the XI (captain ×2) and splits the pool **50/30/20** to the top three managers. |
| **Instant OKB payouts + OKX DEX** | Winners pull OKB from `PayoutVault.claim()`, then swap to a stablecoin via the embedded **OKX DEX** widget / aggregator REST API. |
| **OKX Wallet + X Layer** | One-tap connect, auto network-switch, OKB balance, CEX ramp. |
| **3D matchday UI** | react-three-fiber stadium hero, an interactive 3D pitch (2D/3D toggle), holographic rarity-shaded NFT cards, and a live matchday scene — all bloom-lit, with mobile / reduced-motion fallbacks. |

## 🎬 60-second demo path

1. Land on the **3D stadium** → "Fantasy World Cup, run by AI agents, on X Layer."
2. **/agent** → type a strategy → watch Claude stream its reasoning → recommended XI.
3. One click → **OKX Wallet** signs → lineup tx confirmed on **OKLink**. *(the money shot)*
4. **/live** → points tick up → **claim OKB** → swap to USDC via **OKX DEX**.
5. **/players** → mint + train an NFT, rating/level rise on-chain.

Full beat sheet + submission checklist: [`DEMO.md`](DEMO.md).

---

## 🏗️ Architecture (pnpm + Turborepo monorepo)

```
agentic-fantasy-football-os/
├── apps/web/                  # @aff/web — Next.js 14, wagmi/viem, R3F 3D, Claude agent route
│   ├── app/                   # routes + /api/agent (Claude) + /api/dex/* (OKX DEX)
│   ├── components/three/      # Scene3D, StadiumHero, Pitch3D, PlayerCard3D, MatchdayScene
│   └── lib/
│       ├── onchain.ts         # wagmi write/read hooks (mint/train/join/submit/claim)
│       ├── okx/               # OKX DEX aggregator client (HMAC-signed) + payout helper
│       └── agents/engine.ts   # deterministic heuristic (agent fallback + scoring math)
├── apps/contracts/            # @aff/contracts — Hardhat + OpenZeppelin 5.0.2 (Solidity 0.8.24)
│   ├── contracts/             # PlayerNFT · ScoringOracle · FantasyLeague · PayoutVault
│   ├── scripts/deploy.ts      # deploys, wires perms, auto-writes addresses to the app
│   └── test/fantasy.test.ts   # end-to-end league flow (mint→…→claim)
└── packages/shared/           # @aff/shared — chains (correct 1952!), ABIs, addresses, constants
```

The deploy writes addresses into `@aff/shared`, which both the app and contracts read — one source of truth, no copy-paste drift.

---

## 🚀 Run it

```bash
pnpm install          # workspace install (root)
pnpm web              # http://localhost:3000  — full app (Demo mode until deployed)
pnpm test             # contracts: end-to-end league test
pnpm build            # build everything via turbo
```

Connect with **OKX Wallet** (auto-switches to X Layer). Every page shows a **Demo / Live** badge; it flips to **Live** automatically once contracts are deployed.

## 🔗 Deploy to X Layer

```bash
# 1) get test OKB: https://web3.okx.com/xlayer/faucet  (or https://www.l2faucet.com/x-layer)
# 2) apps/contracts/.env  ->  PRIVATE_KEY=...   OKLINK_API_KEY=...
pnpm deploy:testnet   # chainId 1952  (or pnpm deploy:mainnet -> 196)
```

Then run the printed `okverify` commands to verify on OKLink. Full runbook: [`apps/contracts/DEPLOY.md`](apps/contracts/DEPLOY.md).

**Seed a demo matchday** (real txns for your video): `pnpm --filter @aff/contracts seed:testnet` — mints, joins, submits, reports oracle points, settles (50/30/20) and claims, printing an OKLink link per step.

### Optional live keys (`apps/web/.env.local`)
- `ANTHROPIC_API_KEY` — turns the agent console into a real Claude agent (heuristic without it).
- `OKX_DEX_API_KEY` / `_SECRET_KEY` / `_PASSPHRASE` / `_PROJECT_ID` — enables the DEX REST payout swap.
- `NEXT_PUBLIC_PAYOUT_TOKEN_ADDRESS` — stablecoin to pre-select in the swap widget.

### X Layer networks

| | Mainnet | Testnet ("terigon") |
| --- | --- | --- |
| Chain ID | **196** | **1952** *(not 195 — that's the dead X1 testnet)* |
| RPC | `https://rpc.xlayer.tech` | `https://testrpc.xlayer.tech/terigon` |
| Gas token | OKB | OKB |
| Explorer | oklink.com/x-layer | oklink.com/x-layer-testnet |

---

## 🟣 OKX / OnchainOS integrations

- **OKX Wallet** — injected EIP-1193 connector, auto network-switch.
- **OKX DEX** — embedded `@okxweb3/dex-widget` swap (X Layer) + server-side aggregator REST (`/api/dex/quote|swap`, HMAC-signed) for "claim → stablecoin".
- **OKLink** — contract verification via `@okxweb3/hardhat-explorer-verify`.
- **OKB** — native gas + mint/train/entry/prize currency end-to-end.

## 🎯 Why it scales X Layer

Fantasy sports is a massive, proven retention market; the NFT-training loop + matchday cadence + instant payouts is a credible on-chain wedge, and matchdays create spiky real-time load that suits X Layer's throughput. OKX Wallet + OKB make the on-ramp seamless.

> **Honesty note:** demo player/fixture/leaderboard data is illustrative seed data. The contracts, wallet integration, Claude agent, OKX DEX wiring, and X Layer config are real; the app gates real transactions behind a deployment check and shows a Demo/Live badge so nothing is misrepresented.
