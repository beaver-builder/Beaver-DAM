/* eslint-disable @typescript-eslint/no-unused-vars */
import { ethers,network,run } from "hardhat";
import { delay, isHardhatNetwork } from '../utils';
import {
  LpValocracy,
  Valocracy,
  USDCVALOCRACY
} from 'typechain-types';
import env from '../../src/config';


async function estimateDeployCost(contractPath: string,contractNane:string, args: any) {
    console.log(`\n -- ${contractNane} --\n`);

  // Criar a fábrica do contrato
  const contractFactory = await ethers.getContractFactory(contractPath);

  // Estimar o gas necessário para deploy
  const gasEstimate = await ethers.provider.estimateGas(await contractFactory.getDeployTransaction(...args));

  // Obter preço do gas atual
  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice;

  if (!gasPrice) throw new Error("Não foi possível obter o preço do gás.");

  // Calcular custo total (gasEstimate * gasPrice)
  const estimatedCost = gasEstimate * gasPrice;
  const estimatedCostInETH = ethers.formatEther(estimatedCost.toString());

  console.log(`\nCusto estimado de deploy: ${estimatedCostInETH} ETH`);
  console.log(`Gas estimado: ${gasEstimate.toString()}`);
  console.log(`Preço do gás: ${ethers.formatUnits(gasPrice, "gwei")} Gwei\n`);

  return {
    estimatedGas: gasEstimate,
    estimatedCost: estimatedCostInETH,
  };
}


export async function deployUsdtValocracy(){
  const args = [1000000] as const;
  await estimateDeployCost("contracts/USDCVALOCRACY.sol:USDCVALOCRACY","USDT VALOCRACY",args)
}

export async function deployValocracy(){
 
  const argsLpValocracy = [(2n ** 200n),env.ADDRESS_LINEA_OWNER_BEAVER] as const;
  await estimateDeployCost("contracts/LpValocracy.sol:LpValocracy","LP VALOCRACY",argsLpValocracy)

  const argsValocracy = [
    "ipfs://QmTL2h88FxDcURt5S7AF1B4rV1SRA7PHH5HZqbxvSHGYW5",
    ethers.ZeroAddress,
    env.USDC_CONTRACT_ADDRESS,
    ethers.MaxUint256,
    env.OWNER_VALOCRACY_ADDRESS
  ] as const;

  await estimateDeployCost("contracts/Valocracy.sol:Valocracy","VALOCRACY",argsValocracy)
}


