import { ExampleResult } from "@/components/landing/ExampleResult";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Method } from "@/components/landing/Method";
import { Pains } from "@/components/landing/Pains";
import { Pricing } from "@/components/landing/Pricing";
import { ReturningCard } from "@/components/landing/ReturningCard";
import { WhatYouGet } from "@/components/landing/WhatYouGet";

export default function Home() {
  return (
    <div className="overflow-x-clip bg-paper text-ink">
      <LandingHeader />
      <main>
        <ReturningCard />
        <Hero />
        <Pains />
        <HowItWorks />
        <WhatYouGet />
        <Method />
        <ExampleResult />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
