/* eslint-disable @typescript-eslint/no-unused-vars */

import { ethers, } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Valocracy,LpValocracy, USDT, Effort} from "../typechain-types";
import { deployContract } from "../scripts/deploy/deployContract";
import { deployValocracy } from "../scripts/deploy/deployValocracy";

describe("MINT AND CLAIM\n\n", function () {

  let valocracy: Valocracy;
  let lpContract: LpValocracy;
  let USDTContract: LpValocracy;
  let EffortContract:Effort;
  let OTHER_HOLDER: SignerWithAddress;
  let THIRD_HOLDER: SignerWithAddress;
  let OWNER:SignerWithAddress;
  let valocracyAddress: string;
  let effortAddress: string
  let lpContractAddress: string;
  let USDTAddress: string;

  before(async function () {

    //Carteira que faz deploy e assina as tranzações
    
    //Outra carteira de teste
    [OWNER,OTHER_HOLDER,THIRD_HOLDER] = await ethers.getSigners() as unknown as SignerWithAddress[];
   
    /**
     * @valocracy  contrato principal da Valocracia
     * @lpContract contrato LP token(ERC20)
     */
    [lpContract,USDTContract,EffortContract]  = await Promise.all([
      deployContract(1000000000,"LpValocracy"),
      deployContract(1000,"USDT"),
      deployContract(undefined,"contracts/external/Effort.sol:Effort")
    ]) as [LpValocracy,USDT,Effort];

    effortAddress = await EffortContract.getAddress();

    valocracy = await deployValocracy(effortAddress);
    
    /**
     * Endereços dos contratos
     */
    valocracyAddress = await valocracy.getAddress();
    lpContractAddress = await lpContract.getAddress();
    USDTAddress = await USDTContract.getAddress();

    console.log('\n\nOWNER -->',OWNER.address)
    console.log('OTHER HOLDER -->',OTHER_HOLDER.address)
    console.log('THIRD HOLDER -->',THIRD_HOLDER.address,'\n\n')
  
  });

  it("Check sender call Effor", async function () {

    console.log("ADDRESS SENDER CALL EFFORT\n")
    const addressSender = await valocracy.CallCheckSend()

    console.log("ADDRESS SENDER --->",addressSender);

    console.log("\n===================  \n\n")
  });

  /**
   * Transfere usdt para o contrato
   */
  // it("Transfer 100 usdt to contract", async function () {

  //   console.log("transferencia USDT para o contrato")
  //   const amountUSDT = ethers.parseUnits("1000", 18);
  //   await USDTContract.transfer(valocracyAddress,amountUSDT);

  //   const balanceUsdtValocracy = await USDTContract.balanceOf(valocracyAddress);
  //   console.log("QUANTIDADE DE USDT NO CONTRATO DA VALOCRACIA -> ",ethers.formatUnits(balanceUsdtValocracy,18),"\n\n");

  //   console.log("\n===================  \n\n")
  // });

  //   /**
  //  * Seta o endereço do token LP no contrato
  //  */
  //   it("Set lp address", async function () {
  //     console.log("seta o endereço LP token na valocracia")
  //     await valocracy.setLpAddress(lpContractAddress);
  //     console.log("\n===================  \n\n")
  //   });
  
  //   /**
  //    * Retorna os ids das nfts do OWNER
  //    */
  //   it("Aprove LP to valocracy", async function () {

  //     console.log("Aprovando LP para o contrato da valocracia")

  //     const amountToToken = ethers.parseUnits("1000000000", 18);
  //     await lpContract.approve(valocracyAddress,amountToToken)

  //     const allowance = await lpContract.allowance(OWNER.address,valocracyAddress)     
  //     console.log('ALLOWANCE',ethers.formatUnits(allowance,18)); 
  
  //     console.log("\n =================== \n\n")
  //   });

  // /**
  //  * Retorna os ids das nfts do OWNER
  //  */
  // it("Get my tokens ids", async function () {
  //   const tokens = await valocracy.getOwnerTokensEconomics(OWNER.address);
  //   console.log('NFTS IDs do OWNER -->',tokens);

  //   console.log("\n ===================  \n\n")
  // });

  // /**
  //  * Minta nft gov e eco para o OWNER
  //  */
  // it("Mint token", async function () {

  //   console.log("MINTANDO NFT")
  //   await valocracy.mintValocracy(OWNER.address,1,"dale nftezinho 1",10);

  //   console.log("\n ===================  \n\n")
  // });

  // /**
  //  * Retorna os ids das nfts do OWNER
  //  */
  // it("Get my tokens ids", async function () {
  //   const tokens = await valocracy.getOwnerTokensEconomics(OWNER.address);
  //   console.log('NFTS IDs do OWNER -->',tokens);

  //   console.log("\n ===================  \n\n")
  // });

  // it("Transfer nft governament", async function () {
  //   //valocracy.approve(OTHER_HOLDER.address,1n)
  //   valocracy.transferFrom(OWNER.address,OTHER_HOLDER.address,2n);
  //   //valocracy.approve(OTHER_HOLDER.address,1n)
  //   const ownerToken1 = await valocracy.ownerOf(2n)
  //   console.log('OWNER TOKEN 1 -->', ownerToken1); 

  //   console.log("\n ===================  \n\n")
  // });

  // it("Transfer nft governament", async function () {

  //   const ownerToken1 = await valocracy.ownerOf(2n)
  //   console.log('OWNER TOKEN 1 -->', ownerToken1); 

  //   console.log("\n ===================  \n\n")
  // });
  
});

