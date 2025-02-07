//import database from "@/database/billing_control.database";
import {ethers} from 'ethers'; // Load Ethers library
import { Valocracy,LpValocracy,USDCVALOCRACY } from "typechain-types";
import valocracyArti from 'artifacts/contracts/Valocracy.sol/Valocracy.json';
import lpValocracy from 'artifacts/contracts/LpValocracy.sol/LpValocracy.json';
import usdcvalocracy from 'artifacts/contracts/USDCVALOCRACY.sol/USDCVALOCRACY.json';
import {wallet,} from '@/loaders/provider'
import env from "@/config";

class ValocracyService {

	ValocracyContract : Valocracy = new ethers.Contract(env.VALOCRACY_CONTRACT_ADDRESS, valocracyArti.abi, wallet) as unknown as Valocracy;
	LpContract : LpValocracy = new ethers.Contract(env.LP_VALOCRACY_CONTRACT_ADDRESS, lpValocracy.abi, wallet) as unknown as LpValocracy;
	USDTContract : USDCVALOCRACY = new ethers.Contract(env.USDC_CONTRACT_ADDRESS, usdcvalocracy.abi, wallet) as unknown as USDCVALOCRACY;

	async config() {
	
		await this.approve()

		if(env.DEVELOPMENT){
			await this.TransferUSDT("1000")
		}
	}

	async approve() {
		
		const amountToToken = ethers.parseUnits((2n ** 200n).toString(), 6);
		
		let tx = await this.LpContract.approveLpSpender(env.ADDRESS_LINEA_OWNER_BEAVER,env.VALOCRACY_CONTRACT_ADDRESS,amountToToken)
		console.log("\n\nDALEE\n\n")
		await tx.wait()

		const allowance = await this.LpContract.allowance(env.ADDRESS_LINEA_OWNER_BEAVER,env.VALOCRACY_CONTRACT_ADDRESS)     
		console.log('ALLOWANCE',ethers.formatUnits(allowance,6)); 
	}

	async allowance() {
		const allowance = await this.LpContract.allowance(env.ADDRESS_LINEA_OWNER_BEAVER,env.VALOCRACY_CONTRACT_ADDRESS)     
		console.log('ALLOWANCE',ethers.formatUnits(allowance,6)); 

		return ethers.formatUnits(allowance,6)
	}

	async TransferUSDT(amount:string) {

		const amountUSDT = ethers.parseUnits(amount, 6);
		const tx = await this.USDTContract.transfer(env.VALOCRACY_CONTRACT_ADDRESS,amountUSDT);
		await tx.wait()
		
		const balanceUsdt = await this.USDTContract.balanceOf(env.VALOCRACY_CONTRACT_ADDRESS);
		console.log("QUANTIDADE DE USDT NO CONTRATO DA VALOCRACIA -> ",ethers.formatUnits(balanceUsdt,6),"\n\n");
	}

	async balanceOfUsdt() {
	
		const balance = await this.USDTContract.balanceOf(env.VALOCRACY_CONTRACT_ADDRESS)
		const balanceOf = ethers.formatUnits(balance,6) 
		console.log("QUANTIDADE DE USDT NO CONTRATO DA VALOCRACIA -> ",balanceOf,"\n\n");
		return balanceOf
	
	}

	async error() {
	
		try {
			const decodedError = this.ValocracyContract.interface.parseError("0x89ba7e10");
			console.log("Erro decodificado:", decodedError);
		} catch (decodeError) {
			console.log("Não foi possível decodificar o erro:", decodeError);
		}
		
		return 'DALE PASSPORT'
	}
}

export default new ValocracyService();
