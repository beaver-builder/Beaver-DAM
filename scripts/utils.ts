import { network } from 'hardhat';

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function isHardhatNetwork(): Promise<boolean> {
  const {ethers} = await network.connect();
  const net = await ethers.provider.getNetwork();
  return ['hardhat', 'localhost'].includes(net.name);
}

export function convertBigNumberToDecimalTokenValue(value: bigint, tokenPlaces: number): number {
  return Number(value / BigInt(Math.pow(10, tokenPlaces)));
}

function bigintJSONReplacer(_key: string, value: unknown): unknown {
  return typeof value === 'bigint' ? value.toString() : value;
}

export function normalizeVerifyArgs(args: ReadonlyArray<unknown>): string[] {
  return args.map((arg) => {
    if (typeof arg === 'string') return arg;
    if (
      typeof arg === 'bigint' ||
      typeof arg === 'number' ||
      typeof arg === 'boolean' ||
      arg === null ||
      arg === undefined
    ) {
      return String(arg);
    }
    if (Array.isArray(arg)) {
      return JSON.stringify(arg, bigintJSONReplacer);
    }
    if (arg instanceof Uint8Array) {
      const hex = Array.from(arg)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
      return `0x${hex}`;
    }
    return JSON.stringify(arg, bigintJSONReplacer);
  });
}
