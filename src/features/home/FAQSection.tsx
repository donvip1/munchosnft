import { SectionHeading } from "@/components/ui/SectionHeading";

const faqs = [
  {
    question: "What makes it Robinhood Chain-native?",
    answer:
      "The product language, roadmap, data model, and future feature surfaces are planned around Robinhood Chain smart contracts, wallet sessions, NFT ownership, fusion state, and reward activity."
  },
  {
    question: "What does Chain Access mean?",
    answer:
      "Chain Access is the future wallet connection layer. It will let users connect an EVM wallet, read Robinhood Chain activity, and prepare for minting, ownership, rewards, and profile features."
  },
  {
    question: "What does Mint Layer mean?",
    answer:
      "Mint Layer is the future NFT creation system for Munchos NFT. It covers allowlist access, mint sessions, smart contract minting, metadata, and the first collection experience."
  },
  {
    question: "What does Evolution Engine mean?",
    answer:
      "Evolution Engine is the future upgrade system for NFTs. It is designed for fusion rules, trait changes, rarity upgrades, and on-chain progression after users own Munchos assets."
  },
  {
    question: "How does the referral system work?",
    answer:
      "After registration, each member receives a unique MUNCHOS referral code and referral link. Referral totals are stored through the Google Sheets backend."
  },
  {
    question: "What can NFT Fusion become?",
    answer:
      "Future fusion flows can let users select NFTs, lock or burn originals, receive upgraded NFTs, improve rarity, and unlock new traits through chain-based rules."
  }
];

export function FAQSection() {
  return (
    <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <SectionHeading eyebrow="FAQ" title="Community First, Architecture Ready" />
        <div className="mt-10 space-y-3">
          {faqs.map((faq) => (
            <details
              className="group rounded-[24px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl"
              key={faq.question}
            >
              <summary className="cursor-pointer list-none font-pixel text-lg text-white marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {faq.question}
                  <span className="text-lemon transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-white/58">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
