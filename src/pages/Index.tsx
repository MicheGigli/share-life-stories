import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Sections } from "@/components/Sections";
import { LatestExperiences } from "@/components/LatestExperiences";
import { Footer } from "@/components/Footer";
import { useSampleData } from "@/hooks/useSampleData";
import { useProfileSync } from "@/hooks/useProfileSync";
import { ChatbotKnowledgeBase } from "@/components/ChatbotKnowledgeBase";
import { HowItWorks } from "@/components/HowItWorks";
import { AdBanner } from "@/components/ads/AdBanner";
import { AdSenseLoader } from "@/components/ads/AdSenseUnit";
import OnboardingWelcome from "@/components/OnboardingWelcome";
import { PersonalizedFeed } from "@/components/PersonalizedFeed";
import { TrendingTopics } from "@/components/TrendingTopics";

const Index = () => {
  // Ensure user has profile and sample data
  useProfileSync();
  useSampleData();
  const { user } = useAuth();

  return (
    <div id="main-content" className="min-h-screen bg-background">
      <AdSenseLoader />
      {user && <Header />}
      {user ? (
        <>
          <OnboardingWelcome />
          <div className="pt-16">
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <Sections />
                  <PersonalizedFeed />
                  
                  {/* Ad banner */}
                  <AdBanner 
                    position="horizontal" 
                    className="max-w-full"
                    dismissible
                  />
                  
                  <LatestExperiences />
                </div>
                
                {/* Sidebar */}
                <div className="space-y-6">
                  <TrendingTopics limit={8} />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <Hero />
          <HowItWorks />
          
          {/* Ad banner for non-authenticated users */}
          <div className="container mx-auto px-4 py-8">
            <AdBanner 
              position="horizontal" 
              className="max-w-4xl mx-auto"
            />
          </div>
        </>
      )}
      <Footer />
      {user && (
        <div>
          <ChatbotKnowledgeBase />
        </div>
      )}
    </div>
  );
};

export default Index;
