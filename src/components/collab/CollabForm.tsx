"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  Check,
  Globe2,
  Mail,
  Send,
  Sparkles,
  UserRound
} from "lucide-react";
import { useMemo, useState } from "react";

import { CollabField, CollabTextarea } from "@/components/collab/CollabField";
import { CollabLoadingState } from "@/components/collab/CollabLoadingState";
import { CollabSuccessModal } from "@/components/collab/CollabSuccessModal";
import { CollabUpload } from "@/components/collab/CollabUpload";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { submitCollab } from "@/lib/collab-api";
import { sanitizeCollabPayload, validateCollabPayload } from "@/lib/collab-validation";
import {
  applicantTypes,
  collaborationTypes,
  type ApplicantType,
  type CollabPayload,
  type CollabSocialLink,
  type CollaborationType
} from "@/types/collab";

const socialLinkDefaults: CollabSocialLink[] = [
  { label: "X Profile", url: "" },
  { label: "Telegram", url: "" },
  { label: "Discord", url: "" },
  { label: "GitHub", url: "" },
  { label: "OpenSea", url: "" },
  { label: "Magic Eden", url: "" },
  { label: "Robinhood Chain Explorer Profile", url: "" },
  { label: "Other Link", url: "" }
];

const initialPayload: CollabPayload = {
  formType: "collaboration",
  applicantType: "Project",
  collaborationTypes: [],
  projectName: "",
  contactName: "",
  email: "",
  telegram: "",
  xUsername: "",
  discord: "",
  country: "",
  website: "",
  socialLinks: socialLinkDefaults,
  projectDescription: "",
  whyCollaborate: "",
  extraInfo: "",
  confirmed: false
};

const steps = [
  "Identity",
  "Links",
  "Project",
  "Review"
] as const;

const stepFieldMap: Array<Array<keyof CollabPayload>> = [
  [
    "applicantType",
    "projectName",
    "contactName",
    "email",
    "telegram",
    "xUsername",
    "country",
    "website"
  ],
  ["socialLinks", "collaborationTypes"],
  ["projectDescription", "whyCollaborate"],
  ["logo", "confirmed"]
];

