import { NextResponse } from "next/server";

import { postCollabToGoogleAppsScript } from "@/lib/collab-api";
import { sanitizeCollabPayload, validateCollabPayload } from "@/lib/collab-validation";
import type { CollabPayload, CollabResponse } from "@/types/collab";

function generateDemoApplicationId() {
  return `MUNCH-COLLAB-${Math.floor(10000 + Math.random() * 90000)}`;
}

export async function POST(request: Request) {
  let payload: CollabPayload;

  try {
    payload = (await request.json()) as CollabPayload;
  } catch {
    return NextResponse.json<CollabResponse>(
      {
        ok: false,
        status: "invalid",
        message: "Invalid request payload."
      },
      { status: 400 }
    );
  }

  const sanitized = sanitizeCollabPayload(payload);
  const validation = validateCollabPayload(sanitized);

  if (!validation.valid) {
    return NextResponse.json<CollabResponse>(
      {
        ok: false,
        status: "invalid",
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
    return NextResponse.json<CollabResponse>(
      {
        ok: false,
        status: "error",
        message: "Collaboration backend is not configured."
      },
      { status: 500 }
    );
  }

  if (!hasConfiguredEndpoint) {
    return NextResponse.json<CollabResponse>({
      ok: true,
      status: "submitted",
      message: "Demo collaboration request complete. Add GOOGLE_APPS_SCRIPT_URL to store entries.",
      applicationId: generateDemoApplicationId()
    });
  }

  const response = await postCollabToGoogleAppsScript(endpoint as string, sanitized);
  return NextResponse.json<CollabResponse>(response, { status: response.ok ? 200 : 400 });
}
