import { NextResponse } from "next/server";

import { verifyXTasks } from "@/lib/x-verification";
import type { VerifyTasksPayload, VerifyTasksResponse } from "@/types/task-verification";

export async function POST(request: Request) {
  let payload: VerifyTasksPayload;

  try {
    payload = (await request.json()) as VerifyTasksPayload;
  } catch {
    return NextResponse.json<VerifyTasksResponse>(
      {
        ok: false,
        message: "Invalid verification request."
      },
      { status: 400 }
    );
  }

  const response = await verifyXTasks(payload.xUsername);
  return NextResponse.json<VerifyTasksResponse>(response, { status: response.ok ? 200 : 400 });
}
