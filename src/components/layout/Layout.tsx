import React from 'react';
import Navbar from './Navbar/Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    // Make sure there's no fixed positioning in the layout structure
    <div className="min-h-screen bg-gray-900">
      {/* No wrapper div around Navbar */}
      <Navbar />
      
      <main>
        {children}
      </main>
      
      <Footer />
    </div>
  );
};
