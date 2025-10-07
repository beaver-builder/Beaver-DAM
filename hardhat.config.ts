import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "tsconfig-paths/register";
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-contract-sizer';
import env from './src/config/index'


const accounts = env.KEY_LINEA_DEPLOY_BEAVER !== undefined ? [ env.KEY_LINEA_DEPLOY_BEAVER] : [];


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

      networks: {

      },
      plugins: [hardhatToolboxMochaEthers],

};

export default config;