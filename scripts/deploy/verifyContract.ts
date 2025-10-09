/* eslint-disable @typescript-eslint/no-unused-vars */
import hardhat from "hardhat";
import { delay, isHardhatNetwork, normalizeVerifyArgs } from "../utils";
import env from "@/config";
import { ethers } from "ethers";

async function verify(
  contractPath: string,
  contractName: string,
  args: any[],
  contractAddress: string
) {
  console.log(`\n -- verify ${contractName} --\n`);
  try {
    if (await isHardhatNetwork()) throw new Error("Network not supported");

    const constructorArgs = Array.isArray(args)
      ? normalizeVerifyArgs([...args])
      : [];

    await hardhat.tasks.getTask(["verify", "etherscan"]).run({
      address: contractAddress,
      constructorArgs: constructorArgs,
      contract: contractPath,
    });
  } catch (error) {
    console.log("\nERROR VERIFY CONTRACT\n");
    console.log(error);
    console.log("\nERROR VERIFY CONTRACT\n");
  }
  console.log("\n====================\n\n");
}

export async function verifyContract() {
  const args = [
    "ipfs://QmaHYPkpyGx4a6N4nBYLMHntmj8wxRV2S7LtjU3yPgvYDx",
    "0x0E5bBCecfD30FAb0a076C4Df16Ab0221Ae4Cd1C1",
    env.USDC_CONTRACT_ADDRESS,
    ethers.MaxUint256,
    env.ADDRESS_LINEA_OWNER_BEAVER
  ] as const;

  const constructorArgs = Array.isArray(args)
  ? normalizeVerifyArgs([...args])
  : [];

  await hardhat.tasks.getTask(["verify", "etherscan"]).run({
    address: "0x08a14f06A6D65A59d967B0f135D08307A7aa4b29",
    constructorArgs: constructorArgs,
    contract: "contracts/Valocracy.sol:Valocracy",

  });
}
