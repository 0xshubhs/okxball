import { ethers, network } from "hardhat";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

/**
 * Opens a FRESH league and points the web app at it.
 *
 *   pnpm --filter @okxball/contracts open-league:testnet   (X Layer testnet, 1952)
 *   pnpm --filter @okxball/contracts open-league:mainnet   (X Layer mainnet, 196)
 *
 * Use this before a live demo: once an earlier league has been locked & settled
 * (by the settle script), join/submit revert on it. This creates a new open
 * league and writes NEXT_PUBLIC_LEAGUE_ID into web/.env.local so the app's
 * join → submit → claim flow targets the open one. Owner-only.
 */
const ENTRY_FEE = ethers.parseEther(process.env.ENTRY_FEE_OKB ?? "0.02");
const GAMEWEEK = BigInt(process.env.GAMEWEEK ?? "14");
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
      const a = JSON.parse(readFileSync(file, "utf8"))[key];
      if (a?.fantasyLeague && a.fantasyLeague !== ZERO) return a;
    }
  }
  return { fantasyLeague: process.env.NEXT_PUBLIC_FANTASY_LEAGUE_ADDRESS };
}

function explorerBase() {
  if (network.name === "xlayer") return "https://www.oklink.com/x-layer";
  if (network.name === "xlayerTestnet") return "https://www.oklink.com/x-layer-testnet";
  return "";
}

/** Merge NEXT_PUBLIC_LEAGUE_ID into web/.env.local without clobbering other keys. */
function writeLeagueId(id: bigint) {
  const file = resolve(__dirname, "../../web/.env.local");
  const lines = existsSync(file)
    ? readFileSync(file, "utf8").split("\n").filter((l) => l.trim())
    : [];
  const kept = lines.filter((l) => !l.startsWith("NEXT_PUBLIC_LEAGUE_ID="));
  writeFileSync(file, [...kept, `NEXT_PUBLIC_LEAGUE_ID=${id}`].join("\n") + "\n");
}

async function main() {
  const [me] = await ethers.getSigners();
  const a = loadAddresses();
  if (!a.fantasyLeague || a.fantasyLeague === ZERO) {
    throw new Error(`No deployed FantasyLeague for ${network.name}. Deploy first.`);
  }
  const league = await ethers.getContractAt("FantasyLeague", a.fantasyLeague);

  const newId: bigint = await league.nextLeagueId();
  const tx = await league.createLeague(ENTRY_FEE, GAMEWEEK);
  await tx.wait();
  const ex = explorerBase();

  writeLeagueId(newId);
  console.log(`Opened league #${newId} (entry ${ethers.formatEther(ENTRY_FEE)} OKB, GW ${GAMEWEEK}).`);
  if (ex) console.log(`  ${ex}/tx/${tx.hash}`);
  console.log(`Wrote NEXT_PUBLIC_LEAGUE_ID=${newId} to web/.env.local — restart the web app.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
