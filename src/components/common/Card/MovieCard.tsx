import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiStar, FiCalendar, FiPlay, FiHeart } from 'react-icons/fi';
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
  slug?: string;
  quality?: string;
  lang?: string;
  episodeCurrent?: string;
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
  slug,
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
          alt={`Poster ${title}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Favorite button in corner */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavoriteToggle?.();
          }}
          className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          title={isFavorited ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
          <FiHeart 
            className={`transition-colors duration-300 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white hover:text-red-400'}`} 
            size={16} 
          />
        </button>
        
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
              Xem Ngay
            </Button>
          </div>
        </div>
        
        {/* Rating badge */}
        {rating !== undefined && (
          <div className="absolute top-2 left-2 bg-black/80 text-yellow-400 rounded-full px-2 py-1 text-xs flex items-center">
            <FiStar className="mr-1" />
            {rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Movie info */}
      <div className="p-4">
        <Link to={`/phim/${slug || id}`} className="hover:text-rose-500 transition-colors">
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
