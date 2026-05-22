import { expect } from "chai";
import { ethers } from "hardhat";

describe("Agentic Fantasy Football OS", () => {
  async function deployAll() {
    const [owner, alice] = await ethers.getSigners();

    const playerNFT = await (await ethers.getContractFactory("PlayerNFT")).deploy();
    const oracle = await (await ethers.getContractFactory("ScoringOracle")).deploy();
    const vault = await (await ethers.getContractFactory("PayoutVault")).deploy();
    const league = await (
      await ethers.getContractFactory("FantasyLeague")
    ).deploy(
      await playerNFT.getAddress(),
      await oracle.getAddress(),
      await vault.getAddress()
    );

    await vault.setDistributor(await league.getAddress(), true);
    return { owner, alice, playerNFT, oracle, vault, league };
  }

  it("mints and trains a Player NFT", async () => {
    const { alice, playerNFT } = await deployAll();
    await playerNFT.connect(alice).mint(2, { value: ethers.parseEther("0.3") });
    expect(await playerNFT.balanceOf(alice.address)).to.equal(1n);
    expect(await playerNFT.levelOf(1)).to.equal(1n);

    // train 7x -> 560 xp -> 1 level up (XP_PER_LEVEL = 500)
    for (let i = 0; i < 7; i++) {
      await playerNFT.connect(alice).train(1, { value: ethers.parseEther("0.02") });
    }
    expect(await playerNFT.levelOf(1)).to.equal(2n);
  });

  it("runs a full league: join, lineup, oracle scoring, settle, payout", async () => {
    const { owner, alice, playerNFT, oracle, vault, league } = await deployAll();

    // Alice mints two players
    await playerNFT.connect(alice).mint(4, { value: ethers.parseEther("1.5") }); // token 1
    await playerNFT.connect(alice).mint(1, { value: ethers.parseEther("0.12") }); // token 2

    await league.createLeague(ethers.parseEther("2"), 14); // league #1, GW14
    await league.connect(alice).joinLeague(1, { value: ethers.parseEther("2") });

    await league.connect(alice).submitLineup(1, [1, 2], 1); // captain token 1

    // Oracle reports GW14 points
    await oracle.reportPoints(14, [1, 2], [10, 5]);

    await league.lock(1);
    await league.settle(1);

    // captain doubles token 1: 10*2 + 5 = 25
    expect(await league.scoreOf(1, alice.address)).to.equal(25n);
    // entire pool allocated to the sole (winning) manager
    expect(await vault.claimable(alice.address)).to.equal(ethers.parseEther("2"));

    const before = await ethers.provider.getBalance(alice.address);
    await vault.connect(alice).claim(1);
    const after = await ethers.provider.getBalance(alice.address);
    expect(after).to.be.greaterThan(before);
  });
});
