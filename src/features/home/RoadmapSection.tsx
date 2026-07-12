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
          {roadmap.map((phase, index) => (
            <div
              className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 shadow-glass backdrop-blur-xl"
              key={phase.phase}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-pixel text-sm uppercase text-lemon">{phase.phase}</p>
                {index === 0 ? (
                  <CheckCircle2 aria-hidden="true" className="text-lemon" size={20} />
                ) : (
                  <CircleDashed aria-hidden="true" className="text-white/32" size={20} />
                )}
              </div>
              <h3 className="mt-4 font-pixel text-xl text-white">{phase.title}</h3>
              <ul className="mt-5 space-y-3">
                {phase.items.map((item) => (
                  <li className="flex gap-2 text-sm leading-5 text-white/58" key={item}>
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
