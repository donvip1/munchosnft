import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { EligibilityChecker } from "@/features/eligibility/EligibilityChecker";

export default function EligibilityPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <EligibilityChecker />
      </main>
      <SiteFooter />
    </>
  );
}
