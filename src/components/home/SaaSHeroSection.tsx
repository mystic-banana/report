import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Star,
  Users,
  Award,
  TrendingUp,
  Play,
  ArrowRight,
  CheckCircle,
  Globe,
  Zap,
} from "lucide-react";

const SaaSHeroSection: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [stats, setStats] = useState({
    users: 0,
    reports: 0,
    accuracy: 0,
  });

  const testimonials = [
    { text: "Most accurate readings I've ever received!", author: "Sarah M." },
    { text: "The AI astrologer is incredibly insightful.", author: "David L." },
    { text: "Changed my life completely. 5 stars!", author: "Emma R." },
  ];

  // Animate stats on mount
  useEffect(() => {
    const animateStats = () => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let step = 0;
      const interval = setInterval(() => {
        step++;
        const progress = step / steps;

        setStats({
          users: Math.floor(1200000 * progress),
          reports: Math.floor(5000000 * progress),
          accuracy: Math.floor(99.2 * progress),
        });

        if (step >= steps) {
          clearInterval(interval);
          setStats({ users: 1200000, reports: 5000000, accuracy: 99.2 });
        }
      }, stepDuration);
    };

    const timer = setTimeout(animateStats, 500);
    return () => clearTimeout(timer);
  }, []);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    "Free Birth Chart Analysis",
    "AI-Powered Predictions",
    "99.2% Accuracy Rate",
    "24/7 Astrologer Chat",
  ];

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 animate-pulse">
          <Star className="w-6 h-6 text-yellow-300/30" />
        </div>
        <div className="absolute top-40 right-20 animate-bounce">
          <Sparkles className="w-8 h-8 text-purple-300/40" />
        </div>
        <div className="absolute bottom-40 left-20 animate-pulse">
          <Star className="w-4 h-4 text-pink-300/30" />
        </div>
        <div className="absolute top-60 left-1/3 animate-bounce">
          <Star className="w-5 h-5 text-blue-300/30" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Column - Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-4 text-sm"
            >
              <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-white">#1 Astrology Platform</span>
              </div>
              <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-white">1M+ Users</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                World's Most
                <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {" "}
                  Accurate{" "}
                </span>
                Astrology Platform
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 leading-relaxed max-w-2xl">
                Discover your cosmic destiny with AI-powered insights, free
                birth chart analysis, and 24/7 astrologer chat. Join over 1
                million seekers worldwide.
              </p>
            </motion.div>

            {/* Feature List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-3"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white text-sm">{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link
                to="/astrology/birth-chart"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Get Free Birth Chart
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/astrology/ai-chat"
                className="group inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl transition-all duration-300 border border-white/20 hover:border-white/40"
              >
                <Play className="w-5 h-5 mr-2" />
                Chat with AI Astrologer
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="pt-6"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-3"
                >
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 italic">
                    "{testimonials[currentTestimonial].text}"
                  </p>
                  <span className="text-gray-400 text-sm">
                    - {testimonials[currentTestimonial].author}
                  </span>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Right Column - Stats & Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20"
              >
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">
                  {(stats.users / 1000000).toFixed(1)}M+
                </div>
                <div className="text-gray-300 text-sm">Active Users</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20"
              >
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">
                  {(stats.reports / 1000000).toFixed(1)}M+
                </div>
                <div className="text-gray-300 text-sm">Reports Generated</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20"
              >
                <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">
                  {stats.accuracy}%
                </div>
                <div className="text-gray-300 text-sm">Accuracy Rate</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20"
              >
                <Globe className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">150+</div>
                <div className="text-gray-300 text-sm">Countries</div>
              </motion.div>
            </div>

            {/* Central Visual Element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="relative mx-auto w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center"
            >
              <div className="w-60 h-60 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full flex items-center justify-center">
                <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-yellow-400 animate-pulse" />
                </div>
              </div>

              {/* Orbiting Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <Star className="absolute top-4 left-1/2 w-6 h-6 text-yellow-300" />
                <Star className="absolute bottom-4 left-1/2 w-4 h-4 text-pink-300" />
                <Star className="absolute left-4 top-1/2 w-5 h-5 text-blue-300" />
                <Star className="absolute right-4 top-1/2 w-4 h-4 text-purple-300" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-20 fill-white">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default SaaSHeroSection;
