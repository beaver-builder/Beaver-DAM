/* eslint-disable @typescript-eslint/no-unused-vars */
import {run } from "hardhat";
import { delay, isHardhatNetwork } from '../utils';

async function verify(contractPath:string, contractNane:string, args:any, contractAddress:string) {


  console.log(`\n -- ${contractNane} --\n`);

  try {

    if (isHardhatNetwork()) throw new Error("Ne")

    await run('verify:verify', {
      address: contractAddress,
      constructorArguments: args,
      contract: contractPath,
    });
  
    
  } catch (error) {
   
    console.log('\nERROR VERIFY CONTRACT\n')
    console.log(error)
    console.log('\nERROR VERIFY CONTRACT\n')
    
  }

  console.log('\n====================\n\n')

}

export async function verifyContract(){
  const args = [1000000] as const;
  await verify("contracts/USDCVALOCRACY.sol:USDCVALOCRACY","USCT VALOCRACY",args, "0x63bE56747FECE0487F526008d7070713dBe3FfC5")
}




