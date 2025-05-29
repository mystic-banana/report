import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

const SubscriptionSection: React.FC = () => {
  const freeFeatures = [
    'Access to basic articles and content',
    'Daily horoscope for your sign',
    'Weekly tarot card reading',
    'Limited podcast episodes',
    'Community forum access'
  ];
  
  const premiumFeatures = [
    'Unlimited access to all articles and content',
    'Detailed daily horoscopes for all signs',
    'Personalized birth chart analysis',
    'Exclusive premium podcast episodes',
    'Advanced tarot spread interpretations',
    'Personalized spiritual guidance',
    'Ad-free experience',
    'Early access to new features'
  ];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-mystic-primary-900 mb-4">
            Choose Your Cosmic Journey
          </h2>
          <p className="text-mystic-secondary-600 max-w-2xl mx-auto">
            Select the subscription that aligns with your spiritual path and unlock divine insights tailored to your journey.
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Free Plan */}
          <motion.div 
            className="rounded-lg overflow-hidden bg-white shadow-lg transition-shadow hover:shadow-xl border border-gray-200"
            variants={itemVariants}
          >
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center mb-4">
                <Star className="w-6 h-6 text-mystic-secondary-500 mr-2" />
                <h3 className="font-serif text-2xl font-semibold text-mystic-secondary-900">Free Spirit</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-mystic-primary-800">$0</span>
                <span className="text-mystic-secondary-500 ml-2">/ month</span>
              </div>
              <p className="text-mystic-secondary-600 text-sm">
                Begin your spiritual journey with our free offerings and explore the cosmic universe.
              </p>
            </div>
            
            <div className="p-8">
              <h4 className="font-medium text-mystic-secondary-900 mb-4">What's included:</h4>
              <ul className="space-y-3 mb-8">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-mystic-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-mystic-secondary-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                to="/signup" 
                className="block w-full py-3 text-center bg-white border border-mystic-primary-600 text-mystic-primary-600 rounded-md font-medium transition-colors hover:bg-mystic-primary-50"
              >
                Sign Up Free
              </Link>
            </div>
          </motion.div>
          
          {/* Premium Plan */}
          <motion.div 
            className="rounded-lg overflow-hidden bg-gradient-to-br from-mystic-primary-900 to-mystic-secondary-900 shadow-lg transition-shadow hover:shadow-xl relative"
            variants={itemVariants}
          >
            {/* Recommended Badge */}
            <div className="absolute -top-4 right-8">
              <div className="bg-mystic-gold-500 text-white px-4 py-1 rounded-full font-medium text-sm shadow-md">
                Recommended
              </div>
            </div>
            
            <div className="p-8 border-b border-mystic-primary-700">
              <div className="flex items-center mb-4">
                <Crown className="w-6 h-6 text-mystic-gold-400 mr-2" />
                <h3 className="font-serif text-2xl font-semibold text-white">Cosmic Explorer</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$12.99</span>
                <span className="text-mystic-secondary-300 ml-2">/ month</span>
              </div>
              <p className="text-mystic-secondary-200 text-sm">
                Unlock the full cosmic experience with premium insights and personalized guidance.
              </p>
            </div>
            
            <div className="p-8">
              <h4 className="font-medium text-white mb-4">What's included:</h4>
              <ul className="space-y-3 mb-8">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-mystic-gold-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-mystic-secondary-200">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                to="/premium" 
                className="block w-full py-3 text-center bg-mystic-accent-600 hover:bg-mystic-accent-700 text-white rounded-md font-medium transition-colors"
              >
                Get Cosmic Explorer
              </Link>
            </div>
          </motion.div>
        </motion.div>
        
        <div className="text-center text-mystic-secondary-500 text-sm mt-8 max-w-xl mx-auto">
          <p>
            All plans include our satisfaction guarantee. You can cancel or change your subscription at any time. 
            Premium subscriptions are auto-renewed monthly until canceled.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionSection;