import { ethers, network } from "hardhat";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

/**
 * Seeds a complete, verifiable matchday on the DEPLOYED contracts so the demo
 * shows real on-chain activity end-to-end:
 *   createLeague → mint → joinLeague → submitLineup → reportPoints → lock → settle → claim
 *
 *   pnpm --filter @okxball/contracts seed:testnet   (X Layer testnet, chainId 1952)
 *   pnpm --filter @okxball/contracts seed:mainnet   (X Layer mainnet, chainId 196)
 *
 * Each run creates its OWN fresh league, so it's repeatable and never collides
 * with an already-locked/settled league. Run AFTER deploying. Addresses are read
 * from packages/shared/src/deployments.json (written by the deploy script) or
 * NEXT_PUBLIC_* env vars. The signer must be the deployer (it owns the
 * oracle/league and reports/locks/settles).
 *
 * NOTE: this seeds a self-contained proof league. For the LIVE demo flow where a
 * user wallet joins/submits, use `open-league` + `settle-league` instead.
 */
const ENTRY_FEE = ethers.parseEther("0.02");
const GAMEWEEK = 14n;
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
      const json = JSON.parse(readFileSync(file, "utf8"));
      const a = json[key];
      if (a && a.playerNFT && a.playerNFT !== ZERO) return a;
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
  const [me] = await ethers.getSigners();
  const a = loadAddresses();
  if (!a.playerNFT || a.playerNFT === ZERO) {
    throw new Error(
      `No deployed addresses for ${network.name}. Deploy first: pnpm deploy:${netKey() === "mainnet" ? "mainnet" : "testnet"}`
    );
  }

  const ex = explorerBase();
  const link = (h: string) => (ex ? `${ex}/tx/${h}` : h);
  console.log("Network :", network.name);
  console.log("Manager :", me.address, "\n");

  const playerNFT = await ethers.getContractAt("PlayerNFT", a.playerNFT);
  const oracle = await ethers.getContractAt("ScoringOracle", a.scoringOracle);
  const vault = await ethers.getContractAt("PayoutVault", a.payoutVault);
  const league = await ethers.getContractAt("FantasyLeague", a.fantasyLeague);

  // Create a fresh league for this run so the seed is always repeatable.
  const LEAGUE_ID: bigint = await league.nextLeagueId();
  const entryFee = ENTRY_FEE;
  const gw = GAMEWEEK;
  const createTx = await league.createLeague(entryFee, gw);
  await createTx.wait();
  console.log(`create league #${LEAGUE_ID}  ${link(createTx.hash)}`);
  console.log(`League #${LEAGUE_ID}: entry ${ethers.formatEther(entryFee)} OKB, GW ${gw}\n`);

  // 1) mint N common players (default 1 — keeps the testnet faucet budget safe;
  //    override with SEED_MINTS for a fuller lineup once funded)
  const N = Math.max(1, Number(process.env.SEED_MINTS ?? 1));
  const price: bigint = await playerNFT.mintPrice(0);
  const startId = Number(await playerNFT.nextId());
  const ids: number[] = [];
  for (let k = 0; k < N; k++) {
    const tx = await playerNFT.mint(0, { value: price });
    await tx.wait();
    ids.push(startId + k);
    console.log(`mint   token #${startId + k}   ${link(tx.hash)}`);
  }

  // 2) join the league + submit the lineup (captain = first token)
  const joinTx = await league.joinLeague(LEAGUE_ID, { value: entryFee });
  await joinTx.wait();
  console.log(`join   ${link(joinTx.hash)}`);
  const subTx = await league.submitLineup(LEAGUE_ID, ids, ids[0]);
  await subTx.wait();
  console.log(`lineup ${link(subTx.hash)}`);

  // 3) oracle reports this gameweek's points (captain doubles the first token)
  const pts = [40, 30, 20].slice(0, ids.length);
  const repTx = await oracle.reportPoints(gw, ids, pts);
  await repTx.wait();
  console.log(`report ${link(repTx.hash)}`);

  // 4) lock, then settle ONLY once the RPC confirms the lock landed. X Layer's
  //    load-balanced RPC can serve a stale read to settle's gas pre-flight
  //    ("not locked") right after lock mines — poll the state to avoid it.
  const lockTx = await league.lock(LEAGUE_ID);
  await lockTx.wait();
  console.log(`lock   ${link(lockTx.hash)}`);
  for (let i = 0; i < 20; i++) {
    const lg2 = await league.leagues(LEAGUE_ID);
    if (lg2.locked ?? lg2[3]) break;
    await sleep(1500);
  }
  const setTx = await league.settle(LEAGUE_ID);
  await setTx.wait();
  console.log(`settle ${link(setTx.hash)}`);

  const score = await league.scoreOf(LEAGUE_ID, me.address);
  let claimable: bigint = await vault.claimable(me.address);
  for (let i = 0; i < 20 && claimable === 0n; i++) {
    await sleep(1500);
    claimable = await vault.claimable(me.address);
  }
  console.log(`\nScore: ${score}  ·  Claimable: ${ethers.formatEther(claimable)} OKB`);

  // 5) claim winnings
  if (claimable > 0n) {
    const claimTx = await vault.claim(LEAGUE_ID);
    await claimTx.wait();
    console.log(`claim  ${link(claimTx.hash)}`);
  }

  console.log("\n✓ Matchday seeded — point judges at the tx links above on OKLink.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
