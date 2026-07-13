"use client";

import { motion } from "framer-motion";

const particles = [
  { left: "8%", top: "18%", size: "h-1.5 w-1.5", delay: 0 },
  { left: "22%", top: "64%", size: "h-2 w-2", delay: 0.9 },
  { left: "76%", top: "22%", size: "h-1.5 w-1.5", delay: 0.4 },
  { left: "88%", top: "58%", size: "h-2.5 w-2.5", delay: 1.2 },
  { left: "48%", top: "12%", size: "h-1 w-1", delay: 0.7 },
  { left: "62%", top: "82%", size: "h-1.5 w-1.5", delay: 1.5 }
];

export function CollabParticles() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.span
          animate={{ opacity: [0.2, 0.85, 0.2], y: [0, -18, 0], scale: [1, 1.35, 1] }}
          className={`absolute rounded-full bg-lemon shadow-[0_0_20px_rgba(200,255,0,0.45)] ${particle.size}`}
          key={`${particle.left}-${particle.top}`}
          style={{ left: particle.left, top: particle.top }}
          transition={{
            delay: particle.delay,
            duration: 4.5,
            ease: "easeInOut",
            repeat: Infinity
          }}
        />
      ))}
    </div>
  );
}
