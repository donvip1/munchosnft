import { buildReferralLink, generateReferralCode } from "@/lib/referral";
import type { VerifyTasksPayload, VerifyTasksResponse } from "@/types/task-verification";
import type { WaitlistPayload, WaitlistResponse } from "@/types/waitlist";

type AppsScriptResponse = {
  ok?: boolean;
  status?: "registered" | "duplicate";
  message?: string;
  referralCode?: string;
  referralLink?: string;
  referralCount?: number;
  waitlistPosition?: number | null;
  rewardTier?: string | null;
};

export async function submitWaitlist(payload: WaitlistPayload): Promise<WaitlistResponse> {
  const response = await fetch("/api/waitlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return (await response.json()) as WaitlistResponse;
}

export async function verifyWaitlistTasks(
  payload: VerifyTasksPayload
): Promise<VerifyTasksResponse> {
  const response = await fetch("/api/tasks/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return (await response.json()) as VerifyTasksResponse;
}

export async function postToGoogleAppsScript(
  endpoint: string,
  payload: WaitlistPayload
): Promise<WaitlistResponse> {
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
      message: "Waitlist backend is unreachable. Check the Google Apps Script deployment URL."
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
        "Waitlist backend returned an unexpected response. Confirm the Google Apps Script web app is deployed with public access."
    };
  }

  if (!response.ok || !data.ok) {
    return {
      ok: false,
      message: data.message ?? "Unable to complete waitlist registration."
    };
  }

  const referralCode = data.referralCode ?? generateReferralCode(payload.walletAddress);

  return {
    ok: true,
    status: data.status ?? "registered",
    message: data.message ?? "You are on the Munchos NFT waitlist.",
    referralCode,
    referralLink: data.referralLink ?? buildReferralLink(referralCode),
    referralCount: data.referralCount ?? 0,
    waitlistPosition: data.waitlistPosition ?? null,
    rewardTier: data.rewardTier ?? null
  };
}
