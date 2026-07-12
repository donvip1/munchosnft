"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FormEvent, ReactNode, useMemo, useState } from "react";
import { Check, Loader2, ShieldCheck, Twitter, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { siteConfig, waitlistTasks } from "@/config/site";
import { submitWaitlist } from "@/lib/waitlist-api";
import type { WaitlistFailure, WaitlistPayload, WaitlistSuccess as WaitlistSuccessType } from "@/types/waitlist";

import { WaitlistSuccess } from "./WaitlistSuccess";
import { XPostEmbed } from "./XPostEmbed";

const initialState: WaitlistPayload = {
  fullName: "",
  email: "",
  xUsername: "",
  walletAddress: "",
  referralCode: "",
  referredBy: "",
  taskCompleted: false
};

export function WaitlistCard() {
  const searchParams = useSearchParams();
  const referredBy = useMemo(() => searchParams.get("ref") ?? "", [searchParams]);
  const [form, setForm] = useState<WaitlistPayload>({ ...initialState, referredBy });
  const [fieldErrors, setFieldErrors] = useState<WaitlistFailure["fieldErrors"]>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<WaitlistSuccessType | null>(null);

  function updateField<K extends keyof WaitlistPayload>(field: K, value: WaitlistPayload[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");
    setFieldErrors({});

    const response = await submitWaitlist({ ...form, referredBy });
    setIsSubmitting(false);

    if (!response.ok) {
      setStatusMessage(response.message);
      setFieldErrors(response.fieldErrors);
      return;
    }

    setSuccess(response);
  }

  if (success) {
    return <WaitlistSuccess result={success} />;
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
            <StatusPill tone="green">Exclusive Waitlist</StatusPill>
            <StatusPill tone="purple">{siteConfig.chain}</StatusPill>
          </div>
          <h2 className="mt-5 font-pixel text-3xl leading-tight text-white sm:text-4xl">
            Enter the Munchos NFT Access Queue
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/62 sm:text-base">
            Join the community layer for a scalable Robinhood Chain-native NFT application built
            for minting, fusion, evolution, rewards, and marketplace expansion.
          </p>
        </div>

        <div className="grid gap-0 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="border-b border-white/10 p-5 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-lemon/30 bg-lemon/10 text-lemon">
                <ShieldCheck aria-hidden="true" size={20} />
              </div>
              <div>
                <p className="font-pixel text-sm uppercase text-white">Required Tasks</p>
                <p className="text-xs text-white/48">Complete before submitting</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {waitlistTasks.map((task) => (
                <div
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/24 p-3"
                  key={task}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-lemon/12 text-lemon">
                    <Check aria-hidden="true" size={16} />
                  </span>
                  <span className="text-sm text-white/72">{task}</span>
                </div>
              ))}
            </div>

            <div className="mt-5">
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
              />
              <Field
                label="Email Address"
                value={form.email}
                error={fieldErrors?.email}
                onChange={(value) => updateField("email", value)}
                autoComplete="email"
                type="email"
              />
            </div>

            <Field
              label="X Username"
              value={form.xUsername}
              error={fieldErrors?.xUsername}
              onChange={(value) => updateField("xUsername", value)}
              placeholder="@munchonft"
              icon={<Twitter aria-hidden="true" size={17} />}
            />

            <Field
              label="EVM Wallet Address"
              value={form.walletAddress}
              error={fieldErrors?.walletAddress}
              onChange={(value) => updateField("walletAddress", value)}
              placeholder="0x..."
              icon={<WalletCards aria-hidden="true" size={17} />}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Referral Code"
                value={form.referralCode ?? ""}
                onChange={(value) => updateField("referralCode", value)}
                placeholder="Optional"
              />
              <Field
                label="Referred By"
                value={referredBy}
                onChange={() => undefined}
                placeholder="Auto"
                disabled
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-3xl border border-white/10 bg-black/24 p-4">
              <input
                className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent accent-lemon"
                type="checkbox"
                checked={form.taskCompleted}
                onChange={(event) => updateField("taskCompleted", event.target.checked)}
              />
              <span>
                <span className="block text-sm text-white">
                  I have completed all required tasks.
                </span>
                {fieldErrors?.taskCompleted ? (
                  <span className="mt-1 block text-xs text-red-300">{fieldErrors.taskCompleted}</span>
                ) : null}
              </span>
            </label>

            {statusMessage ? (
              <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
                {statusMessage}
              </p>
            ) : null}

            <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
              {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" size={18} /> : null}
              Join Waitlist
            </Button>
          </form>
        </div>
      </GlassCard>
    </motion.div>
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
