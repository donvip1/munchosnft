import type { WhitelistPayload } from "@/types/whitelist";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const walletPattern = /^0x[a-fA-F0-9]{40}$/;
const xUsernamePattern = /^@?[A-Za-z0-9_]{1,15}$/;
const xPostUrlPattern =
  /^https?:\/\/(www\.)?(x|twitter)\.com\/([A-Za-z0-9_]{1,15}|i)\/status(es)?\/\d+/i;

export function normalizeXUsername(value: string) {
  return value.trim().replace(/^@/, "").toLowerCase();
}

export function normalizeWallet(value: string) {
  return value.trim().toLowerCase();
}

export function validateWhitelistPayload(payload: WhitelistPayload) {
  const fieldErrors: Partial<Record<keyof WhitelistPayload, string>> = {};

  if (!payload.fullName.trim()) {
    fieldErrors.fullName = "Full name is required.";
  }

  if (!emailPattern.test(payload.email.trim())) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!xUsernamePattern.test(payload.xUsername.trim())) {
    fieldErrors.xUsername = "Enter a valid X username.";
  }

  if (!xPostUrlPattern.test(payload.xPostUrl.trim())) {
    fieldErrors.xPostUrl = "Enter a valid X post link.";
  }

  if (!walletPattern.test(payload.walletAddress.trim())) {
    fieldErrors.walletAddress = "Enter a valid EVM wallet address.";
  }

  if (!payload.taskCompleted) {
    fieldErrors.taskCompleted = "Confirm that the required tasks are complete.";
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors
  };
}

export function sanitizeWhitelistPayload(payload: WhitelistPayload): WhitelistPayload {
  const referralCode = payload.referralCode?.trim().toUpperCase();
  const referredBy = payload.referredBy?.trim().toUpperCase();

  return {
    fullName: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    xUsername: normalizeXUsername(payload.xUsername),
    xPostUrl: payload.xPostUrl.trim(),
    walletAddress: normalizeWallet(payload.walletAddress),
    referralCode: referralCode || undefined,
    referredBy: referredBy || undefined,
    taskCompleted: Boolean(payload.taskCompleted)
  };
}
