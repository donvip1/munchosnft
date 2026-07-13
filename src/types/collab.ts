export const applicantTypes = [
  "Project",
  "Creator",
  "Brand",
  "Marketplace",
  "Community",
  "Infrastructure",
  "Media",
  "Other"
] as const;

export const collaborationTypes = [
  "AMA",
  "NFT Partnership",
  "Cross Promotion",
  "Marketing",
  "Whitelist Exchange",
  "Giveaway",
  "Collection Launch",
  "Grant",
  "Community Growth",
  "Technical Integration",
  "Strategic Partnership",
  "Other"
] as const;

export type ApplicantType = (typeof applicantTypes)[number];
export type CollaborationType = (typeof collaborationTypes)[number];

export type CollabSocialLink = {
  label: string;
  url: string;
};

export type CollabLogoUpload = {
  fileName: string;
  mimeType: string;
  size: number;
  base64: string;
};

export type CollabPayload = {
  formType: "collaboration";
  applicantType: ApplicantType;
  collaborationTypes: CollaborationType[];
  projectName: string;
  contactName: string;
  email: string;
  telegram: string;
  xUsername: string;
  discord?: string;
  country: string;
  website: string;
  socialLinks: CollabSocialLink[];
  projectDescription: string;
  whyCollaborate: string;
  extraInfo?: string;
  logo?: CollabLogoUpload;
  confirmed: boolean;
};

export type CollabSuccess = {
  ok: true;
  status: "submitted";
  message: string;
  applicationId: string;
};

export type CollabFailure = {
  ok: false;
  status?: "duplicate" | "invalid" | "error";
  message: string;
  fieldErrors?: Partial<Record<keyof CollabPayload, string>>;
};

export type CollabResponse = CollabSuccess | CollabFailure;
