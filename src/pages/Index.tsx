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

const Index = () => {
  // Ensure user has profile and sample data
  useProfileSync();
  useSampleData();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {user && <Header />}
      {user ? (
        <>
          <div className="pt-16">
            <Sections />
            <LatestExperiences />
          </div>
        </>
      ) : (
        <Hero />
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
