import { ethers, network } from "hardhat";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

/**
 * Seeds a complete, verifiable matchday on the DEPLOYED contracts so the demo
 * shows real on-chain activity end-to-end:
 *   mint × 3 → joinLeague → submitLineup → reportPoints → lock → settle → claim
 *
 *   pnpm --filter @aff/contracts seed:testnet   (X Layer testnet, chainId 1952)
 *   pnpm --filter @aff/contracts seed:mainnet   (X Layer mainnet, chainId 196)
 *
 * Run AFTER deploying. Addresses are read from packages/shared/src/deployments.json
 * (written by the deploy script) or NEXT_PUBLIC_* env vars. The signer must be the
 * deployer (it owns the oracle/league and reports/locks/settles).
 */
const LEAGUE_ID = 1n;
const ZERO = "0x0000000000000000000000000000000000000000";

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

  const lg = await league.leagues(LEAGUE_ID);
  const entryFee: bigint = lg.entryFee ?? lg[0];
  const gw: bigint = lg.gameweek ?? lg[1];
  console.log(`League #${LEAGUE_ID}: entry ${ethers.formatEther(entryFee)} OKB, GW ${gw}\n`);

  // 1) mint 3 common players (token ids start at nextId)
  const price: bigint = await playerNFT.mintPrice(0);
  const startId = Number(await playerNFT.nextId());
  const ids: number[] = [];
  for (let k = 0; k < 3; k++) {
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

  // 4) lock + settle (splits the pool 50/30/20; 1 manager -> 100%)
  const lockTx = await league.lock(LEAGUE_ID);
  await lockTx.wait();
  console.log(`lock   ${link(lockTx.hash)}`);
  const setTx = await league.settle(LEAGUE_ID);
  await setTx.wait();
  console.log(`settle ${link(setTx.hash)}`);

  const score = await league.scoreOf(LEAGUE_ID, me.address);
  const claimable: bigint = await vault.claimable(me.address);
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
