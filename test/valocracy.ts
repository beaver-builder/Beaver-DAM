/* eslint-disable @typescript-eslint/no-unused-vars */

import { ethers, } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Valocracy,LpValocracy, USDT } from "../typechain-types";
import { deployContract } from "../scripts/deploy/deployContract";
import { deployValocracy } from "../scripts/deploy/deployValocracy";

describe("VALOCRACY\n\n", function () {

  let valocracy: Valocracy;
  let lpContract: LpValocracy;
  let USDTContract: LpValocracy;
  let otherHolder: SignerWithAddress;
  let deployed: SignerWithAddress;
  let owner:SignerWithAddress;
  let valocracyAddress: string;
  let lpContractAddress: string;
  let USDTAddress: string;

  before(async function () {

    //Carteira que faz deploy e assina as tranzações
    
    //Outra carteira de teste
    [deployed,otherHolder ] = await ethers.getSigners() as unknown as SignerWithAddress[];
    owner = deployed;
    /**
     * @valocracy  contrato principal da Valocracia
     * @lpContract contrato LP token(ERC20)
     */
    [valocracy,lpContract,USDTContract]  = await Promise.all([
      deployValocracy(),
      deployContract(10000000,"LpValocracy"),
      deployContract(100,"USDT")
    ]) as [Valocracy, LpValocracy,USDT];

    /**
     * Endereços dos contratos
     */
    valocracyAddress = await valocracy.getAddress();
    lpContractAddress = await lpContract.getAddress();
    USDTAddress = await USDTContract.getAddress();

    console.log('\n\nowner.address -->',owner.address)
    console.log('owner.otherHolder -->',otherHolder.address,'\n\n')
  
  });

  /**
   * Seta o endereço do token LP no contrato
   */
  it("Set lp address", async function () {
      await valocracy.setLpAddress(lpContractAddress);
  });

  /**
   * Transfere usdt para o contrato
   */
  it("Transfer 100 usdt to contract", async function () {

    console.log("transferencia para o contrato.")
    const amountUSDT = ethers.parseUnits("100", 18);
    await USDTContract.transfer(valocracyAddress,amountUSDT);

    const balanceUsdtValocracy = await USDTContract.balanceOf(valocracyAddress);
    console.log("Quantidade de USDT na Valocracia -> ",ethers.formatUnits(balanceUsdtValocracy,18),"\n\n");
  });


  /**
   * Retorna a quantidade de contrato LP token(ERC20)
   */
  it("LP balance", async function () {

    console.log("QUANTOS LP TEM O CONTRATO")
    
    const amountToToken = ethers.parseUnits("10", 18);
    await lpContract.approve(valocracyAddress,amountToToken)
    const allowance = await lpContract.allowance(owner.address,valocracyAddress)     
    console.log('ALLOWANCE',ethers.formatUnits(allowance,18)); 
    const balanceLp = await lpContract.balanceOf(valocracyAddress)
    console.log("Quantidade de LP tokens mintados valocracyAddress->",ethers.formatUnits(balanceLp,18));
    console.log("\n\n")
  });

  /**
   * Retorna os ids das nfts do owner
   */
  it("Get my tokens ids", async function () {
    const tokens = await valocracy.getOwnerTokensEconomics(owner.address);
    console.log('Get my tokens ids',tokens);
  });

  /**
   * Minta nft gov e eco para o owner
   */
  it("Mint token", async function () {
    await valocracy.mintValocracy(owner.address,1,"dale nftezinho",10);
  });

  /**
   * Retorna os ids das nfts do owner
   */
  it("owner tokens ids", async function () {
    const tokens = await valocracy.getOwnerTokensEconomics(owner.address);
    console.log("DEPLOYED TOKENS -->",tokens);
  });

  /**
   *  Transfere nft eco para o otherHolder
   */
  it("Tranfer token", async function () {
    await valocracy.transferFrom(owner.address,otherHolder.address,2n);
  });

  /**
   * Retorna os ids das nfts do owner
   */
  it("owner tokens ids", async function () {
    const tokens = await valocracy.getOwnerTokensEconomics(owner.address);
    console.log("OWNER TOKENS -->",tokens);
  });

  /**
   * Retorna os ids das nfts do owner
   */
  it("other tokens ids", async function () {
     const tokens = await valocracy.getOwnerTokensEconomics(otherHolder.address);
     console.log("OTHER TOKENS -->",tokens);
  });

  /**
   * Transfere LP para a nft economica
   */
  // it("Transfer LP to token", async function () {
  //   const amountToToken = ethers.parseUnits("10", 18);

  //   const tokens = await valocracy.transferERC20ToToken(lpContractAddress,2n,amountToToken,'0x');
  // });

  /**
   * Retorna a quantidade de LP do token eco
   */
  it("Balance LP token 2", async function () {
    const ownerToken = await valocracy.ownerOf(1n);
    console.log('OWNER TOKEN == 1 == ->',ownerToken)
    // const balanceToken2 = await valocracy.fetchEconomicPowerOfEffort(2n);
    // console.log('TOTAL LP TOKEN->',ethers.formatUnits(balanceToken2,18))
  });
  
});

