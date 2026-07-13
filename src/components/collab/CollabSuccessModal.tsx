"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

import { Button, LinkButton } from "@/components/ui/Button";

type CollabSuccessModalProps = {
  open: boolean;
  applicationId?: string;
  onSubmitAnother: () => void;
};

export function CollabSuccessModal({
  open,
  applicationId,
  onSubmitAnother
}: CollabSuccessModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/74 px-4 py-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-lg rounded-[28px] border border-white/12 bg-[#111111]/95 p-5 shadow-glass sm:p-7"
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <motion.div
              animate={{ rotate: [0, -7, 7, 0], scale: [1, 1.08, 1] }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-lemon/35 bg-lemon/12 text-lemon shadow-lemon"
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <CheckCircle2 aria-hidden="true" size={28} />
            </motion.div>
            <h2 className="mt-5 font-pixel text-3xl leading-tight text-white">
              Application Submitted 🎉
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/64">
              Thank you for reaching out to Munchos. Our team will review your collaboration
              request. If selected, we&apos;ll contact you through the information you provided.
            </p>
            {applicationId ? (
              <div className="mt-5 rounded-2xl border border-lemon/20 bg-lemon/[0.07] p-4">
                <p className="font-pixel text-xs uppercase text-white/44">Application ID</p>
                <p className="mt-2 break-all font-pixel text-xl text-lemon">{applicationId}</p>
              </div>
            ) : null}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <LinkButton href="/" size="md">
                <Home aria-hidden="true" size={17} />
                Return Home
              </LinkButton>
              <Button type="button" variant="secondary" onClick={onSubmitAnother}>
                <RefreshCw aria-hidden="true" size={17} />
                Submit Another
              </Button>
            </div>
            <Link className="sr-only" href="/">
              Return home
            </Link>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
