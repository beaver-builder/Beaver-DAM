/* eslint-disable @typescript-eslint/no-unused-vars */
import { ethers, network,run } from 'hardhat';
import { Address } from 'cluster';
import { LpValocracy, USDCVALOCRACY } from "../../typechain-types";
import { delay, isHardhatNetwork } from '../utils';
import env from '@/config/index';

export async function deployContractUSDT() {
  
  const contractFactory = await ethers.getContractFactory('contracts/USDCVALOCRACY.sol:USDCVALOCRACY');
  const args = [1000] as const;

  const contract = await contractFactory.deploy(...args);
  await contract.waitForDeployment();

  return contract;
  
}

export async function deployContractLpValocracy(ownerValocracyAddress?:string) {

  const ownerValocracy = ownerValocracyAddress ? ownerValocracyAddress : env.ADDRESS_LINEA_OWNER_BEAVER

  const contractFactory = await ethers.getContractFactory('contracts/LpValocracy.sol:LpValocracy');
  const args = ["1000000000000000000000000",ownerValocracy] as const;

  const contract = await contractFactory.deploy(...args);
  await contract.waitForDeployment();

  return contract;
  
}

