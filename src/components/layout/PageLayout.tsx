import React from "react";
import { Helmet } from "react-helmet-async";
import Header from "./Header";
import Footer from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  title?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = "",
  showHeader = true,
  showFooter = true,
  title,
}) => {
  return (
    <div className={`min-h-screen bg-slate-900 ${className}`}>
      <Helmet>
        {title && <title>{title}</title>}
        <meta name="theme-color" content="#0f172a" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      {showHeader && <Header />}
      <main className="flex-1">
        <div className="pt-16">{children}</div>
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default PageLayout;
