const DEFAULT_TESTNET_ENDS_AT = "2026-07-28T23:59:00+01:00";

export const testnetEndsAt =
  process.env.NEXT_PUBLIC_TESTNET_ENDS_AT ?? DEFAULT_TESTNET_ENDS_AT;

export const testnetEndsAtMs = Date.parse(testnetEndsAt);

if (Number.isNaN(testnetEndsAtMs)) {
  throw new Error("NEXT_PUBLIC_TESTNET_ENDS_AT must be a valid ISO 8601 date-time.");
}
