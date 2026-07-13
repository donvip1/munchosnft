import type { CollabPayload, CollabResponse } from "@/types/collab";

type AppsScriptCollabResponse = {
  ok?: boolean;
  status?: "submitted" | "duplicate" | "invalid" | "error";
  message?: string;
  applicationId?: string;
  fieldErrors?: Partial<Record<keyof CollabPayload, string>>;
};

export async function submitCollab(payload: CollabPayload): Promise<CollabResponse> {
  const response = await fetch("/api/collab", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return (await response.json()) as CollabResponse;
}

export async function postCollabToGoogleAppsScript(
  endpoint: string,
  payload: CollabPayload
): Promise<CollabResponse> {
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
      status: "error",
      message: "Collaboration backend is unreachable. Check the Google Apps Script deployment URL."
    };
  }

  const text = await response.text();
  let data: AppsScriptCollabResponse;

  try {
    data = JSON.parse(text) as AppsScriptCollabResponse;
  } catch {
    return {
      ok: false,
      status: "error",
      message:
        "Collaboration backend returned an unexpected response. Confirm the Google Apps Script web app is deployed with public access."
    };
  }

  if (!response.ok || !data.ok) {
    const failureStatus = data.status === "submitted" ? "error" : data.status;

    return {
      ok: false,
      status: failureStatus ?? "error",
      message: data.message ?? "Unable to submit collaboration request.",
      fieldErrors: data.fieldErrors
    };
  }

  return {
    ok: true,
    status: "submitted",
    message: data.message ?? "Collaboration request submitted.",
    applicationId: data.applicationId ?? "MUNCH-COLLAB-DEMO"
  };
}
