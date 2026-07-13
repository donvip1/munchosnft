"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ExternalLink, Loader2, MessageCircle, ShieldCheck, Twitter, WalletCards } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FormEvent, ReactNode, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { siteConfig, whitelistTaskActions } from "@/config/site";
import { validateWhitelistPayload } from "@/lib/validation";
import { submitWhitelist } from "@/lib/whitelist-api";
import type { WhitelistFailure, WhitelistPayload, WhitelistSuccess as WhitelistSuccessType } from "@/types/whitelist";

import { WhitelistSuccess } from "./WhitelistSuccess";
import { XPostEmbed } from "./XPostEmbed";

const initialState: WhitelistPayload = {
  fullName: "",
  email: "",
  xUsername: "",
  xPostUrl: "",
  walletAddress: "",
  referralCode: "",
  referredBy: "",
  taskCompleted: false
};

const firstVerificationMessages = [
  "Checking community engagement...",
  "Syncing your submission...",
  "Reviewing your completed tasks..."
];

const finalVerificationMessages = [
  "Finalizing your submission...",
  "Completing registration...",
  "Securing your whitelist spot..."
];

type VerificationStage = "idle" | "first-loading" | "modal" | "second-loading";

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function WhitelistCard() {
  const searchParams = useSearchParams();
  const referredBy = useMemo(() => searchParams.get("ref") ?? "", [searchParams]);
  const [form, setForm] = useState<WhitelistPayload>({ ...initialState, referredBy });
  const [fieldErrors, setFieldErrors] = useState<WhitelistFailure["fieldErrors"]>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [verificationStage, setVerificationStage] = useState<VerificationStage>("idle");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<WhitelistSuccessType | null>(null);
  const isLoading =
    verificationStage === "first-loading" || verificationStage === "second-loading" || isSubmitting;

  function updateField<K extends keyof WhitelistPayload>(field: K, value: WhitelistPayload[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setStatusMessage("");
  }

  function handleTaskClick(task: (typeof whitelistTaskActions)[number]) {
    window.open(task.url, "_blank", "noopener,noreferrer");
    setStatusMessage("");
  }

  function validateForm() {
    const candidate = {
      ...form,
      referredBy,
      taskCompleted: true
    };
    const validation = validateWhitelistPayload(candidate);

    if (!validation.valid) {
      setFieldErrors(validation.fieldErrors);
      setStatusMessage("Complete the form and required X task details before continuing.");
      return false;
    }

    setFieldErrors({});
    setStatusMessage("");
    return true;
  }

  async function runLoading(messages: string[], duration: number) {
    setLoadingProgress(0);
    setLoadingMessage(messages[0]);

    const startedAt = Date.now();
    let messageIndex = 0;

    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setLoadingProgress(Math.min(Math.round((elapsed / duration) * 100), 96));
    }, 150);

    const messageTimer = window.setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, Math.max(1000, Math.floor(duration / messages.length)));

    await wait(duration);
    window.clearInterval(progressTimer);
    window.clearInterval(messageTimer);
    setLoadingProgress(100);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setVerificationStage("first-loading");
    await runLoading(firstVerificationMessages, 6500);
    setVerificationStage("modal");
  }

  async function handleVerifyAgain() {
    setVerificationStage("second-loading");
    setStatusMessage("");
    await runLoading(finalVerificationMessages, 3500);
    setIsSubmitting(true);

    const response = await submitWhitelist({ ...form, referredBy, taskCompleted: true });
    setIsSubmitting(false);

    if (!response.ok) {
      setVerificationStage("idle");
      setStatusMessage(response.message);
      setFieldErrors(response.fieldErrors);
      return;
    }

    setSuccess(response);
  }

  if (success) {
    return <WhitelistSuccess result={success} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55 }}
    >
      <GlassCard className="mx-auto max-w-3xl overflow-hidden">
        <div className="border-b border-white/10 bg-white/[0.035] px-5 py-6 text-center sm:px-8">
          <div className="mx-auto flex w-full max-w-[230px] justify-center">
            <Image
              src="/images/munchosnft.png"
              alt="Munchos NFT"
              width={360}
              height={240}
              className="h-auto w-full drop-shadow-[0_0_22px_rgba(200,255,0,0.35)]"
              priority
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <StatusPill tone="green">Exclusive Whitelist</StatusPill>
            <StatusPill tone="purple">{siteConfig.chain}</StatusPill>
          </div>
          <h2 className="mt-5 font-pixel text-3xl leading-tight text-white sm:text-4xl">
            Enter the Munchos NFT Access Queue
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/62 sm:text-base">
            Join the community layer for a scalable Robinhood Chain-native NFT application built
            for NFT fusion, minting, evolution, rewards, and marketplace expansion.
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-white/10 p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-lemon/30 bg-lemon/10 text-lemon">
                <ShieldCheck aria-hidden="true" size={20} />
              </div>
              <div>
                <p className="font-pixel text-sm uppercase text-white">Required Tasks</p>
                <p className="text-xs text-white/48">Open each task before verifying</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {whitelistTaskActions.map((task) => (
                <button
                  className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/24 p-3 text-left transition hover:border-lemon/35 hover:bg-white/[0.06]"
                  key={task.id}
                  type="button"
                  onClick={() => handleTaskClick(task)}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lemon/12 text-lemon">
                    <Check aria-hidden="true" size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-pixel text-sm uppercase text-white">
                      {task.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-white/50">
                      {task.description}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 font-pixel text-[11px] uppercase text-white/70">
                    {task.actionLabel}
                    <ExternalLink aria-hidden="true" size={14} />
                  </span>
                </button>
              ))}

              <button
                className="w-full rounded-2xl border border-white/10 bg-black/24 p-3 text-left transition hover:border-lemon/35 hover:bg-white/[0.06]"
                type="button"
                onClick={() => window.open(siteConfig.pinnedPostUrl, "_blank", "noopener,noreferrer")}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-lemon">
                    <MessageCircle aria-hidden="true" size={17} />
                  </span>
                  <div>
                    <p className="font-pixel text-sm uppercase text-white">
                      Comment on the pinned post
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/50">
                      Leave a genuine comment before submitting your whitelist entry.
                    </p>
                  </div>
                </div>
              </button>

              <XPostEmbed />
            </div>
          </div>

          <form className="space-y-4 p-5 sm:p-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Full Name"
                value={form.fullName}
                error={fieldErrors?.fullName}
                onChange={(value) => updateField("fullName", value)}
                autoComplete="name"
                disabled={isLoading}
              />
              <Field
                label="Email Address"
                value={form.email}
                error={fieldErrors?.email}
                onChange={(value) => updateField("email", value)}
                autoComplete="email"
                type="email"
                disabled={isLoading}
              />
            </div>

            <Field
              label="X Username"
              value={form.xUsername}
              error={fieldErrors?.xUsername}
              onChange={(value) => updateField("xUsername", value)}
              placeholder="@munchonft"
              icon={<Twitter aria-hidden="true" size={17} />}
              disabled={isLoading}
            />

            <Field
              label="Munchos Post Link"
              value={form.xPostUrl}
              error={fieldErrors?.xPostUrl}
              onChange={(value) => updateField("xPostUrl", value)}
              placeholder="https://x.com/username/status/..."
              icon={<ExternalLink aria-hidden="true" size={17} />}
              disabled={isLoading}
            />

            <Field
              label="EVM Wallet Address"
              value={form.walletAddress}
              error={fieldErrors?.walletAddress}
              onChange={(value) => updateField("walletAddress", value)}
              placeholder="0x..."
              icon={<WalletCards aria-hidden="true" size={17} />}
              disabled={isLoading}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Referral Code"
                value={form.referralCode ?? ""}
                onChange={(value) => updateField("referralCode", value)}
                placeholder="Optional"
                disabled={isLoading}
              />
              <Field
                label="Referred By"
                value={referredBy}
                onChange={() => undefined}
                placeholder="Auto"
                disabled
              />
            </div>

            {isLoading ? (
              <div className="rounded-3xl border border-lemon/20 bg-lemon/[0.07] p-4">
                <div className="flex items-center gap-3 text-sm text-lemon">
                  <Loader2 className="animate-spin" aria-hidden="true" size={18} />
                  <span>{loadingMessage}</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/40">
                  <div
                    className="h-full rounded-full bg-lemon transition-all duration-150"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              </div>
            ) : null}

            {statusMessage ? (
              <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
                {statusMessage}
              </p>
            ) : null}

            <Button className="w-full" disabled={isLoading} size="lg" type="submit">
              {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" size={18} /> : null}
              {isLoading ? "Reviewing Tasks" : "Verify Tasks"}
            </Button>
          </form>
        </div>
      </GlassCard>

      <ConfirmationModal
        open={verificationStage === "modal"}
        onGoToX={() => window.open(siteConfig.xUrl, "_blank", "noopener,noreferrer")}
        onVerifyAgain={handleVerifyAgain}
      />
    </motion.div>
  );
}

