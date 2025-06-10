import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Heart,
  TrendingUp,
  Calendar,
  Users,
  BookOpen,
  Headphones,
  Zap,
  Globe,
  Shield,
  Clock,
  Award,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const FeaturesShowcase: React.FC = () => {
  const mainFeatures = [
    {
      icon: <Star className="w-8 h-8" />,
      title: "Birth Chart Analysis",
      description:
        "Complete natal chart interpretation with planetary positions, houses, and aspects.",
      features: [
        "Detailed Planet Analysis",
        "House Interpretations",
        "Aspect Patterns",
        "Chart Patterns",
      ],
      color: "from-blue-500 to-purple-600",
      link: "/astrology/birth-chart",
      image:
        "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Relationship Compatibility",
      description:
        "Synastry analysis and composite charts for deep relationship insights.",
      features: [
        "Synastry Charts",
        "Composite Analysis",
        "Love Compatibility",
        "Relationship Timing",
      ],
      color: "from-pink-500 to-red-500",
      link: "/astrology/compatibility",
      image:
        "https://images.unsplash.com/photo-1518621012420-8ab10887b471?w=400&q=80",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Predictive Astrology",
      description:
        "Future predictions using transits, progressions, and solar returns.",
      features: [
        "Transit Forecasts",
        "Solar Returns",
        "Progressions",
        "Timing Analysis",
      ],
      color: "from-green-500 to-teal-600",
      link: "/astrology/transits",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Daily Horoscopes",
      description:
        "Personalized daily, weekly, and monthly horoscope predictions.",
      features: [
        "Daily Predictions",
        "Weekly Forecasts",
        "Monthly Outlook",
        "Lucky Numbers",
      ],
      color: "from-yellow-500 to-orange-500",
      link: "/astrology/horoscopes",
      image:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&q=80",
    },
  ];

  const additionalFeatures = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Vedic Astrology",
      description: "Traditional Indian astrology with dashas and nakshatras",
      link: "/astrology/vedic",
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "Astrology Podcasts",
      description: "Expert insights and cosmic guidance audio content",
      link: "/podcasts",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Forum",
      description: "Connect with fellow astrology enthusiasts worldwide",
      link: "/community",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Reports",
      description: "Get detailed reports generated in under 30 seconds",
      link: "/astrology/reports",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Time Zones",
      description: "Accurate calculations for any location worldwide",
      link: "/astrology/birth-chart",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy Protected",
      description: "Your personal data is encrypted and secure",
      link: "/privacy",
    },
  ];

  const stats = [
    {
      icon: <Users className="w-8 h-8" />,
      value: "1.2M+",
      label: "Active Users",
    },
    {
      icon: <Star className="w-8 h-8" />,
      value: "5M+",
      label: "Reports Generated",
    },
    {
      icon: <Award className="w-8 h-8" />,
      value: "99.2%",
      label: "Accuracy Rate",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      value: "24/7",
      label: "Support Available",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Complete Astrological
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {" "}
              Ecosystem{" "}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need for your spiritual journey - from birth chart
            analysis to daily guidance, all powered by cutting-edge AI and
            traditional astrological wisdom.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Main Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-80`}
                />
                <div className="absolute top-6 left-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
                    {feature.icon}
                  </div>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {feature.features.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to={feature.link}
                  className={`group/btn inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r ${feature.color} text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105`}
                >
                  Explore {feature.title.split(" ")[0]}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Plus Many More Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link
                  to={feature.link}
                  className="block bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center bg-gradient-to-r from-purple-900 to-pink-900 rounded-3xl p-12 text-white"
        >
          <h3 className="text-3xl font-bold mb-4">
            Ready to Unlock Your Cosmic Potential?
          </h3>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join over 1 million users who trust Mystic Banana for their
            spiritual guidance. Start your journey today with a free birth chart
            analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/astrology/birth-chart"
              className="inline-flex items-center px-8 py-4 bg-white text-purple-900 font-bold rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Star className="w-5 h-5 mr-2" />
              Get Free Birth Chart
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesShowcase;
