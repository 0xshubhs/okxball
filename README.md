# ⚽ OKBall — Fantasy World Cup, on-chain

> A fully on-chain **Fantasy World Cup** on **X Layer**. AI agents auto-manage your squad of national-team **Player NFTs** from live match stats, scoring streams through an on-chain **oracle**, and winnings pay out in **OKB** with a one-tap swap to stablecoins via **OKX DEX** — all from your **OKX Wallet**.

Built for the **OKX X Cup Hackathon** (World Cup theme · X Layer). Tracks: **GameFi + AI Agent + NFT**.

---

## 🔗 On-chain proof (X Layer)

**OKBall is live on X Layer testnet (chainId 1952).** Deployed + a full matchday verified on-chain (mint → join → submitLineup → reportPoints → lock → settle → claim).

### Deployed contracts (X Layer testnet · chainId 1952)

| Contract | Address | Explorer |
| --- | --- | --- |
| **PlayerNFT** (ERC-721) | `0x08a25a794639a6cA03b0A7C655B2c36d82fF144a` | [OKLink ↗](https://www.oklink.com/x-layer-testnet/address/0x08a25a794639a6cA03b0A7C655B2c36d82fF144a) |
| **ScoringOracle** | `0x9d3ccbE19D1A6e37A9F67868ae7eE8452069d697` | [OKLink ↗](https://www.oklink.com/x-layer-testnet/address/0x9d3ccbE19D1A6e37A9F67868ae7eE8452069d697) |
| **FantasyLeague** | `0x3297baE90BbD190de4F275cEAE71568428e794f0` | [OKLink ↗](https://www.oklink.com/x-layer-testnet/address/0x3297baE90BbD190de4F275cEAE71568428e794f0) |
| **PayoutVault** | `0x30E7EC0E595091adA9c8c85A969c6bA9a995e4D6` | [OKLink ↗](https://www.oklink.com/x-layer-testnet/address/0x30E7EC0E595091adA9c8c85A969c6bA9a995e4D6) |

Full matchday lifecycle on **league #2** (every step a verified tx on OKLink):
[createLeague](https://www.oklink.com/x-layer-testnet/tx/0x2fb8e0cd7c85d6ec557540cf39e609c29631a70119f1110fd16cf00ba875b768) ·
[mint](https://www.oklink.com/x-layer-testnet/tx/0xc3146ba51bed1aa70b69e81972d9088ae3a770f41a6bd61d3ee5bf70a97260d2) ·
[mint](https://www.oklink.com/x-layer-testnet/tx/0x88277c234eb392b5be9576005af8fdc0787e9bd5bd3f2c4f938884285f21abcb) ·
[join](https://www.oklink.com/x-layer-testnet/tx/0x08908f4f4cdd039a630a6ac6753886d7de0b2d516a03e17994697079ae240d81) ·
[submitLineup](https://www.oklink.com/x-layer-testnet/tx/0x6e3f8e0b3f69cc48f94027f2ee1e355138e22512576b7b18e3760f1c0f1b4bcf) ·
[reportPoints](https://www.oklink.com/x-layer-testnet/tx/0x5e24fa6b1fa719e23a490713a7439a6f94ef3e5efb0e645bec4871ff0e244c61) ·
[lock](https://www.oklink.com/x-layer-testnet/tx/0x77831dd514d37315ce9afc6ee5aef5a1075fff5057c997825915a0f3e1ecba73) ·
[settle](https://www.oklink.com/x-layer-testnet/tx/0xe07bf066da8b7aded7de69b835334e4931c84cba8bf0266e8d5336fca0760d33) ·
[claim](https://www.oklink.com/x-layer-testnet/tx/0xad08a14f3a32a93d6af45319b22575fb16ff3cd8bfea9fffa2ed9ca246ef3366)

The app's live flow targets **[league #3](https://www.oklink.com/x-layer-testnet/tx/0x4044cfafd40e10949f2dbc3b3b0174af25689a9d33cde45db344163e53899b38)** — open and empty, ready for a connected wallet to join + submit on camera (`NEXT_PUBLIC_LEAGUE_ID=3`).

> Mainnet (196): run `pnpm deploy:mainnet` before submission. The app reads the
> live addresses from `packages/shared/src/deployments.json` and auto-flips Demo → Live.

**Network:** X Layer is a Polygon CDK **zkEVM**; gas token **OKB**. Mainnet `chainId 196`, testnet `chainId 1952` ("terigon"). See [`apps/contracts/DEPLOY.md`](apps/contracts/DEPLOY.md).

---

## ✨ What it does

| Pillar | How it works |
| --- | --- |
| **AI agent manages your squad** | `AUTO` (optimise on stats) or `PROMPT` ("all-out attack, captain my hottest striker"). A **self-hosted LLM agent** — Qwen3-VL on a **RunPod vLLM** (OpenAI-compatible) endpoint — streams its reasoning live via `/api/agent` and returns a structured XI; one click submits it **on-chain**. Falls back to a deterministic heuristic if the endpoint is unreachable (no API key required). |
| **National-team Player NFTs you can train** | Each footballer is an ERC-721 with on-chain rating/level/XP. `train()` levels them up and boosts projected points + resale value. |
| **On-chain oracle scoring** | `ScoringOracle` takes trusted batch `reportPoints(gw, tokenIds, pts)`; `FantasyLeague.settle()` tallies the XI (captain ×2) and splits the pool **50/30/20** to the top three managers. |
| **Instant OKB payouts + OKX DEX** | Winners pull OKB from `PayoutVault.claim()`, then swap to a stablecoin via the embedded **OKX DEX** widget / aggregator REST API. |
| **OKX Wallet + X Layer** | One-tap connect, auto network-switch, OKB balance, CEX ramp. |
| **3D matchday UI** | react-three-fiber stadium hero, an interactive 3D pitch (2D/3D toggle), holographic rarity-shaded NFT cards, and a live matchday scene — all bloom-lit, with mobile / reduced-motion fallbacks. |

## 🎬 60-second demo path

1. Land on the **3D stadium** → "Fantasy World Cup, run by AI agents, on X Layer."
2. **/players** → mint + train an NFT → **OKX Wallet** signs → rating/level rise on-chain.
3. **/agent** → type a strategy → watch the LLM stream its reasoning → recommended XI.
4. One click → **join + submit** your owned NFTs → tx confirmed on **OKLink**. *(the money shot)*
5. **/live** → operator settles the gameweek → **claim OKB** → swap to USDC via **OKX DEX**.

Full beat sheet + submission checklist: [`DEMO.md`](DEMO.md).

---

## 🏗️ Architecture (pnpm + Turborepo monorepo)

```
okball/
├── apps/web/                  # @okball/web — Next.js 14, wagmi/viem, R3F 3D, agent route
│   ├── app/                   # routes + /api/agent (RunPod LLM) + /api/dex/* (OKX DEX)
│   ├── components/three/      # Scene3D, StadiumHero, Pitch3D, PlayerCard3D, MatchdayScene
│   └── lib/
│       ├── onchain.ts         # wagmi write/read hooks (mint/train/join/submit/claim)
│       ├── okx/               # OKX DEX aggregator client (HMAC-signed) + payout helper
│       └── agents/engine.ts   # deterministic heuristic (agent fallback + scoring math)
├── apps/contracts/            # @okball/contracts — Hardhat + OpenZeppelin 5.0.2 (Solidity 0.8.24)
│   ├── contracts/             # PlayerNFT · ScoringOracle · FantasyLeague · PayoutVault
│   ├── scripts/deploy.ts      # deploys, wires perms, auto-writes addresses to the app
│   └── test/fantasy.test.ts   # end-to-end league flow (mint→…→claim)
└── packages/shared/           # @okball/shared — chains (correct 1952!), ABIs, addresses, constants
```

The deploy writes addresses into `@okball/shared`, which both the app and contracts read — one source of truth, no copy-paste drift.

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

**Seed a demo matchday** (self-contained proof, real txns): `pnpm --filter @okball/contracts seed:testnet` — creates a fresh league, then mints, joins, submits, reports oracle points, locks, settles (50/30/20) and claims, printing an OKLink link per step.

**For a live on-camera demo** (a connected wallet really plays):
```bash
pnpm --filter @okball/contracts open-league:testnet   # opens a fresh league, writes NEXT_PUBLIC_LEAGUE_ID
# … in the app: connect wallet → /players mint → /agent → join + submit (real txns) …
LEAGUE_ID=<id> pnpm --filter @okball/contracts settle:testnet   # operator scores + settles so winners can claim
```

### Optional live keys (`apps/web/.env.local`)
- `AI_BASE_URL` / `AI_MODEL` — point the agent at your own OpenAI-compatible LLM
  (defaults to a live RunPod Qwen3-VL endpoint; `AI_API_KEY` optional). Heuristic fallback if unreachable.
- `NEXT_PUBLIC_LEAGUE_ID` — the league the app joins/submits/claims against (set by the `open-league` script).
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

> **Honesty note:** demo player/fixture/leaderboard data is illustrative seed data, and the agent reasons over that on-screen squad — but the **on-chain submit uses the wallet's own minted NFTs** (read live from chain), since `submitLineup` requires `ownerOf == you`. The contracts, wallet integration, RunPod LLM agent, OKX DEX wiring, and X Layer config are real; the app gates real transactions behind a deployment check and shows a Demo/Live badge so nothing is misrepresented.
