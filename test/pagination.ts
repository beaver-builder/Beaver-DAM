/* eslint-disable @typescript-eslint/no-unused-vars */

import { ethers, } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Valocracy,LpValocracy, USDT } from "../typechain-types";
import { deployContract } from "../scripts/deploy/deployContract";
import { deployValocracy } from "../scripts/deploy/deployValocracy";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";

describe("ECONOMIC TOKEN DATA\n\n", function () {

  let valocracy: Valocracy;
  let lpContract: LpValocracy;
  let USDTContract: LpValocracy;
  let OTHER_HOLDER: HardhatEthersSigner;
  let THIRD_HOLDER: HardhatEthersSigner;
  let OWNER:HardhatEthersSigner;
  let valocracyAddress: string;
  let lpContractAddress: string;
  let USDTAddress: string;

  before(async function () {

    //Carteira que faz deploy e assina as tranzações
    
    //Outra carteira de teste
    [OWNER,OTHER_HOLDER,THIRD_HOLDER] = await ethers.getSigners();

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

    console.log('\n\nOWNER -->',OWNER.address)
    console.log('OTHER HOLDER -->',OTHER_HOLDER.address)
    console.log('THIRD HOLDER -->',THIRD_HOLDER.address,'\n\n')
  });

  /**
   * Transfere usdt para o contrato
   */
  it("Transfer 100 usdt to contract", async function () {
   
    //console.log("\n ===================  \n\n")

    //console.log("transferencia USDT para o contrato")
    const amountUSDT = ethers.parseUnits("1000", 18);
    await USDTContract.transfer(valocracyAddress,amountUSDT);

    const balanceUsdtValocracy = await USDTContract.balanceOf(valocracyAddress);
    //console.log("QUANTIDADE DE USDT NO CONTRATO DA VALOCRACIA -> ",ethers.formatUnits(balanceUsdtValocracy,18),"\n\n");

    console.log("\n===================  \n\n")
  });

  /**
   * Aprova os Lps do OWNER para o contrato usar
   */
  it("Aprove LP to valocracy", async function () {
    //console.log("Aprovando LP para o contrato da valocracia")
    const amountToToken = ethers.parseUnits("1000000000", 18);
    await lpContract.approve(valocracyAddress,amountToToken)
    const allowance = await lpContract.allowance(OWNER.address,valocracyAddress)     
    //console.log('ALLOWANCE',ethers.formatUnits(allowance,18)); 

    console.log("\n =================== \n\n")
  });

  /**
   * TODOS OS TOKENS
   */
  it("All tokens", async function () {

    console.log('----- ALL TOKENS -----')
    //expect(await tokenHolder.supportsInterface(IERC165)).to.equal(true);
    const tokens = await valocracy.fetchAllTokens(0,50,true);
    console.log('ALL TOKENS -->',tokens);

    console.log("\n ===================  \n\n")
  });

  /**
   * Minta nft gov e eco para o OWNER
   */
  it("Mint token OWNER", async function () {

    console.log("MINTANDO NFT OWNER")
    await valocracy.mintValocracy(OWNER.address,"dale nftezinho 1",10);
    await valocracy.mintValocracy(OWNER.address,"dale nftezinho 1",10);
    //await valocracy.mintValocracy(OWNER.address,1,"dale nftezinho 1",10);
    // await valocracy.mintValocracy(OWNER.address,1,"dale nftezinho 1",3);

    console.log("\n ===================  \n\n")
  });

  /**
  * Minta nft gov e eco para o OTHER HOLDER
  */
  it("Mint token OTHER HOLDER", async function () {

    console.log("MINTANDO NFT OTHER HOLDER")
    await valocracy.mintValocracy(OTHER_HOLDER.address,"dale nftezinho 2",10);
    await valocracy.mintValocracy(OTHER_HOLDER.address,"dale nftezinho 2",10);
    // await valocracy.mintValocracy(OTHER_HOLDER.address,1,"dale nftezinho 3",5);
    // await valocracy.mintValocracy(OTHER_HOLDER.address,1,"dale nftezinho 4",2);

    console.log("\n ===================  \n\n")
  });

  /**
  * TODOS OS TOKENS
  */
  it("All tokens", async function () {
    console.log('----- ALL TOKENS -----')
    const tokens = await valocracy.fetchAllTokens(0,50,true);
    console.log('ALL TOKENS -->',tokens);
    console.log("\n ===================  \n\n")
  });

  /**
   * Retorna os ids das nfts do OWNER
   */
  it("Get OWNER tokens ids", async function () {
    expect( await valocracy.fetchOwnerTokens(OWNER.address,0,50,true)).to.deep.equal([ [ 1n, 2n ], [ 3n, 4n ] ]);

    const tokens = await valocracy.fetchOwnerTokens(OWNER.address,0,50,true);
    console.log('NFTS IDs do OWNER -->',tokens);

    console.log("\n ===================  \n\n")
  });

  /**
   * Retorna os ids das nfts do OWNER
   */
  it("Get OWNER tokens ids", async function () {
      
    const tokens = await valocracy.fetchOwnerTokens(OWNER.address,0,50,false);
    console.log('NFTS IDs do OWNER DESCENDENTE-->',tokens);
    expect( await valocracy.fetchOwnerTokens(OWNER.address,0,50,false)).to.deep.equal([ [ 3n, 4n ] , [ 1n, 2n ] ]);

    console.log("\n ===================  \n\n")
  });

  /**
   * Todos os tokens
   */
  it("All tokens", async function () {
  
    const tokens = await valocracy.fetchAllTokens(0,50,true);
    console.log('TODOS OS TOKENS -->',tokens);
    expect( await valocracy.fetchAllTokens(0,50,true)).to.deep.equal([ [ 1n, 2n ], [ 3n, 4n ] , [ 5n, 6n ] , [ 7n, 8n ] ]);

    console.log("\n ===================  \n\n")
  });

  /**
   * Todos os tokens
   */
  it("All token", async function () {
    
    const tokens = await valocracy.fetchAllTokens(0,50,false);
    console.log('TODOS OS TOKENS REVERSO-->',tokens);
    expect( await valocracy.fetchAllTokens(0,50,false)).to.deep.equal([[ 7n, 8n ] , [ 5n, 6n ], [ 3n, 4n ] , [ 1n, 2n ] ]);

    console.log("\n ===================  \n\n")
  });

});

