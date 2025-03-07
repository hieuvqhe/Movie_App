import React from 'react';
import { FiCamera } from 'react-icons/fi';

export interface UserData {
  _id: string;
  name: string;
  email?: string;
  dateJoined?: string;
  favoriteCount?: number;
  avatar?: string;
  favoriteMovies?: any[];
}

interface ProfileHeaderProps {
  userData: UserData;
  onAvatarClick?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userData, onAvatarClick }) => {
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="flex flex-col items-center py-8 px-4 border-b border-gray-700">
      <div className="relative group">
        <div 
          onClick={onAvatarClick}
          className="w-28 h-28 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer overflow-hidden"
        >
          {userData.avatar ? (
            <img 
              src={userData.avatar}
              alt={`${userData.name}'s avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl font-bold text-red-500">
              {getInitial(userData.name)}
            </span>
          )}
        </div>
        
        <button
          onClick={onAvatarClick}
          className="absolute bottom-0 right-0 bg-red-600 w-8 h-8 rounded-full flex items-center justify-center border-2 border-gray-900 transition-opacity group-hover:opacity-100"
        >
          <FiCamera className="text-white" size={16} />
        </button>
      </div>
      
      <h1 className="text-2xl font-bold text-white mt-4">
        {userData.name}
      </h1>
      
      {userData.dateJoined && (
        <p className="text-gray-400 text-sm mt-1">
          Tham gia từ: {formatDate(userData.dateJoined)}
        </p>
      )}
    </div>
  );
};

export default ProfileHeader;
