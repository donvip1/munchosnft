"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function CollabLoadingState() {
  return (
    <motion.div
      animate={{ opacity: [0.72, 1, 0.72] }}
      className="rounded-2xl border border-lemon/20 bg-lemon/[0.07] p-4"
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="flex items-center gap-3 text-sm text-lemon">
        <Loader2 aria-hidden="true" className="animate-spin" size={18} />
        <span>Preparing collaboration request...</span>
      </div>
      <div className="mt-4 grid gap-2">
        <span className="h-2 rounded-full bg-white/10" />
        <span className="h-2 w-2/3 rounded-full bg-white/10" />
      </div>
    </motion.div>
  );
}
