import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import SubscriptionSection from '../components/home/SubscriptionSection';
import TestimonialsSection from '../components/home/TestimonialsSection';

const PlansPage: React.FC = () => {
  return (
    <PageLayout>
      <SubscriptionSection />
      <TestimonialsSection />
    </PageLayout>
  );
};

export default PlansPage;
