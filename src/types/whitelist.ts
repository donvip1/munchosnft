export type WhitelistPayload = {
  fullName: string;
  email: string;
  xUsername: string;
  xPostUrl: string;
  walletAddress: string;
  referralCode?: string;
  referredBy?: string;
  taskCompleted: boolean;
};

export type WhitelistSuccess = {
  ok: true;
  status: "registered" | "duplicate";
  message: string;
  referralCode: string;
  referralLink: string;
  referralCount: number;
  whitelistPosition?: number | null;
  rewardTier?: string | null;
};

export type WhitelistFailure = {
  ok: false;
  message: string;
  fieldErrors?: Partial<Record<keyof WhitelistPayload, string>>;
};

export type WhitelistResponse = WhitelistSuccess | WhitelistFailure;
