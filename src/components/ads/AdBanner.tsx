import React, { useState, useEffect, useRef } from "react";
import { ExternalLink, X } from "lucide-react";
import { adBannerService } from "../../services/adBannerService";
import { useAuthStore } from "../../store/authStore";
import type {
  AdBanner as AdBannerType,
  AdDisplayProps,
} from "../../types/adTypes";

const AdBanner: React.FC<AdDisplayProps> = ({
  zone,
  className = "",
  maxAds = 1,
  enableTracking = true,
  enableRotation = false,
  rotationInterval = 30000, // 30 seconds
}) => {
  const { user } = useAuthStore();
  const [ads, setAds] = useState<AdBannerType[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const adRef = useRef<HTMLDivElement>(null);
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load ads for the zone
  useEffect(() => {
    const loadAds = async () => {
      try {
        setError(null);
        const adsData = await adBannerService.getActiveAdsForZone(zone, maxAds);
        const filteredAds = adsData.filter((ad) => !dismissed.includes(ad.id));
        setAds(filteredAds);
      } catch (error) {
        console.error("Error loading ads:", error);
        setError("Failed to load ads");
        // Set empty ads array on error to prevent infinite loading
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    loadAds();
  }, [zone, maxAds, dismissed]);

  // Set up intersection observer for view tracking
  useEffect(() => {
    if (!enableTracking || !adRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !visible) {
            setVisible(true);
            const currentAd = ads[currentAdIndex];
            if (currentAd) {
              adBannerService
                .trackAdEvent(currentAd.id, "view", zone, user?.id)
                .catch((err) => {
                  console.error("Error tracking ad view:", err);
                });
            }
          }
        });
      },
      { threshold: 0.5 },
    );

    observerRef.current.observe(adRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [ads, currentAdIndex, enableTracking, visible, zone, user?.id]);

  // Set up rotation timer
  useEffect(() => {
    if (!enableRotation || ads.length <= 1) return;

    rotationTimerRef.current = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, rotationInterval);

    return () => {
      if (rotationTimerRef.current) {
        clearInterval(rotationTimerRef.current);
      }
    };
  }, [ads.length, enableRotation, rotationInterval]);

  const handleAdClick = async (ad: AdBannerType) => {
    try {
      if (enableTracking) {
        await adBannerService.trackAdEvent(ad.id, "click", zone, user?.id);
      }

      if (ad.target_url) {
        window.open(ad.target_url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Error handling ad click:", error);
    }
  };

  const handleDismiss = (adId: string) => {
    setDismissed([...dismissed, adId]);
    // Store dismissed ads in localStorage
    try {
      const dismissedAds = JSON.parse(
        localStorage.getItem("dismissedAds") || "[]",
      );
      dismissedAds.push(adId);
      localStorage.setItem("dismissedAds", JSON.stringify(dismissedAds));
    } catch (error) {
      console.error("Error saving dismissed ads:", error);
    }
  };

  // Load dismissed ads from localStorage on mount
  useEffect(() => {
    try {
      const dismissedAds = JSON.parse(
        localStorage.getItem("dismissedAds") || "[]",
      );
      setDismissed(dismissedAds);
    } catch (error) {
      console.error("Error loading dismissed ads:", error);
    }
  }, []);

  const renderAdContent = (ad: AdBannerType) => {
    try {
      switch (ad.ad_type) {
        case "html":
          return (
            <div
              dangerouslySetInnerHTML={{ __html: ad.content }}
              className="w-full h-full"
            />
          );

        case "svg":
          return (
            <div
              dangerouslySetInnerHTML={{ __html: ad.content }}
              className="w-full h-full flex items-center justify-center"
            />
          );

        case "image":
          return (
            <div className="relative w-full h-full overflow-hidden rounded-lg">
              <img
                src={ad.content}
                alt={ad.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  console.error("Error loading ad image:", ad.content);
                  e.currentTarget.style.display = "none";
                }}
              />
              {ad.cta_text && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="text-white font-semibold text-sm mb-1">
                    {ad.title}
                  </div>
                  <div className="inline-flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium">
                    <span>{ad.cta_text}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              )}
            </div>
          );

        case "text":
          return (
            <div className="p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg">
              <div className="text-white font-semibold mb-2">{ad.title}</div>
              <div className="text-gray-300 text-sm mb-3">{ad.content}</div>
              {ad.cta_text && (
                <div className="inline-flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 rounded-full text-white text-xs font-medium hover:from-purple-700 hover:to-pink-700 transition-colors">
                  <span>{ad.cta_text}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              )}
            </div>
          );

        default:
          return (
            <div className="p-4 bg-gray-800/50 rounded-lg text-center text-gray-400">
              Unsupported ad type: {ad.ad_type}
            </div>
          );
      }
    } catch (error) {
      console.error("Error rendering ad content:", error);
      return (
        <div className="p-4 bg-red-800/20 border border-red-600/30 rounded-lg text-center text-red-400">
          Error displaying ad
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div
        className={`animate-pulse bg-gray-800/50 rounded-lg ${getZoneClasses(zone)} ${className}`}
      >
        <div className="w-full h-full bg-gray-700/50 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${getZoneClasses(zone)} ${className}`}>
        <div className="p-4 bg-red-800/20 border border-red-600/30 rounded-lg text-center text-red-400 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className={`${getZoneClasses(zone)} ${className}`}>
        {/* Empty ad space - could show placeholder or nothing */}
      </div>
    );
  }

  const currentAd = ads[currentAdIndex];
  if (!currentAd) return null;

  return (
    <div
      ref={adRef}
      className={`relative group ${getZoneClasses(zone)} ${className}`}
    >
      {/* Dismiss button */}
      <button
        onClick={() => handleDismiss(currentAd.id)}
        className="absolute top-2 right-2 z-10 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
        title="Dismiss ad"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Ad content */}
      <div
        onClick={() => handleAdClick(currentAd)}
        className="w-full h-full cursor-pointer transition-transform hover:scale-[1.02]"
      >
        {renderAdContent(currentAd)}
      </div>

      {/* Rotation indicator */}
      {enableRotation && ads.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {ads.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentAdIndex ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      )}

      {/* Zone label (dev mode) */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute top-0 left-0 bg-red-600 text-white text-xs px-2 py-1 rounded-br-lg opacity-50">
          {zone}
        </div>
      )}
    </div>
  );
};

// Helper function to get responsive classes based on zone
const getZoneClasses = (zone: string): string => {
  const zoneClasses: Record<string, string> = {
    "homepage-hero": "w-full max-w-6xl h-64 md:h-80 lg:h-96",
    "homepage-sidebar": "w-full max-w-sm h-64",
    "magazine-header": "w-full max-w-4xl h-20 md:h-24",
    "magazine-sidebar": "w-full max-w-sm h-64",
    "article-top": "w-full max-w-4xl h-20 md:h-24",
    "article-bottom": "w-full max-w-4xl h-20 md:h-24",
    "article-sidebar": "w-full max-w-sm h-64",
    "podcast-header": "w-full max-w-4xl h-20 md:h-24",
    "podcast-sidebar": "w-full max-w-sm h-64",
    "podcast-detail-top": "w-full max-w-4xl h-20 md:h-24",
    "mobile-banner": "w-full max-w-sm h-24 md:hidden",
    "dashboard-widget": "w-full max-w-sm h-32",
  };

  return zoneClasses[zone] || "w-full max-w-sm h-32";
};

export default AdBanner;
