import "hardhat/types/network";
import type { HardhatEthers } from "@nomicfoundation/hardhat-ethers/types";

declare module "hardhat/types/network" {
  interface NetworkConnection<
    ChainTypeT extends ChainType | string = DefaultChainType,
  > {
    ethers: HardhatEthers;
  }
}
