import React from 'react';
import { FiPlay, FiHeart } from 'react-icons/fi';
import { Button } from '../../components/common';

interface MovieActionsProps {
  isFavorite: boolean;
  isProcessingFavorite: boolean;
  onToggleFavorite: () => void;
  onPlay: () => void;
  isPlayable: boolean;
  showPlayer: boolean;
}

const MovieActions: React.FC<MovieActionsProps> = ({
  isFavorite, 
  isProcessingFavorite, 
  onToggleFavorite, 
  onPlay, 
  isPlayable, 
  showPlayer
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-4">
      {isPlayable && !showPlayer && (
        <Button
          variant="primary"
          fullWidth
          icon={<FiPlay />}
          onClick={onPlay}
          className="sm:max-w-[200px]"
        >
          Xem Phim
        </Button>
      )}
      
      <Button
        variant={isFavorite ? "secondary" : "outline"}
        fullWidth
        icon={<FiHeart className={isFavorite ? "fill-red-500 text-red-500" : ""} />}
        onClick={onToggleFavorite}
        isLoading={isProcessingFavorite}
        className="sm:max-w-[200px]"
      >
        {isFavorite ? "Đã yêu thích" : "Yêu thích"}
      </Button>
    </div>
  );
};

export default MovieActions;
