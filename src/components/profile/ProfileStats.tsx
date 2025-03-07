import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

interface ProfileStatsProps {
  favoriteCount: number;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ favoriteCount }) => {
  return (
    <div className="py-6 border-b border-gray-700">
      <Link 
        to="/favorites" 
        className="flex items-center justify-between px-6 py-2 hover:bg-gray-800 rounded-lg transition-colors"
      >
        <div className="flex items-center">
          <span className="text-2xl font-bold text-red-500 mr-3">
            {favoriteCount}
          </span>
          <span className="text-gray-300">
            Phim yêu thích
          </span>
        </div>
        <FiChevronRight className="text-gray-400" size={20} />
      </Link>
    </div>
  );
};

export default ProfileStats;
