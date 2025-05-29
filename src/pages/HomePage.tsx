import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import HeroSection from '../components/home/HeroSection';
import FeaturedContent from '../components/home/FeaturedContent';
import FeaturedPodcasts from '../components/home/FeaturedPodcasts';
import DailyTarotSection from '../components/home/DailyTarotSection';
import CategoriesSection from '../components/home/CategoriesSection';

const HomePage: React.FC = () => {
  return (
    <PageLayout>
      <HeroSection />
      <FeaturedContent />
      <FeaturedPodcasts />
      <DailyTarotSection />
      <CategoriesSection />
    </PageLayout>
  );
};

export default HomePage;