export function CollabForm() {
  const [form, setForm] = useState<CollabPayload>(initialPayload);
  const [step, setStep] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CollabPayload, string>>>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const progress = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step]);

  function updateField<K extends keyof CollabPayload>(field: K, value: CollabPayload[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setStatusMessage("");
  }

  function updateSocialLink(index: number, field: keyof CollabSocialLink, value: string) {
    setForm((current) => ({
      ...current,
      socialLinks: current.socialLinks.map((link, linkIndex) =>
        linkIndex === index ? { ...link, [field]: value } : link
      )
    }));
    setFieldErrors((current) => ({ ...current, socialLinks: undefined }));
  }

  function addSocialLink() {
    setForm((current) => ({
      ...current,
      socialLinks: [...current.socialLinks, { label: "Other Link", url: "" }]
    }));
  }

  function toggleCollaborationType(type: CollaborationType) {
    setForm((current) => ({
      ...current,
      collaborationTypes: current.collaborationTypes.includes(type)
        ? current.collaborationTypes.filter((item) => item !== type)
        : [...current.collaborationTypes, type]
    }));
    setFieldErrors((current) => ({ ...current, collaborationTypes: undefined }));
  }

  function validateCurrentStep() {
    const sanitized = sanitizeCollabPayload(form);
    const validation = validateCollabPayload(sanitized);
    const currentFields = stepFieldMap[step];
    const scopedErrors = Object.fromEntries(
      Object.entries(validation.fieldErrors).filter(([field]) =>
        currentFields.includes(field as keyof CollabPayload)
      )
    ) as Partial<Record<keyof CollabPayload, string>>;

    setFieldErrors(scopedErrors);
    setStatusMessage(Object.keys(scopedErrors).length ? "Please complete this section first." : "");

    return Object.keys(scopedErrors).length === 0;
  }

  function goNext() {
    if (validateCurrentStep()) {
      setStep((current) => Math.min(current + 1, steps.length - 1));
    }
  }

  function goBack() {
    setStatusMessage("");
    setFieldErrors({});
    setStep((current) => Math.max(current - 1, 0));
  }

  async function handleSubmit() {
    const sanitized = sanitizeCollabPayload(form);
    const validation = validateCollabPayload(sanitized);

    if (!validation.valid) {
      setFieldErrors(validation.fieldErrors);
      setStatusMessage("Please correct the highlighted fields before submitting.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");
    const response = await submitCollab(sanitized);
    setIsSubmitting(false);

    if (!response.ok) {
      setFieldErrors(response.fieldErrors ?? {});
      setStatusMessage(response.message);
      return;
    }

    setApplicationId(response.applicationId);
    setSuccessOpen(true);
  }

  function resetForm() {
    setForm(initialPayload);
    setStep(0);
    setFieldErrors({});
    setStatusMessage("");
    setApplicationId("");
    setSuccessOpen(false);
  }

  return (
    <>
      <GlassCard className="relative mx-auto max-w-[760px] overflow-hidden p-4 sm:p-6">
        <motion.div
          aria-hidden="true"
          animate={{ opacity: [0.28, 0.78, 0.28] }}
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lemon to-transparent"
          transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
        />

        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 text-xs text-white/48">
            <span className="font-pixel uppercase">
              Step {step + 1} of {steps.length}
            </span>
            <span className="font-pixel uppercase text-lemon">{steps[step]}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40">
            <motion.div
              className="h-full rounded-full bg-lemon shadow-lemon"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.22 }}
        >
          {step === 0 ? (
            <div className="space-y-6">
              <SectionTitle eyebrow="Section 1" title="Who are you?" />
              <div className="grid gap-3 sm:grid-cols-2">
                {applicantTypes.map((type) => {
                  const selected = form.applicantType === type;
                  return (
                    <motion.button
                      aria-pressed={selected}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-lemon/60 bg-lemon/[0.12] shadow-lemon"
                          : "border-white/10 bg-black/24 hover:border-lemon/35 hover:bg-white/[0.055]"
                      }`}
                      key={type}
                      type="button"
                      whileHover={{ y: -2 }}
                      onClick={() => updateField("applicantType", type as ApplicantType)}
                    >
                      <span className="font-pixel text-sm uppercase text-white">{type}</span>
                    </motion.button>
                  );
                })}
              </div>

              <SectionTitle eyebrow="Section 2" title="Basic Information" />
              <div className="grid gap-4 sm:grid-cols-2">
                <CollabField
                  label="Project / Brand Name"
                  value={form.projectName}
                  error={fieldErrors.projectName}
                  onChange={(value) => updateField("projectName", value)}
                  icon={<Sparkles aria-hidden="true" size={17} />}
                  required
                />
                <CollabField
                  label="Contact Name"
                  value={form.contactName}
                  error={fieldErrors.contactName}
                  onChange={(value) => updateField("contactName", value)}
                  autoComplete="name"
                  icon={<UserRound aria-hidden="true" size={17} />}
                  required
                />
                <CollabField
                  label="Email Address"
                  value={form.email}
                  error={fieldErrors.email}
                  onChange={(value) => updateField("email", value)}
                  type="email"
                  autoComplete="email"
                  icon={<Mail aria-hidden="true" size={17} />}
                  required
                />
                <CollabField
                  label="Telegram Username"
                  value={form.telegram}
                  error={fieldErrors.telegram}
                  onChange={(value) => updateField("telegram", value)}
                  placeholder="@username"
                  icon={<AtSign aria-hidden="true" size={17} />}
                  required
                />
                <CollabField
                  label="X Username"
                  value={form.xUsername}
                  error={fieldErrors.xUsername}
                  onChange={(value) => updateField("xUsername", value)}
                  placeholder="@project"
                  icon={<AtSign aria-hidden="true" size={17} />}
                  required
                />
                <CollabField
                  label="Discord Username"
                  value={form.discord ?? ""}
                  onChange={(value) => updateField("discord", value)}
                  placeholder="Optional"
                  icon={<AtSign aria-hidden="true" size={17} />}
                />
                <CollabField
                  label="Country"
                  value={form.country}
                  error={fieldErrors.country}
                  onChange={(value) => updateField("country", value)}
                  required
                />
                <CollabField
                  label="Website"
                  value={form.website}
                  error={fieldErrors.website}
                  onChange={(value) => updateField("website", value)}
                  placeholder="https://"
                  icon={<Globe2 aria-hidden="true" size={17} />}
                  required
                />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-6">
              <SectionTitle eyebrow="Section 3" title="Social Links" />
              <div className="grid gap-4 sm:grid-cols-2">
                {form.socialLinks.map((link, index) => (
                  <div className="grid gap-2" key={`${link.label}-${index}`}>
                    <CollabField
                      label={link.label}
                      value={link.url}
                      error={index === 0 ? fieldErrors.socialLinks : undefined}
                      onChange={(value) => updateSocialLink(index, "url", value)}
                      placeholder="https://"
                    />
                  </div>
                ))}
              </div>
              <Button size="sm" type="button" variant="secondary" onClick={addSocialLink}>
                Add More
              </Button>

              <SectionTitle eyebrow="Section 4" title="Collaboration Type" />
              <div className="grid gap-3 sm:grid-cols-2">
                {collaborationTypes.map((type) => {
                  const selected = form.collaborationTypes.includes(type);
                  return (
                    <motion.button
                      aria-pressed={selected}
                      className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${
                        selected
                          ? "border-lemon/60 bg-lemon/[0.12]"
                          : "border-white/10 bg-black/24 hover:border-lemon/35"
                      }`}
                      key={type}
                      type="button"
                      whileHover={{ y: -2 }}
                      onClick={() => toggleCollaborationType(type)}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                          selected ? "border-lemon bg-lemon text-black" : "border-white/18"
                        }`}
                      >
                        {selected ? <Check aria-hidden="true" size={14} /> : null}
                      </span>
                      <span className="font-pixel text-sm text-white">{type}</span>
                    </motion.button>
                  );
                })}
              </div>
              {fieldErrors.collaborationTypes ? (
                <p className="text-xs text-red-300">{fieldErrors.collaborationTypes}</p>
              ) : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <SectionTitle eyebrow="Section 5" title="Project Information" />
              <CollabTextarea
                label="Describe your project."
                value={form.projectDescription}
                error={fieldErrors.projectDescription}
                onChange={(value) => updateField("projectDescription", value)}
                minLength={150}
                required
              />
              <SectionTitle eyebrow="Section 6" title="Why should Munchos collaborate with you?" />
              <CollabTextarea
                label="Collaboration Fit"
                value={form.whyCollaborate}
                error={fieldErrors.whyCollaborate}
                onChange={(value) => updateField("whyCollaborate", value)}
                minLength={100}
                required
              />
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-6">
              <SectionTitle eyebrow="Section 7" title="Upload" />
              <CollabUpload
                value={form.logo}
                error={fieldErrors.logo}
                onChange={(value) => updateField("logo", value)}
              />

              <SectionTitle eyebrow="Section 8" title="Anything Else?" />
              <CollabTextarea
                label="Extra Information"
                value={form.extraInfo ?? ""}
                onChange={(value) => updateField("extraInfo", value)}
                placeholder="Optional notes, campaign dates, community size, or preferred next step."
              />

              <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/24 p-4">
                <input
                  checked={form.confirmed}
                  className="mt-1 h-4 w-4 accent-lemon"
                  type="checkbox"
                  onChange={(event) => updateField("confirmed", event.target.checked)}
                />
                <span>
                  <span className="block font-pixel text-sm text-white">
                    I confirm all information provided is accurate.
                  </span>
                  {fieldErrors.confirmed ? (
                    <span className="mt-2 block text-xs text-red-300">{fieldErrors.confirmed}</span>
                  ) : null}
                </span>
              </label>

              {isSubmitting ? <CollabLoadingState /> : null}
            </div>
          ) : null}
        </motion.div>

        {statusMessage ? (
          <p className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
            {statusMessage}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button disabled={step === 0 || isSubmitting} type="button" variant="secondary" onClick={goBack}>
            <ArrowLeft aria-hidden="true" size={17} />
            Back
          </Button>

          {step < steps.length - 1 ? (
            <Button className="sm:ml-auto" type="button" onClick={goNext}>
              Next
              <ArrowRight aria-hidden="true" size={17} />
            </Button>
          ) : (
            <Button
              className="sm:ml-auto"
              disabled={isSubmitting}
              size="lg"
              type="button"
              onClick={() => void handleSubmit()}
            >
              <Send aria-hidden="true" size={18} />
              {isSubmitting ? "Sending Request" : "Send Collab Request"}
            </Button>
          )}
        </div>
      </GlassCard>

      <CollabSuccessModal
        applicationId={applicationId}
        open={successOpen}
        onSubmitAnother={resetForm}
      />
    </>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="font-pixel text-xs uppercase text-lemon">{eyebrow}</p>
      <h2 className="mt-1 font-pixel text-2xl leading-tight text-white sm:text-3xl">{title}</h2>
    </div>
  );
}
