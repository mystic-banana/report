import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-950 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <h2 className="font-serif font-bold text-2xl text-white">
                Mystic<span className="text-accent-400">Banana</span>
              </h2>
            </Link>
            <p className="text-dark-300 text-sm">
              Your cosmic guide to inner wisdom. Explore spiritual insights, tarot readings, horoscopes, and astrology.
            </p>
            <div className="flex space-x-4 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-accent-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-accent-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-accent-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-accent-400 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {['Magazine', 'Podcasts', 'Tarot', 'Horoscopes', 'Shop'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase()}`}
                    className="text-dark-300 hover:text-accent-400 transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  to="/dashboard"
                  className="text-accent-400 hover:text-accent-300 font-medium transition-colors text-sm flex items-center"
                >
                  Submit your podcast
                  <span className="inline-block ml-1 text-xs bg-accent-500 text-white px-1.5 py-0.5 rounded">New</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-white">Categories</h3>
            <ul className="space-y-2">
              {['Astrology', 'Spirituality', 'Tarot', 'Meditation', 'Wellbeing', 'Relationships'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/category/${item.toLowerCase()}`}
                    className="text-dark-300 hover:text-accent-400 transition-colors text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-white">Join Our Newsletter</h3>
            <p className="text-dark-300 text-sm mb-4">
              Subscribe to receive cosmic updates, spiritual insights, and exclusive content.
            </p>
            <form className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-md text-sm text-white placeholder-dark-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2.5 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-950"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */} 
        <div className="mt-10 pt-8 border-t border-dark-700 text-center text-sm text-dark-400">
          <p>&copy; {new Date().getFullYear()} MysticBanana. All rights reserved.</p>
          <p className="mt-1">
            <Link to="/privacy-policy" className="hover:text-accent-400 transition-colors">Privacy Policy</Link>
            <span className="mx-2">|</span>
            <Link to="/terms-of-service" className="hover:text-accent-400 transition-colors">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;