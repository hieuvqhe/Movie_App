import React, { useState, useEffect } from 'react';
import { FiUser, FiKey } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../components/common';
import ProfileHeader, { UserData } from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ProfileForm from '../components/profile/ProfileForm';
import PasswordForm from '../components/profile/PasswordForm';
import MenuItem from '../components/profile/MenuItem';
import { getUserProfileService, updateUserProfileService } from '../services/userService';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showProfileForm, setShowProfileForm] = useState<boolean>(false);
  const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  
  // Use updateProfile from authStore to ensure global state update
  const { checkLoginStatus, logout, updateProfile } = useAuthStore();

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!checkLoginStatus) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        setLoading(true);
        const response = await getUserProfileService();
        
        if (response.success && response.user) {
          setUserData({
            ...response.user,
            _id: response.user.id, // Map id to _id
            favoriteCount: response.user.favoriteMovies?.length || 0,
            name: response.user.name || ''
          });
          // Simple success message - could be removed if no notification is needed
          console.log('Profile loaded successfully');
        } else {
          throw new Error(response.message || 'Không thể tải thông tin');
        }
      } catch (error) {
        // Handle authentication errors
        if (error instanceof Error && 
            (error.message.includes('token') || 
             error.message.includes('unauthorized') || 
             error.message.includes('unauthenticated'))) {
          toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
          logout();
          navigate('/login', { replace: true });
        } else {
          toast.error('Không thể tải thông tin hồ sơ');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [checkLoginStatus, navigate, logout]);

  // Toggle menu items
  const handleMenuToggle = (menu: 'profile' | 'password') => {
    if (menu === 'profile') {
      setShowProfileForm(!showProfileForm);
      setShowPasswordForm(false);
    } else {
      setShowPasswordForm(!showPasswordForm);
      setShowProfileForm(false);
    }
  };

  // Handle profile update - now using authStore's updateProfile
  const handleProfileUpdate = async (name: string) => {
    if (!name.trim()) {
      toast.error('Tên người dùng không được để trống');
      return;
    }

    setIsUpdating(true);
    try {
      // First update via service for backend
      const response = await updateUserProfileService({ name });
      
      if (response.success) {
        // Then update the global auth store - this ensures Navbar will get updated
        await updateProfile({ name });
        
        toast.success('Cập nhật thông tin thành công');
        setShowProfileForm(false);
        
        // Update local user data
        if (response.user && userData) {
          setUserData({ ...userData, name: response.user.name });
        }
      } else {
        throw new Error(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật thông tin');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password change - changed to use updateUserProfileService
  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    if (!currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (!newPassword) {
      toast.error('Vui lòng nhập mật khẩu mới');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await updateUserProfileService({ currentPassword, newPassword });
      
      if (response.success) {
        toast.success('Cập nhật mật khẩu thành công');
        setShowPasswordForm(false);
      } else {
        throw new Error(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật mật khẩu');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle avatar click (mock for now) - changed from error to info
  const handleAvatarClick = () => {
    toast.error('Tính năng đang phát triển');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Loader />
       
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <p className="text-gray-300">Không tìm thấy thông tin người dùng</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-12">
      {/* User Header Section */}
      <ProfileHeader userData={userData} onAvatarClick={handleAvatarClick} />
      
      {/* Stats Section */}
      <ProfileStats favoriteCount={userData.favoriteCount || 0} />
      
      {/* Profile Menu */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <MenuItem 
          title="Chỉnh sửa thông tin"
          description="Cập nhật tên người dùng"
          icon={<FiUser size={22} />}
          isOpen={showProfileForm}
          onClick={() => handleMenuToggle('profile')}
        />
        
        {showProfileForm && (
          <ProfileForm 
            initialName={userData.name}
            onSubmit={handleProfileUpdate}
            isLoading={isUpdating}
          />
        )}
        
        <MenuItem 
          title="Đổi mật khẩu"
          description="Cập nhật mật khẩu tài khoản"
          icon={<FiKey size={22} />}
          isOpen={showPasswordForm}
          onClick={() => handleMenuToggle('password')}
        />
        
        {showPasswordForm && (
          <PasswordForm 
            onSubmit={handlePasswordChange}
            isLoading={isUpdating}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
