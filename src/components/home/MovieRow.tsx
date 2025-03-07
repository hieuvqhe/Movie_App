import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';

interface Movie {
  _id: string;
  slug: string;
  name: string;
  thumb_url?: string;
  poster_url?: string;
}

interface MovieRowProps {
  title: string;
  movies: Movie[];
  category: string;
}

const BASE_IMAGE_URL = 'https://phimimg.com';

const MovieRow: React.FC<MovieRowProps> = ({ title, movies, category }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Check if scrolling arrows should be displayed
  useEffect(() => {
    const checkScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      // Show left arrow if scrolled right
      setShowLeftArrow(container.scrollLeft > 20);
      
      // Show right arrow if more content to scroll
      const isScrollable = container.scrollWidth > container.clientWidth;
      const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 20;
      setShowRightArrow(isScrollable && !isAtEnd);
    };
    
    // Initial check
    checkScroll();
    
    // Add scroll event listener
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
    }
    
    // Cleanup
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
    };
  }, [movies]);
  
  // Handle scroll buttons
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      // Calculate scroll amount (approx. 3 items)
      const scrollAmount = Math.min(container.clientWidth * 0.75, 600);
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      // Calculate scroll amount (approx. 3 items)
      const scrollAmount = Math.min(container.clientWidth * 0.75, 600);
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getCategorySlug = (cat: string) => {
    return cat;
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BASE_IMAGE_URL}/${url}`;
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="py-6 relative">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
          <Link 
            to={`/category/${getCategorySlug(category)}`} 
            className="text-red-600 hover:text-red-400 flex items-center transition-colors text-sm md:text-base"
          >
            Xem tất cả <FiChevronRight className="ml-1" />
          </Link>
        </div>
        
        <div className="relative group">
          {showLeftArrow && (
            <button 
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transform -translate-x-1/2 opacity-70 hover:opacity-100 transition-opacity focus:outline-none"
              aria-label="Scroll left"
            >
              <FiChevronLeft size={24} />
            </button>
          )}
          
          {showRightArrow && (
            <button 
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transform translate-x-1/2 opacity-70 hover:opacity-100 transition-opacity focus:outline-none"
              aria-label="Scroll right"
            >
              <FiChevronRight size={24} />
            </button>
          )}
          
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide scroll-smooth"
            style={{ 
              scrollbarWidth: 'none',  /* Firefox */
              msOverflowStyle: 'none',  /* IE and Edge */
            }}
          >
            <div className="flex space-x-4">
              {movies.map(movie => (
                <div key={movie._id} className="flex-none w-36 md:w-44 transition-transform hover:scale-105 duration-200">
                  <Link to={`/movie/${movie.slug}`} className="block group">
                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-800 mb-2 shadow-lg">
                      <img 
                        src={getFullImageUrl(movie.poster_url || movie.thumb_url)} 
                        alt={movie.name}
                        className="w-full h-full object-cover transition-transform duration-300 "
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 opacity-0 transition-opacity duration-300"></div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors line-clamp-2">
                      {movie.name}
                    </h3>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieRow;
