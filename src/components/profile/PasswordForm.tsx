import React, { useState } from 'react';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

interface PasswordFormProps {
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
}

const PasswordForm: React.FC<PasswordFormProps> = ({ onSubmit, isLoading }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(currentPassword, newPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-5 mt-4">
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="text-gray-400" />
          </div>
          <input
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="bg-gray-700 text-white w-full pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Mật khẩu hiện tại"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showCurrentPassword ? 
              <FiEyeOff className="text-gray-400" /> : 
              <FiEye className="text-gray-400" />
            }
          </button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="text-gray-400" />
          </div>
          <input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-gray-700 text-white w-full pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Mật khẩu mới"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showNewPassword ? 
              <FiEyeOff className="text-gray-400" /> : 
              <FiEye className="text-gray-400" />
            }
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !currentPassword || !newPassword}
        className={`
          w-full mt-6 py-3 px-4 rounded-lg text-white font-medium
          ${isLoading || !currentPassword || !newPassword 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-700 transition-colors'}
        `}
      >
        {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
      </button>
    </form>
  );
};

export default PasswordForm;
