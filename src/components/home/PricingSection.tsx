import React from "react";
import { Check } from "lucide-react";

const PricingSection: React.FC = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for exploring your cosmic journey",
      features: [
        "Basic birth chart analysis",
        "Daily horoscope",
        "Limited AI astrologer chat",
        "Basic compatibility reports",
        "Community access",
      ],
      popular: false,
      buttonText: "Get Started Free",
      buttonStyle:
        "bg-white text-purple-600 border border-purple-600 hover:bg-purple-50",
    },
    {
      name: "Premium",
      price: "$19",
      period: "per month",
      description: "Unlock your full astrological potential",
      features: [
        "Complete birth chart analysis",
        "Unlimited AI astrologer chat",
        "Advanced compatibility reports",
        "Transit predictions",
        "Vedic & Western astrology",
        "PDF report downloads",
        "Priority support",
        "Ad-free experience",
      ],
      popular: true,
      buttonText: "Start Premium",
      buttonStyle: "bg-white text-purple-600 hover:bg-purple-50",
    },
    {
      name: "Professional",
      price: "$49",
      period: "per month",
      description: "For serious astrology practitioners",
      features: [
        "Everything in Premium",
        "Professional consultation tools",
        "Client management system",
        "Custom report branding",
        "Advanced chart techniques",
        "Bulk chart generation",
        "API access",
        "White-label options",
      ],
      popular: false,
      buttonText: "Go Professional",
      buttonStyle:
        "bg-white text-purple-600 border border-purple-600 hover:bg-purple-50",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your Cosmic Journey
          </h2>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Unlock the mysteries of the universe with our comprehensive
            astrology platform. From free insights to professional tools, we
            have the perfect plan for your spiritual journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border ${
                plan.popular
                  ? "border-yellow-400 shadow-2xl scale-105 bg-white/15"
                  : "border-white/20 hover:border-white/30"
              } transition-all duration-300 hover:transform hover:scale-105`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full text-sm font-bold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-purple-200 ml-2">/{plan.period}</span>
                </div>
                <p className="text-purple-200">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  plan.buttonStyle
                } transform hover:scale-105`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-purple-200 mb-4">
            All plans include our 30-day money-back guarantee
          </p>
          <div className="flex justify-center items-center space-x-8 text-sm text-purple-300">
            <span className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              No setup fees
            </span>
            <span className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Cancel anytime
            </span>
            <span className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              24/7 support
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
