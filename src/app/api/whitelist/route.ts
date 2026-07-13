import { NextResponse } from "next/server";

import { buildReferralLink, generateReferralCode } from "@/lib/referral";
import { postToGoogleAppsScript } from "@/lib/whitelist-api";
import { sanitizeWhitelistPayload, validateWhitelistPayload } from "@/lib/validation";
import type { WhitelistPayload, WhitelistResponse } from "@/types/whitelist";

export async function POST(request: Request) {
  let payload: WhitelistPayload;

  try {
    payload = (await request.json()) as WhitelistPayload;
  } catch {
    return NextResponse.json<WhitelistResponse>(
      {
        ok: false,
        message: "Invalid request payload."
      },
      { status: 400 }
    );
  }

  const sanitized = sanitizeWhitelistPayload(payload);
  const validation = validateWhitelistPayload(sanitized);

  if (!validation.valid) {
    return NextResponse.json<WhitelistResponse>(
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
    return NextResponse.json<WhitelistResponse>(
      {
        ok: false,
        message: "Whitelist backend is not configured."
      },
      { status: 500 }
    );
  }

  if (!hasConfiguredEndpoint) {
    const referralCode = generateReferralCode(sanitized.walletAddress);

    return NextResponse.json<WhitelistResponse>({
      ok: true,
      status: "registered",
      message: "Demo registration complete. Add GOOGLE_APPS_SCRIPT_URL to store entries.",
      referralCode,
      referralLink: buildReferralLink(referralCode),
      referralCount: 0,
      whitelistPosition: null,
      rewardTier: null
    });
  }

  const response = await postToGoogleAppsScript(endpoint as string, sanitized);
  return NextResponse.json<WhitelistResponse>(response, { status: response.ok ? 200 : 400 });
}
