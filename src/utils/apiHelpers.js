import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Format API error messages
export const formatErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại sau.';
};

// Handle unauthorized errors (401)
export const handleUnauthorizedError = async (navigation) => {
  try {
    // Clear token
    await AsyncStorage.removeItem('accessToken');
    
    // Show alert
    Alert.alert(
      'Phiên đăng nhập hết hạn',
      'Vui lòng đăng nhập lại để tiếp tục.',
      [
        { 
          text: 'OK', 
          onPress: () => {
            // Navigate to login screen if navigation is provided
            if (navigation) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        }
      ]
    );
  } catch (error) {
    console.error('Error handling unauthorized state:', error);
  }
};

// Add authorization headers to requests
export const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  return token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  };
};

// Process movie data to standardize format
export const processMovieData = (movie) => {
  if (!movie) return null;
  
  const { MOVIE_IMAGE_BASE_URL } = require('../config/apiConfig');
  
  return {
    ...movie,
    // Ensure image URLs are absolute
    poster_url: movie.poster_url?.startsWith('http') 
      ? movie.poster_url 
      : `${MOVIE_IMAGE_BASE_URL}/${movie.poster_url}`,
    thumb_url: movie.thumb_url?.startsWith('http') 
      ? movie.thumb_url 
      : `${MOVIE_IMAGE_BASE_URL}/${movie.thumb_url}`,
    // Ensure movie has an ID
    _id: movie._id || movie.movieId || `${movie.slug}-${Date.now()}`
  };
};
