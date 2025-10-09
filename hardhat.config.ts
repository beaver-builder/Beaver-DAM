
import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import { task } from "hardhat/config";
import HardhatIgnitionEthersPlugin from '@nomicfoundation/hardhat-ignition-ethers'
//import "./scripts/run-deploy"

import "tsconfig-paths/register";
import env from './src/config/index'
import { deployTask } from "./scripts/run-deploy";
import { verifyTask } from "./scripts/verify-contract"; 


const accounts = env.KEY_LINEA_DEPLOY_BEAVER !== undefined ? [ env.KEY_LINEA_DEPLOY_BEAVER] : [];

console.log("URL_RPC_NETWORK",env.URL_RPC_NETWORK)

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.24',
        
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          //evmVersion: "london",
        },
      },
      verify: {
        etherscan: {
          apiKey: env.ETHERSCAN_API_KEY,
        },
      },
      networks: {
        hardhat: {
          // mining: {
          //   auto: false,
          //   interval: 5000
          // }
          type: 'http',
          chainType: 'l1',
          url: 'http://127.0.0.1:8545',
        },

        lineaSepolia: {
          url: 'https://rpc.sepolia.linea.build',
          type: 'http',
          chainType: 'l1',
          chainId: 59141,
          accounts: accounts,
        },
        linea: {
          url: "https://rpc.linea.build",
          type: 'http',
          chainType: 'l1',
          chainId: 59144,
          accounts: accounts,
          
        }
      },
      plugins: [
        hardhatToolboxMochaEthers,
        hardhatVerify,
        HardhatIgnitionEthersPlugin
      ],
      tasks: [
        deployTask,
        verifyTask
      ],

};

export default config;
