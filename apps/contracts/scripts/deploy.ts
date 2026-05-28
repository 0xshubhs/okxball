import { ethers, network } from "hardhat";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";

/**
 * Deploys the full OKBall stack and wires permissions:
 *   PlayerNFT · ScoringOracle · PayoutVault · FantasyLeague
 *
 *   pnpm deploy:testnet   (X Layer testnet, chainId 1952)
 *   pnpm deploy:mainnet   (X Layer mainnet, chainId 196)
 *
 * On X Layer networks it also writes the addresses to:
 *   - packages/shared/src/deployments.json  (the app reads this automatically)
 *   - web/.env.local                        (NEXT_PUBLIC_* overrides)
 * so the frontend goes live with zero manual copy-paste.
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Network :", network.name, `(chainId ${network.config.chainId})`);
  console.log("Deployer:", deployer.address);
  const bal = await ethers.provider.getBalance(deployer.address);
  console.log("Balance :", ethers.formatEther(bal), "OKB\n");

  const PlayerNFT = await ethers.getContractFactory("PlayerNFT");
  const playerNFT = await PlayerNFT.deploy();
  await playerNFT.waitForDeployment();
  console.log("PlayerNFT     ->", await playerNFT.getAddress());

  const ScoringOracle = await ethers.getContractFactory("ScoringOracle");
  const oracle = await ScoringOracle.deploy();
  await oracle.waitForDeployment();
  console.log("ScoringOracle ->", await oracle.getAddress());

  const PayoutVault = await ethers.getContractFactory("PayoutVault");
  const vault = await PayoutVault.deploy();
  await vault.waitForDeployment();
  console.log("PayoutVault   ->", await vault.getAddress());

  const FantasyLeague = await ethers.getContractFactory("FantasyLeague");
  const league = await FantasyLeague.deploy(
    await playerNFT.getAddress(),
    await oracle.getAddress(),
    await vault.getAddress()
  );
  await league.waitForDeployment();
  console.log("FantasyLeague ->", await league.getAddress());

  // Wire permissions: league can allocate payouts; create an opening league.
  await (await vault.setDistributor(await league.getAddress(), true)).wait();
  await (await league.createLeague(ethers.parseEther("0.02"), 14)).wait();
  console.log(
    "\nWired: league authorized as vault distributor; league #1 created (0.02 OKB entry, GW14)."
  );

  const addresses = {
    playerNFT: await playerNFT.getAddress(),
    scoringOracle: await oracle.getAddress(),
    payoutVault: await vault.getAddress(),
    fantasyLeague: await league.getAddress(),
  };

  // Map the hardhat network to the shared-deployments key.
  const netKey =
    network.name === "xlayer"
      ? "mainnet"
      : network.name === "xlayerTestnet"
        ? "testnet"
        : null;

  if (netKey) {
    persistShared(netKey, network.config.chainId ?? 0, addresses);
    persistEnvLocal(addresses);
    console.log(
      `\nWrote addresses to packages/shared/src/deployments.json (${netKey}) and web/.env.local`
    );
  }

  console.log("\n--- web/.env.local ---");
  console.log(`NEXT_PUBLIC_PLAYER_NFT_ADDRESS=${addresses.playerNFT}`);
  console.log(`NEXT_PUBLIC_SCORING_ORACLE_ADDRESS=${addresses.scoringOracle}`);
  console.log(`NEXT_PUBLIC_PAYOUT_VAULT_ADDRESS=${addresses.payoutVault}`);
  console.log(`NEXT_PUBLIC_FANTASY_LEAGUE_ADDRESS=${addresses.fantasyLeague}`);

  console.log("\n--- verify on OKLink ---");
  for (const [name, addr] of Object.entries(addresses)) {
    console.log(`pnpm --filter @okball/contracts exec hardhat okverify --network ${network.name} ${addr}  # ${name}`);
  }
}

type Addrs = {
  playerNFT: string;
  scoringOracle: string;
  payoutVault: string;
  fantasyLeague: string;
};

function persistShared(netKey: string, chainId: number, a: Addrs) {
  const file = resolve(__dirname, "../../../packages/shared/src/deployments.json");
  const json = JSON.parse(readFileSync(file, "utf8"));
  json[netKey] = { chainId, ...a };
  writeFileSync(file, JSON.stringify(json, null, 2) + "\n");
}

function persistEnvLocal(a: Addrs) {
  const file = resolve(__dirname, "../../web/.env.local");
  const vars: Record<string, string> = {
    NEXT_PUBLIC_PLAYER_NFT_ADDRESS: a.playerNFT,
    NEXT_PUBLIC_SCORING_ORACLE_ADDRESS: a.scoringOracle,
    NEXT_PUBLIC_PAYOUT_VAULT_ADDRESS: a.payoutVault,
    NEXT_PUBLIC_FANTASY_LEAGUE_ADDRESS: a.fantasyLeague,
  };
  const lines = existsSync(file)
    ? readFileSync(file, "utf8").split("\n").filter((l) => l.trim())
    : [];
  const kept = lines.filter((l) => !Object.keys(vars).some((k) => l.startsWith(k + "=")));
  const merged = [...kept, ...Object.entries(vars).map(([k, v]) => `${k}=${v}`)];
  writeFileSync(file, merged.join("\n") + "\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
