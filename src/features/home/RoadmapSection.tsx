import { CheckCircle2, CircleDashed } from "lucide-react";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { roadmap } from "@/config/site";

export function RoadmapSection() {
  return (
    <section id="roadmap" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Roadmap" title="From Waitlist to Evolution Engine">
          Version 1 launches the community queue first, while the interface already reserves space
          for wallet, mint, fusion, staking, and marketplace flows.
        </SectionHeading>

        <div className="mt-12 grid gap-4 lg:grid-cols-5">
          {roadmap.map((item, index) => (
            <div
              className="flex min-h-36 items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-glass backdrop-blur-xl"
              key={item.title}
            >
              <h3 className="font-pixel text-xl text-white">{item.title}</h3>
              {index === 0 ? (
                <CheckCircle2 aria-hidden="true" className="shrink-0 text-lemon" size={20} />
              ) : (
                <CircleDashed aria-hidden="true" className="shrink-0 text-white/32" size={20} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
