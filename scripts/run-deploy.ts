import { task } from 'hardhat/config';

export const deployTask = task("deploy", "Deploy contracts")
  .addOption({name: "contract", description: "Identificador do contrato", defaultValue: ""})
  .setAction(async () => ({
    default: async (taskArgs, hre) => {
      console.log("Deploying contract...\n")

      const {ethers} = await hre.network.connect();
      const network = await ethers.provider.getNetwork();
      console.log("network ->",network.name,"\n")
   
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
    }
  })).build();

