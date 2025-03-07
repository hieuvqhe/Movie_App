import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiStar, FiCalendar, FiPlay, FiPlus, FiHeart } from 'react-icons/fi';
import Card from './Card';
import Button from '../Button';

export interface MovieCardProps {
  id: string | number;
  title: string;
  posterUrl: string;
  rating?: number;
  year?: number;
  duration?: string;
  genres?: string[];
  className?: string;
  isFavorited?: boolean;
  onFavoriteToggle?: () => void;
  onWatch?: () => void;
  onAddToWatchlist?: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({
  id,
  title,
  posterUrl,
  rating,
  year,
  duration,
  genres = [],
  className = '',
  isFavorited = false,
  onFavoriteToggle,
  onWatch,
  onAddToWatchlist,
}) => {
  return (
    <Card
      className={`w-full max-w-xs relative group ${className}`}
      hoverable
    >
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={posterUrl} 
          alt={`${title} poster`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex flex-col space-y-2">
            <Button 
              variant="primary" 
              size="sm" 
              fullWidth
              icon={<FiPlay />} 
              onClick={onWatch}
            >
              Watch Now
            </Button>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                icon={<FiPlus />} 
                onClick={onAddToWatchlist}
                className="flex-1"
              >
                Watchlist
              </Button>
              <Button 
                variant="icon" 
                size="sm"
                onClick={onFavoriteToggle}
                className="bg-gray-700 hover:bg-gray-600"
              >
                <FiHeart 
                  className={isFavorited ? 'fill-red-500 text-red-500' : ''} 
                  size={18} 
                />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Rating badge */}
        {rating !== undefined && (
          <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 rounded-full px-2 py-1 text-xs flex items-center">
            <FiStar className="mr-1" />
            {rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Movie info */}
      <div className="p-4">
        <Link to={`/movie/${id}`} className="hover:text-rose-500 transition-colors">
          <h3 className="font-bold text-white truncate text-lg">{title}</h3>
        </Link>
        
        <div className="flex items-center text-gray-400 text-xs mt-1 gap-x-2">
          {year && (
            <div className="flex items-center">
              <FiCalendar size={12} className="mr-1" />
              <span>{year}</span>
            </div>
          )}
          
          {duration && (
            <div className="flex items-center">
              <FiClock size={12} className="mr-1" />
              <span>{duration}</span>
            </div>
          )}
        </div>

        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {genres.slice(0, 3).map((genre, index) => (
              <span 
                key={index}
                className="bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 text-xs"
              >
                {genre}
              </span>
            ))}
            {genres.length > 3 && (
              <span className="bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 text-xs">
                +{genres.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default MovieCard;
