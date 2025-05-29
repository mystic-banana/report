import React, { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, title }) => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | MysticBanana`;
    } else {
      document.title = 'MysticBanana';
    }
  }, [title]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-dark-900">
      <Header />
      <main className="flex-grow pt-16">{children}</main>
      <Footer />
    </div>
  );
};

export default PageLayout;