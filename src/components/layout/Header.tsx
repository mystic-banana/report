import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, UserCircle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import MobileMenu from "./MobileMenu";
import UserMenu from "./UserMenu";

const Header: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-dark-950/95 backdrop-blur-sm border-b border-dark-800"
          : "bg-transparent"
      }`}
    >
      <div className="container h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-serif font-bold text-white">
            Mystic<span className="text-accent-500">Banana</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          {[
            ["Magazine", "/magazine"],
            ["Podcasts", "/podcasts"],
            ["Astrology", "/astrology"],
            ["Horoscopes", "/astrology/horoscopes"],
            ["Birth Chart", "/astrology/birth-chart"],
          ].map(([label, path]) => (
            <Link
              key={path}
              to={path}
              className="nav-link text-sm font-sans font-medium text-gray-300 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <button
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full ring-2 ring-accent-500"
                  />
                ) : (
                  <UserCircle className="w-8 h-8 text-gray-400" />
                )}
              </button>

              {isUserMenuOpen && (
                <UserMenu onClose={() => setIsUserMenuOpen(false)} />
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link to="/signup" className="btn-primary">
                Sign Up
              </Link>
            </div>
          )}

          <button
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
      )}
    </header>
  );
};

export default Header;
