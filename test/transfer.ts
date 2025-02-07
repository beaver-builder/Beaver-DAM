/* eslint-disable @typescript-eslint/no-unused-vars */

import { ethers, } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Valocracy,LpValocracy, USDT } from "../typechain-types";
import { deployContract } from "../scripts/deploy/deployContract";
import { deployValocracy } from "../scripts/deploy/deployValocracy";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { Console } from "console";

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
   
    console.log("\n ===================  \n\n")

    const amountUSDT = ethers.parseUnits("1000", 18);
    await USDTContract.transfer(valocracyAddress,amountUSDT);

    console.log("\n===================  \n\n")
  });

  /**
   * Aprova os Lps do OWNER para o contrato usar
   */
  it("Aprove LP to valocracy", async function () {
    const amountToToken = ethers.parseUnits("1000000000", 18);
    await lpContract.approve(valocracyAddress,amountToToken)
    const allowance = await lpContract.allowance(OWNER.address,valocracyAddress)     

    console.log("\n =================== \n\n")
  });

  /**
   * Retorna os ids das nfts do OWNER
   */
  it("Get OWNER tokens ids", async function () {
    console.log("\n ===================  \n\n")
    expect( await valocracy.fetchOwnerTokens(OWNER.address,0,50,true)).to.deep.equal([ ]);

    const tokens = await valocracy.fetchOwnerTokens(OWNER.address,0,50,true);
    console.log('NFTS IDs do OWNER -->',tokens);
  });

  it("total economic power", async function () {
    console.log("\n ===================  \n\n")
    const tokens = await valocracy.fetchTotalEconomicPower();
    console.log('TOTAL ECONOMIC POWER -->',tokens);
  });

  /**
   * Todos os tokens
   */
  it("All tokens", async function () {
    console.log("\n ===================  \n\n")
    const tokens = await valocracy.fetchAllTokens(0,50,true);
    console.log('TODOS OS TOKENS -->',tokens);
    expect( await valocracy.fetchAllTokens(0,50,true)).to.deep.equal([]);
  });

  /**
   * Minta nft gov e eco para o OWNER
   */
  it("Mint token OWNER", async function () {
    console.log("\n ===================  \n\n")
    console.log("MINTANDO NFT OWNER")
    await valocracy.mintValocracy(OWNER.address,"dale nftezinho 1",10);
    await valocracy.mintValocracy(OWNER.address,"dale nftezinho 1",10);
    //await valocracy.mintValocracy(OWNER.address,1,"dale nftezinho 1",10);
    // await valocracy.mintValocracy(OWNER.address,1,"dale nftezinho 1",3);
  });

  /**
  * Minta nft gov e eco para o OTHER HOLDER
  */
  it("Mint token OTHER HOLDER", async function () {
    console.log("\n ===================  \n\n")
    console.log("MINTANDO NFT OTHER HOLDER")
    await valocracy.mintValocracy(OTHER_HOLDER.address,"dale nftezinho 2",10);
    await valocracy.mintValocracy(OTHER_HOLDER.address,"dale nftezinho 2",10);
    // await valocracy.mintValocracy(OTHER_HOLDER.address,1,"dale nftezinho 3",5);
    // await valocracy.mintValocracy(OTHER_HOLDER.address,1,"dale nftezinho 4",2);
  });

  it("Mint token OTHER HOLDER", async function () {
    const filter = valocracy.filters.Mint(OWNER.address);
    const events = await valocracy.queryFilter(filter, 0, 'latest');
    console.log(events);
  });

  /**
  * TODOS OS TOKENS
  */
  it("All tokens", async function () {
    console.log("\n ===================  \n\n")
    console.log('----- ALL TOKENS -----')

    expect( await valocracy.fetchAllTokens(0,50,true)).to.deep.equal([ [ 1n, 2n ], [ 3n, 4n ] , [ 5n, 6n ] , [ 7n, 8n ] ]);
    
    const tokens = await valocracy.fetchAllTokens(0, 50, true) as unknown as NestedTokenArray
    console.log('ALL NFTS -->',tokens);
    
    // tokens.map((e)  => {
    //   console.log("gov ->",e.governanceId)
    //   console.log("eco ->",e.economicId)
    // })
  });

  // it("Get OWNER tokens ids", async function () {
  //   console.log("\n ===================  \n\n")
    
  //   const index6 = await valocracy.indexByToken(6n);
  //   const index8 = await valocracy.indexByToken(8n);
  //   const index2 = await valocracy.indexByToken(2n);
  //   const index4 = await valocracy.indexByToken(4n);
    
    
  //   console.log('INDEX TOKEN 6 -->',index6);
  //   console.log('INDEX TOKEN 8 -->',index8);
  //   console.log('INDEX TOKEN 2 -->',index2);
  //   console.log('INDEX TOKEN 4 -->',index4);
    
  //   console.log('\n--------------------\n')
    
  //   const indexOwner6 = await valocracy.indexOwnerByToken(6n);
  //   const indexOwner8 = await valocracy.indexOwnerByToken(8n);
  //   const indexOwner2 = await valocracy.indexOwnerByToken(2n);
  //   const indexOwner4 = await valocracy.indexOwnerByToken(4n);
    
  //   console.log('INDEX OWNER TOKEN 6 -->',indexOwner6);
  //   console.log('INDEX OWNER TOKEN 8 -->',indexOwner8);
  //   console.log('INDEX OWNER TOKEN 2 -->',indexOwner2);
  //   console.log('INDEX OWNER TOKEN 4 -->',indexOwner4);
  // });

  /**
   * Retorna os ids das nfts do OWNER
   */
  it("Get OWNER tokens ids", async function () {
    console.log("\n ===================  \n\n")

    expect( await valocracy.fetchOwnerTokens(OWNER.address,0,50,true)).to.deep.equal([ [ 1n, 2n ], [ 3n, 4n ] ]);

    const tokens = await valocracy.fetchOwnerTokens(OWNER.address,0,50,true);
    console.log('NFTS IDs do OWNER -->',tokens);

  });

  /**
   * Retorna os ids das nfts do OWNER
   */
  it("Get OTHER_HOLDER tokens ids", async function () {
    console.log("\n ===================  \n\n")

    expect( await valocracy.fetchOwnerTokens(OTHER_HOLDER.address,0,50,true)).to.deep.equal([ [ 5n, 6n ], [ 7n, 8n ] ]);

    const tokens = await valocracy.fetchOwnerTokens(OTHER_HOLDER.address,0,50,true);
    console.log('NFTS IDs do OTHER_HOLDER -->',tokens);

  });

  /**
  * TRANSFER TOKEN
  */
  it("transfer token", async function () {

    console.log("\n ===================  \n\n")
    console.log('TRANSFER')

    await valocracy.transferFrom(OWNER.address,OTHER_HOLDER.address,2n);
    await valocracy.transferFrom(OWNER.address,OTHER_HOLDER.address,4n);
    
  });

    /**
  * TRANSFER TOKEN
  */
    it("tranfer gov", async function () {

      console.log("\n ===================  \n\n")
      console.log('TRANSFER')
  
      await valocracy.transferFrom(OWNER.address,OTHER_HOLDER.address,1n);
      
    });

  /**
   * Retorna os ids das nfts do OWNER
   */
  it("Get OWNER tokens ids", async function () {
    console.log("\n ===================  \n\n")
    expect( await valocracy.fetchOwnerTokens(OWNER.address,0,50,true)).to.deep.equal([ [ 1n, 0n ], [ 3n, 0n ] ]);

    const tokens = await valocracy.fetchOwnerTokens(OWNER.address,0,50,true);
    console.log('NFTS IDs do OWNER -->',tokens);
  });

  /**
   * Retorna os ids das nfts do OWNER
   */
  it("Get OTHER_HOLDER tokens ids", async function () {
    console.log("\n ===================  \n\n")
    //expect( await valocracy.fetchOwnerTokens(OTHER_HOLDER.address,0,50,true)).to.deep.equal([ [ 5n, 6n ], [ 7n, 8n ],[ 0n, 2n ], [ 0n, 4n ] ]);

    const tokens = await valocracy.fetchOwnerTokens(OTHER_HOLDER.address,0,50,true);
    console.log('NFTS IDs do OTHER_HOLDER -->',tokens);

   
  });

  it("All tokens", async function () {
    console.log("\n ===================  \n\n")
    console.log('----- ALL TOKENS -----')

    //expect( await valocracy.fetchAllTokens(0,50,true)).to.deep.equal([ [ 1n, 2n ], [ 3n, 4n ] , [ 5n, 6n ] , [ 7n, 8n ] ]);
    
    const tokens = await valocracy.fetchAllTokens(0, 50, true) as unknown as NestedTokenArray
    console.log('ALL NFTS -->',tokens);
    
    // tokens.map((e)  => {
    //   console.log("gov ->",e.governanceId)
    //   console.log("eco ->",e.economicId)
    // })
  });

  it("Get OWNER tokens ids", async function () {
    console.log("\n ===================  \n\n")
    
    const index6 = await valocracy.indexByToken(6n);
    const index8 = await valocracy.indexByToken(8n);
    const index2 = await valocracy.indexByToken(2n);
    const index4 = await valocracy.indexByToken(4n);
    
    
    console.log('INDEX TOKEN 6 -->',index6);
    console.log('INDEX TOKEN 8 -->',index8);
    console.log('INDEX TOKEN 2 -->',index2);
    console.log('INDEX TOKEN 4 -->',index4);
    
    console.log('\n--------------------\n')
    
    const indexOwner6 = await valocracy.indexOwnerByToken(6n);
    const indexOwner8 = await valocracy.indexOwnerByToken(8n);
    const indexOwner2 = await valocracy.indexOwnerByToken(2n);
    const indexOwner4 = await valocracy.indexOwnerByToken(4n);
    
    console.log('INDEX OWNER TOKEN 6 -->',indexOwner6);
    console.log('INDEX OWNER TOKEN 8 -->',indexOwner8);
    console.log('INDEX OWNER TOKEN 2 -->',indexOwner2);
    console.log('INDEX OWNER TOKEN 4 -->',indexOwner4);
  });


  /**
  * TODOS OS TOKENS
  */
  it("All tokens", async function () {
    console.log("\n ===================  \n\n")

    console.log('----- ALL TOKENS -----')

    expect( await valocracy.fetchAllTokens(0,50,true)).to.deep.equal([ [ 1n, 0n ], [ 3n, 0n ], [ 5n, 6n ], [ 7n, 8n ],[ 0n, 2n ], [ 0n, 4n ] ]);
    
    const tokens = await valocracy.fetchAllTokens(0, 50, true) as unknown as NestedTokenArray
    console.log('ALL NFTS -->',tokens);

  });

 

  /**
  * CLAIM OWNER
  */
  it("CLAIM", async function () {

    const valocracyWithOtherHolder = valocracy.connect(OTHER_HOLDER);

    const nftIdClaim = 2n

    console.log('\n\n\n --- CLAIM OWNER TOKEN 2 --- \n\n\n ')
    await valocracyWithOtherHolder.claim(nftIdClaim);
  
    console.log("\n ===================  \n\n")
  });

  it("All tokens", async function () {
    console.log("\n ===================  \n\n")
    console.log('----- ALL TOKENS -----')
    //expect( await valocracy.fetchAllTokens(0,50,true)).to.deep.equal([ [ 1n, 2n ], [ 3n, 4n ] , [ 5n, 6n ] , [ 7n, 8n ] ]);
    
    const tokens = await valocracy.fetchAllTokens(0, 50, true) as unknown as NestedTokenArray
    console.log('ALL NFTS -->',tokens);
    
  });

    /**
  * CLAIM OWNER
  */
    it("CLAIM GOV", async function () {
  
      const nftIdClaim = 1n
  
      console.log('\n\n\n --- CLAIM OWNER TOKEN 2 --- \n\n\n ')
      await valocracy.claim(nftIdClaim);
    
      console.log("\n ===================  \n\n")
    });
  
    it("All tokens", async function () {
      console.log("\n ===================  \n\n")
      console.log('----- ALL TOKENS -----')
      //expect( await valocracy.fetchAllTokens(0,50,true)).to.deep.equal([ [ 1n, 2n ], [ 3n, 4n ] , [ 5n, 6n ] , [ 7n, 8n ] ]);
      
      const tokens = await valocracy.fetchAllTokens(0, 50, true) as unknown as NestedTokenArray
      console.log('ALL NFTS -->',tokens);
      
    });

  it("Get OWNER tokens ids", async function () {
    console.log("\n ===================  \n\n")
    
    const index6 = await valocracy.indexByToken(6n);
    const index8 = await valocracy.indexByToken(8n);
    const index2 = await valocracy.indexByToken(2n);
    const index4 = await valocracy.indexByToken(4n);
    
    
    console.log('INDEX TOKEN 6 -->',index6);
    console.log('INDEX TOKEN 8 -->',index8);
    console.log('INDEX TOKEN 2 -->',index2);
    console.log('INDEX TOKEN 4 -->',index4);
    
    console.log('\n--------------------\n')
    
    const indexOwner6 = await valocracy.indexOwnerByToken(6n);
    const indexOwner8 = await valocracy.indexOwnerByToken(8n);
    const indexOwner2 = await valocracy.indexOwnerByToken(2n);
    const indexOwner4 = await valocracy.indexOwnerByToken(4n);
    
    console.log('INDEX OWNER TOKEN 6 -->',indexOwner6);
    console.log('INDEX OWNER TOKEN 8 -->',indexOwner8);
    console.log('INDEX OWNER TOKEN 2 -->',indexOwner2);
    console.log('INDEX OWNER TOKEN 4 -->',indexOwner4);
  });

  it("CLAIM", async function () {

    const valocracyWithOtherHolder = valocracy.connect(OTHER_HOLDER);

    console.log('\n\n\n --- CLAIM OWNER TOKEN 4 --- \n\n\n ')

    await valocracyWithOtherHolder.claim(4n);
  
    console.log("\n ===================  \n\n")
  });

   /**
  * Retorna os ids das nfts do OWNER
  */
  it("Get OWNER tokens ids", async function () {
    console.log("\n ===================  \n\n")
    expect( await valocracy.fetchOwnerTokens(OWNER.address,0,50,true)).to.deep.equal([ [ 1n, 0n ], [ 3n, 0n ] ]);
    const tokens = await valocracy.fetchOwnerTokens(OWNER.address,0,50,true);
    console.log('NFTS IDs do OWNER -->',tokens);
  });

   /**
    * Retorna os ids das nfts do OWNER
    */
  it("Get OTHER_HOLDER tokens ids", async function () {
    console.log("\n ===================  \n\n")
    //expect( await valocracy.fetchOwnerTokens(OTHER_HOLDER.address,0,50,true)).to.deep.equal([ [ 5n, 6n ], [ 7n, 8n ],[ 0n, 2n ], [ 0n, 4n ] ]);
    const tokens = await valocracy.fetchOwnerTokens(OTHER_HOLDER.address,0,50,true);
    console.log('NFTS IDs do OTHER_HOLDER -->',tokens);
   
  });

  it("All tokens", async function () {
    console.log("\n ===================  \n\n")
    console.log('----- ALL TOKENS -----')
    //expect( await valocracy.fetchAllTokens(0,50,true)).to.deep.equal([ [ 1n, 2n ], [ 3n, 4n ] , [ 5n, 6n ] , [ 7n, 8n ] ]);
    
    const tokens = await valocracy.fetchAllTokens(0, 50, true) as unknown as NestedTokenArray
    console.log('ALL NFTS -->',tokens);
    
  });

  it("Get OWNER tokens ids", async function () {
    console.log("\n ===================  \n\n")
    
    const index6 = await valocracy.indexByToken(6n);
    const index8 = await valocracy.indexByToken(8n);
    const index2 = await valocracy.indexByToken(2n);
    const index4 = await valocracy.indexByToken(4n);
    
    
    console.log('INDEX TOKEN 6 -->',index6);
    console.log('INDEX TOKEN 8 -->',index8);
    console.log('INDEX TOKEN 2 -->',index2);
    console.log('INDEX TOKEN 4 -->',index4);
    
    console.log('\n--------------------\n')
    
    const indexOwner6 = await valocracy.indexOwnerByToken(6n);
    const indexOwner8 = await valocracy.indexOwnerByToken(8n);
    const indexOwner2 = await valocracy.indexOwnerByToken(2n);
    const indexOwner4 = await valocracy.indexOwnerByToken(4n);
    
    console.log('INDEX OWNER TOKEN 6 -->',indexOwner6);
    console.log('INDEX OWNER TOKEN 8 -->',indexOwner8);
    console.log('INDEX OWNER TOKEN 2 -->',indexOwner2);
    console.log('INDEX OWNER TOKEN 4 -->',indexOwner4);
  });
  

  return

  it("total economic power", async function () {
    const tokens = await valocracy.fetchTotalEconomicPower();
    console.log('TOTAL ECONOMIC POWER -->',ethers.formatUnits(tokens,18));

    console.log("\n ===================  \n\n")
  });

  /**
  * Todos os tokens economicos
  */
  // it("all tokens economics", async function () {
  //   const tokens = await valocracy.fetchAlltokensEconomics();
  //   console.log('ALL TOKENS ECONOMICS -->',tokens);

  //   console.log("\n ===================  \n\n")
  // });

  /**
  * Retorna saldo em usdt do owner
  */
  it("Get USDT balance owner", async function () {
    const tokens = await USDTContract.balanceOf(OWNER.address);
    console.log('SALDO USDT OWNER -->',ethers.formatUnits(tokens,18));

    console.log("\n ===================  \n\n")
  });

  /**
   * TODOS OS TOKENS
   */
  it("All tokens", async function () {

    console.log('----- ALL TOKENS -----')

    const tokens = await valocracy.fetchAllTokens(0, 50, true) as unknown as NestedTokenArray
    console.log('ALL NFTS -->',tokens);
    tokens.map((e)  => {
      //console.log("NFT ->",e.economicId)
      console.log("gov ->",e.governanceId)
      console.log("eco ->",e.economicId)
    })

    console.log("\n ===================  \n\n")
  });

});

