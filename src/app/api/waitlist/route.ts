import { NextResponse } from "next/server";

import { buildReferralLink, generateReferralCode } from "@/lib/referral";
import { postToGoogleAppsScript } from "@/lib/waitlist-api";
import { sanitizeWaitlistPayload, validateWaitlistPayload } from "@/lib/validation";
import type { WaitlistPayload, WaitlistResponse } from "@/types/waitlist";

export async function POST(request: Request) {
  let payload: WaitlistPayload;

  try {
    payload = (await request.json()) as WaitlistPayload;
  } catch {
    return NextResponse.json<WaitlistResponse>(
      {
        ok: false,
        message: "Invalid request payload."
      },
      { status: 400 }
    );
  }

  const sanitized = sanitizeWaitlistPayload(payload);
  const validation = validateWaitlistPayload(sanitized);

  if (!validation.valid) {
    return NextResponse.json<WaitlistResponse>(
      {
        ok: false,
        message: "Please correct the highlighted fields.",
        fieldErrors: validation.fieldErrors
      },
      { status: 400 }
    );
  }

  const endpoint = process.env.GOOGLE_APPS_SCRIPT_URL;
  const hasConfiguredEndpoint =
    Boolean(endpoint) && !endpoint?.includes("YOUR_DEPLOYMENT_ID");

  if (!hasConfiguredEndpoint && process.env.NODE_ENV === "production") {
    return NextResponse.json<WaitlistResponse>(
      {
        ok: false,
        message: "Waitlist backend is not configured."
      },
      { status: 500 }
    );
  }

  if (!hasConfiguredEndpoint) {
    const referralCode = generateReferralCode(sanitized.walletAddress);

    return NextResponse.json<WaitlistResponse>({
      ok: true,
      status: "registered",
      message: "Demo registration complete. Add GOOGLE_APPS_SCRIPT_URL to store entries.",
      referralCode,
      referralLink: buildReferralLink(referralCode),
      referralCount: 0,
      waitlistPosition: null,
      rewardTier: null
    });
  }

  const response = await postToGoogleAppsScript(endpoint as string, sanitized);
  return NextResponse.json<WaitlistResponse>(response, { status: response.ok ? 200 : 400 });
}
