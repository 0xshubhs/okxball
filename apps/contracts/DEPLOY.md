# Deploying to X Layer

> X Layer is a Polygon CDK zkEVM. Native gas token: **OKB**.
> **Mainnet** chainId `196` · RPC `https://rpc.xlayer.tech`
> **Testnet** chainId `1952` ("terigon") · RPC `https://testrpc.xlayer.tech/terigon`
> (The widely-cited `195` is the dead X1 testnet — do not use it.)

## 1. Get test OKB (testnet)

- Faucet: https://web3.okx.com/xlayer/faucet — 0.2 OKB/day (needs ~$10 in your OKX Wallet).
- No-gate fallback: https://www.l2faucet.com/x-layer

## 2. Configure secrets

Copy `apps/contracts/.env.example` → `apps/contracts/.env` and fill:

```
PRIVATE_KEY=<deployer key, testnet only>
OKLINK_API_KEY=<free key from oklink.com → My Account → API Management>
```

## 3. Deploy

From the repo root:

```bash
pnpm deploy:testnet     # X Layer testnet (chainId 1952)
# or
pnpm deploy:mainnet     # X Layer mainnet (chainId 196)
```

The script deploys PlayerNFT, ScoringOracle, PayoutVault, FantasyLeague, wires the
vault distributor, creates league #1 (0.02 OKB entry, GW14), and **automatically
writes the addresses** to:

- `packages/shared/src/deployments.json` (the app reads this)
- `apps/web/.env.local` (`NEXT_PUBLIC_*` overrides)

So the frontend goes live the moment the deploy finishes — no manual copy-paste.

## 4. Verify on OKLink

The deploy prints a ready-to-run `okverify` command per contract, e.g.:

```bash
pnpm --filter @okball/contracts exec hardhat okverify --network xlayerTestnet <ADDRESS>
```

OKLink verification uses OKX's own plugin (`@okxweb3/hardhat-explorer-verify`) — it is
**not** Etherscan/Blockscout/Sourcify compatible, so you need an OKLink API key, not an
Etherscan one.

## 5. Run the app against the live contracts

```bash
pnpm web        # http://localhost:3000 — pages flip from "Demo" to "Live"
```
