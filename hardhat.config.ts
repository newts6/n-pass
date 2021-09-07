import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-contract-sizer";

import { resolve } from "path";

import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";

dotenvConfig({ path: resolve(__dirname, "./.env") });

import "./tasks/transfer-n";
import "./tasks/accounts";

const chainIds = {
  goerli: 5,
  ganache: 1337,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
};

// Ensure that we have all the environment variables we need.
let mnemonic: string;
if (!process.env.MNEMONIC) {
  throw new Error("Please set your MNEMONIC in a .env file");
} else {
  mnemonic = process.env.MNEMONIC;
}

let alchemyToken: string;
if (!process.env.ALCHEMY_TOKEN) {
  throw new Error("Please set your ALCHEMY_TOKEN in a .env file");
} else {
  alchemyToken = process.env.ALCHEMY_TOKEN;
}

let etherscanApiKey: string;
if (!process.env.ETHERSCAN_API_KEY) {
  throw new Error("Please set your ETHERSCAN_API_KEY in a .env file");
} else {
  etherscanApiKey = process.env.ETHERSCAN_API_KEY;
}

function createConfig(network: keyof typeof chainIds): NetworkUserConfig {
  const url = `https://eth-${network}.alchemyapi.io/v2/${alchemyToken}`;
  return createConfigWithUrl(url, network);
}

function createConfigWithUrl(url: string, network: keyof typeof chainIds): NetworkUserConfig {
  return {
    accounts: {
      count: 10,
      initialIndex: 0,
      mnemonic,
      path: "m/44'/60'/0'/0",
    },
    chainId: chainIds[network],
    url,
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
      forking: { url: `https://eth-mainnet.alchemyapi.io/v2/${alchemyToken}`, blockNumber: 13176923 },
      chainId: chainIds.ganache,
    },
    goerli: createConfig("goerli"),
    kovan: createConfig("kovan"),
    rinkeby: createConfig("rinkeby"),
    ropsten: createConfig("ropsten"),
    mainnet: createConfig("mainnet"),
    forkedMainnet: createConfigWithUrl("http://178.128.113.162:8545", "ganache"),
  },
  etherscan: {
    apiKey: etherscanApiKey,
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.6",
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/solidity-template/issues/31
        bytecodeHash: "none",
      },
      // You should disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
    disambiguatePaths: false,
  },
};

export default config;
