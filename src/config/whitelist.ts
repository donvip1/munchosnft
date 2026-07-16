// 21:00 on 16 July 2026 in Africa/Lagos (WAT), represented in UTC.
export const WHITELIST_CUTOFF_AT = "2026-07-16T20:00:00.000Z";

export function isWhitelistClosed(now = new Date()) {
  return now.getTime() >= Date.parse(WHITELIST_CUTOFF_AT);
}
