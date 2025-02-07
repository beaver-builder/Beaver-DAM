import { network } from 'hardhat';

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isHardhatNetwork(): boolean {
  return ['hardhat', 'localhost'].includes(network.name);
}

export function convertBigNumberToDecimalTokenValue(value: bigint, tokenPlaces: number): number {
  return Number(value / BigInt(Math.pow(10, tokenPlaces)));
}