import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Users,
  Calendar,
  TrendingUp,
  BookOpen,
  Sparkles,
  ArrowRight,
  Plus,
  Eye,
} from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { useAuthStore } from "../../store/authStore";
import { useAstrologyStore } from "../../store/astrologyStore";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { getZodiacSign } from "../../utils/astronomicalCalculations";

const AstrologyPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const {
    birthCharts,
    dailyHoroscopes,
    compatibilityReports,
    loading,
    fetchBirthCharts,
    fetchDailyHoroscope,
    fetchCompatibilityReports,
  } = useAstrologyStore();

  const [todayHoroscope, setTodayHoroscope] = useState(null);
  const [userZodiacSign, setUserZodiacSign] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBirthCharts(user.id);
      fetchCompatibilityReports(user.id);

      // Get user's zodiac sign from their first birth chart
      if (birthCharts.length > 0) {
        const sign = getZodiacSign(birthCharts[0].birth_date);
        setUserZodiacSign(sign);

        // Fetch today's horoscope
        const today = new Date().toISOString().split("T")[0];
        fetchDailyHoroscope(sign, today).then(setTodayHoroscope);
      }
    }
  }, [isAuthenticated, user, birthCharts.length]);

  const features = [
    {
      icon: Star,
      title: "Birth Chart Analysis",
      description:
        "Generate detailed natal charts with planetary positions and interpretations",
      link: "/astrology/birth-chart",
      color: "from-purple-600 to-indigo-600",
    },
    {
      icon: Users,
      title: "Compatibility Reports",
      description:
        "Discover relationship compatibility through astrological synastry",
      link: "/astrology/compatibility",
      color: "from-pink-500 to-rose-600",
    },
    {
      icon: Calendar,
      title: "Daily Horoscopes",
      description: "Personalized daily guidance based on your zodiac sign",
      link: "/astrology/horoscopes",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: TrendingUp,
      title: "Transit Forecasts",
      description: "Track planetary movements and their influence on your life",
      link: "/astrology/transits",
      color: "from-teal-500 to-cyan-600",
    },
    {
      icon: BookOpen,
      title: "Professional Reports",
      description: "Comprehensive astrological reports for deep insights",
      link: "/astrology/reports",
      color: "from-indigo-500 to-purple-600",
    },
    {
      icon: Sparkles,
      title: "Karma & Destiny",
      description: "Explore your soul's journey through Vedic astrology",
      link: "/astrology/vedic",
      color: "from-emerald-500 to-teal-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <PageLayout title="Astrology - Mystic Banana">
      <div className="bg-gradient-to-br from-dark-900 via-dark-850 to-dark-800 min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6">
                Unlock Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Cosmic
                </span>{" "}
                Destiny
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
                Discover the profound wisdom of the stars with our comprehensive
                astrological tools and AI-powered interpretations.
              </p>

              {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/signup">
                    <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg">
                      Start Your Journey
                    </Button>
                  </Link>
                  <Link to="/astrology/birth-chart">
                    <Button variant="outline" className="px-8 py-4 text-lg">
                      Try Free Chart
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link to="/astrology/birth-chart">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg">
                    Create Birth Chart
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </section>

        {/* User Dashboard Section */}
        {isAuthenticated && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-8 mb-12 border border-purple-500/20"
              >
                <h2 className="text-3xl font-serif font-bold text-white mb-6">
                  Welcome back, {user?.name}!
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Birth Charts */}
                  <div className="bg-dark-800/50 rounded-xl p-6 border border-dark-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Birth Charts
                      </h3>
                      <Star className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">
                      {birthCharts.length}
                    </p>
                    <p className="text-gray-400 text-sm mb-4">Charts created</p>
                    <Link to="/astrology/birth-chart">
                      <Button size="sm" variant="outline" icon={Plus}>
                        Create New
                      </Button>
                    </Link>
                  </div>

                  {/* Compatibility Reports */}
                  <div className="bg-dark-800/50 rounded-xl p-6 border border-dark-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Compatibility
                      </h3>
                      <Users className="w-5 h-5 text-pink-400" />
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">
                      {compatibilityReports.length}
                    </p>
                    <p className="text-gray-400 text-sm mb-4">
                      Reports generated
                    </p>
                    <Link to="/astrology/compatibility">
                      <Button size="sm" variant="outline" icon={Eye}>
                        View All
                      </Button>
                    </Link>
                  </div>

                  {/* Today's Horoscope */}
                  <div className="bg-dark-800/50 rounded-xl p-6 border border-dark-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Today's Horoscope
                      </h3>
                      <Calendar className="w-5 h-5 text-amber-400" />
                    </div>
                    {userZodiacSign ? (
                      <>
                        <p className="text-2xl font-bold text-white mb-2">
                          {userZodiacSign}
                        </p>
                        <p className="text-gray-400 text-sm mb-4">Your sign</p>
                        <Link to="/astrology/horoscopes">
                          <Button size="sm" variant="outline" icon={Eye}>
                            Read More
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <p className="text-gray-400 text-sm">
                        Create a birth chart to see your horoscope
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
                Explore Astrological Wisdom
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Dive deep into the cosmic influences that shape your life with
                our comprehensive suite of astrological tools.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group relative"
                  >
                    <Link to={feature.link}>
                      <div className="relative bg-dark-800 rounded-2xl p-8 border border-dark-700 hover:border-dark-600 transition-all duration-300 overflow-hidden h-full">
                        {/* Gradient Background */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                        ></div>

                        {/* Content */}
                        <div className="relative z-10">
                          <div
                            className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 bg-gradient-to-br ${feature.color}`}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-3">
                            {feature.title}
                          </h3>
                          <p className="text-gray-400 mb-6">
                            {feature.description}
                          </p>
                          <div className="flex items-center text-sm font-medium text-purple-400 group-hover:text-purple-300 transition-colors">
                            <span>Explore</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-dark-900/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-serif font-bold text-white mb-6">
                Cosmic Transformations
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Discover how our astrological insights have helped others find
                clarity and purpose.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah J.",
                  quote:
                    "The birth chart analysis was incredibly accurate. It helped me understand aspects of my personality I've been struggling with for years.",
                  image:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
                },
                {
                  name: "Michael T.",
                  quote:
                    "The compatibility report gave my partner and I deep insights into our relationship dynamics. Highly recommended!",
                  image:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
                },
                {
                  name: "Elena R.",
                  quote:
                    "I've been following my transit forecasts for months now, and the accuracy is uncanny. It's like having a cosmic GPS!",
                  image:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=elena",
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-dark-800 rounded-2xl p-8 border border-dark-700"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-purple-400 text-sm">Verified User</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-12 text-center border border-purple-500/20 relative overflow-hidden"
            >
              {/* Background Elements */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-purple-500 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500 rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
                  Begin Your Cosmic Journey Today
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                  Unlock the secrets of the stars and discover your true cosmic
                  potential with our personalized astrological tools.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/astrology/birth-chart">
                    <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg">
                      Create Your Birth Chart
                    </Button>
                  </Link>
                  <Link to="/astrology/horoscopes">
                    <Button variant="outline" className="px-8 py-4 text-lg">
                      Read Daily Horoscope
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default AstrologyPage;
