import {
    Valocracy,
} from 'typechain-types';
import { ethers } from "hardhat";
import { MintData } from '@/types/MintData.type';

export const valocracyMintCost = async (contract:Valocracy,mint:MintData) => {

   /**
    * gasEstimate e gasPrice retornam em Wei (18 casas decimais)
    */
    const gasEstimate = await contract.mintValocracy.estimateGas(
        mint.to,
        mint._tokenURIGovernance,
        mint._tokenURIEconomic,
        mint.rarity,
        mint.tokenMetadata,
        708018308554095n //número aleatório para preencher o campo
    );

    const feeData = await ethers.provider.getFeeData()
    const gasPrice = feeData.gasPrice

    if(!gasPrice) throw new Error("Gás price não obtido!")

    // console.log("\nEstimate gas used ->",gasEstimate)
    // console.log("Estimate gas price ->",gasPrice,)
    
    const transactionCost = gasEstimate * gasPrice
    //const transactionCostETH = Number(ethers.formatEther(transactionCost))

    // console.log('Transaction cost', transactionCost)
    // console.log('Transaction cost ETH', transactionCostETH)
    
    return transactionCost

}

export const valocracyMintBatchCost = async (contract:Valocracy,mintBatch:MintData[]) => {

    /**
     * gasEstimate e gasPrice retornam em Wei (18 casas decimais)
     */
     const gasEstimate = await contract.mintBatch.estimateGas(
        mintBatch
     );
 
     const feeData = await ethers.provider.getFeeData()
     const gasPrice = feeData.gasPrice
 
     if(!gasPrice) throw "Gás price não obtido!"
 
     // console.log("\nEstimate gas used ->",gasEstimate)
     // console.log("Estimate gas price ->",gasPrice,)
     
     const transactionCost = gasEstimate * gasPrice
     //const transactionCostETH = Number(ethers.formatEther(transactionCost))
 
     // console.log('Transaction cost', transactionCost)
     // console.log('Transaction cost ETH', transactionCostETH)
 
     return transactionCost / BigInt(mintBatch.length)
 
 }