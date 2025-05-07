
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { ethers, } from "hardhat";
import { Valocracy,LpValocracy, USDCVALOCRACY } from "../typechain-types";
import { deployContractLpValocracy, deployContractUSDT } from "../scripts/deploy/deployContract";
import { deployValocracy } from "./deploy/deployValocracy";
import { expect } from "chai";
import { getMintsDatas } from "./constants/mints";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { valocracyMintBatchCost, valocracyMintCost } from "./utils/transactionCost";
import { MintData } from "./types/MintData.type";
import { MintCostRegister } from "./types/MintCostRegister";
import { twoFixedNumber,bigToNumber,twoFixed,formatEther } from "./utils/utils";
import { ContractTransactionResponse } from "ethers";
import gasService from "@/services/gas.service";
import { env } from "process";

const PROVIDER = ethers.provider

describe("\n\n  == VALOCARACY TEST == \n\n", function () {

  type MintsData = {
    mintDatas:MintData[];
    rarityTotal:number;
    mintBatch:MintData[]
  };

  let valocracy: Valocracy;
  let lpContract: LpValocracy;
  let USDCContract: USDCVALOCRACY;
  let DEPLOYER:HardhatEthersSigner;
  let RAEL: HardhatEthersSigner;
  let VIT: HardhatEthersSigner;
  let OWNER: HardhatEthersSigner;
  let valocracyAddress: string;
  let lpContractAddress: string;
  let USDTAddress: string;
  let mintsRAEL:MintsData;
  let mintsVIT:MintsData
  let RAELsigner:Valocracy
  let VITsigner: Valocracy
  let OWNERsigner: Valocracy

  let balanceNativeLocalValocracy:bigint = 0n

  //Salva o custo do mint da nft
  const mintCostRegister:MintCostRegister = new Map()

  //Faz o controle local da ultima nft mintado
  let lastMintId = 0;
  let totalSuplyNftPair = 0;
  let localTotalEconomicPower:number = 0
  let localBalanceEconomicTotal = 0
  let RAELBalanceUsdt = 0
  let VITBalanceUsdt = 0
  let balanceLocalRAEL:bigint = 0n;
  let balanceLocalVIT:bigint = 0n;
  const allNfts: number[][] = []
  const RAELnftIds: number[][] = []
  const VITnftIds: number[][] = []

  const updateBalanceClaim = (nftIdClaim:number,balance:bigint) => {

    const nftMintCost = mintCostRegister.get(nftIdClaim)

    if(!nftMintCost) throw `Custo do mint não encontrado (updateBalance nftMintCost) ${nftMintCost}`

    //TODOS DO MINT DA NFT, NO CLAIM O VALAOR VAI PARA O CONTRATO
    balanceNativeLocalValocracy += nftMintCost

    return balance -= nftMintCost
  }

  const updateBalancex = async (tx: ContractTransactionResponse ,balance:bigint) => {

    const txReceipt = await tx.wait()
    const txCont = await gasService.transactionGasCost(txReceipt)
    //console.log("typeof txCont", typeof txCont)
    console.log({balance})
    console.log({txCont})
    return balance -= txCont

  }

  const getLocalEconomicPower = () => {
    return localTotalEconomicPower
  }

  const getLocalRelativeEconomicPowerOfUser = (powerUserTotal:number) => {

    return  powerUserTotal * 100 / getLocalEconomicPower()
  }

  const getLocalEconomicShareOfUser = (powerUserTotal:number) => {

    console.log("valocracy local total balancy",localBalanceEconomicTotal)
    console.log("user local poder relativo",getLocalRelativeEconomicPowerOfUser(powerUserTotal))

    const shareOfUser = localBalanceEconomicTotal * getLocalRelativeEconomicPowerOfUser(powerUserTotal) / 100
    return shareOfUser
  }

  const claim = async (nftId:number,owner=true) => {

    const indexInAllNfts = allNfts.findIndex((e,i) => e[1] == nftId)

    let index:number;

    if(owner){
      //atualiza o saldo do owner
      balanceLocalRAEL = updateBalanceClaim(nftId,balanceLocalRAEL)
      index = RAELnftIds.findIndex(e => e[1] == nftId)
      RAELnftIds[index][1] = 0

    }else{
      balanceLocalVIT = updateBalanceClaim(nftId,balanceLocalVIT)
      index = VITnftIds.findIndex(e => e[1] == nftId)
      VITnftIds[index][1] = 0
    }

    if(index == -1) console.log('VOCE NÃO É O DONO DO NFT!')

    allNfts[indexInAllNfts][1] = 0
    
    totalSuplyNftPair --

    const PowerOfEffortToken = await valocracy.fetchEconomicPowerOfEffort(nftId);
    localTotalEconomicPower -= bigToNumber(PowerOfEffortToken)

    const economicShareOfEffortToken = await valocracy.economicShareOfEffort(nftId);
    localBalanceEconomicTotal -= bigToNumber(economicShareOfEffortToken)

    if(owner){
      RAELBalanceUsdt += bigToNumber(economicShareOfEffortToken)
      mintsRAEL.rarityTotal -= bigToNumber(PowerOfEffortToken)

      if(RAELnftIds[index][0] == 0){

        RAELnftIds[index] = RAELnftIds[RAELnftIds.length -1]
        RAELnftIds.pop()


        allNfts[indexInAllNfts] = allNfts[allNfts.length - 1]
        allNfts.pop()
      }


    }else{
      VITBalanceUsdt += twoFixed(economicShareOfEffortToken)
      mintsVIT.rarityTotal -= twoFixed(PowerOfEffortToken)

      if(VITnftIds[index][0] == 0){

        VITnftIds[index] = VITnftIds[VITnftIds.length -1]
        VITnftIds.pop()


        allNfts[indexInAllNfts] = allNfts[allNfts.length - 1]
        allNfts.pop()
      }

    }

  }

  const forfeiting = async (nftId:number,owner=true) => {

    const indexInAllNfts = allNfts.findIndex((e,i) => e[1] == nftId)

    let index:number;

    if(owner){
      //atualiza o saldo do owner
      balanceLocalRAEL = updateBalanceClaim(nftId,balanceLocalRAEL)
      index = RAELnftIds.findIndex(e => e[1] == nftId)
      RAELnftIds[index][1] = 0

    }else{
      balanceLocalVIT = updateBalanceClaim(nftId,balanceLocalVIT)
      index = VITnftIds.findIndex(e => e[1] == nftId)
      VITnftIds[index][1] = 0
    }

    if(index == -1) console.log('VOCE NÃO É O DONO DO NFT!')

    console.log({indexInAllNfts})
    allNfts[indexInAllNfts][1] = 0
    
    totalSuplyNftPair --

    const PowerOfEffortToken = await valocracy.fetchEconomicPowerOfEffort(nftId);
    localTotalEconomicPower -= bigToNumber(PowerOfEffortToken)

    if(owner){

      mintsRAEL.rarityTotal -= bigToNumber(PowerOfEffortToken)

      if(RAELnftIds[index][0] == 0){

        RAELnftIds[index] = RAELnftIds[RAELnftIds.length -1]
        RAELnftIds.pop()


        allNfts[indexInAllNfts] = allNfts[allNfts.length - 1]
        allNfts.pop()
      }


    }else{

      mintsVIT.rarityTotal -= twoFixed(PowerOfEffortToken)

      if(VITnftIds[index][0] == 0){

        VITnftIds[index] = VITnftIds[VITnftIds.length -1]
        VITnftIds.pop()


        allNfts[indexInAllNfts] = allNfts[allNfts.length - 1]
        allNfts.pop()
      }

    }

  }

  const transfer = async (nftId:number,ownerToOther=true) => {

    const indexInAllNfts = allNfts.findIndex((e,i) => e[1] == nftId)

    let index:number;

    if(ownerToOther){

      index = RAELnftIds.findIndex(e => e[1] == nftId)

    }else{

      index = VITnftIds.findIndex(e => e[1] == nftId)

    }

    if(indexInAllNfts == -1) throw 'NFT NÃO ENCONTRADA'
    if(index == -1) throw 'VOCE NÃO É O DONO DO NFT!'

    if(ownerToOther){

      VITnftIds.push([0,RAELnftIds[index][1]])
      allNfts.push([0,allNfts[indexInAllNfts][1]])

      RAELnftIds[index][1] = 0
      allNfts[indexInAllNfts][1] = 0

      if(RAELnftIds[index][0] == 0){

        RAELnftIds[index] = RAELnftIds[RAELnftIds.length -1]
        RAELnftIds.pop()


        allNfts[indexInAllNfts] = allNfts[allNfts.length - 1]
        allNfts.pop()
      }

    }else{

      RAELnftIds.push([0,VITnftIds[index][1]])
      allNfts.push([0,allNfts[indexInAllNfts][1]])

      VITnftIds[index][1] = 0
      allNfts[indexInAllNfts][1] = 0

      if(VITnftIds[index][0] == 0){

        VITnftIds[index] = VITnftIds[VITnftIds.length -1]
        VITnftIds.pop()


        allNfts[indexInAllNfts] = allNfts[allNfts.length - 1]
        allNfts.pop()
      }

    }

    const PowerOfEffortToken = await valocracy.fetchEconomicPowerOfEffort(nftId);

    if(ownerToOther){

      mintsRAEL.rarityTotal -= bigToNumber(PowerOfEffortToken)
      mintsVIT.rarityTotal += bigToNumber(PowerOfEffortToken)
    }else{

      mintsVIT.rarityTotal -= bigToNumber(PowerOfEffortToken)
      mintsRAEL.rarityTotal += bigToNumber(PowerOfEffortToken)
    }


  }

  before(async function () {

    //Carteira que faz deploy e assina as tranzações

    //Outra carteira de teste
    [DEPLOYER,OWNER,RAEL,VIT] = await ethers.getSigners() as unknown as HardhatEthersSigner[];

    /**
     * @valocracy  contrato principal da Valocracia
     * @lpContract contrato LP token(ERC20)
     */
    lpContract  = await deployContractLpValocracy(OWNER.address) as LpValocracy
    USDCContract = await  deployContractUSDT() as USDCVALOCRACY 

    lpContractAddress = await lpContract.getAddress();
    USDTAddress = await USDCContract.getAddress();

    valocracy = await deployValocracy(lpContractAddress,USDTAddress);
    valocracyAddress = await valocracy.getAddress();

    RAELsigner = valocracy.connect(RAEL);
    VITsigner = valocracy.connect(VIT);
    OWNERsigner = valocracy.connect(OWNER);

    console.log("DEPLOYER ADDRESS ->", DEPLOYER.address)
    console.log("OWNER ADDRESS ->", OWNER.address)
    console.log("OWNER VALOCRACY",await valocracy.owner())

    mintsRAEL = getMintsDatas(RAEL.address,50)
    mintsVIT = getMintsDatas(VIT.address,50)

    localTotalEconomicPower = mintsRAEL.rarityTotal + mintsVIT.rarityTotal

    balanceLocalRAEL = await PROVIDER.getBalance(RAEL.address)
    balanceLocalVIT = await PROVIDER.getBalance(VIT.address)

    console.table({
      balanceLocalRAEL,
      balanceLocalVIT
    })

  });

  /**
   * Transfere usdt para o contrato
   */
  it(" Transfer 1000 usdt to contract", async function () {

    console.log("\n===================  \n\n")

    console.log("USDCContract.address ->",USDTAddress)

    const balanceOwner = await USDCContract.balanceOf(DEPLOYER.address)
    console.log("BALANCE DEPLOYER USDCVALOCRACY->",ethers.formatUnits(balanceOwner,6))

    const balanceOwner2 = await lpContract.balanceOf(OWNER.address)
    console.log("BALANCE OWNER LP->",ethers.formatUnits(balanceOwner2,6))

    localBalanceEconomicTotal = 1000;
    const amountUSDT = ethers.parseUnits("1000", 6);
    await USDCContract.transfer(valocracyAddress,amountUSDT);
    const balanceUsdtValocracy = await USDCContract.balanceOf(valocracyAddress);

    console.log('transfer ->', ethers.formatUnits(balanceUsdtValocracy,6))

    expect( ethers.formatUnits(balanceUsdtValocracy,6)).to.deep.equal("1000.0");
  });

  /**
   * Aprova os Lps do DEPLOYER para o contrato usar
   */
  it("Aprove LP to valocracy", async function () {
    console.log("\n =================== \n\n");

    const balanceDeployer = await lpContract.balanceOf(DEPLOYER.address)
    console.log("BALANCE DEPLOYER LP->",ethers.formatUnits(balanceDeployer,6))

    await lpContract.transfer(OWNER.address,balanceDeployer)
    const balanceOwner = await lpContract.balanceOf(OWNER.address)
    console.log("BALANCE OWNER LP->",ethers.formatUnits(balanceOwner,6))  

    const amountToToken = ethers.parseUnits("1000000000000000000000000", 6);
    await lpContract.approveLpSpender(OWNER.address,valocracyAddress,amountToToken)
    const allowance = await lpContract.allowance(OWNER.address,valocracyAddress)

    expect( ethers.formatUnits(allowance,6)).to.deep.equal("1000000000000000000000000.0");
  });

  /**
   * Retorna os ids das nfts do RAEL
   */
  it("Get RAEL tokens ids 1", async function () {
    console.log("\n ===================  \n\n")

    const tokens = await OWNERsigner.fetchOwnerTokens(RAEL.address,0,50,true);
    expect(tokens).to.deep.equal([]);

    console.log('NFTS IDs RAEL -->',tokens);

  });

  /**
  * Retorna os ids das nfts do VIT
  */
  it("Get VIT tokens ids 1", async function () {
    console.log("\n ===================  Get VIT tokens ids 1\n\n")
    const tokens = await OWNERsigner.getRelativeEconomicPowerOfUser(VIT.address)

    console.log('tokens VIT',tokens)
  });

  it("total economic power", async function () {
    console.log("\n ===================  \n\n")

    const totalEconomicPower = await OWNERsigner.fetchTotalEconomicPower();
    expect(totalEconomicPower).to.deep.equal(0);

    console.log('TOTAL ECONOMIC POWER -->',totalEconomicPower);
  });

  /**
   * Mints alternados entre duas carteiras
   */
  it("MINTS", async function () {
    console.log("\n ===================  \n\n")
    console.log("MINTS")

    let mintRAEL = true;

    //salva o custo da transação
    let transactionMintCost:bigint;
    let index = 0

    for (let i = 0; i < 100; i++) {

      if(mintRAEL){

        const mintCost = await valocracyMintCost(OWNERsigner,mintsRAEL.mintDatas[index])

        let tx = await OWNERsigner.mintValocracy(
          mintsRAEL.mintDatas[index].to,
          mintsRAEL.mintDatas[index]._tokenURIGovernance,
          mintsRAEL.mintDatas[index]._tokenURIEconomic,
          mintsRAEL.mintDatas[index].rarity,
          mintsRAEL.mintDatas[index].tokenMetadata,
          mintCost
        );


        const transation = await tx.wait()
        transactionMintCost = await gasService.transactionGasCost(transation)

        RAELnftIds.push([lastMintId+1,lastMintId+2])
        allNfts.push([lastMintId+1,lastMintId+2])
        console
        mintRAEL = false
        totalSuplyNftPair ++

      }else{

        const mintCost = await valocracyMintCost(OWNERsigner,mintsVIT.mintDatas[index])

        let tx = await OWNERsigner.mintValocracy(
          mintsVIT.mintDatas[index].to,
          mintsVIT.mintDatas[index]._tokenURIGovernance,
          mintsVIT.mintDatas[index]._tokenURIEconomic,
          mintsVIT.mintDatas[index].rarity,
          mintsVIT.mintDatas[index].tokenMetadata,
          mintCost
        );

        const transation = await tx.wait()
        transactionMintCost = await gasService.transactionGasCost(transation)

        VITnftIds.push([lastMintId+1,lastMintId+2])
        allNfts.push([lastMintId+1,lastMintId+2])

        mintRAEL = true
        totalSuplyNftPair ++
        index ++

      }

      lastMintId += 2

      if(lastMintId == 188){
        console.log(transactionMintCost == 711087323606616n)
        console.log(transactionMintCost)
      }
      mintCostRegister.set(lastMintId,transactionMintCost)

    }

  });

    /**
   * Mint batch
   */
  it("MINT BATCH", async function () {
    console.log("\n ===================  \n\n")
    console.log("MINT BATCH")

    //salva o custo da transação
    let transactionMintCost:bigint;
      
    //RAEL
    let mintCost = await valocracyMintBatchCost(OWNERsigner,mintsRAEL.mintBatch)

    console.log("\n\n")
    console.log("MINT BATCH", mintsRAEL.mintBatch)
    console.log("MINT BATCH LENGTH", mintsRAEL.mintBatch.length)
    console.log("\n\n")

    for(let i=0; i<mintsRAEL.mintBatch.length; i++){

      mintsRAEL.mintBatch[i].mintCost = mintCost

      RAELnftIds.push([lastMintId+1,lastMintId+2])
      allNfts.push([lastMintId+1,lastMintId+2])
      totalSuplyNftPair ++
      lastMintId += 2

      mintCostRegister.set(lastMintId,mintCost)
    }

    let tx = await OWNERsigner.mintBatch(
      mintsRAEL.mintBatch
    );

    let transation = await tx.wait()
    transactionMintCost = await gasService.transactionGasCost(transation)

    //-----
  
    //VIT
    mintCost = await valocracyMintBatchCost(OWNERsigner,mintsVIT.mintBatch)

    for(let i=0; i<mintsVIT.mintBatch.length; i++){

      mintsVIT.mintBatch[i].mintCost = mintCost

      VITnftIds.push([lastMintId+1,lastMintId+2])
      allNfts.push([lastMintId+1,lastMintId+2])
      totalSuplyNftPair ++
      lastMintId += 2

      mintCostRegister.set(lastMintId,mintCost)
    }

    tx = await OWNERsigner.mintBatch(
      mintsVIT.mintBatch
    );

    transation = await tx.wait()
    transactionMintCost = await gasService.transactionGasCost(transation)

  })

    

    /**
   *TOTAL DE TOKENS ECONOMICOS
   */
   it("NFT COST", async function () {
    const NFTID = 188
    const costLocal = mintCostRegister.get(NFTID)
    const costContract = await valocracy.getEconomicTokenMintCost(NFTID)

    console.log(costLocal == costContract)
    console.log(costLocal,"<- COST LOCAL")
    console.log(costContract,"<- COST CONTRACT")

    console.log("\n ===================  \n\n")
  });
  
  /**
   *TOTAL DE TOKENS ECONOMICOS
   */
  it("Count tokens economics", async function () {

    const mintedSupply = await OWNERsigner.fetchEconomicMintedSupply();
    expect(mintedSupply).to.deep.equal(totalSuplyNftPair);

    console.log('TOTAL TOKENS ECONOMICOS -->',mintedSupply);

    console.log("\n ===================  \n\n")
  });

  /**
  * Todos os tokens
  */
  it("all tokens economics", async function () {
    console.log("\n ===================  \n\n")
    const tokens = await OWNERsigner.fetchAllTokens(0,200,true);
    //console.log('ALL TOKENS ECONOMICS -->',tokens);

    expect(tokens).to.deep.equal(allNfts);
  });

  /**
   * Retorna os ids das nfts do RAEL
   */
  it("Get RAEL tokens ids 2", async function () {
    console.log("\n ===================  \n\n")

    const tokens = await OWNERsigner.fetchOwnerTokens(RAEL.address,0,200,true);

    expect(tokens).to.deep.equal(RAELnftIds);

    //console.log('NFTS IDs do DEPLOYER -->',tokens);

  });

  /**
   * Retorna os ids das nfts do VIT
   */
  it("Get VIT tokens ids 2", async function () {
    console.log("\n ===================  \n\n")

    const tokens = await OWNERsigner.fetchOwnerTokens(VIT.address,0,200,true);

    expect(tokens).to.deep.equal(VITnftIds);

    //console.log('NFTS IDs do RAEL -->',tokens);

  });

  it("total economic power", async function () {
    console.log("\n ===================  \n\n")
    const totalEconomicPower = await OWNERsigner.fetchTotalEconomicPower();
    expect(twoFixed(totalEconomicPower)).to.deep.equal(getLocalEconomicPower());

    console.log('TOTAL ECONOMIC POWER -->',twoFixed(totalEconomicPower));
  });

  /**
  * Poder economico RAEL
  */
  it("Get RAEL power", async function () {
    console.log("\n ===================  \n\n")

    console.log("\n\n -- RAEL -- \n\n");

    //PODER ECONOMIO TOTAL
    const power = await OWNERsigner.fetchEconomicPowerOfUser(RAEL.address);
    //PORCENTAGEM QUE USUÁRIO TEM NA TESOURARIA
    const UserEconomicPowerOfEffort = await OWNERsigner.getRelativeEconomicPowerOfUser(RAEL.address);
    //DINHEIRO TOTAL QUE O USUÁRIO TEM NA TESOURARIA
    const economicShareOfUser = await OWNERsigner.economicShareOfUser(RAEL.address);

    console.log('PODER ECONOMICO TOTAL RAEL -->',twoFixed(power));
    console.log('PORCENTAGEM TOTAL DA TESOURARIA -->',twoFixed(UserEconomicPowerOfEffort));
    console.log('DINHEIRO TOTAL QUE O USUÁRIO TEM NA TESOURARIA -->',twoFixed(economicShareOfUser));

    expect(twoFixed(power)).to.deep.equal(mintsRAEL.rarityTotal);
    expect(twoFixed(UserEconomicPowerOfEffort)).to.deep.equal(twoFixedNumber(getLocalRelativeEconomicPowerOfUser(mintsRAEL.rarityTotal)));
    expect(twoFixed(economicShareOfUser)).to.deep.equal(twoFixedNumber(getLocalEconomicShareOfUser(mintsRAEL.rarityTotal)));

    //expect(tokens).to.deep.equal([[ 1n, 2n ], [ 3n, 4n ],[5n, 6n ]]);

  });

  /**
  * Poder economico VIT
  */
  it("Get VIT power", async function () {
    console.log("\n ===================  \n\n")
    console.log("\n\n -- VIT -- \n\n");

    //PODER ECONOMIO TOTAL
    const power = await OWNERsigner.fetchEconomicPowerOfUser(VIT.address);

    //PORCENTAGEM QUE USUÁRIO TEM NA TESOURARIAS
    const UserEconomicPowerOfEffort = await OWNERsigner.getRelativeEconomicPowerOfUser(VIT.address);

    //DINHEIRO TOTAL QUE O USUÁRIO TEM NA TESOURARIA
    const economicShareOfUser = await OWNERsigner.economicShareOfUser(VIT.address);

    console.log('PODER ECONOMICO TOTAL VIT -->',twoFixed(power));
    console.log('PORCENTAGEM TOTAL DA TESOURARIA  VIT-->',twoFixedNumber(getLocalRelativeEconomicPowerOfUser(mintsVIT.rarityTotal)));
    console.log('DINHEIRO TOTAL QUE O USUÁRIO TEM NA TESOURARIA  VIT-->',twoFixedNumber(getLocalEconomicShareOfUser(mintsVIT.rarityTotal)));

    expect(twoFixed(power)).to.deep.equal(mintsVIT.rarityTotal);
    expect(twoFixed(UserEconomicPowerOfEffort)).to.deep.equal(twoFixedNumber(getLocalRelativeEconomicPowerOfUser(mintsVIT.rarityTotal)));
    expect(twoFixed(economicShareOfUser)).to.deep.equal(twoFixedNumber(getLocalEconomicShareOfUser(mintsVIT.rarityTotal)));

  });

  /**
  * CLAIM RAEL
  */
  it("CLAIM", async function () {
    console.log("\n ===================  \n\n")

    console.log('\n\n\n --- CLAIM RAEL TOKEN 2 --- \n\n\n ')

    const nftIdClaim = 6

    const nftMintCost = mintCostRegister.get(nftIdClaim)
    const cost = await RAELsigner.getEconomicTokenMintCost(nftIdClaim)

    console.log("nftMintCost ->",nftMintCost)
    console.log("cost ->",cost)
    let tx = await RAELsigner.claim(nftIdClaim,{value:nftMintCost});

    balanceLocalRAEL = await updateBalancex(tx,balanceLocalRAEL)

    await claim(nftIdClaim)

  });

  it("Count tokens economics", async function () {
    const mintedSupply = await OWNERsigner.fetchEconomicMintedSupply();
    expect(mintedSupply).to.deep.equal(totalSuplyNftPair);

    console.log('TOTAL TOKENS ECONOMICOS -->',mintedSupply);

    console.log("\n ===================  \n\n")
  });

  it("total economic power", async function () {
    const totalEconomicPower = await OWNERsigner.fetchTotalEconomicPower();
    console.log('TOTAL ECONOMIC POWER -->',ethers.formatUnits(totalEconomicPower,6));

    expect(twoFixed(totalEconomicPower)).to.deep.equal(getLocalEconomicPower());

    console.log("\n ===================  \n\n")
  });

  /**
  * Todos os tokens economicos
  */
  it("all tokens economics", async function () {
    const tokens = await OWNERsigner.fetchAllTokens(0,150,true);

    expect(tokens).to.deep.equal(allNfts);

    console.log("\n ===================  \n\n")
  });

  /**
   * forfeiting RAEL
   */
  it("Forfeiting", async function () {
    console.log("\n ===================  \n\n")
    console.log("forfeiting RAEL")

    let forfeitingTokenId = 130
    await forfeiting(forfeitingTokenId)
    let nftMintCost = mintCostRegister.get(forfeitingTokenId)
    let tx = await RAELsigner.forfeiting(forfeitingTokenId,{value:nftMintCost});
    balanceLocalRAEL = await updateBalancex(tx,balanceLocalRAEL)
    
    forfeitingTokenId = 106
    await forfeiting(forfeitingTokenId)
    nftMintCost = mintCostRegister.get(forfeitingTokenId)
    tx = await RAELsigner.forfeiting(forfeitingTokenId,{value:nftMintCost});
    balanceLocalRAEL = await updateBalancex(tx,balanceLocalRAEL)

    forfeitingTokenId = 198
    await forfeiting(forfeitingTokenId)
    nftMintCost = mintCostRegister.get(forfeitingTokenId)
    tx = await RAELsigner.forfeiting(forfeitingTokenId,{value:nftMintCost});
    balanceLocalRAEL = await updateBalancex(tx,balanceLocalRAEL)
    
  });

  /**
   * Retorna os ids das nfts do RAEL
   */
  it("Get RAEL tokens ids 2", async function () {
    console.log("\n ===================  \n\n")
    const tokens = await OWNERsigner.fetchOwnerTokens(RAEL.address,0,150,true);
    expect(tokens).to.deep.equal(RAELnftIds);
    console.log('TOKENS RAEL',tokens)
  });


  /**
   * forfeiting VIT
   */
  it("Forfeiting VIT", async function () {
    console.log("\n ===================  \n\n")
    console.log("forfeiting VIT")

    let forfeitingTokenId = 76
    await forfeiting(forfeitingTokenId,false)
    let nftMintCost = mintCostRegister.get(forfeitingTokenId)
    let tx = await VITsigner.forfeiting(forfeitingTokenId,{value:nftMintCost});
    balanceLocalVIT = await updateBalancex(tx,balanceLocalVIT)
    
    forfeitingTokenId = 96
    await forfeiting(forfeitingTokenId,false)
    nftMintCost = mintCostRegister.get(forfeitingTokenId)
    tx = await VITsigner.forfeiting(forfeitingTokenId,{value:nftMintCost});
    balanceLocalVIT = await updateBalancex(tx,balanceLocalVIT)
    
    forfeitingTokenId = 200
    await forfeiting(forfeitingTokenId,false)
    nftMintCost = mintCostRegister.get(forfeitingTokenId)
    tx = await VITsigner.forfeiting(forfeitingTokenId,{value:nftMintCost});
    balanceLocalVIT = await updateBalancex(tx,balanceLocalVIT)
    
  });
  /**
   * Retorna os ids das nfts do VIT
   */
  it("Get VIT tokens ids 3", async function () {
    console.log("\n ===================  \n\n")
    const tokens = await OWNERsigner.fetchOwnerTokens(VIT.address,0,100,true);

    expect(tokens).to.deep.equal(VITnftIds);
    console.log('TOKENS VIT',tokens)
  });

  /**
  * Retorna saldo em usdt do RAEL
  */
  it("Get USDCVALOCRACY balance RAEL", async function () {
    const balance = await USDCContract.balanceOf(RAEL.address);

    expect(twoFixed(balance)).to.deep.equal(twoFixedNumber(RAELBalanceUsdt));


    console.log('SALDO USDCVALOCRACY DEPLOYER -->',twoFixed(balance));

    console.log("\n ===================  \n\n")
  });

  /**
  * Retorna saldo em usdt do owner
  */
  it("Transfer", async function () {
    let tx = await RAELsigner.transferFrom(RAEL.address, VIT.address,134)

    balanceLocalRAEL = await updateBalancex(tx,balanceLocalRAEL)
    await transfer(134)

    console.log("\n ===================  \n\n")
  });

  /**
   * Retorna os ids das nfts do RAEL
   */
  it("Get RAEL tokens ids 1", async function () {
    console.log("\n ===================  \n\n")
    const tokens = await OWNERsigner.fetchOwnerTokens(RAEL.address,0,100,true);

    expect(tokens).to.deep.equal(RAELnftIds);
  });

  /**
   * Retorna os ids das nfts do VIT
   */
  it("Get VIT tokens ids 4", async function () {
    console.log("\n ===================  \n\n")
    const tokens = await OWNERsigner.fetchOwnerTokens(VIT.address,0,100,true);

    expect(tokens).to.deep.equal(VITnftIds);
  });

  it("Transfer VIT TO RAEL", async function () {

    let tx = await VITsigner.transferFrom(VIT.address,RAEL.address,156)
    balanceLocalVIT = await updateBalancex(tx,balanceLocalVIT)

    // tx = await VITsigner.transferFrom(VIT.address,RAEL.address,184)
    // balanceLocalVIT = await updateBalancex(tx,balanceLocalVIT)

    tx = await VITsigner.transferFrom(VIT.address,RAEL.address,52)
    balanceLocalVIT = await updateBalancex(tx,balanceLocalVIT)

    await transfer(156,false)
    //await transfer(184,false)
    await transfer(52,false)

    console.log("\n ===================  \n\n")
  });

  /**
   * Retorna os ids das nfts do DEPLOYER
   */
  it("Get RAEL tokens ids 3", async function () {
    console.log("\n ===================  \n\n")
    const tokens = await OWNERsigner.fetchOwnerTokens(RAEL.address,0,100,true);

    expect(tokens).to.deep.equal(RAELnftIds);
    console.log('TOKENS RAEL',tokens)
  });

  /**
    * Retorna os ids das nfts do VIT
    */
  it("Get VIT tokens ids 5", async function () {
    console.log("\n ===================  \n\n")
    const tokens = await OWNERsigner.fetchOwnerTokens(VIT.address,0,100,true);

    expect(tokens).to.deep.equal(VITnftIds);
    console.log('TOKENS VIT',tokens)
  });

  /**
  * CLAIM RAEL
  */
  it("CLAIM", async function () {
    console.log("\n ===================  \n\n")

    console.log('\n\n\n --- CLAIM DEPLOYER TOKEN 2 --- \n\n\n ')

    let nftClaimId = 30
    let nftMintCost = mintCostRegister.get(nftClaimId)
    let tx = await RAELsigner.claim(nftClaimId,{value:nftMintCost});
    balanceLocalRAEL = await updateBalancex(tx,balanceLocalRAEL)
    await claim(nftClaimId)


    nftClaimId = 162
    nftMintCost = mintCostRegister.get(nftClaimId)
    console.log("MINT COST LOCAL -> ",nftMintCost,"\n\n")
    tx = await RAELsigner.claim(nftClaimId,{value:nftMintCost});
    balanceLocalRAEL = await updateBalancex(tx,balanceLocalRAEL)
    await claim(nftClaimId)

    nftClaimId = 52
    nftMintCost = mintCostRegister.get(nftClaimId)
    tx = await RAELsigner.claim(nftClaimId,{value:nftMintCost});
    balanceLocalRAEL = await updateBalancex(tx,balanceLocalRAEL)
    await claim(nftClaimId)

  });

  /**
   * Retorna os ids das nfts do RAEL
   */
  it("Get RAEL tokens ids", async function () {
    console.log("\n ===================  \n\n")
    const tokens = await OWNERsigner.fetchOwnerTokens(RAEL.address,0,100,true);

    expect(tokens).to.deep.equal(RAELnftIds);
    console.log('TOKENS RAEL',tokens)
  });

  /**
    * Retorna os ids das nfts do VIT
    */
  it("Get VIT tokens ids 6", async function () {
    console.log("\n ===================  \n\n")
    const tokens = await OWNERsigner.fetchOwnerTokens(VIT.address,0,100,true);

    expect(tokens).to.deep.equal(VITnftIds);
    console.log('TOKENS VIT',tokens)
  });

  /**
  * Poder economico RAEL
  */
  it("Get RAEL power", async function () {
    console.log("\n ===================  \n\n")

    console.log("\n\n -- RAEL  dale-- \n\n");

     //PODER ECONOMIO TOTAL
    const power = await OWNERsigner.fetchEconomicPowerOfUser(RAEL.address);
    //PORCENTAGEM QUE USUÁRIO TEM NA TESOURARIA
    const UserEconomicPowerOfEffort = await OWNERsigner.getRelativeEconomicPowerOfUser(RAEL.address);
    //DINHEIRO TOTAL QUE O USUÁRIO TEM NA TESOURARIA
    const economicShareOfUser = await OWNERsigner.economicShareOfUser(RAEL.address);

    console.log('PODER ECONOMICO TOTAL RAEL -->',twoFixed(power));
    console.log('PORCENTAGEM TOTAL DA TESOURARIA -->',twoFixed(UserEconomicPowerOfEffort));
    console.log('DINHEIRO TOTAL QUE O USUÁRIO TEM NA TESOURARIA -->',twoFixed(economicShareOfUser));

    expect(twoFixed(power)).to.deep.equal(mintsRAEL.rarityTotal);
    expect(twoFixed(UserEconomicPowerOfEffort)).to.deep.equal(twoFixedNumber(getLocalRelativeEconomicPowerOfUser(mintsRAEL.rarityTotal)));
    expect(twoFixed(economicShareOfUser)).to.deep.equal(twoFixedNumber(getLocalEconomicShareOfUser(mintsRAEL.rarityTotal)));

    //expect(tokens).to.deep.equal([[ 1n, 2n ], [ 3n, 4n ],[5n, 6n ]]);

  });

  /**
  * Todos os tokens
  */
  it("all tokens economics", async function () {
    console.log("\n ===================  \n\n")
    const tokens = await OWNERsigner.fetchAllTokens(0,200,true);
    //console.log('ALL TOKENS ECONOMICS -->',tokens);

    expect(tokens).to.deep.equal(allNfts);
  });

  /**
  * Todos os tokens
  */
  it("all tokens economics", async function () {
    console.log("\n ===================  \n\n")
    const tokens = await OWNERsigner.fetchAllTokens(0,200,true);
    //console.log('ALL TOKENS ECONOMICS -->',tokens);

    expect(tokens).to.deep.equal(allNfts);
  });

  // it("all tokens economics", async function () {
  //   console.log("\n ===================  \n\n")
  //   const tx = await OWNERsigner.burn(1,0);
  //   await tx.wait()

  // });


  it("BALANCE VALOCRACY", async function () {
    console.log("\n ===================  \n\n")

    const valocracyBalance = await PROVIDER.getBalance(valocracyAddress)

    console.table({
      balanceValocracy:formatEther(valocracyBalance),
    })

    expect(valocracyBalance).to.deep.equal(balanceNativeLocalValocracy);

  });

  it("BALANCE VALOCRACY", async function () {
    console.log("\n ===================  \n\n")

    const ownerBalance = await PROVIDER.getBalance(OWNER.address)
    const valocracyBalance = await PROVIDER.getBalance(valocracyAddress)

    console.log("OWNER BALANCE BEFORE WD ->",ownerBalance)

    let tx:any = await OWNERsigner.withdrawNativeToken()
    tx = await tx.wait()
    const costTrasaction = await gasService.transactionGasCost(tx)

    console.log("OWNER BALANCE AFTER WD ->",ownerBalance)

    expect(balanceNativeLocalValocracy+ownerBalance-costTrasaction).to.deep.equal(valocracyBalance+ownerBalance-costTrasaction);

  });

  it("BALANCE USERS", async function () {
    console.log("\n ===================  \n\n")

    const balanceRAEL = await PROVIDER.getBalance(RAEL.address)
    const balanceVIT = await PROVIDER.getBalance(VIT.address)

    console.table({
      balanceRAEL:formatEther(balanceRAEL),
      balanceVIT:formatEther(balanceVIT)
    })
    console.table({
      balanceLocalRAEL: balanceLocalRAEL,
      balanceLocalVIT: balanceLocalVIT
    })

    expect(balanceRAEL).to.deep.equal(balanceLocalRAEL);
    expect(balanceVIT).to.deep.equal(balanceLocalVIT);

  });

});


