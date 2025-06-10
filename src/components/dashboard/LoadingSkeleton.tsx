import React from "react";
import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  variant?: "card" | "list" | "stats" | "header" | "content";
  count?: number;
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = "card",
  count = 1,
  className = "",
}) => {
  const shimmer = {
    initial: { backgroundPosition: "-200px 0" },
    animate: {
      backgroundPosition: "calc(200px + 100%) 0",
    },
    transition: {
      duration: 1.5,
      ease: "linear",
      repeat: Infinity,
    },
  };

  const baseClasses =
    "bg-gradient-to-r from-dark-700 via-dark-600 to-dark-700 bg-[length:200px_100%] animate-pulse";

  const renderSkeleton = () => {
    switch (variant) {
      case "header":
        return (
          <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  className={`w-16 h-16 rounded-full ${baseClasses}`}
                  {...shimmer}
                />
                <div className="space-y-2">
                  <motion.div
                    className={`h-6 w-48 rounded ${baseClasses}`}
                    {...shimmer}
                  />
                  <motion.div
                    className={`h-4 w-32 rounded ${baseClasses}`}
                    {...shimmer}
                  />
                </div>
              </div>
              <motion.div
                className={`w-24 h-24 rounded-full ${baseClasses}`}
                {...shimmer}
              />
            </div>
          </div>
        );

      case "stats":
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-dark-700 rounded-lg p-4">
                <motion.div
                  className={`w-8 h-8 rounded mb-3 ${baseClasses}`}
                  {...shimmer}
                />
                <motion.div
                  className={`h-8 w-12 rounded mb-2 ${baseClasses}`}
                  {...shimmer}
                />
                <motion.div
                  className={`h-4 w-16 rounded ${baseClasses}`}
                  {...shimmer}
                />
              </div>
            ))}
          </div>
        );

      case "list":
        return (
          <div className="space-y-4">
            {[...Array(count)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3">
                <motion.div
                  className={`w-10 h-10 rounded-lg ${baseClasses}`}
                  {...shimmer}
                />
                <div className="flex-1 space-y-2">
                  <motion.div
                    className={`h-4 w-3/4 rounded ${baseClasses}`}
                    {...shimmer}
                  />
                  <motion.div
                    className={`h-3 w-1/2 rounded ${baseClasses}`}
                    {...shimmer}
                  />
                </div>
                <motion.div
                  className={`w-16 h-6 rounded ${baseClasses}`}
                  {...shimmer}
                />
              </div>
            ))}
          </div>
        );

      case "content":
        return (
          <div className="space-y-4">
            <motion.div
              className={`h-6 w-1/3 rounded ${baseClasses}`}
              {...shimmer}
            />
            <div className="space-y-2">
              <motion.div
                className={`h-4 w-full rounded ${baseClasses}`}
                {...shimmer}
              />
              <motion.div
                className={`h-4 w-5/6 rounded ${baseClasses}`}
                {...shimmer}
              />
              <motion.div
                className={`h-4 w-4/5 rounded ${baseClasses}`}
                {...shimmer}
              />
            </div>
          </div>
        );

      case "card":
      default:
        return (
          <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
            <div className="flex items-center mb-4">
              <motion.div
                className={`w-6 h-6 rounded mr-3 ${baseClasses}`}
                {...shimmer}
              />
              <motion.div
                className={`h-6 w-32 rounded ${baseClasses}`}
                {...shimmer}
              />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <motion.div
                    className={`w-10 h-10 rounded-lg ${baseClasses}`}
                    {...shimmer}
                  />
                  <div className="flex-1 space-y-2">
                    <motion.div
                      className={`h-4 w-3/4 rounded ${baseClasses}`}
                      {...shimmer}
                    />
                    <motion.div
                      className={`h-3 w-1/2 rounded ${baseClasses}`}
                      {...shimmer}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {variant === "stats" || variant === "header" || variant === "content"
        ? renderSkeleton()
        : [...Array(count)].map((_, i) => (
            <div key={i} className={i > 0 ? "mt-6" : ""}>
              {renderSkeleton()}
            </div>
          ))}
    </div>
  );
};

export default LoadingSkeleton;
