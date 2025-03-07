import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  loginApi, 
  registerApi, 
  getUserProfile, 
  updateUserProfile,
  changePassword
} from '../api/userApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('accessToken');
        if (storedToken) {
          setToken(storedToken);
          // Load user profile
          const userData = await getUserProfile();
          setUser(userData.user || userData);
        }
      } catch (err) {
        console.log('Failed to load user data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginApi(username, password);
      
      // Save token
      await AsyncStorage.setItem('accessToken', response.token);
      setToken(response.token);
      
      // Get user profile after login
      const userData = await getUserProfile();
      setUser(userData.user || userData);
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerApi(username, password);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem('accessToken');
      setUser(null);
      setToken(null);
    } catch (err) {
      console.log('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateUserProfile(updates);
      // Update local user state
      setUser(prevState => ({ ...prevState, ...updates }));
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const updatePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await changePassword(currentPassword, newPassword);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
