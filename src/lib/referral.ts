import { siteConfig } from "@/config/site";

export function generateReferralCode(seed = crypto.randomUUID()) {
  const compactSeed = seed.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const token = compactSeed.slice(0, 6).padEnd(6, "0");

  return `MUNCHOS-${token}`;
}

export function buildReferralLink(code: string) {
  const url = new URL(siteConfig.siteUrl);
  url.pathname = "/whitelist";
  url.searchParams.set("ref", code);

  return url.toString();
}

export function normalizeReferralCode(value?: string) {
  return value?.trim().toUpperCase() || "";
}
