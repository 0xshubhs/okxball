# ⚽ Agentic Fantasy Football OS

> Fully on-chain fantasy football on **X Layer**. AI agents auto-manage your squad of **Player NFTs** from live match stats, scoring streams in via oracles, and winnings pay out instantly in **OKB** — all from your **OKX Wallet**.

A GameFi + AI Agents + NFTs hackathon build for the X Layer / OKX ecosystem.

---

## ✨ What it does

| Pillar | How it works |
| --- | --- |
| **AI agents manage your squad** | Run on `AUTO` (optimise on stats) or `PROMPT` ("go all-out attack, captain my hottest player"). The agent picks formation, XI and captain — and explains every decision. |
| **Player NFTs you can train** | Each footballer is an ERC-721 with on-chain rating/level/XP. Train them to level up and boost projected points + resale value. |
| **Real-time oracle scoring** | Matchday points stream into the live center; your XI ticks up event-by-event. |
| **Instant OKB payouts** | Prize pool settles through the PayoutVault straight to your wallet — claim in one tap. |
| **OKX Wallet + X Layer** | One-tap connect, auto network-switch to X Layer, OKB balance, ramp from OKX CEX. |

## 🗺️ App map

| Route | Screen |
| --- | --- |
| `/` | Landing — the pitch |
| `/dashboard` | Manager overview: KPIs, your XI, agent activity, matchday, mini-table |
| `/squad` | **Squad builder** — pick a formation, fill the pitch, set captain, auto-pick with the agent, submit on-chain |
| `/players` | **NFT collection + market** — filter, mint, buy, and **train/upgrade** players |
| `/agent` | **Agent console** — AUTO/PROMPT modes, streamed reasoning log, recommended XI |
| `/live` | **Live center** — live score, per-player points, event feed, instant payout |
| `/leaderboard` | League standings + prize split |
| `/logo` | Brand page — marks, lockups, colors |

---

## 🏗️ Architecture

```
agentic-fantasy-football-os/
├── web/                      # Next.js 14 (App Router) + Tailwind + Framer Motion
│   ├── app/                  # routes (landing, dashboard, squad, players, agent, live, leaderboard, logo)
│   ├── components/           # PlayerCard, Pitch, WalletConnect, Navbar, logo, StatBar…
│   └── lib/
│       ├── chains.ts         # X Layer mainnet (196) + testnet (195) viem chains
│       ├── wagmi.ts          # OKX Wallet (injected) connector + wagmi config
│       ├── data.ts           # players, formations, fixtures, leaderboard (demo data)
│       ├── contracts.ts      # addresses (env) + ABIs
│       └── agents/engine.ts  # the agent: projected points, prompt parsing, XI optimiser
└── contracts/                # Hardhat + OpenZeppelin (Solidity 0.8.24)
    ├── contracts/
    │   ├── PlayerNFT.sol     # ERC-721 footballers with train()/mint()
    │   ├── ScoringOracle.sol # trusted reporters push gameweek points
    │   ├── PayoutVault.sol   # holds prize pool, instant claims
    │   └── FantasyLeague.sol # join, submit lineup, settle, allocate winnings
    ├── scripts/deploy.ts     # deploys + wires the whole stack
    └── test/fantasy.test.ts  # end-to-end league flow test
```

**Agent design.** `lib/agents/engine.ts` is a deterministic, explainable heuristic so the demo runs with zero external calls. To go live with an LLM, swap `parsePrompt` + `pickXI` for a server-side tool-calling agent that returns the same `AgentPlan` shape — the UI and on-chain submission path don't change. (Set `ANTHROPIC_API_KEY` and wire a route handler.)

---

## 🚀 Run the frontend

```bash
cd web
npm install
cp .env.example .env.local      # defaults to X Layer testnet; works without contracts
npm run dev                     # http://localhost:3000
```

The UI is fully navigable with simulated data before any contract is deployed. Connect with **OKX Wallet** (the button auto-switches you to X Layer); if OKX isn't installed it links you to install it.

## 🔗 Deploy the contracts

```bash
cd contracts
npm install
cp .env.example .env            # set PRIVATE_KEY (a funded X Layer testnet key)
npm run compile
npm test                        # runs the end-to-end league test
npm run deploy:testnet          # X Layer testnet (chainId 195)
# npm run deploy:mainnet        # X Layer (chainId 196)
```

The deploy script prints the four `NEXT_PUBLIC_*` addresses — paste them into `web/.env.local` and restart `npm run dev` to wire the frontend to chain.

### X Layer networks

| | Mainnet | Testnet |
| --- | --- | --- |
| Chain ID | 196 | 195 |
| RPC | `https://rpc.xlayer.tech` | `https://testrpc.xlayer.tech` |
| Gas token | OKB | OKB |
| Explorer | oklink.com/xlayer | oklink.com/xlayer-test |

---

## 🎯 Why it fits the grant

- **Under-built category on EVM L2s** — agentic GameFi fantasy sports is fresh.
- **Retention + NFT utility** — training loop + matchday cadence drive repeat sessions.
- **High concurrency** — matchdays create spiky, real-time load that suits X Layer's throughput.
- **Seamless ramps** — OKX Wallet + OKB bring the huge traditional fantasy market on-chain.

> Demo data (players, fixtures, scores) is simulated for the hackathon. The contract layer, wallet integration, and X Layer config are real.
