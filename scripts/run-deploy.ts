import { task } from 'hardhat/config';

task("deploy", "Deploy contracts")
  .addParam("contract", "Identificador do contrato")
  .setAction(async (taskArgs, env) => {

    console.log("network ->",env.network.name,"\n")
 
    const contractDeploy = new Map<string, () => Promise<void>>();

    const { deployUsdtValocracy,deployValocracy } = await import("./deploy/deployValocracy");
    contractDeploy.set("usdt", deployUsdtValocracy);
    contractDeploy.set("valocracy", deployValocracy);

    const runDeploy = contractDeploy.get(taskArgs.contract);

    if (!runDeploy) {
      throw new Error("Contract deploy not found");
    }

    // Executa a função de deploy.
    await runDeploy();
  });
