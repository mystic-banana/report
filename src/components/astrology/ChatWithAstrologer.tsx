import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import { useAstrologyStore } from "../../store/astrologyStore";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import {
  MessageCircle,
  Send,
  Sparkles,
  Star,
  Moon,
  Sun,
  X,
  ChevronDown,
  User,
  Bot,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatWithAstrologerProps {
  className?: string;
}

const ChatWithAstrologer: React.FC<ChatWithAstrologerProps> = ({
  className = "",
}) => {
  const { user } = useAuthStore();
  const { birthCharts, reports, fetchBirthCharts, fetchReports } =
    useAstrologyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      fetchBirthCharts(user.id);
      fetchReports(user.id);
    }
  }, [user, isOpen, fetchBirthCharts, fetchReports]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const parseChartData = (chart: any, report?: any) => {
    let chartInfo = "";

    if (chart) {
      chartInfo += `Birth Chart for ${chart.name}:\n`;
      chartInfo += `Birth Date: ${new Date(chart.birth_date).toLocaleDateString()}\n`;
      if (chart.birth_time) {
        chartInfo += `Birth Time: ${chart.birth_time}\n`;
      }
      if (chart.birth_location) {
        chartInfo += `Birth Location: ${chart.birth_location.city}, ${chart.birth_location.country}\n`;
      }

      if (chart.chart_data?.planets) {
        chartInfo += "\nPlanetary Positions:\n";
        chart.chart_data.planets.slice(0, 10).forEach((planet: any) => {
          chartInfo += `- ${planet.name} in ${planet.sign}`;
          if (planet.house) {
            chartInfo += ` (${planet.house}${getOrdinalSuffix(planet.house)} house)`;
          }
          chartInfo += "\n";
        });
      }

      if (chart.chart_data?.aspects) {
        chartInfo += "\nMajor Aspects:\n";
        chart.chart_data.aspects.slice(0, 8).forEach((aspect: any) => {
          chartInfo += `- ${aspect.planet1} ${aspect.aspect} ${aspect.planet2}\n`;
        });
      }
    }

    if (report) {
      chartInfo += `\n\nReport: ${report.title}\n`;
      chartInfo += `Report Type: ${report.report_type}\n`;
      if (report.content) {
        // Include first 500 characters of report content for context
        const contentPreview = report.content.substring(0, 500);
        chartInfo += `Report Summary: ${contentPreview}...\n`;
      }
    }

    return chartInfo;
  };

  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Get selected chart and report data
      const selectedChartData = birthCharts.find((c) => c.id === selectedChart);
      const selectedReportData = reports.find((r) => r.id === selectedReport);

      if (!selectedChartData && !selectedReportData) {
        throw new Error("Please select a birth chart or report to chat about.");
      }

      // Parse chart/report data for context
      const chartContext = parseChartData(
        selectedChartData,
        selectedReportData,
      );

      // Call the edge function for AI chat
      const response = await supabase.functions.invoke(
        "supabase-functions-chat-with-astrologer",
        {
          body: {
            chartData: chartContext,
            userQuestion: inputMessage,
            conversationHistory: messages.slice(-6), // Last 6 messages for context
          },
        },
      );

      if (response.error) {
        throw new Error(
          response.error.message || "Failed to get astrological advice",
        );
      }

      const aiResponse = response.data?.response || response.data?.content;
      if (!aiResponse) {
        throw new Error("No response received from the astrologer");
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I apologize, but I'm having trouble connecting right now. ${error.message || "Please try again in a moment."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setSelectedChart("");
    setSelectedReport("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getWelcomeMessage = () => {
    const selectedChartData = birthCharts.find((c) => c.id === selectedChart);
    const selectedReportData = reports.find((r) => r.id === selectedReport);

    if (selectedChartData || selectedReportData) {
      const name = selectedChartData?.name || selectedReportData?.title || "";
      return `🌟 Welcome! I'm your AI astrologer. I can see you've selected ${name}. I'm here to help you understand your cosmic blueprint and answer any questions about your astrological profile. What would you like to explore?`;
    }

    return "🌟 Greetings, seeker! I am your AI astrologer, here to guide you through the mysteries of your cosmic blueprint. Please select a birth chart or report above, and then ask me anything about your astrological journey.";
  };

  if (!user) {
    return (
      <div className={`${className}`}>
        <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-6 border border-purple-500/20 text-center">
          <MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Chat with AI Astrologer
          </h3>
          <p className="text-gray-300 mb-4">
            Sign in to chat with your personal AI astrologer about your birth
            charts and reports.
          </p>
          <Button
            onClick={() => (window.location.href = "/login")}
            className="bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            Sign In to Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                <MessageCircle className="w-8 h-8 text-purple-400" />
                <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-white">
                  Chat with AI Astrologer
                </h3>
                <p className="text-gray-300 text-sm">
                  Get personalized insights about your charts and reports
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              Start Chat
            </Button>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-2xl border border-purple-500/20 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-purple-800/50 to-indigo-800/50 p-4 border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-purple-800"></div>
                </div>
                <div className="ml-3">
                  <h3 className="text-white font-semibold">AI Astrologer</h3>
                  <p className="text-purple-300 text-xs">
                    Online • Ready to help
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startNewChat}
                  className="text-purple-300 hover:text-white"
                >
                  New Chat
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-purple-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chart/Report Selection */}
            <div className="mt-4 space-y-2">
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full bg-purple-800/30 border border-purple-500/30 rounded-lg px-3 py-2 text-left text-white text-sm flex items-center justify-between hover:bg-purple-800/40 transition-colors"
                >
                  <span>
                    {selectedChart || selectedReport
                      ? `Selected: ${
                          birthCharts.find((c) => c.id === selectedChart)
                            ?.name ||
                          reports.find((r) => r.id === selectedReport)?.title ||
                          "Unknown"
                        }`
                      : "Select a birth chart or report to discuss"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-dark-800 border border-purple-500/30 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                    {birthCharts.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-purple-400 bg-purple-900/20">
                          Birth Charts
                        </div>
                        {birthCharts.map((chart) => (
                          <button
                            key={chart.id}
                            onClick={() => {
                              setSelectedChart(chart.id);
                              setSelectedReport("");
                              setShowDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-white text-sm hover:bg-purple-800/30 transition-colors flex items-center"
                          >
                            <Star className="w-4 h-4 text-purple-400 mr-2" />
                            <div>
                              <div className="font-medium">{chart.name}</div>
                              <div className="text-xs text-gray-400">
                                {new Date(
                                  chart.birth_date,
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {reports.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-purple-400 bg-purple-900/20">
                          Reports
                        </div>
                        {reports.slice(0, 10).map((report) => (
                          <button
                            key={report.id}
                            onClick={() => {
                              setSelectedReport(report.id);
                              setSelectedChart("");
                              setShowDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-white text-sm hover:bg-purple-800/30 transition-colors flex items-center"
                          >
                            <Moon className="w-4 h-4 text-indigo-400 mr-2" />
                            <div>
                              <div className="font-medium truncate">
                                {report.title}
                              </div>
                              <div className="text-xs text-gray-400 capitalize">
                                {report.report_type.replace("-", " ")}
                                {report.is_premium && " • Premium"}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {birthCharts.length === 0 && reports.length === 0 && (
                      <div className="px-3 py-4 text-center text-gray-400 text-sm">
                        No charts or reports available.
                        <br />
                        Create a birth chart first.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sun className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed max-w-md mx-auto">
                  {getWelcomeMessage()}
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-teal-600 to-cyan-600"
                      : "bg-gradient-to-br from-purple-600 to-indigo-600"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
                      : "bg-dark-700 text-gray-100 border border-purple-500/20"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 opacity-70 ${
                      message.role === "user"
                        ? "text-teal-100"
                        : "text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-dark-700 border border-purple-500/20 rounded-2xl px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-gray-300 text-sm">
                      Consulting the stars...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-purple-500/20 bg-purple-900/10">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your chart, planets, aspects, or spiritual guidance..."
                  className="w-full bg-dark-700 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading || (!selectedChart && !selectedReport)}
                />
                {!selectedChart && !selectedReport && (
                  <div className="absolute inset-0 bg-dark-700/50 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm">
                      Select a chart or report first
                    </span>
                  </div>
                )}
              </div>
              <Button
                onClick={sendMessage}
                disabled={
                  !inputMessage.trim() ||
                  isLoading ||
                  (!selectedChart && !selectedReport)
                }
                className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Have questions about your chart? Ask your AI astrologer!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWithAstrologer;
