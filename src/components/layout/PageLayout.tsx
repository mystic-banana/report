import React, { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  className = "",
  showHeader = true,
  showFooter = true,
}) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Mystic Banana`;
    } else {
      document.title = "Mystic Banana - Modern Spiritual Magazine";
    }
  }, [title]);

  return (
    <div
      className={`flex flex-col min-h-screen bg-magazine-primary text-magazine-text ${className}`}
    >
      {showHeader && <Header />}
      <main className={`flex-grow ${showHeader ? "pt-16" : ""}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default PageLayout;
