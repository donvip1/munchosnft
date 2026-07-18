import { isAddress, zeroAddress } from "viem";

export function isFusionConfigured(address?: string) {
  return Boolean(address && isAddress(address) && address !== zeroAddress);
}

export function getTransactionError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;
  const firstLine = error.message.split("\n")[0];
  return firstLine || fallback;
}
