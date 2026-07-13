import { buildReferralLink, generateReferralCode } from "@/lib/referral";
import type { WhitelistPayload, WhitelistResponse } from "@/types/whitelist";

type AppsScriptResponse = {
  ok?: boolean;
  status?: "registered" | "duplicate";
  message?: string;
  referralCode?: string;
  referralLink?: string;
  referralCount?: number;
  whitelistPosition?: number | null;
  rewardTier?: string | null;
};

export async function submitWhitelist(payload: WhitelistPayload): Promise<WhitelistResponse> {
  const response = await fetch("/api/whitelist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return (await response.json()) as WhitelistResponse;
}

export async function postToGoogleAppsScript(
  endpoint: string,
  payload: WhitelistPayload
): Promise<WhitelistResponse> {
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload),
      cache: "no-store"
    });
  } catch {
    return {
      ok: false,
      message: "Whitelist backend is unreachable. Check the Google Apps Script deployment URL."
    };
  }

  const text = await response.text();
  let data: AppsScriptResponse;

  try {
    data = JSON.parse(text) as AppsScriptResponse;
  } catch {
    return {
      ok: false,
      message:
        "Whitelist backend returned an unexpected response. Confirm the Google Apps Script web app is deployed with public access."
    };
  }

  if (!response.ok || !data.ok) {
    return {
      ok: false,
      message: data.message ?? "Unable to complete whitelist registration."
    };
  }

  const referralCode = data.referralCode ?? generateReferralCode(payload.walletAddress);

  return {
    ok: true,
    status: data.status ?? "registered",
    message: data.message ?? "You are on the Munchos NFT whitelist.",
    referralCode,
    referralLink: data.referralLink ?? buildReferralLink(referralCode),
    referralCount: data.referralCount ?? 0,
    whitelistPosition: data.whitelistPosition ?? null,
    rewardTier: data.rewardTier ?? null
  };
}
