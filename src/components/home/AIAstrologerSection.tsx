import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Bot,
  Sparkles,
  Clock,
  Globe,
  Zap,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  Brain,
  Heart,
  TrendingUp,
} from "lucide-react";

const AIAstrologerSection: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const chatDemo = [
    {
      type: "user",
      message: "What does my birth chart say about my career?",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
    },
    {
      type: "ai",
      message:
        "Based on your Mars in 10th house and Jupiter trine Midheaven, you're naturally drawn to leadership roles. Your chart suggests success in fields involving communication, technology, or healing. The upcoming Jupiter transit in March will bring significant career opportunities.",
      avatar: null,
    },
    {
      type: "user",
      message: "When is the best time to make a career change?",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    {
      type: "ai",
      message:
        "The optimal timing for your career transition is during the New Moon in your 10th house on April 15th. Saturn's supportive aspect to your Midheaven suggests this change will bring long-term stability and growth. I recommend preparing your transition plan now.",
      avatar: null,
    },
  ];

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Advanced AI Intelligence",
      description: "Trained on 10,000+ professional astrology readings",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Availability",
      description: "Get instant answers anytime, anywhere",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-Language Support",
      description: "Chat in 50+ languages worldwide",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Personalized Insights",
      description: "Tailored advice based on your unique birth chart",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Predictive Analysis",
      description: "Future predictions with 99.2% accuracy rate",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Responses",
      description: "Get detailed answers in under 3 seconds",
    },
  ];

  const testimonials = [
    {
      text: "The AI astrologer gave me insights that changed my life. More accurate than any human reading I've had!",
      author: "Sarah Chen",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face",
    },
    {
      text: "I was skeptical at first, but the predictions were incredibly accurate. It's like having a personal astrologer 24/7.",
      author: "Michael Rodriguez",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
    },
    {
      text: "The AI understood my birth chart better than I do! The career advice was spot-on and helped me land my dream job.",
      author: "Emma Thompson",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
    },
  ];

  // Simulate chat animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => {
        setCurrentMessage((prev) => (prev + 1) % chatDemo.length);
        setIsTyping(false);
      }, 1500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50" />
      <div className="absolute top-20 left-10 animate-pulse">
        <Star className="w-6 h-6 text-purple-300" />
      </div>
      <div className="absolute bottom-20 right-10 animate-bounce">
        <Sparkles className="w-8 h-8 text-blue-300" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Bot className="w-4 h-4" />
            <span>POWERED BY ADVANCED AI</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Chat with the World's Most
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Intelligent{" "}
            </span>
            AI Astrologer
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get instant, personalized astrological guidance 24/7. Our AI has
            been trained on millions of readings and provides insights with
            99.2% accuracy - more precise than most human astrologers.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Chat Demo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Chat Interface */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">AI Astrologer</h3>
                    <div className="flex items-center space-x-2 text-sm text-blue-100">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span>Online • Responds instantly</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-6 h-96 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {chatDemo.slice(0, currentMessage + 1).map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-start space-x-3 max-w-xs ${msg.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                      >
                        <div className="flex-shrink-0">
                          {msg.type === "user" ? (
                            <img
                              src={msg.avatar}
                              alt="User"
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div
                          className={`px-4 py-3 rounded-2xl ${msg.type === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}`}
                        >
                          <p className="text-sm leading-relaxed">
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="px-4 py-3 bg-gray-100 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-100 rounded-full px-4 py-3">
                    <p className="text-gray-500 text-sm">
                      Ask me anything about your future...
                    </p>
                  </div>
                  <button className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Features & Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/astrology/ai-chat"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <MessageCircle className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Start Free Chat
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>

            {/* Testimonials */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                What Our Users Say:
              </h3>
              {testimonials.slice(0, 2).map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-4"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-1 mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 text-yellow-400 fill-current"
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm mb-2">
                        "{testimonial.text}"
                      </p>
                      <p className="text-gray-500 text-xs font-medium">
                        - {testimonial.author}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIAstrologerSection;
