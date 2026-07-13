import {
  applicantTypes,
  collaborationTypes,
  type CollabPayload,
  type CollabSocialLink
} from "@/types/collab";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
const allowedLogoTypes = ["image/png", "image/svg+xml", "image/jpeg"] as const;
const maxLogoSize = 5 * 1024 * 1024;

function normalizeOptional(value?: string) {
  return value?.trim() || undefined;
}

function normalizeSocialLinks(links: CollabSocialLink[]) {
  return links
    .map((link) => ({
      label: link.label.trim(),
      url: link.url.trim()
    }))
    .filter((link) => link.url);
}

export function validateCollabPayload(payload: CollabPayload) {
  const fieldErrors: Partial<Record<keyof CollabPayload, string>> = {};

  if (!applicantTypes.includes(payload.applicantType)) {
    fieldErrors.applicantType = "Choose who you are.";
  }

  if (!payload.projectName.trim()) {
    fieldErrors.projectName = "Project or brand name is required.";
  }

  if (!payload.contactName.trim()) {
    fieldErrors.contactName = "Contact name is required.";
  }

  if (!emailPattern.test(payload.email.trim())) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (!payload.telegram.trim()) {
    fieldErrors.telegram = "Telegram username is required.";
  }

  if (!payload.xUsername.trim()) {
    fieldErrors.xUsername = "X username is required.";
  }

  if (!payload.country.trim()) {
    fieldErrors.country = "Country is required.";
  }

  if (!urlPattern.test(payload.website.trim())) {
    fieldErrors.website = "Enter a valid website URL including https://.";
  }

  if (!payload.collaborationTypes.length) {
    fieldErrors.collaborationTypes = "Select at least one collaboration type.";
  } else if (
    payload.collaborationTypes.some((type) => !collaborationTypes.includes(type))
  ) {
    fieldErrors.collaborationTypes = "Select valid collaboration types.";
  }

  const socialLinks = normalizeSocialLinks(payload.socialLinks);
  const invalidSocialLink = socialLinks.find((link) => !link.label || !urlPattern.test(link.url));

  if (invalidSocialLink) {
    fieldErrors.socialLinks = "Each social link needs a label and valid URL.";
  }

  if (payload.projectDescription.trim().length < 150) {
    fieldErrors.projectDescription = "Describe your project in at least 150 characters.";
  }

  if (payload.whyCollaborate.trim().length < 100) {
    fieldErrors.whyCollaborate = "Share why we should collaborate in at least 100 characters.";
  }

  if (payload.logo) {
    if (!allowedLogoTypes.includes(payload.logo.mimeType as (typeof allowedLogoTypes)[number])) {
      fieldErrors.logo = "Upload a PNG, SVG, or JPG logo.";
    } else if (payload.logo.size > maxLogoSize) {
      fieldErrors.logo = "Logo must be 5MB or smaller.";
    } else if (!payload.logo.base64) {
      fieldErrors.logo = "Logo upload is missing file data.";
    }
  }

  if (!payload.confirmed) {
    fieldErrors.confirmed = "Confirm that the information is accurate.";
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors
  };
}

export function sanitizeCollabPayload(payload: CollabPayload): CollabPayload {
  return {
    formType: "collaboration",
    applicantType: payload.applicantType,
    collaborationTypes: payload.collaborationTypes.filter((type) =>
      collaborationTypes.includes(type)
    ),
    projectName: payload.projectName.trim(),
    contactName: payload.contactName.trim(),
    email: payload.email.trim().toLowerCase(),
    telegram: payload.telegram.trim(),
    xUsername: payload.xUsername.trim().replace(/^@/, ""),
    discord: normalizeOptional(payload.discord),
    country: payload.country.trim(),
    website: payload.website.trim(),
    socialLinks: normalizeSocialLinks(payload.socialLinks),
    projectDescription: payload.projectDescription.trim(),
    whyCollaborate: payload.whyCollaborate.trim(),
    extraInfo: normalizeOptional(payload.extraInfo),
    logo: payload.logo,
    confirmed: Boolean(payload.confirmed)
  };
}

export const collabValidationRules = {
  maxLogoSize,
  allowedLogoTypes,
  urlPattern
};
