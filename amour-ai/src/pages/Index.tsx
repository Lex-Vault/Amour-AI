import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PricingSection from "@/components/PricingSection";
import { CallToActionSection, Footer } from "@/components/CallToActionSection";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const { fetchUser } = useAuth();

  useEffect(() => {
    fetchUser();
  }, []);
  return (
    <div className="min-h-screen">
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
