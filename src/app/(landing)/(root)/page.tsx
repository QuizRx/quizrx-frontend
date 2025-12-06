"use client";

import CallToAction from "@/modules/landing/layouts/home/call-to-action";
import FAQSection from "@/modules/landing/layouts/home/faq";
import Features from "@/modules/landing/layouts/home/features";
import HowItWorks from "@/modules/landing/layouts/home/how-it-works";
import PricingSection from "@/modules/landing/layouts/home/pricing";
import TestimonialCarousel from "@/modules/landing/layouts/home/testimonials";
import FreeTrialSection from "@/modules/landing/layouts/home/trail";


export default function Page() {
  return (
    <div className="flex flex-col w-full h-full gap-8 px-8 pb-8 pt-10">
      <CallToAction />
      <Features />
      <HowItWorks />
      <TestimonialCarousel />
      <PricingSection />
      <FAQSection />
      <FreeTrialSection />
    </div>
  );
}
