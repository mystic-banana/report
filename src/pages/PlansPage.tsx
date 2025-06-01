import React from "react";
import { motion } from "framer-motion";
import { Check, Star, Sparkles, Crown, Zap } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import Button from "../components/ui/Button";

const PlansPage: React.FC = () => {
  const plans = [
    {
      name: "Free Explorer",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with astrology",
      icon: Star,
      color: "from-gray-600 to-gray-700",
      borderColor: "border-gray-600",
      features: [
        "5 Birth Charts per month",
        "5 Basic Reports per month",
        "Daily Horoscopes",
        "Basic Compatibility Analysis",
        "Western Astrology only",
        "Community Support",
      ],
      limitations: [
        "Limited chart storage",
        "Basic report features only",
        "No premium interpretations",
      ],
    },
    {
      name: "Cosmic Seeker",
      price: "$19",
      period: "per month",
      description: "Unlock deeper cosmic insights",
      icon: Sparkles,
      color: "from-purple-600 to-indigo-600",
      borderColor: "border-purple-500",
      popular: true,
      features: [
        "25 Birth Charts per month",
        "25 Premium Reports per month",
        "Advanced Compatibility Analysis",
        "Transit Forecasts",
        "Western + Vedic Astrology",
        "PDF Report Downloads",
        "Priority Support",
        "Detailed Chart Interpretations",
      ],
    },
    {
      name: "Astral Master",
      price: "$49",
      period: "per month",
      description: "Complete astrological mastery",
      icon: Crown,
      color: "from-amber-500 to-orange-600",
      borderColor: "border-amber-500",
      features: [
        "Unlimited Birth Charts",
        "Unlimited Premium Reports",
        "All Astrology Systems",
        "Advanced Vedic Features",
        "Personalized Remedies",
        "Live Chart Consultations",
        "Custom Report Templates",
        "API Access",
        "White-label Options",
        "Dedicated Support",
      ],
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Professional Astrologer",
      content:
        "The Vedic astrology features are incredibly accurate. My clients love the detailed reports!",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Spiritual Coach",
      content:
        "The PDF reports are beautifully designed and professionally formatted. Perfect for my practice.",
      rating: 5,
    },
    {
      name: "Emma Thompson",
      role: "Astrology Enthusiast",
      content:
        "Finally found a platform that combines Western and Vedic astrology seamlessly!",
      rating: 5,
    },
  ];

  return (
    <PageLayout title="Pricing Plans - Mystic Banana">
      <div className="bg-gradient-to-br from-dark-900 via-dark-850 to-dark-800 min-h-screen">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">
                Choose Your
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 block">
                  Cosmic Journey
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Unlock the mysteries of the universe with our comprehensive
                astrology platform. From basic insights to professional-grade
                analysis.
              </p>
            </motion.div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl p-6 border border-purple-500/20"
              >
                <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">
                  AI-Powered Reports
                </h3>
                <p className="text-gray-400 text-sm">
                  Advanced AI generates personalized interpretations
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl p-6 border border-amber-500/20"
              >
                <Star className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Dual Systems</h3>
                <p className="text-gray-400 text-sm">
                  Both Western and Vedic astrology in one platform
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-pink-900/30 to-rose-900/30 rounded-xl p-6 border border-pink-500/20"
              >
                <Crown className="w-8 h-8 text-pink-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">
                  Professional Quality
                </h3>
                <p className="text-gray-400 text-sm">
                  Beautiful PDFs perfect for professional use
                </p>
              </motion.div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-dark-800 rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                    plan.popular
                      ? "border-purple-500 shadow-2xl shadow-purple-500/20"
                      : plan.borderColor
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 bg-gradient-to-br ${plan.color}`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-400 mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-gray-400 ml-2">/{plan.period}</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations &&
                      plan.limitations.map((limitation, limitIndex) => (
                        <div
                          key={limitIndex}
                          className="flex items-center opacity-60"
                        >
                          <div className="w-5 h-5 mr-3 flex-shrink-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                          </div>
                          <span className="text-gray-400 text-sm">
                            {limitation}
                          </span>
                        </div>
                      ))}
                  </div>

                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        : plan.name === "Free Explorer"
                          ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                          : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    }`}
                  >
                    {plan.name === "Free Explorer"
                      ? "Get Started Free"
                      : "Choose Plan"}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Testimonials */}
          <div className="mb-16">
            <h2 className="text-3xl font-serif font-bold text-white text-center mb-12">
              What Our Users Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-dark-800 rounded-xl p-6 border border-dark-700"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-amber-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="text-white font-semibold">
                      {testimonial.name}
                    </p>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700">
            <h2 className="text-2xl font-serif font-bold text-white text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-white font-semibold mb-2">
                  Can I change plans anytime?
                </h3>
                <p className="text-gray-400 text-sm">
                  Yes, you can upgrade or downgrade your plan at any time.
                  Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">
                  What's included in Vedic astrology?
                </h3>
                <p className="text-gray-400 text-sm">
                  Comprehensive Vedic features including Dasha periods,
                  Nakshatra analysis, and traditional remedies.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">
                  Are the reports professionally formatted?
                </h3>
                <p className="text-gray-400 text-sm">
                  Yes, all reports are beautifully designed PDFs suitable for
                  professional use and client sharing.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-gray-400 text-sm">
                  Our Free Explorer plan gives you full access to basic features
                  with no time limit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PlansPage;
