/* eslint-disable @typescript-eslint/no-unused-vars */

import { ethers, } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Valocracy,LpValocracy, USDT } from "../typechain-types";
import { deployContract } from "../scripts/deploy/deployContract";
import { deployValocracy } from "../scripts/deploy/deployValocracy";

describe("ECONOMIC TOKEN DATA\n\n", function () {

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

    console.log("transferencia USDT para o contrato")
    const amountUSDT = ethers.parseUnits("1000", 18);
    await USDTContract.transfer(valocracyAddress,amountUSDT);

    const balanceUsdtValocracy = await USDTContract.balanceOf(valocracyAddress);
    console.log("QUANTIDADE DE USDT NO CONTRATO DA VALOCRACIA -> ",ethers.formatUnits(balanceUsdtValocracy,18),"\n\n");

    console.log("\n===================  \n\n")
  });

    /**
     * Aprova os Lps do OWNER para o contrato usar
     */
    it("Aprove LP to valocracy", async function () {

      console.log("Aprovando LP para o contrato da valocracia")

      const amountToToken = ethers.parseUnits("1000000000", 18);
      await lpContract.approve(valocracyAddress,amountToToken)

      const allowance = await lpContract.allowance(OWNER.address,valocracyAddress)     
      console.log('ALLOWANCE',ethers.formatUnits(allowance,18)); 
  
      console.log("\n =================== \n\n")
    });

  /**
   * Retorna os ids das nfts do OWNER
   */
  it("Get OWNER tokens ids", async function () {
    const tokens = await valocracy.getOwnerTokensEconomics(OWNER.address);
    console.log('NFTS IDs do OWNER -->',tokens);

    console.log("\n ===================  \n\n")
  });

  it("total economic power", async function () {
    const tokens = await valocracy.fetchTotalEconomicPower();
    console.log('TOTAL ECONOMIC POWER -->',tokens);

    console.log("\n ===================  \n\n")
  });

  /**
   * Minta nft gov e eco para o OWNER
   */
  it("Mint token OWNER", async function () {

    console.log("MINTANDO NFT OWNER")
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
    // await valocracy.mintValocracy(OTHER_HOLDER.address,1,"dale nftezinho 3",5);
    // await valocracy.mintValocracy(OTHER_HOLDER.address,1,"dale nftezinho 4",2);

    console.log("\n ===================  \n\n")
  });

  it("total economic power", async function () {
    const totalEconomicPower = await valocracy.fetchTotalEconomicPower();
    console.log('TOTAL ECONOMIC POWER -->',ethers.formatUnits(totalEconomicPower,18));

    console.log("\n ===================  \n\n")
  });

  /**
  * Todos os tokens economicos
  */
   it("all tokens economics", async function () {
     const tokens = await valocracy.fetchAlltokensEconomics();
     console.log('ALL TOKENS ECONOMICS -->',tokens);

     console.log("\n ===================  \n\n")
   });

  /**
   * Retorna os ids das nfts do OWNER
   */
  it("Get OWNER tokens ids", async function () {
    const tokens = await valocracy.getOwnerTokensEconomics(OWNER.address);
    console.log('NFTS IDs do OWNER -->',tokens);

    console.log("\n ===================  \n\n")
  });

  /**
  * Retorna os ids das nfts do OTHER OWNER
  */
  it("Get OTHER HOLDER tokens ids", async function () {
    const tokens = await valocracy.getOwnerTokensEconomics(OTHER_HOLDER.address);
    console.log('NFTS IDs do OTHER HOLDER -->',tokens);
    console.log("\n ===================  \n\n")
  });


  /**
  * Poder economico OWNER
  */
  it("Get OWNER power", async function () {

    console.log("\n\n -- OWNER -- \n\n");

    //PODER ECONOMIO TOTAL
    const power = await valocracy.fetchEconomicPowerOfUser(OWNER.address);

    //PORCENTAGEM QUE USUÁRIO TEM NA TESOURARIA
    const UserEconomicPowerOfEffort = await valocracy.getRelativeEconomicPowerOfUser(OWNER.address);

    //DINHEIRO TOTAL QUE O USUÁRIO TEM NA TESOURARIA
    const economicShareOfUser = await valocracy.economicShareOfUser(OWNER.address);

  
    console.log('PODER ECONOMICO TOTAL OWNER -->',ethers.formatUnits(power,18));
    console.log('PORCENTAGEM TOTAL DA TESOURARIA -->',ethers.formatUnits(UserEconomicPowerOfEffort,18));
    console.log('DINHEIRO TOTAL QUE O USUÁRIO TEM NA TESOURARIA -->',ethers.formatUnits(economicShareOfUser,18));
    console.log("\n ===================  \n\n")
  });

  /**
  * Poder economico OTHER HOLDER
  */
  it("Get OTHER HOLDER power", async function () {
    console.log("\n\n -- OTHER HOLDER -- \n\n");

    //PODER ECONOMIO TOTAL
    const power = await valocracy.fetchEconomicPowerOfUser(OTHER_HOLDER.address);

    //PORCENTAGEM QUE USUÁRIO TEM NA TESOURARIA
    const UserEconomicPowerOfEffort = await valocracy.getRelativeEconomicPowerOfUser(OTHER_HOLDER.address);

    //DINHEIRO TOTAL QUE O USUÁRIO TEM NA TESOURARIA
    const economicShareOfUser = await valocracy.economicShareOfUser(OTHER_HOLDER.address);

  
    console.log('PODER ECONOMICO TOTAL OTHER_HOLDER -->',ethers.formatUnits(power,18));
    console.log('PORCENTAGEM TOTAL DA TESOURARIA  OTHER_HOLDER-->',ethers.formatUnits(UserEconomicPowerOfEffort,18));
    console.log('DINHEIRO TOTAL QUE O USUÁRIO TEM NA TESOURARIA  OTHER_HOLDER-->',ethers.formatUnits(economicShareOfUser,18));
    console.log("\n ===================  \n\n")
  });

  /**
  * TOKEN 2
  */
  it("TOKEN 2 DATA", async function () {

    //PORCENTAGEM ECONOMICA DO TOKEN
    const relativePowerOfEffortToken2 = await valocracy.getRelativeEconomicPowerOfEffort(2n);

    //PORCENTAGEM ECONOMICA DO TOKEN
    const PowerOfEffortToken2 = await valocracy.fetchEconomicPowerOfEffort(2n);

    //VALOR DO TOKEN EM RELAÇÃO AO TOTAL DA VALOCRACIA 
    const economicShareOfEffortToken2 = await valocracy.economicShareOfEffort(2n);

    console.log('PORCENTAGEM ECONOMICA TOKEN 2 -->',ethers.formatUnits(relativePowerOfEffortToken2,18));
    console.log('PODER ECONOMICO TOKEN 2-->',ethers.formatUnits(PowerOfEffortToken2,18));
    console.log('VALOR ECONOMICO DO TOKEN 2 -->',ethers.formatUnits(economicShareOfEffortToken2,18));
    console.log("\n ===================  \n\n")
  });

  /**
  * Poder economico OTHER HOLDER
  */
  it("Get OTHER HOLDER power", async function () {
    console.log("\n\n -- OTHER HOLDER -- \n\n");

    //PODER ECONOMIO TOTAL
    const power = await valocracy.fetchEconomicPowerOfUser(OTHER_HOLDER.address);

    //PORCENTAGEM QUE USUÁRIO TEM NA TESOURARIA
    const UserEconomicPowerOfEffort = await valocracy.getRelativeEconomicPowerOfUser(OTHER_HOLDER.address);

    //DINHEIRO TOTAL QUE O USUÁRIO TEM NA TESOURARIA
    const economicShareOfUser = await valocracy.economicShareOfUser(OTHER_HOLDER.address);

    console.log('PODER ECONOMICO TOTAL OTHER_HOLDER -->',ethers.formatUnits(power,18));
    console.log('PORCENTAGEM TOTAL DA TESOURARIA  OTHER_HOLDER-->',ethers.formatUnits(UserEconomicPowerOfEffort,18));
    console.log('DINHEIRO TOTAL QUE O USUÁRIO TEM NA TESOURARIA  OTHER_HOLDER-->',ethers.formatUnits(economicShareOfUser,18));
    console.log("\n ===================  \n\n")
  });



  /**
  * FORFEITING OWNER
  */
  it("FORFEITING", async function () {

    const nftIdClaim = "2"

    console.log('\n\n\n --- FORFEITING OWNER TOKEN 2 --- \n\n\n ')
    const txResponse = await valocracy.forfeiting(nftIdClaim);

    const filter = valocracy.filters.Forfeiting()
    const events = await valocracy.queryFilter(filter, 'latest', 'latest');

    // Exibindo os eventos
    const forfeitingData = events.filter(event => event.args.tokenId.toString() == nftIdClaim)
    
    console.log(`TokenID: ${forfeitingData[0].args.tokenId.toString()}, Forfeiting: ${ethers.formatUnits(forfeitingData[0].args.shareOfEffort.toString(),18)}`);
  
    console.log("\n ===================  \n\n")
  });

  it("total economic power", async function () {
    const tokens = await valocracy.fetchTotalEconomicPower();
    console.log('TOTAL ECONOMIC POWER -->',ethers.formatUnits(tokens,18));

    console.log("\n ===================  \n\n")
  });

  /**
  * Todos os tokens economicos
  */
  it("all tokens economics", async function () {
    const tokens = await valocracy.fetchAlltokensEconomics();
    console.log('ALL TOKENS ECONOMICS -->',tokens);

    console.log("\n ===================  \n\n")
  });

  /**
  * Retorna os ids das nfts do OWNER
  */
  it("Get OWNER tokens ids", async function () {
    const tokens = await valocracy.getOwnerTokensEconomics(OWNER.address);
    console.log('NFTS IDs do OWNER -->',tokens);

    console.log("\n ===================  \n\n")
  });

  /**
  * Retorna saldo em usdt do owner
  */
  it("Get USDT balance owner", async function () {
    const tokens = await USDTContract.balanceOf(OWNER.address);
    console.log('SALDO USDT OWNER -->',ethers.formatUnits(tokens,18));

    console.log("\n ===================  \n\n")
  });
});

