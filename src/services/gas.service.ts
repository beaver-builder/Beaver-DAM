import {ethers,ContractTransactionReceipt} from 'ethers'; // Load Ethers library

class gasService {

	async transactionGasCost(tx:ContractTransactionReceipt | null) {

		if(!tx) throw "Transação não encontrada"

		const actualGasUsed = tx.gasUsed;
		const actualGasPrice = tx.gasPrice;
	
		// console.log('\ntx gas used:', actualGasUsed.toString());
		// console.log('gas price:', actualGasPrice.toString());
		// console.log('tx cost ether:', Number(ethers.formatEther(actualGasUsed * actualGasPrice)), 'ETH');
		// console.log('\n=====')
			
		return  actualGasUsed * actualGasPrice
		
	}

}

export default new gasService();
