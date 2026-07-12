"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FormEvent, ReactNode, useMemo, useState } from "react";
import { Check, CheckCircle2, ExternalLink, Loader2, ShieldCheck, Twitter, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { siteConfig, waitlistTaskActions } from "@/config/site";
import { submitWaitlist, verifyWaitlistTasks } from "@/lib/waitlist-api";
import type { XTaskId } from "@/types/task-verification";
import type { WaitlistFailure, WaitlistPayload, WaitlistSuccess as WaitlistSuccessType } from "@/types/waitlist";

import { WaitlistSuccess } from "./WaitlistSuccess";

const initialState: WaitlistPayload = {
  fullName: "",
  email: "",
  xUsername: "",
  walletAddress: "",
  referralCode: "",
  referredBy: "",
  taskCompleted: false
};

type TaskStatus = "idle" | "missing" | "complete";

function createInitialTaskStatus() {
  return waitlistTaskActions.reduce(
    (status, task) => ({
      ...status,
      [task.id]: "idle"
    }),
    {} as Record<XTaskId, TaskStatus>
  );
}

export function WaitlistCard() {
  const searchParams = useSearchParams();
  const referredBy = useMemo(() => searchParams.get("ref") ?? "", [searchParams]);
  const [form, setForm] = useState<WaitlistPayload>({ ...initialState, referredBy });
  const [taskStatus, setTaskStatus] = useState<Record<XTaskId, TaskStatus>>(
    createInitialTaskStatus
  );
  const [fieldErrors, setFieldErrors] = useState<WaitlistFailure["fieldErrors"]>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isVerifyingTasks, setIsVerifyingTasks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<WaitlistSuccessType | null>(null);
  const allTasksComplete = waitlistTaskActions.every(
    (task) => taskStatus[task.id] === "complete"
  );

  function updateField<K extends keyof WaitlistPayload>(field: K, value: WaitlistPayload[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));

    if (field === "xUsername") {
      setTaskStatus(createInitialTaskStatus());
      setVerificationMessage("");
    }
  }

  function handleTaskClick(task: (typeof waitlistTaskActions)[number]) {
    window.open(task.url, "_blank", "noopener,noreferrer");
    setStatusMessage("");
    setFieldErrors((current) => ({ ...current, taskCompleted: undefined }));
  }

  async function handleVerifyTasks() {
    setStatusMessage("");
    setVerificationMessage("");
    setFieldErrors((current) => ({ ...current, taskCompleted: undefined, xUsername: undefined }));

    if (!form.xUsername.trim()) {
      setFieldErrors((current) => ({
        ...current,
        xUsername: "Enter your X username before verifying tasks."
      }));
      setVerificationMessage("Enter your X username, complete the tasks on X, then verify.");
      return;
    }

    setIsVerifyingTasks(true);
    const response = await verifyWaitlistTasks({ xUsername: form.xUsername });
    setIsVerifyingTasks(false);

    if (response.tasks) {
      setTaskStatus(
        waitlistTaskActions.reduce(
          (status, task) => ({
            ...status,
            [task.id]: response.tasks?.[task.id] ? "complete" : "missing"
          }),
          {} as Record<XTaskId, TaskStatus>
        )
      );
    }

    if (!response.ok) {
      setVerificationMessage(response.message);
      setFieldErrors((current) => ({
        ...current,
        ...response.fieldErrors,
        taskCompleted: "X tasks must be verified before joining the waitlist."
      }));
      return;
    }

    setVerificationMessage(response.message);
    setFieldErrors((current) => ({ ...current, taskCompleted: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");
    setFieldErrors({});

    if (!allTasksComplete) {
      setStatusMessage("Verify the required X tasks before joining the waitlist.");
      setFieldErrors({
        taskCompleted: "Click Verify X Tasks after completing follow, like, and repost."
      });
      return;
    }

    setIsSubmitting(true);

    const response = await submitWaitlist({ ...form, referredBy, taskCompleted: true });
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
            for NFT fusion, minting, evolution, rewards, and marketplace expansion.
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
              {waitlistTaskActions.map((task) => {
                const status = taskStatus[task.id];
                const isComplete = status === "complete";

                return (
                  <button
                    className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      isComplete
                        ? "border-lemon/35 bg-lemon/[0.08]"
                        : "border-white/10 bg-black/24 hover:border-lemon/35 hover:bg-white/[0.06]"
                    }`}
                    key={task.id}
                    type="button"
                    onClick={() => handleTaskClick(task)}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isComplete ? "bg-lemon text-black" : "bg-lemon/12 text-lemon"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 aria-hidden="true" size={18} />
                      ) : (
                        <Check aria-hidden="true" size={17} />
                      )}
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
                      {isComplete
                        ? "Checked"
                        : status === "missing"
                          ? "Missing"
                          : task.actionLabel}
                      {!isComplete ? <ExternalLink aria-hidden="true" size={14} /> : null}
                    </span>
                  </button>
                );
              })}

              <Button
                className="w-full"
                disabled={isVerifyingTasks}
                type="button"
                variant={allTasksComplete ? "secondary" : "primary"}
                onClick={handleVerifyTasks}
              >
                {isVerifyingTasks ? (
                  <Loader2 className="animate-spin" aria-hidden="true" size={18} />
                ) : null}
                Verify X Tasks
              </Button>

              {verificationMessage ? (
                <p
                  className={`rounded-2xl border p-3 text-xs leading-5 ${
                    allTasksComplete
                      ? "border-lemon/30 bg-lemon/[0.07] text-lemon"
                      : "border-violet/30 bg-violet/10 text-white/70"
                  }`}
                >
                  {verificationMessage}
                </p>
              ) : null}

              <div
                className={`rounded-2xl border p-3 ${
                  allTasksComplete
                    ? "border-lemon/30 bg-lemon/[0.07] text-lemon"
                    : "border-white/10 bg-black/24 text-white/56"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
                    <Check aria-hidden="true" size={17} />
                  </span>
                  <div>
                    <p className="font-pixel text-sm uppercase text-white">Join the waitlist</p>
                    <p className="mt-1 text-xs leading-5 text-white/50">
                      Submit the form after the X tasks are checked.
                    </p>
                  </div>
                </div>
              </div>

              {fieldErrors?.taskCompleted && !verificationMessage ? (
                <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-xs leading-5 text-red-200">
                  {fieldErrors.taskCompleted}
                </p>
              ) : null}
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

            {statusMessage ? (
              <p className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
                {statusMessage}
              </p>
            ) : null}

            <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
              {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" size={18} /> : null}
              {allTasksComplete ? "Join Waitlist" : "Complete Tasks First"}
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
