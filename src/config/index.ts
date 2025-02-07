/* eslint-disable @typescript-eslint/no-explicit-any */
import dotenv from "dotenv";

const getEnvs = () => {
  
  let envPath = ''
  if(process.env.NODE_ENV === 'production'){

    console.log('\n\n-- MAINNET --\n\n')

    envPath = '.prod'
  }else if(process.env.NODE_ENV === 'test'){
    envPath = '.test'
  }else{
    console.log("Development")
    envPath = '.dev'
  }
  const dotenvResult = dotenv.config({path: `.env${envPath}`});
  // const dotenvResult = dotenv.config({ path: `.env` });

  if(dotenvResult.error) {
    const processEnv = process.env;

    if(processEnv && !processEnv.error) return processEnv;
  }

  return dotenvResult;
}
// const envFound = dotenv.config({ path: `.env` });
const envFound:any = getEnvs();

if (envFound.error) {
  // This error should crash whole process

  throw new Error(`Couldn't find .env file. ${envFound.error}`);
}

interface ENV {
  PORT: number,
  PRIVATE_KEY:string,
  URL_RPC_NETWORK:string,
  PASSPORT_CONTRACT_ADDRESS:string,
  ALIEN_CONTRACT_ADDRESS:string,
  MINTALIEN_CONTRACT_ADDRESS:string,
  CATALOG_CONTRACT_ADDRESS:string,
  DEVELOPMENT:boolean,
  USDC_CONTRACT_ADDRESS:string
  VALOCRACY_CONTRACT_ADDRESS:string
  LP_VALOCRACY_CONTRACT_ADDRESS:string
  OWNER_VALOCRACY_ADDRESS:string
  KEY_LINEA_DEPLOY_BEAVER:string
  ADDRESS_LINEA_OWNER_BEAVER:string
}
const env: ENV = {
  // Application
  PORT: Number(process.env.PORT),
  PRIVATE_KEY:process.env.PRIVATE_KEY || '',
  URL_RPC_NETWORK:process.env.URL_RPC_NETWORK || '',
  PASSPORT_CONTRACT_ADDRESS:process.env.PASSPORT_CONTRACT_ADDRESS || '',
  ALIEN_CONTRACT_ADDRESS:process.env.ALIEN_CONTRACT_ADDRESS || '',
  MINTALIEN_CONTRACT_ADDRESS:process.env.MINTALIEN_CONTRACT_ADDRESS || '',
  CATALOG_CONTRACT_ADDRESS:process.env.CATALOG_CONTRACT_ADDRESS || '',
  USDC_CONTRACT_ADDRESS:process.env.USDC_CONTRACT_ADDRESS || '',
  VALOCRACY_CONTRACT_ADDRESS:process.env.VALOCRACY_CONTRACT_ADDRESS || '',
  LP_VALOCRACY_CONTRACT_ADDRESS:process.env.LP_VALOCRACY_CONTRACT_ADDRESS || '',
  DEVELOPMENT:process.env.NODE_ENV === 'development',
  OWNER_VALOCRACY_ADDRESS: process.env.OWNER_VALOCRACY_ADDRESS || '',
  KEY_LINEA_DEPLOY_BEAVER:process.env.KEY_LINEA_DEPLOY_BEAVER || '',
  ADDRESS_LINEA_OWNER_BEAVER:process.env.ADDRESS_LINEA_OWNER_BEAVER || '',
};

export default env;
