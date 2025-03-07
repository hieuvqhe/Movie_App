import React, { useState } from 'react';
import { FiUser } from 'react-icons/fi';

interface ProfileFormProps {
  initialName: string;
  onSubmit: (name: string) => Promise<void>;
  isLoading: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ 
  initialName, 
  onSubmit,
  isLoading
}) => {
  const [name, setName] = useState(initialName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(name);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-5 mt-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiUser className="text-gray-400" />
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-gray-700 text-white w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Tên người dùng"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className={`
          w-full mt-4 py-3 px-4 rounded-lg text-white font-medium
          ${isLoading || !name.trim() 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-700 transition-colors'}
        `}
      >
        {isLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
      </button>
    </form>
  );
};

export default ProfileForm;
