import { isAddress, zeroAddress } from "viem";

export type FusionInputValidation =
  | { ok: true; tokenIds: readonly [bigint, bigint] }
  | { ok: false; message: string };

export function isFusionConfigured(address?: string) {
  return Boolean(address && isAddress(address) && address !== zeroAddress);
}

export function validateFusionInputs(first: string, second: string): FusionInputValidation {
  if (!/^\d+$/.test(first) || !/^\d+$/.test(second)) {
    return { ok: false, message: "Enter two valid Genesis token IDs." };
  }

  const tokenIds = [BigInt(first), BigInt(second)] as const;
  if (tokenIds[0] === tokenIds[1]) {
    return { ok: false, message: "Choose two different Genesis NFTs." };
  }

  return { ok: true, tokenIds };
}

export function getTransactionError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;
  const firstLine = error.message.split("\n")[0];
  return firstLine || fallback;
}
