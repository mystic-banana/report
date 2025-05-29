import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useContentStore } from '../../store/contentStore';
import { ArrowRight, Sparkles } from 'lucide-react';

const DailyTarotSection: React.FC = () => {
  const { dailyTarotReading, fetchDailyTarotReading, isLoading } = useContentStore();
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  
  useEffect(() => {
    fetchDailyTarotReading();
  }, [fetchDailyTarotReading]);
  
  const handleCardFlip = (cardId: string) => {
    if (flippedCards.includes(cardId)) {
      setFlippedCards(flippedCards.filter(id => id !== cardId));
    } else {
      setFlippedCards([...flippedCards, cardId]);
    }
  };
  
  if (isLoading || !dailyTarotReading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse-slow w-8 h-8 rounded-full bg-mystic-primary-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <section className="py-16 bg-cosmic-gradient text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 inline-flex items-center justify-center">
            <Sparkles className="w-6 h-6 mr-2 text-mystic-gold-400" />
            Daily Tarot Reading
          </h2>
          <p className="text-mystic-secondary-200 max-w-2xl mx-auto">
            Receive cosmic guidance for your day with our three-card spread. Click each card to reveal its meaning.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {dailyTarotReading.cards.map((card) => (
              <motion.div
                key={card.id}
                className="perspective-1000"
                whileHover={{ y: -5 }}
                onClick={() => handleCardFlip(card.id)}
              >
                <div className={`relative w-full aspect-[2/3] cursor-pointer transition-transform duration-700 transform-style-3d ${
                  flippedCards.includes(card.id) ? 'rotate-y-180' : ''
                }`}>
                  {/* Card Back */}
                  <div className="absolute inset-0 backface-hidden rounded-lg overflow-hidden border-2 border-mystic-gold-300 shadow-lg bg-gradient-to-b from-mystic-primary-800 to-mystic-primary-900">
                    <div className="flex items-center justify-center h-full">
                      <div className="w-20 h-20 bg-mystic-gold-400 rounded-full flex items-center justify-center">
                        <span className="font-serif text-mystic-primary-900 text-2xl font-bold">?</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Front */}
                  <div className="absolute inset-0 backface-hidden rounded-lg overflow-hidden border-2 border-mystic-gold-300 shadow-lg rotate-y-180 bg-white">
                    <img 
                      src={card.image} 
                      alt={card.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                      <h3 className="font-serif text-xl font-semibold text-white mb-1">
                        {card.name}
                        {card.isReversed && " (Reversed)"}
                      </h3>
                      <p className="text-sm text-mystic-secondary-200">
                        {card.isReversed ? card.meaningReversed : card.meaningUpright}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 bg-black/20 p-6 rounded-lg">
            <h3 className="font-serif text-xl font-semibold mb-4">Today's Interpretation</h3>
            <p className="text-mystic-secondary-200 mb-6">
              {dailyTarotReading.interpretation}
            </p>
            <Link 
              to="/tarot/personal-reading" 
              className="inline-flex items-center px-5 py-2 bg-mystic-accent-600 hover:bg-mystic-accent-700 text-white rounded-md transition-colors text-sm font-medium"
            >
              Get Your Personal Reading <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailyTarotSection;