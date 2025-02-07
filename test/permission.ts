/* eslint-disable @typescript-eslint/no-unused-vars */

import { ethers, } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Valocracy,LpValocracy, USDT } from "../typechain-types";
import { deployContract } from "../scripts/deploy/deployContract";
import { deployValocracy } from "../scripts/deploy/deployValocracy";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";

describe("ECONOMIC TOKEN DATA\n\n", function () {

  type Token = {
    governanceId: number;
    economicId: number;
  };

  type NestedTokenArray = Token[];

  let valocracy: Valocracy;
  let lpContract: LpValocracy;
  let USDTContract: LpValocracy;
  let OTHER_HOLDER: HardhatEthersSigner;
  let THIRD_HOLDER: HardhatEthersSigner;
  let OWNER:HardhatEthersSigner;
  let valocracyAddress: string;
  let lpContractAddress: string;
  let USDTAddress: string;

  const twoFixed = (number:bigint,formatUnits=true) => {
    const numberFormat = formatUnits ? parseFloat(ethers.formatUnits(number,18)).toFixed(2) :
    parseFloat(number.toString()).toFixed(2)

    return Number(numberFormat)
  }

  before(async function () {

    //Carteira que faz deploy e assina as tranzações
    
    //Outra carteira de teste
    [OWNER,OTHER_HOLDER,THIRD_HOLDER] = await ethers.getSigners() as unknown as HardhatEthersSigner[];
   
    /**
     * @valocracy  contrato principal da Valocracia
     * @lpContract contrato LP token(ERC20)
     */
    [lpContract,USDTContract,]  = await Promise.all([
      deployContract(1000000000,"LpValocracy"),
      deployContract(1000,"USDT"),
    ]) as [LpValocracy,USDT];

    lpContractAddress = await lpContract.getAddress();
    USDTAddress = await USDTContract.getAddress();

    valocracy = await deployValocracy(lpContractAddress,USDTAddress);
    valocracyAddress = await valocracy.getAddress();
  });

  /**
   * Transfere usdt para o contrato
   */
  it("Transfer 100 usdt to contract", async function () {

    console.log("\n===================  \n\n")

    const amountUSDT = ethers.parseUnits("1000", 18);
    await USDTContract.transfer(valocracyAddress,amountUSDT);
    const balanceUsdtValocracy = await USDTContract.balanceOf(valocracyAddress);

    expect( ethers.formatUnits(balanceUsdtValocracy,18)).to.deep.equal("1000.0");
  });

  /**
   * Aprova os Lps do OWNER para o contrato usar
   */
  it("Aprove LP to valocracy", async function () {
    console.log("\n =================== \n\n");
    
    const amountToToken = ethers.parseUnits("1000000000", 18);
    await lpContract.approve(valocracyAddress,amountToToken)
    const allowance = await lpContract.allowance(OWNER.address,valocracyAddress)

    expect( ethers.formatUnits(allowance,18)).to.deep.equal("1000000000.0");

    lpContract.mint(OTHER_HOLDER.address,amountToToken) 
    const lpContractWithOtherHolder = lpContract.connect(OTHER_HOLDER);
    lpContractWithOtherHolder.approve(valocracyAddress,amountToToken)
  });

  /**
   * Retorna os ids das nfts do OWNER
   */
  it("Get OWNER tokens ids", async function () {
    console.log("\n ===================  \n\n")

    const tokens = await valocracy.fetchOwnerTokens(OWNER.address,0,50,true);
    expect( tokens).to.deep.equal([]);

    console.log('NFTS IDs OWNER -->',tokens);

  });

  it("total economic power", async function () {
    console.log("\n ===================  \n\n")

    const totalEconomicPower = await valocracy.fetchTotalEconomicPower();
    expect(totalEconomicPower).to.deep.equal(0);

    console.log('TOTAL ECONOMIC POWER -->',totalEconomicPower);
  });

  /**
   * Minta nft gov e eco para o OWNER
   */
  it("Mint token OWNER", async function () {
    console.log("\n ===================  \n\n")
    console.log("MINTANDO NFT OWNER")
    await valocracy.mintValocracy(OWNER.address,"dale nftezinho 1",10);
    //await valocracy.mintValocracy(OWNER.address,1,"dale nftezinho 1",10);
    // await valocracy.mintValocracy(OWNER.address,1,"dale nftezinho 1",3);
  });

  /**
   * Minta nft gov e eco para o OWNER
   */
  it("Add other holder contributor", async function () {
    console.log("\n ===================  \n\n")
    console.log("ADD OTHER HOLDER CONTRIBUTOR")
    await valocracy.manageContributor(OTHER_HOLDER.address,true);
  });

  /**
  * Minta nft gov e eco para o OTHER HOLDER
  */
  it("Mint token OTHER HOLDER", async function () {

    const valocracyWithOtherHolder = valocracy.connect(OTHER_HOLDER);

    console.log("\n ===================  \n\n")
    console.log("MINTANDO NFT OTHER HOLDER")
    await valocracyWithOtherHolder.mintValocracy(OTHER_HOLDER.address,"dale nftezinho 2",10);
    await valocracyWithOtherHolder.mintValocracy(OTHER_HOLDER.address,"dale nftezinho 3",10);
    // await valocracy.mintValocracy(OTHER_HOLDER.address,1,"dale nftezinho 4",2);    
  });

  
 

});

