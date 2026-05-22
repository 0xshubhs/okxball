import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    // X Layer mainnet (OKB gas)
    xlayer: {
      url: process.env.XLAYER_RPC || "https://rpc.xlayer.tech",
      chainId: 196,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    // X Layer testnet
    xlayerTestnet: {
      url: process.env.XLAYER_TESTNET_RPC || "https://testrpc.xlayer.tech",
      chainId: 195,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    // OKLink (X Layer) verification
    apiKey: {
      xlayer: process.env.OKLINK_API_KEY || "",
      xlayerTestnet: process.env.OKLINK_API_KEY || "",
    },
    customChains: [
      {
        network: "xlayer",
        chainId: 196,
        urls: {
          apiURL:
            "https://www.oklink.com/api/explorer/v1/contract/verify/async/api/xlayer",
          browserURL: "https://www.oklink.com/xlayer",
        },
      },
      {
        network: "xlayerTestnet",
        chainId: 195,
        urls: {
          apiURL:
            "https://www.oklink.com/api/explorer/v1/contract/verify/async/api/xlayer-test",
          browserURL: "https://www.oklink.com/xlayer-test",
        },
      },
    ],
  },
};

export default config;
