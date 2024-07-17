require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");
// ref: https://hardhat.org/hardhat-chai-matchers/docs/overview
require('@nomicfoundation/hardhat-chai-matchers');
// require('@nomiclabs/hardhat-waffle');
require("@openzeppelin/hardhat-upgrades");
require("@nomicfoundation/hardhat-verify");

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const PRIVATE_KEYS = process.env.WALLET_PRIVATE_KEYS.split(',');
const ETHERSCAN_KEY = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      chainId: 11155111,
      accounts: PRIVATE_KEYS
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_KEY
    },
  },
  sourcify: {
    // ref: https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify#verifying-on-sourcify
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
};
