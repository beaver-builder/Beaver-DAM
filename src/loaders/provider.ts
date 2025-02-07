import { ethers } from "ethers";
import { network } from "hardhat";
import env from "../config";

//const envFound = dotenv.config({path: `.env${process.env.NODE_ENV === 'development' ? '.dev' : ''}`});

const providerURL =  env.URL_RPC_NETWORK;
console.log({providerURL})
const provider = new ethers.JsonRpcProvider(providerURL)

const privateKey = env.KEY_LINEA_DEPLOY_BEAVER ?? ''
const wallet = new ethers.Wallet(privateKey, provider);
console.log('aqui')

export {
    provider,
    wallet
} 

