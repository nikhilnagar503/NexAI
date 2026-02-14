import { BackgroundGradient } from "@/components/landing/background-gradient";
// import CtaSection from "@/components/landing/cta-section";
// import FeaturesSection from "@/components/landing/features-section";
import HeroSection from "@/components/landing/hero-section";
// import HowItWorksSection from "@/components/landing/how-it-works-section";
// import PricingSection from "@/components/landing/pricing-section";
// import { MotionDiv } from "@/components/ui/motion-div";



export default function Home() {
  return (
    <div className="relative min-h-screen ">
      <BackgroundGradient />

      <div className="relative z-10">

        <HeroSection />


      </div>

    </div>
  );
}