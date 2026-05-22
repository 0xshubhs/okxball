import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@okxweb3/hardhat-explorer-verify";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      // X Layer is a Polygon CDK zkEVM — keep the EVM target conservative.
      evmVersion: "paris",
    },
  },
  networks: {
    // X Layer mainnet (chainId 196, OKB gas)
    xlayer: {
      url: process.env.XLAYER_RPC || "https://rpc.xlayer.tech",
      chainId: 196,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    // X Layer testnet (chainId 1952 — "terigon"; NOT the dead 195/X1 testnet)
    xlayerTestnet: {
      url: process.env.XLAYER_TESTNET_RPC || "https://testrpc.xlayer.tech/terigon",
      chainId: 1952,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  // OKLink verification via OKX's official plugin (not Etherscan-compatible).
  // Verify with: pnpm --filter @aff/contracts exec hardhat okverify --network xlayerTestnet <ADDRESS>
  okxweb3explorer: {
    apiKey: process.env.OKLINK_API_KEY || "",
  },
};

export default config;
