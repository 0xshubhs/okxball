# 🎥 Demo script + submission checklist

For the OKX X Cup Hackathon (World Cup theme · X Layer). Judging weights: **Innovation**, **Market potential**, **Completion** (on-chain verifiability weighted heavily). A 1–3 min demo video is a scored bonus.

---

## 1–3 minute demo video — beat sheet

Record at 1080p, dark room, wallet extension visible. Deploy to X Layer **before** filming so every badge reads **Live** and you can show real txns.

| Time | Beat | What's on screen | Say |
| --- | --- | --- | --- |
| 0:00–0:15 | **Theme hook** | Landing page, the 3D stadium hero rotating | "A fantasy World Cup, run by AI agents — fully on-chain on X Layer." |
| 0:15–0:45 | **The agent (your edge)** | `/agent`: type *"All-out attack, captain my hottest striker"* → Claude's reasoning streams line-by-line → recommended XI on the 3D pitch | "You don't pick the team — you brief an agent. This is Claude Opus reasoning live over your NFT squad's stats." |
| 0:45–1:15 | **The on-chain click (Completion proof)** | Hit **Apply & submit** → OKX Wallet popup → confirmed → cut to the **OKLink** tx page | "One click turns that recommendation into a real transaction on X Layer. Here it is verified on OKLink. Natural language → on-chain lineup." |
| 1:15–1:45 | **Matchday + payout** | `/live`: points tick up on the 3D matchday scene → **Claim** OKB → open OKX DEX swap → USDC | "Scoring settles through the on-chain oracle. Winners claim OKB and swap to a stablecoin via OKX DEX, in-wallet." |
| 1:45–2:10 | **NFT depth (retention)** | `/players`: open a holographic 3D card → **Train** → rating/level rises | "Every footballer is an ERC-721 you train and upgrade — the GameFi loop that brings players back each matchday." |
| 2:10–end | **Close** | `/leaderboard`: standings, prize pool, "agents" tags | "Fantasy sports is a huge traditional market. This brings it fully on-chain, with OKX Wallet as the on-ramp. Built on X Layer." |

**The single money shot is 0:45–1:15** — natural-language prompt to a verifiable on-chain transaction. Lead the thumbnail/title with it.

---

## Before you film — make it real

1. **Deploy + verify** (biggest score lever): `pnpm deploy:testnet` then the printed `okverify` commands → fill the on-chain proof table in `README.md`. For the strongest story also `pnpm deploy:mainnet` (196).
2. **Seed a live matchday on-chain** — one command: `pnpm --filter @aff/contracts seed:testnet`. It mints 3 players, joins the league, submits a lineup, reports oracle points, locks, settles (50/30/20 split), and claims — printing an **OKLink tx link for every step**. Paste those links into the README proof block and show them in the video so "oracle scoring" and "instant payout" are literally true on screen.
3. **Set keys** in `apps/web/.env.local`: `ANTHROPIC_API_KEY` (real Claude agent) and the `OKX_DEX_*` keys (real swap). Verify the agent console badge shows **"Claude Opus 4.7"**, not "Heuristic engine".
4. **Set `NEXT_PUBLIC_PAYOUT_TOKEN_ADDRESS`** to X Layer USDC so the swap widget pre-selects it.
5. Smoke-test the full path end to end on the deployed contracts with a funded wallet.

---

## Submission checklist (per the rules)

- [ ] **Deployed on X Layer** — testnet (1952) at minimum; mainnet (196) for the best "on-chain verifiable" score.
- [ ] **Contracts verified on OKLink** + addresses/tx links in the README on-chain-proof block.
- [ ] **Dedicated X (Twitter) account** created; **tag @XLayerOfficial** on submission and **post throughout** the hackathon.
- [ ] **Demo video** (1–3 min) recorded and linked.
- [ ] **World Cup theme** front-and-centre (national teams ✓, group-stage framing ✓).
- [ ] **Substantial new development during the window** — document what was built (monorepo, contract wiring, Claude agent, OKX DEX, 3D, World Cup re-theme).
- [ ] **Google Form** submitted before **23:59 UTC, May 28**.

## Talking points if a judge digs in

- **On-chain verifiability:** four verified contracts; mint/train/join/submit/settle/claim are real txns; oracle scoring + payout vault are real Solidity with an end-to-end test (`pnpm test`).
- **Innovation:** the agent doesn't just optimise — it turns a plain-English brief into a signed on-chain lineup. Claude tool-calling with streamed reasoning.
- **Honest engineering:** the app degrades gracefully (Demo/Live badges, heuristic fallback when no LLM key) instead of faking — but with keys + deploy, every headline claim is backed by working code.
