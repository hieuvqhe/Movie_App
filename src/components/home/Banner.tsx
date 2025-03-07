import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Movie {
  _id: string;
  slug: string;
  name: string;
  year?: string;
  poster_url?: string;
  thumb_url?: string;
}

interface BannerProps {
  movies: Movie[];
}

const Banner: React.FC<BannerProps> = ({ movies }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselMovies = movies?.slice(0, 10) || [];

  // Auto scroll functionality
  useEffect(() => {
    if (carouselMovies.length === 0) return;

    const interval = setInterval(() => {
      if (!isTransitioning) {
        setIsTransitioning(true);

        setCurrentSlide((prev) =>
          prev === carouselMovies.length - 1 ? 0 : prev + 1
        );
        setTimeout(() => setIsTransitioning(false), 500);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselMovies.length, isTransitioning]);

  // Manual navigation
  const goToSlide = (index: number) => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const nextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) =>
        prev === carouselMovies.length - 1 ? 0 : prev + 1
      );
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const prevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) =>
        prev === 0 ? carouselMovies.length - 1 : prev - 1
      );
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gray-900">
      {/* Full width container with height constraint */}
      <div className="relative w-full overflow-hidden">
        {/* Banner container with fixed height instead of aspect ratio */}
        <div className="relative w-full h-[60vh] md:h-[50vh] lg:h-[60vh]">
          {/* Banner Slides */}
          <div className="absolute inset-0">
            {carouselMovies.map((movie, index) => (
              <div
                key={movie._id}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                  currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <Link
                  to={`/movie/${movie.slug}`}
                  className="block w-full h-full relative"
                >
                  {/* Image Container with object position control for better cropping */}
                  <div className="absolute inset-0 bg-gray-900">
                    <div className="w-full h-full overflow-hidden">
                      <img
                        src={movie.thumb_url || movie.poster_url}
                        alt={movie.name}
                        className="w-full h-full object-cover object-top transition-transform duration-10000 hover:scale-105"
                        loading={index === 0 ? "eager" : "lazy"}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://c4.wallpaperflare.com/wallpaper/225/137/236/desktop-error-error-404-error-404-wallpaper-preview.jpg";
                        }}
                      />
                    </div>
                  </div>

                  {/* Enhanced Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                  {/* Movie Info with improved positioning */}
                  <div className="absolute bottom-8 left-0 w-full px-6 md:px-16 lg:px-24 max-w-7xl mx-auto">
                    <div className="container mx-auto">
                      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-lg line-clamp-2">
                        {movie.name}
                      </h2>
                      {movie.year && (
                        <p className="text-gray-200 text-base md:text-xl drop-shadow-lg">
                          {movie.year}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows - Moved outside container to fix visibility issues */}
        <button
          onClick={prevSlide}
          className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 md:p-3 rounded-full transition-colors z-30"
          aria-label="Previous slide"
          disabled={isTransitioning}
        >
          <FiChevronLeft size={24} />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 md:p-3 rounded-full transition-colors z-30"
          aria-label="Next slide"
          disabled={isTransitioning}
        >
          <FiChevronRight size={24} />
        </button>

        {/* Indicators - also increased z-index */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 z-30 px-2">
          {carouselMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              disabled={isTransitioning}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;
