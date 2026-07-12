export type WaitlistPayload = {
  fullName: string;
  email: string;
  xUsername: string;
  walletAddress: string;
  referralCode?: string;
  referredBy?: string;
  taskCompleted: boolean;
};

export type WaitlistSuccess = {
  ok: true;
  status: "registered" | "duplicate";
  message: string;
  referralCode: string;
  referralLink: string;
  referralCount: number;
  waitlistPosition?: number | null;
  rewardTier?: string | null;
};

export type WaitlistFailure = {
  ok: false;
  message: string;
  fieldErrors?: Partial<Record<keyof WaitlistPayload, string>>;
};

export type WaitlistResponse = WaitlistSuccess | WaitlistFailure;
