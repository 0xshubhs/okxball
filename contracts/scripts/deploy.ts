import { ethers } from "hardhat";

/**
 * Deploys the full Agentic Fantasy Football OS stack and wires permissions:
 *   PlayerNFT · ScoringOracle · PayoutVault · FantasyLeague
 *
 *   npm run deploy:testnet   (X Layer testnet, chainId 195)
 *   npm run deploy:mainnet   (X Layer, chainId 196)
 */
async function main() {
  const [deployer] = await ethers.getSigners();
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
  await (await league.createLeague(ethers.parseEther("2"), 14)).wait();
  console.log("\nWired: league authorized as vault distributor; league #1 created (2 OKB entry, GW14).");

  console.log("\n--- paste into web/.env.local ---");
  console.log(`NEXT_PUBLIC_PLAYER_NFT_ADDRESS=${await playerNFT.getAddress()}`);
  console.log(`NEXT_PUBLIC_SCORING_ORACLE_ADDRESS=${await oracle.getAddress()}`);
  console.log(`NEXT_PUBLIC_PAYOUT_VAULT_ADDRESS=${await vault.getAddress()}`);
  console.log(`NEXT_PUBLIC_FANTASY_LEAGUE_ADDRESS=${await league.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
