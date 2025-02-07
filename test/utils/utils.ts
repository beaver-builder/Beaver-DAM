import { ethers, } from "hardhat";

//número com 6 casas decimais, 2 casas pós virgula
export const twoFixedNumber = (number:number):number => {
      
  const scaledNumber = Math.round(number * 10 ** 6);
  
  const formattedNumber = ethers.formatUnits(BigInt(scaledNumber), 6);
  
  return Number(parseFloat(formattedNumber).toFixed(2));
 
}

export const twoFixed = (number:bigint):number => {
    
    return Number(parseFloat(ethers.formatUnits(number,6)).toFixed(2))
}

export const bigToNumber = (number:bigint):number => {
    
    return parseFloat(ethers.formatUnits(number,6))
}

//transforma wei para ether que é a casa decimal normal
export const formatEther = (bigint:bigint) => {
  return Number(ethers.formatEther(bigint))
}