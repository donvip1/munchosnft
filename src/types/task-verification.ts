export type XTaskId = "follow" | "like" | "repost";

export type XTaskStatusMap = Record<XTaskId, boolean>;

export type VerifyTasksPayload = {
  xUsername: string;
};

export type VerifyTasksResponse =
  | {
      ok: true;
      message: string;
      tasks: XTaskStatusMap;
    }
  | {
      ok: false;
      message: string;
      tasks?: Partial<XTaskStatusMap>;
      fieldErrors?: {
        xUsername?: string;
      };
    };
