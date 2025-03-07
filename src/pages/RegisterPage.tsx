import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { Button } from '../components/common';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  
  // Get auth store methods and state
  const { register, loading, error, clearError, isAuthenticated } = useAuthStore();
  
  // Clear errors on unmount - place this BEFORE any conditional returns
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Display error message from store as toast when it changes - before conditional returns
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Now safe to have conditional return
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    
    // Basic validation with toast notifications instead of alerts
    if (!trimmedUsername) {
      toast.error('Vui lòng nhập tên đăng nhập');
      return;
    }
    
    if (!trimmedPassword) {
      toast.error('Vui lòng nhập mật khẩu');
      return;
    }
    
    if (trimmedPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    if (trimmedPassword !== trimmedConfirmPassword) {
      toast.error('Xác nhận mật khẩu không khớp');
      return;
    }
    
    try {
      // Call register function from auth store
      const success = await register(trimmedUsername, trimmedPassword);
      
      if (success) {
        toast.success('Đăng ký thành công!');
        
        // Give a little delay before redirecting to allow the toast to be seen
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      }
    } catch (err) {
      console.error('Registration error:', err);
      // We don't need special handling here anymore as the error is properly handled in the store
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-white">
         Register Page
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Or{' '}
          <Link to="/login" className="font-medium text-red-500 hover:text-red-400">
           Login with your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
       

          <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
            {/* Username field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-700 block w-full pl-10 pr-3 py-3 border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                  placeholder="Enter your username"
                />
              </div>
            </div>


            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-700 block w-full pl-10 pr-10 py-3 border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-200 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Password must be at least 6 characters
              </p>
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-gray-700 block w-full pl-10 pr-10 py-3 border-gray-600 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                  placeholder="re-enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-200 focus:outline-none"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                fullWidth
                variant="primary"
                isLoading={loading}
                className="!w-full !bg-red-600 hover:!bg-red-700"
              >
                Đăng ký
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <p className="text-xs text-center text-gray-400">
              Bằng việc đăng ký, bạn đồng ý với{' '}
              <Link to="/terms" className="text-red-500 hover:text-red-400">
                Điều khoản dịch vụ
              </Link>{' '}
              và{' '}
              <Link to="/privacy" className="text-red-500 hover:text-red-400">
                Chính sách bảo mật
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
