import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Moon, Sparkles, Heart, BrainCircuit, Bot as Lotus } from 'lucide-react';

const CategoriesSection: React.FC = () => {
  const categories = [
    {
      name: 'Astrology',
      description: 'Explore the cosmic influences of celestial bodies on your life',
      icon: <Star className="w-10 h-10 text-magazine-accent" />,
      link: '/category/astrology',
      color: 'bg-magazine-secondary'
    },
    {
      name: 'Tarot',
      description: 'Unlock insights through ancient tarot wisdom and card readings',
      icon: <Moon className="w-10 h-10 text-magazine-accent" />,
      link: '/category/tarot',
      color: 'bg-magazine-secondary'
    },
    {
      name: 'Spirituality',
      description: 'Connect with your higher self and explore universal consciousness',
      icon: <Sparkles className="w-10 h-10 text-magazine-accent" />,
      link: '/category/spirituality',
      color: 'bg-magazine-secondary'
    },
    {
      name: 'Relationships',
      description: 'Discover cosmic compatibility and nurture soulful connections',
      icon: <Heart className="w-10 h-10 text-magazine-accent" />,
      link: '/category/relationships',
      color: 'bg-magazine-secondary'
    },
    {
      name: 'Mindfulness',
      description: 'Cultivate presence and awareness through spiritual practices',
      icon: <BrainCircuit className="w-10 h-10 text-magazine-accent" />,
      link: '/category/mindfulness',
      color: 'bg-magazine-secondary'
    },
    {
      name: 'Meditation',
      description: 'Explore techniques to calm the mind and expand consciousness',
      icon: <Lotus className="w-10 h-10 text-magazine-accent" />,
      link: '/category/meditation',
      color: 'bg-magazine-secondary'
    }
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
    <section className="py-16 bg-magazine-primary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Explore Sacred Knowledge
          </h2>
          <p className="text-magazine-muted max-w-2xl mx-auto">
            Dive into our diverse categories of spiritual wisdom and find the path that resonates with your soul.
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {categories.map((category, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all ${category.color} group`}
            >
              <Link to={category.link} className="block p-8">
                <div className="mb-4 transform group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-magazine-accent transition-colors">
                  {category.name}
                </h3>
                <p className="text-magazine-muted text-sm mb-4">
                  {category.description}
                </p>
                <span className="text-magazine-accent font-medium group-hover:underline text-sm inline-flex items-center">
                  Explore {category.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;