"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lock, X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";

type ComingSoonModalProps = {
  title: string;
  description: string;
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
};

export function ComingSoonModal({
  title,
  description,
  open,
  onClose,
  children
}: ComingSoonModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/72 px-4 pb-4 backdrop-blur-md sm:items-center sm:pb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md rounded-[28px] border border-white/12 bg-[#111111]/95 p-5 shadow-glass"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-lemon/30 bg-lemon/10 text-lemon">
                <Lock aria-hidden="true" size={22} />
              </div>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/70 transition hover:text-white"
                type="button"
                onClick={onClose}
                aria-label="Close modal"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <h3 className="mt-5 font-pixel text-2xl text-white">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-white/64">{description}</p>
            {children ? <div className="mt-5">{children}</div> : null}
            <Button className="mt-6 w-full" type="button" onClick={onClose}>
              Back to Waitlist
            </Button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
