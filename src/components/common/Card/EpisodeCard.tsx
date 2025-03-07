import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiPlay } from 'react-icons/fi';
import Card from './Card';

export interface EpisodeCardProps {
  id: string | number;
  seriesId: string | number;
  title: string;
  thumbnailUrl: string;
  episodeNumber: number;
  seasonNumber: number;
  duration?: string;
  releaseDate?: string;
  description?: string;
  className?: string;
  onPlay?: () => void;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({
  seriesId,
  title,
  thumbnailUrl,
  episodeNumber,
  seasonNumber,
  duration,
  releaseDate,
  description,
  className = '',
  onPlay,
}) => {
  const formattedDate = releaseDate 
    ? new Date(releaseDate).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : null;

  return (
    <Card
      className={`flex flex-col md:flex-row w-full ${className}`}
      hoverable
      onClick={onPlay}
    >
      {/* Episode Thumbnail */}
      <div className="relative md:w-48 lg:w-64">
        <div className="aspect-video w-full h-full">
          <img
            src={thumbnailUrl}
            alt={`Episode ${episodeNumber} thumbnail`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
            <FiPlay className="text-white ml-1" size={24} />
          </div>
        </div>
        
        {/* Episode number badge */}
        <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 text-xs rounded">
          S{seasonNumber} E{episodeNumber}
        </div>
      </div>

      {/* Episode info */}
      <div className="p-4 flex-1">
        <Link to={`/series/${seriesId}/season/${seasonNumber}/episode/${episodeNumber}`} className="hover:text-rose-500 transition-colors">
          <h3 className="font-bold text-white text-lg">{title}</h3>
        </Link>
        
        <div className="flex items-center text-gray-400 text-xs mt-1 space-x-3">
          {duration && (
            <div className="flex items-center">
              <FiClock size={12} className="mr-1" />
              <span>{duration}</span>
            </div>
          )}
          
          {formattedDate && (
            <div className="text-gray-400">
              {formattedDate}
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-gray-300 text-sm mt-2 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </Card>
  );
};

export default EpisodeCard;
