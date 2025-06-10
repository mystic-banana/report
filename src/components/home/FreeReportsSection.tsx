import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Star,
  Heart,
  TrendingUp,
  Users,
  Award,
  Zap,
  Gift,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const FreeReportsSection: React.FC = () => {
  const reports = [
    {
      icon: <Star className="w-8 h-8" />,
      title: "Complete Birth Chart Analysis",
      description:
        "Comprehensive analysis of your natal chart with planetary positions, houses, and aspects.",
      features: [
        "Planetary Positions",
        "House Analysis",
        "Major Aspects",
        "Personality Insights",
      ],
      color: "from-blue-500 to-purple-600",
      link: "/astrology/birth-chart",
      popular: true,
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Love Compatibility Report",
      description:
        "Discover your romantic compatibility with detailed synastry analysis and relationship insights.",
      features: [
        "Synastry Analysis",
        "Compatibility Score",
        "Relationship Advice",
        "Future Predictions",
      ],
      color: "from-pink-500 to-red-500",
      link: "/astrology/compatibility",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Career & Life Purpose",
      description:
        "Uncover your professional path and life mission through astrological career guidance.",
      features: [
        "Career Guidance",
        "Life Purpose",
        "Talent Analysis",
        "Success Timing",
      ],
      color: "from-green-500 to-teal-600",
      link: "/astrology/reports",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Daily Cosmic Forecast",
      description:
        "Personalized daily predictions based on current planetary transits affecting your chart.",
      features: [
        "Daily Predictions",
        "Transit Analysis",
        "Lucky Numbers",
        "Best Times",
      ],
      color: "from-yellow-500 to-orange-500",
      link: "/astrology/horoscopes",
    },
  ];

  const stats = [
    {
      icon: <Users className="w-6 h-6" />,
      value: "1.2M+",
      label: "Reports Generated",
    },
    {
      icon: <Award className="w-6 h-6" />,
      value: "99.2%",
      label: "Accuracy Rate",
    },
    {
      icon: <Star className="w-6 h-6" />,
      value: "4.9/5",
      label: "User Rating",
    },
    {
      icon: <Gift className="w-6 h-6" />,
      value: "100%",
      label: "Free Forever",
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
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Gift className="w-4 h-4" />
            <span>100% FREE FOREVER</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            World's Most Comprehensive
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {" "}
              Free{" "}
            </span>
            Astrology Reports
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get instant access to professional-grade astrology reports that
            normally cost $100+. No credit card required, no hidden fees,
            completely free forever.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl mb-3">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Reports Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {reports.map((report, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                {report.popular && (
                  <div className="absolute -top-3 left-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}

                <div
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${report.color} text-white rounded-2xl mb-6`}
                >
                  {report.icon}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {report.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {report.description}
                </p>

                <div className="space-y-3 mb-8">
                  {report.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center space-x-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to={report.link}
                  className={`group/btn inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r ${report.color} text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                >
                  Get Free Report
                  <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center bg-gradient-to-r from-purple-900 to-pink-900 rounded-3xl p-12 text-white"
        >
          <h3 className="text-3xl font-bold mb-4">
            Why Pay $100+ Elsewhere When It's Free Here?
          </h3>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Our mission is to make professional astrology accessible to
            everyone. That's why we offer premium reports completely free,
            forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/astrology/birth-chart"
              className="inline-flex items-center px-8 py-4 bg-white text-purple-900 font-bold rounded-xl hover:bg-gray-100 transition-colors"
            >
              <FileText className="w-5 h-5 mr-2" />
              Start Your Free Report
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

export default FreeReportsSection;