type ConfirmationModalProps = {
  open: boolean;
  onGoToX: () => void;
  onVerifyAgain: () => void;
};

function ConfirmationModal({ open, onGoToX, onVerifyAgain }: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/72 px-4 pb-4 backdrop-blur-md sm:items-center sm:pb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-[28px] border border-white/12 bg-[#111111]/95 p-5 shadow-glass"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-lemon/30 bg-lemon/10 text-lemon">
              <ShieldCheck aria-hidden="true" size={22} />
            </div>
            <h3 className="mt-5 font-pixel text-3xl text-white">Almost There!</h3>
            <p className="mt-3 text-sm leading-7 text-white/64">
              Before continuing, please make sure you have completed all required tasks:
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-white/70">
              <li>Follow our official X account</li>
              <li>Make a post about Munchos and paste the post link</li>
              <li>Repost the pinned post</li>
              <li>Comment on the pinned post</li>
            </ul>
            <p className="mt-4 text-sm leading-7 text-white/64">
              If you&apos;ve just completed these actions, please return and verify again. This
              helps us maintain a fair and genuine community.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="secondary" onClick={onGoToX}>
                Go to X
              </Button>
              <Button type="button" onClick={onVerifyAgain}>
                Verify Again
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  icon?: ReactNode;
  disabled?: boolean;
};

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  autoComplete,
  icon,
  disabled
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block font-pixel text-xs uppercase text-white/58">{label}</span>
      <span className="relative block">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/36">
            {icon}
          </span>
        ) : null}
        <input
          className={`h-12 w-full rounded-2xl border bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-lemon/55 focus:ring-2 focus:ring-lemon/15 disabled:text-white/35 ${
            icon ? "pl-11" : ""
          } ${error ? "border-red-400/45" : "border-white/10"}`}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
        />
      </span>
      {error ? <span className="mt-2 block text-xs text-red-300">{error}</span> : null}
    </label>
  );
}
