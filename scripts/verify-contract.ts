import { task } from 'hardhat/config';

task("verifyContracts", "Verify contracts")
  .setAction(async (taskArgs, env) => {

    console.log("network ->",env.network.name,"\n")

    const { verifyContract} = await import("./deploy/verifyContract");


    // Executa a função de deploy.
    await verifyContract();
  });
