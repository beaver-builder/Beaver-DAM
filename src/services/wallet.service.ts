import {ethers} from 'ethers'; // Load Ethers library
import {wallet,provider} from '@/loaders/provider'

class walletService {

	async balanceOf() {

		const balance = await provider.getBalance(wallet.address)
			
		return ethers.formatEther(balance)
	}

}

export default new walletService();
