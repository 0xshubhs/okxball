import { ethers, network } from "hardhat";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

/**
 * Advances and settles an EXISTING league so the wallets that joined + submitted
 * live can claim their winnings.
 *
 *   LEAGUE_ID=2 pnpm --filter @okxball/contracts settle:testnet
 *
 * For each manager in the league it reads their submitted lineup, reports oracle
 * points for those tokens (captain doubles via the contract), then locks and
 * settles — allocating the 50/30/20 split into the PayoutVault. Owner-only
 * (oracle reporter + league owner). Run AFTER managers have submitted.
 */
const ZERO = "0x0000000000000000000000000000000000000000";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function netKey(): "mainnet" | "testnet" | null {
  if (network.name === "xlayer") return "mainnet";
  if (network.name === "xlayerTestnet") return "testnet";
  return null;
}

function loadAddresses() {
  const key = netKey();
  if (key) {
    const file = resolve(__dirname, "../../../packages/shared/src/deployments.json");
    if (existsSync(file)) {
      const a = JSON.parse(readFileSync(file, "utf8"))[key];
      if (a?.playerNFT && a.playerNFT !== ZERO) return a;
    }
  }
  return {
    playerNFT: process.env.NEXT_PUBLIC_PLAYER_NFT_ADDRESS,
    scoringOracle: process.env.NEXT_PUBLIC_SCORING_ORACLE_ADDRESS,
    payoutVault: process.env.NEXT_PUBLIC_PAYOUT_VAULT_ADDRESS,
    fantasyLeague: process.env.NEXT_PUBLIC_FANTASY_LEAGUE_ADDRESS,
  };
}

function explorerBase() {
  if (network.name === "xlayer") return "https://www.oklink.com/x-layer";
  if (network.name === "xlayerTestnet") return "https://www.oklink.com/x-layer-testnet";
  return "";
}

async function main() {
  const leagueId = BigInt(process.env.LEAGUE_ID ?? "1");
  const a = loadAddresses();
  if (!a.fantasyLeague || a.fantasyLeague === ZERO) {
    throw new Error(`No deployed contracts for ${network.name}. Deploy first.`);
  }
  const ex = explorerBase();
  const link = (h: string) => (ex ? `${ex}/tx/${h}` : h);

  const oracle = await ethers.getContractAt("ScoringOracle", a.scoringOracle);
  const vault = await ethers.getContractAt("PayoutVault", a.payoutVault);
  const league = await ethers.getContractAt("FantasyLeague", a.fantasyLeague);

  const lg = await league.leagues(leagueId);
  const gw: bigint = lg.gameweek ?? lg[1];
  if ((lg.gameweek ?? lg[1]) === 0n) throw new Error(`League #${leagueId} doesn't exist.`);
  if (lg.settled ?? lg[4]) {
    console.log(`League #${leagueId} already settled.`);
    return;
  }

  const managers: string[] = await league.managersOf(leagueId);
  console.log(`League #${leagueId}: GW ${gw}, ${managers.length} manager(s)\n`);
  if (managers.length === 0) throw new Error("No managers joined — nothing to settle.");

  // 1) report points for every submitted token. Give each manager's lineup a
  //    descending spread so there's a clear winner; captain doubles on-chain.
  for (let m = 0; m < managers.length; m++) {
    const [tokenIds] = await league.getLineup(leagueId, managers[m]);
    if (!tokenIds.length) {
      console.log(`  ${managers[m]} submitted no lineup — skipping`);
      continue;
    }
    const base = 12 - m * 2; // first manager scores highest
    const pts = tokenIds.map((_: bigint, i: number) => BigInt(Math.max(2, base - i)));
    const rep = await oracle.reportPoints(gw, tokenIds, pts);
    await rep.wait();
    console.log(`report ${managers[m]} (${tokenIds.length} tokens)  ${link(rep.hash)}`);
  }

  // 2) lock, wait for the RPC to confirm the lock, then settle.
  const lockTx = await league.lock(leagueId);
  await lockTx.wait();
  console.log(`lock   ${link(lockTx.hash)}`);
  for (let i = 0; i < 20; i++) {
    const lg2 = await league.leagues(leagueId);
    if (lg2.locked ?? lg2[3]) break;
    await sleep(1500);
  }
  const setTx = await league.settle(leagueId);
  await setTx.wait();
  console.log(`settle ${link(setTx.hash)}\n`);

  // 3) report what each manager can now claim.
  for (const m of managers) {
    const score = await league.scoreOf(leagueId, m);
    const claimable = await vault.claimable(m);
    console.log(`  ${m}  score ${score}  claimable ${ethers.formatEther(claimable)} OKB`);
  }
  console.log("\n✓ Settled — winners can now claim in the app (Live tab).");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
