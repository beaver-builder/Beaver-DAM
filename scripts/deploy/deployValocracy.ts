/* eslint-disable @typescript-eslint/no-unused-vars */
import hardhat, { network } from "hardhat";
import { delay, isHardhatNetwork, normalizeVerifyArgs } from '../utils';
import {
  LpValocracy,
  Valocracy,
  USDCVALOCRACY
} from 'types/ethers-contracts';
import env from '../../src/config';

const {ethers} = await network.connect();

async function deploy(contractPath:string, contractNane:string, args:any) {

  console.log(`\n -- ${contractNane} --\n`);

  const contractFactory = await ethers.getContractFactory(contractPath);
  
  const contract = await contractFactory.deploy(...args)
  console.log("dale")
  const deploymentReceipt = await contract.deploymentTransaction()?.wait();
  await contract.waitForDeployment();

  const deployTransactionHash = await deploymentReceipt?.getBlock();
  const deployBlockNumber = await deploymentReceipt?.getTransaction();
    
  console.log('\nBLOCO ->',deployTransactionHash?.number);
  console.log('HASH ->',deployBlockNumber?.hash,'\n');

  let deploymentCost = 0;
  if(deploymentReceipt?.gasUsed && deploymentReceipt?.gasPrice){
    const gasUsed = deploymentReceipt?.gasUsed;
    const gasPrice = deploymentReceipt?.gasPrice;
    deploymentCost = Number(ethers.formatEther(gasUsed * gasPrice))

    console.log('Deployment cost:', deploymentCost)
  }
    
  const contractAddress = await contract.getAddress();
  console.log(`\nDeployed to --> ${contractAddress}\n`);

  try {
    if (!await isHardhatNetwork()) {
      console.log('Waiting 60 seconds before verifying contract...');
      await delay(60000);
      const constructorArgs = Array.isArray(args)
        ? normalizeVerifyArgs([...args])
        : [];
      await hardhat.tasks.getTask(["verify", "etherscan"]).run({
        address: contractAddress,
        constructorArgs,
        contract: contractPath,
      });
    }
  } catch (error) {
    console.log('\nERROR VERIFY CONTRACT\n');
    console.log(error);
    console.log('\nERROR VERIFY CONTRACT\n');
  }


  console.log('\n====================\n\n')

  return {
    contract:contract,
    contractAddress:contractAddress,
    deploymentCost:deploymentCost
  };

}

export async function deployUsdtValocracy(){
  const args = [1000000] as const;
  await deploy("contracts/USDCVALOCRACY.sol:USDCVALOCRACY","USDT VALOCRACY",args)
}

export async function deployValocracy(){
 
  const argsLpValocracy = [(2n ** 200n),env.ADDRESS_LINEA_OWNER_BEAVER] as const;
  const LpValocracy = await deploy("contracts/LpValocracy.sol:LpValocracy","LP VALOCRACY",argsLpValocracy)

  const argsValocracy = [
    "ipfs://QmTL2h88FxDcURt5S7AF1B4rV1SRA7PHH5HZqbxvSHGYW5",
    LpValocracy.contractAddress,
    env.USDC_CONTRACT_ADDRESS,
    ethers.MaxUint256,
    env.ADDRESS_LINEA_OWNER_BEAVER
  ] as const;

  await deploy("contracts/Valocracy.sol:Valocracy","VALOCRACY",argsValocracy)
}
