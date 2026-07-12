import type { WaitlistPayload } from "@/types/waitlist";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const walletPattern = /^0x[a-fA-F0-9]{40}$/;
const xUsernamePattern = /^@?[A-Za-z0-9_]{1,15}$/;

export function normalizeXUsername(value: string) {
  return value.trim().replace(/^@/, "").toLowerCase();
}

export function normalizeWallet(value: string) {
  return value.trim().toLowerCase();
}

export function validateWaitlistPayload(payload: WaitlistPayload) {
  const fieldErrors: Partial<Record<keyof WaitlistPayload, string>> = {};

  if (!payload.fullName.trim()) {
    fieldErrors.fullName = "Full name is required.";
  }

  if (!emailPattern.test(payload.email.trim())) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!xUsernamePattern.test(payload.xUsername.trim())) {
    fieldErrors.xUsername = "Enter a valid X username.";
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

export function sanitizeWaitlistPayload(payload: WaitlistPayload): WaitlistPayload {
  const referralCode = payload.referralCode?.trim().toUpperCase();
  const referredBy = payload.referredBy?.trim().toUpperCase();

  return {
    fullName: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    xUsername: normalizeXUsername(payload.xUsername),
    walletAddress: normalizeWallet(payload.walletAddress),
    referralCode: referralCode || undefined,
    referredBy: referredBy || undefined,
    taskCompleted: Boolean(payload.taskCompleted)
  };
}
