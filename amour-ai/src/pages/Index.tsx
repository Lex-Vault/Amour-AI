import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PricingSection from "@/components/PricingSection";
import { CallToActionSection, Footer } from "@/components/CallToActionSection";
import UserAvatar from "@/components/UserAvatar";

const Index = () => {
  return (
    <div className="min-h-screen">
      <UserAvatar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CallToActionSection />
      <Footer />
    </div>
  );
};

export default Index;
