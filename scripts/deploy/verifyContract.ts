/* eslint-disable @typescript-eslint/no-unused-vars */
import hardhat from "hardhat";
import { delay, isHardhatNetwork, normalizeVerifyArgs } from "../utils";
import env from "@/config";

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
  const argsLpValocracy = [(2n ** 200n),env.ADDRESS_LINEA_OWNER_BEAVER];

  await verify(
    "contracts/LpValocracy.sol:LpValocracy",
    "LP VALOCRACY",
    argsLpValocracy,
    "0x5E2F387A4b8f8CEA4dDA27CAd13c8963530DC6Ca"
  );
}
