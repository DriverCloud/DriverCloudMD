import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";

export default function LandingPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <HeroSection />
            <FeaturesSection />
            <PricingSection />
            <TestimonialsSection />
        </main>
    );
}
