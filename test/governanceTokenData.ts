/* eslint-disable @typescript-eslint/no-unused-vars */

import { ethers, } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Valocracy,LpValocracy, USDT } from "../typechain-types";
import { deployContract } from "../scripts/deploy/deployContract";
import { deployValocracy } from "../scripts/deploy/deployValocracy";
import { expect } from "chai";

const twoFixed = (number:bigint,formatUnits=true) => {
  const numberFormat = formatUnits ? parseFloat(ethers.formatUnits(number,18)).toFixed(2) :
  parseFloat(number.toString()).toFixed(2)

  return Number(numberFormat)
}

describe("GOVERNANCE TOKEN DATA\n\n", function () {

  type Token = {
    governanceId: number;
    economicId: number;
  };

  type NestedTokenArray = Token[];

  let valocracy: Valocracy;
  let lpContract: LpValocracy;
  let USDTContract: LpValocracy;
  let OTHER_HOLDER: SignerWithAddress;
  let THIRD_HOLDER: SignerWithAddress;
  let OWNER:SignerWithAddress;
  let valocracyAddress: string;
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
  });

  it("total economic power", async function () {
    console.log("\n ===================  \n\n")
    const tokens = await valocracy.fetchTotalEconomicPower();
    console.log('TOTAL ECONOMIC POWER -->',tokens);
  });

  /**
   * Minta nft gov e eco para o OWNER
   */
  it("Mint token OWNER", async function () {
    console.log("\n ===================  \n\n")
    console.log("MINTANDO NFT OWNER")
    await valocracy.mintValocracy(OWNER.address,"dale nftezinho 1",1);
    await valocracy.mintValocracy(OWNER.address,"dale nftezinho 1",1);
    await valocracy.mintValocracy(OWNER.address,"dale nftezinho 1",1);
    await valocracy.mintValocracy(OWNER.address,"dale nftezinho 1",1);
    await valocracy.mintValocracy(OWNER.address,"dale nftezinho 1",1);    
    await valocracy.mintValocracy(OWNER.address,"dale nftezinho 1",1);
    await valocracy.mintValocracy(OWNER.address,"dale nftezinho 1",1);
    await valocracy.mintValocracy(OWNER.address,"dale nftezinho 1",1);
    await valocracy.mintValocracy(OWNER.address,"dale nftezinho 1",1);
    await valocracy.mintValocracy(OWNER.address,"dale nftezinho 1",1);
    await valocracy.mintValocracy(OWNER.address,"dale nftezinho 1",1);
  });

  /**
  * Minta nft gov e eco para o OTHER HOLDER
  */
  it("Mint token OTHER HOLDER", async function () {
    console.log("\n ===================  \n\n")
    console.log("MINTANDO NFT OTHER HOLDER")
    await valocracy.mintValocracy(OTHER_HOLDER.address,"dale nftezinho 2",1);
    await valocracy.mintValocracy(OTHER_HOLDER.address,"dale nftezinho 2",1);
    await valocracy.mintValocracy(OTHER_HOLDER.address,"dale nftezinho 2",1);
    await valocracy.mintValocracy(OTHER_HOLDER.address,"dale nftezinho 2",144);
    await valocracy.mintValocracy(OTHER_HOLDER.address,"dale nftezinho 2",144);
    await valocracy.mintValocracy(OTHER_HOLDER.address,"dale nftezinho 2",144);
    await valocracy.mintValocracy(OTHER_HOLDER.address,"dale nftezinho 2",144);
    await valocracy.mintValocracy(OTHER_HOLDER.address,"dale nftezinho 2",144);
    await valocracy.mintValocracy(OTHER_HOLDER.address,"dale nftezinho 2",144);
    await valocracy.mintValocracy(OTHER_HOLDER.address,"dale nftezinho 2",144);
    await valocracy.mintValocracy(OTHER_HOLDER.address,"dale nftezinho 2",144);

  });

  /**
  * TODOS TOKENS DE ECONOMICS 
  */
  it("ALL TOKENS ECONOMICS", async function () {
    console.log("\n ===================  \n\n")
    const balanceAlltokens = await valocracy.balanceOfAllTokens();
    console.log('BALANCE ALL TOKENS -->',balanceAlltokens)

    const tokens = await valocracy.fetchAllTokens(2,10,true);
    console.log('TODOS TOKENS DE ECONOMICOS-->',tokens);
    
  });

  /**
   * Retorna os ids das nfts do OWNER
   */
  it("Get OWNER tokens ids", async function () {
    console.log("\n ===================  \n\n")

    const tokens = await valocracy.fetchOwnerTokens(OWNER.address,0,50,true);

    console.log('NFTS IDs OWNER -->',tokens);

  });

  return

  /**
  * TODOS TOKENS DE GOVERNAÇA
  */
  it("ALL TOKENS GOVERNACE", async function () {
    console.log("\n ===================  \n\n")
    const tokens = await valocracy.fetchAllTokens(1,2,true);
    console.log('TODOS TOKENS DE GOVERNAÇA-->');
    tokens.map((e)  => {
      if(e.governanceId) console.log("GOV ->",e.governanceId)
    })
  });

  /**
  * Retorna os ids das nfts do OTHER OWNER
  */
  // it("Get OTHER HOLDER tokens ids", async function () {
  //   const tokens = await valocracy.fetchGovernanceTokens(OTHER_HOLDER,1,50,true);
  //   console.log('NFTS IDs do OTHER HOLDER -->',tokens);
  //   console.log("\n ===================  \n\n")
  // });


  it("total governace power", async function () {
    console.log("\n ===================  \n\n")
    const totalGovernance = await valocracy.fetchTotalGovernancePower();
    console.log('TOTAL GOVERNACE POWER -->',twoFixed(totalGovernance));
  });

  /**
  * Poder gov OWNER
  */
  it("Get OWNER power", async function () {
    console.log("\n ===================  \n\n")
    console.log("\n\n -- OWNER -- \n\n");

    //PODER ECONOMIO TOTAL
    const power = await valocracy.fetchGovernancePowerOfUser(OWNER.address);

    //PORCENTAGEM QUE USUÁRIO TEM NA TESOURARIA
    const UserGovPowerOfEffort = await valocracy.getRelativeGovernancePowerOfUser(OWNER.address);
  
    console.log('PODER GOV TOTAL OWNER -->',twoFixed(power));
    console.log('PORCENTAGEM TOTAL DE GOVERNANCE -->',twoFixed(UserGovPowerOfEffort));

    
  });

  /**
  * Poder gov OTHER HOLDER
  */
  it("Get OWNER power", async function () {

    console.log("\n\n -- OTHER_HOLDER -- \n\n");

    //PODER ECONOMIO TOTAL
    const power = await valocracy.fetchGovernancePowerOfUser(OTHER_HOLDER.address);

    //PORCENTAGEM QUE USUÁRIO TEM NA TESOURARIA
    const UserGovPowerOfEffort = await valocracy.getRelativeGovernancePowerOfUser(OTHER_HOLDER.address);
  
    console.log('PODER GOV TOTAL OTHER_HOLDER -->',twoFixed(power));
    console.log('PORCENTAGEM TOTAL DE GOVERNANCE -->',twoFixed(UserGovPowerOfEffort));

    console.log("\n ===================  \n\n")
  });

  /**
  * TOKEN 1
  */
  it("TOKEN 1 DATA", async function () {

    //PORCENTAGEM GOV DO TOKEN
    const relativePowerOfEffortToken1 = await valocracy.getRelativeGovernancePowerOfEffort(1);

    //PORCENTAGEM GOV DO TOKEN
    const PowerOfEffortToken1 = await valocracy.fetchGovernancePowerOfEffort(1);

    console.log('PORCENTAGEM GOV TOKEN 1 -->',twoFixed(relativePowerOfEffortToken1));
    console.log('PODER GOV TOKEN 1 -->',twoFixed(PowerOfEffortToken1));

    console.log("\n ===================  \n\n")
  });

    /**
   * Retorna os ids das nfts do OWNER
   */
  /**
  * Todos os tokens economicos
  */
  it("all tokens gov", async function () {
    const tokens = await valocracy.fetchAllTokens(0,50,true);

    //expect(tokens).to.deep.equal([[ 1n, 0n ], [ 3n, 4n ],[5n, 6n ]]);
    console.log('ALL TOKENS GOVERNANCE -->',tokens);
    tokens.map((e)  => {
      if(e.governanceId) console.log("eco ->",e.governanceId)
    })

    console.log("\n ===================  \n\n")
  });

});

