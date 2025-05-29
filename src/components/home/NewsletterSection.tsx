import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Star } from 'lucide-react';

const NewsletterSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-4xl mx-auto bg-gradient-to-r from-mystic-primary-900 to-mystic-secondary-900 rounded-lg overflow-hidden shadow-xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          <div className="relative">
            {/* Background Stars */}
            <div className="absolute top-10 left-10">
              <Star className="w-6 h-6 text-mystic-gold-400/20" />
            </div>
            <div className="absolute bottom-20 right-16">
              <Star className="w-8 h-8 text-mystic-gold-400/20" />
            </div>
            <div className="absolute top-32 right-24">
              <Star className="w-5 h-5 text-mystic-gold-400/20" />
            </div>
            
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <h2 className="font-serif text-3xl font-bold text-white mb-4">
                  Join Our Cosmic Newsletter
                </h2>
                <p className="text-mystic-secondary-200 mb-6">
                  Subscribe to receive weekly spiritual insights, exclusive offers, and cosmic updates tailored to your journey.
                </p>
                <ul className="space-y-2 mb-6">
                  {[
                    'Weekly personalized horoscope updates',
                    'Exclusive spiritual practices and rituals',
                    'Early access to premium content',
                    'Special offers and discounts'
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start text-sm text-mystic-secondary-200">
                      <Star className="w-4 h-4 text-mystic-gold-400 mr-2 flex-shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="w-full md:w-1/2 bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Your name"
                      className="w-full px-4 py-2 bg-white/20 text-white placeholder-white/50 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-mystic-accent-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Your email address"
                      className="w-full px-4 py-2 bg-white/20 text-white placeholder-white/50 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-mystic-accent-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="zodiac" className="block text-sm font-medium text-white mb-1">
                      Zodiac Sign (Optional)
                    </label>
                    <select
                      id="zodiac"
                      className="w-full px-4 py-2 bg-white/20 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-mystic-accent-500"
                    >
                      <option value="">Select your sign</option>
                      {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].map((sign) => (
                        <option key={sign} value={sign.toLowerCase()}>{sign}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-6 py-3 bg-mystic-accent-600 hover:bg-mystic-accent-700 text-white rounded-md font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Subscribe Now
                  </button>
                  
                  <p className="text-xs text-mystic-secondary-300 text-center">
                    By subscribing, you agree to our Privacy Policy. You can unsubscribe at any time.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;