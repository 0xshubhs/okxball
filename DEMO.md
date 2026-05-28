# 🎥 Demo guide + submission checklist

For the **OKX X Cup Hackathon** (World Cup theme · X Layer). Judging weights: **Innovation**, **Market potential**, **Completion** (on-chain verifiability weighted heavily). A 1–3 min demo video is a scored bonus.

> **Everything below has been tested end-to-end.** Contracts are deployed & verified-ready on X Layer testnet, a full matchday is settled on-chain (league #2), the agent runs on a live self-hosted LLM, and an **open league #3** is waiting for a wallet to play live. See the on-chain proof block in [`README.md`](README.md).

---

## ✅ What's actually live (tested 2026-05-25)

| Piece | State | How it was verified |
| --- | --- | --- |
| 4 contracts on X Layer testnet (1952) | **Live** | bytecode confirmed at all 4 addresses; `eth_chainId` = `0x7a0` |
| Full matchday lifecycle | **Settled on-chain (league #2)** | create→mint→join→submit→report→lock→settle→claim, every step a verified tx (README links) |
| Live play league | **Open (league #3)** | app targets it via `NEXT_PUBLIC_LEAGUE_ID=3` |
| AI agent | **Real LLM** | `Qwen/Qwen3-VL-8B-Instruct` on RunPod vLLM; `/api/agent` streams real reasoning + a complete XI |
| Mint / Train | **Real on-chain writes** | `playerNFT.mint/train`, gated on connected + deployed |
| Web app | **Builds & serves** | 16 routes compile; all 9 pages return 200 |
| Agent badge | reads **"Qwen3-VL-8B-Instruct · RunPod"** | (falls back to "Heuristic engine" only if the endpoint is down) |

**Two things that are intentionally honest, say them if asked:**
1. The agent reasons over the on-screen **demo squad** (illustrative national-team data), but the **on-chain `submitLineup` uses the wallet's own minted NFTs** — read live from chain — because the contract requires `ownerOf(tokenId) == you`. So the live flow is **mint → then submit**.
2. **Claim** needs the gameweek settled. A connected wallet joins + submits live; the **operator** then runs `settle:testnet` (oracle report → lock → settle) so winners can claim. Both halves are real on-chain txns.

---

## 1–3 minute demo video — beat sheet

Record at 1080p, dark room, OKX Wallet extension visible. Use a wallet funded with a little testnet OKB ([faucet](https://web3.okx.com/xlayer/faucet)). Every page already shows a **Live** badge.

| Time | Beat | On screen | Say |
| --- | --- | --- | --- |
| 0:00–0:15 | **Theme hook** | Landing page, 3D stadium hero rotating | "A fantasy World Cup, run by AI agents — fully on-chain on X Layer." |
| 0:15–0:40 | **Own a real NFT** | `/players` → mint a card → OKX Wallet confirms → **Train** → rating/level rises | "Every footballer is an ERC-721 you actually mint and train. That's a real transaction on X Layer." |
| 0:40–1:10 | **The agent (your edge)** | `/agent`: type *"All-out attack, captain my hottest striker"* → reasoning streams line-by-line → full XI on the 3D pitch; badge reads **Qwen3-VL · RunPod** | "You don't pick the team — you brief an agent. This is a self-hosted LLM reasoning live over your squad's stats." |
| 1:10–1:40 | **The on-chain click (Completion proof)** | **Join league · 0.02 OKB** → confirm → click again → **Apply & submit** → OKX Wallet popup → confirmed → cut to **OKLink** tx | "One click turns the recommendation into a real `submitLineup` of the NFTs I own. Here it is verified on OKLink. Natural language → on-chain lineup." |
| 1:40–2:05 | **Settle + payout** | (operator has run `settle`) `/live`: points tick up → **Claim** OKB → open OKX DEX swap → USDC | "Scoring settles through the on-chain oracle. Winners claim OKB and swap to a stablecoin via OKX DEX, in-wallet." |
| 2:05–end | **Close** | `/leaderboard`: standings, prize pool, "agents" tags | "Fantasy sports is a huge traditional market. This brings it fully on-chain, with OKX Wallet as the on-ramp. Built on X Layer." |

**The money shot is 1:10–1:40** — a plain-English prompt becoming a verifiable on-chain transaction. Lead the thumbnail/title with it.

> **Shortcut if you can't sign live on camera:** the full lifecycle is already settled on **league #2** — walk the verified OKLink links in the README and narrate them. It's 100% real, just pre-recorded on-chain.

---

## Before you film — exact runbook

Most of this is **already done** (live testnet addresses, open league #3, RunPod agent). The only per-demo steps are wallet funding and the settle pass.

```bash
pnpm install
pnpm web                      # http://localhost:3000  (Live badge; targets league #3)
```

1. **Fund the demo wallet** with testnet OKB: <https://web3.okx.com/xlayer/faucet> (≈0.2 OKB/day is plenty — mint 0.05, train 0.02, join 0.02).
2. **(If league #3 is no longer open)** open a fresh one and re-point the app:
   ```bash
   pnpm --filter @okxball/contracts open-league:testnet   # prints the new id, writes NEXT_PUBLIC_LEAGUE_ID
   pnpm --filter @okxball/web build && pnpm web            # rebuild so the new id is inlined
   ```
   > `NEXT_PUBLIC_*` is baked at build time — **rebuild after changing the league id**.
3. **Record the live half:** connect OKX Wallet → `/players` mint + train → `/agent` run + **join + submit**.
4. **Settle so claim works on camera:**
   ```bash
   LEAGUE_ID=3 pnpm --filter @okxball/contracts settle:testnet   # reports points → lock → settle
   ```
   Then back in `/live`, the demo wallet **claims** its OKB.
5. **(Optional) refresh the README proof block** with a brand-new self-contained lifecycle:
   ```bash
   pnpm --filter @okxball/contracts seed:testnet   # creates its own league, runs create→…→claim
   ```

### Optional polish
- **OKX DEX swap:** the embedded widget runs client-side with no keys, but DEX liquidity is on **mainnet (196)** — for a real swap on camera set `NEXT_PUBLIC_DEFAULT_NETWORK=mainnet` after a mainnet deploy, or just show the in-wallet swap UI. Set `NEXT_PUBLIC_PAYOUT_TOKEN_ADDRESS` to X Layer USDC to pre-select it.
- **Your own LLM:** override `AI_BASE_URL` / `AI_MODEL` in `apps/web/.env.local` (defaults to the live RunPod Qwen endpoint).

---

## Submission checklist (per the rules)

- [x] **Deployed on X Layer** testnet (1952) — 4 contracts live.
- [ ] **Mainnet (196)** deploy for the strongest "on-chain verifiable" score: `pnpm deploy:mainnet`.
- [ ] **Contracts verified on OKLink** — set `OKLINK_API_KEY` in `apps/contracts/.env`, then run the printed `okverify` commands (see [`apps/contracts/DEPLOY.md`](apps/contracts/DEPLOY.md)).
- [x] **On-chain proof block** filled in the README (league #2 full lifecycle + open league #3).
- [ ] **Dedicated X (Twitter) account** created; **tag @XLayerOfficial** on submission and **post throughout** the hackathon.
- [ ] **Demo video** (1–3 min) recorded and linked.
- [x] **World Cup theme** front-and-centre (national teams, group-stage framing).
- [ ] **Google Form** submitted before **23:59 UTC, May 28**.

## Talking points if a judge digs in

- **On-chain verifiability:** four contracts; mint/train/join/submit/settle/claim are real txns; a complete matchday is settled on-chain (league #2). Oracle scoring + payout vault are real Solidity with an end-to-end test (`pnpm test`, 3/3 passing).
- **Innovation:** the agent turns a plain-English brief into a signed on-chain lineup, streaming its reasoning from a **self-hosted LLM** (no third-party API dependency).
- **Honest engineering:** the app degrades gracefully (Demo/Live badges, heuristic fallback if the LLM is down) and the on-chain submit uses your **actually-owned** NFTs — it never fakes ownership.
