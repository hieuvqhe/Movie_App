import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  // Current year for copyright
  const currentYear = new Date().getFullYear();
  
  // Footer links grouped by category
  const linkGroups = [
    {
      title: 'Navigation',
      links: [
        { name: 'Home', path: '/' },
        { name: 'Movies', path: '/movies' },
        { name: 'TV Shows', path: '/tv-shows' },
        { name: 'New Releases', path: '/new-releases' },
      ]
    },
    {
      title: 'Information',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
        { name: 'FAQ', path: '/faq' },
        { name: 'Help Center', path: '/help' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Cookie Policy', path: '/cookies' },
      ]
    }
  ];
  
  // Social media links
  const socialLinks = [
    { icon: <FaFacebook size={20} />, url: 'https://facebook.com', name: 'Facebook' },
    { icon: <FaTwitter size={20} />, url: 'https://twitter.com', name: 'Twitter' },
    { icon: <FaInstagram size={20} />, url: 'https://instagram.com', name: 'Instagram' },
    { icon: <FaYoutube size={20} />, url: 'https://youtube.com', name: 'YouTube' },
    { icon: <FaTiktok size={20} />, url: 'https://tiktok.com', name: 'TikTok' }
  ];

  return (
    <footer className={`bg-gray-900 text-gray-400 pt-2 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-2">
          {/* Logo and description */}
          <div>
            <Link to="/" className="text-red-600 font-bold text-2xl tracking-wider">
              PHIMHAY
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              Your ultimate destination for movies and TV shows. Watch anywhere, anytime on our platform.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          {/* Link Groups */}
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-white font-medium text-lg mb-4">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path} 
                      className="text-sm hover:text-red-500 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright bar */}
        <div className="border-t border-gray-800 py-6 text-center md:flex md:justify-between md:text-left">
          <p className="text-sm">
            &copy; {currentYear} PHIMHAY. All rights reserved.
          </p>
          
          <p className="text-sm mt-2 md:mt-0">
            Designed and developed with ❤️ by Movie Lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
