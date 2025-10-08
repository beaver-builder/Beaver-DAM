import { task } from 'hardhat/config';

export const verifyTask = task("verifyContracts", "Verify contracts")
  .setAction(
    async () => ({
    default: async (taskArgs, hre) => {

    console.log("taskArgs ->",taskArgs,"\n")
    const {ethers} = await hre.network.connect();
    const network = await ethers.provider.getNetwork();
    console.log("network ->",network.name,"\n")

    const { verifyContract} = await import("./deploy/verifyContract");


    // Executa a função de deploy.
    await verifyContract();
  }})
).build();

