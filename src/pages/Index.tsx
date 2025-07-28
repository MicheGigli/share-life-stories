import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Sections } from "@/components/Sections";
import { LatestExperiences } from "@/components/LatestExperiences";
import { Footer } from "@/components/Footer";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Sections />
      <LatestExperiences />
      <Footer />
    </div>
  );
};

export default Index;
