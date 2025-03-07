// URL này sẽ được thay đổi mỗi khi khởi động lại server
// Bạn cần cập nhật URL này từ console.log của server khi khởi động
const BASE_URL = 'https://movie-app-api-production-870f.up.railway.app/api/v1';

// Replace AsyncStorage with localStorage for web app
const getToken = () => localStorage.getItem('accessToken');
const setToken = (token) => localStorage.setItem('accessToken', token);
const removeToken = () => localStorage.removeItem('accessToken');

export const loginApi = async (userName, password) => {
  try {
    // Log the request payload for debugging
    console.log('Login request payload:', { userName, password });
    
    const response = await fetch(`${BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName, password }),
    });

    const data = await response.json();
    
    // Log the response for debugging
    console.log('Login API response:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Tên đăng nhập hoặc mật khẩu không chính xác');
    }
    return data;
  } catch (error) {
    console.error('Login API error:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Đã xảy ra lỗi khi đăng nhập');
    }
  }
};

export const registerApi = async (userName, password) => {
  try {
    console.log('Register request payload:', { userName, password });
    
    const response = await fetch(`${BASE_URL}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName, password }),
    });

    const data = await response.json();
    console.log('Register API response:', data, 'Status:', response.status);
    
    if (!response.ok) {
      // Specifically handle the "User already exists" error
      if (data.message && data.message.toLowerCase().includes('already exists')) {
        throw new Error('Tên đăng nhập đã tồn tại, vui lòng chọn tên khác');
      }
      
      throw new Error(data.message || 'Đăng ký thất bại');
    }
    
    return { success: true, ...data };
  } catch (error) {
    console.error('Register API error:', error);
    throw error;
  }
}; 

// Enhanced getUserProfile with better error handling - using localStorage
export const getUserProfile = async () => {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('Không tìm thấy token đăng nhập');
    }

    const response = await fetch(`${BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      // Handle unauthorized case specifically
      if (response.status === 401) {
        // Token expired or invalid
        removeToken();
        throw new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      }
      throw new Error(data.message || 'Không thể tải thông tin người dùng');
    }
    return data;
  } catch (error) {
    console.error('Profile error:', error);
    throw error;
  }
};

// Update user profile - using localStorage
export const updateUserProfile = async (updates) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Không tìm thấy token đăng nhập');
    }

    const response = await fetch(`${BASE_URL}/user/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Không thể cập nhật thông tin');
    }
    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

// You can keep the existing updateProfile and changePassword for backward compatibility
// or redirect them to use the new consolidated function
export const updateProfile = async (updates) => {
  return updateUserProfile(updates);
};

export const changePassword = async (currentPassword, newPassword) => {
  return updateUserProfile({ currentPassword, newPassword });
};

export const getFavoriteMovies = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Không tìm thấy token đăng nhập');
    }

    const response = await fetch(`${BASE_URL}/movie/favorites`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Không thể tải danh sách phim yêu thích');
    }
    return data;
  } catch (error) {
    console.error('Get favorites error:', error);
    throw error;
  }
};

export const addFavorite = async (movieData) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Không tìm thấy token đăng nhập');
    }
    const processedData = {
      ...movieData,
      type: movieData.type === "single" ? "movie" : movieData.type
    };
    // Log the full request payload for debugging
    console.log('Adding favorite - Full payload:', processedData);


    const response = await fetch(`${BASE_URL}/movie/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(processedData)
    });
    
    const data = await response.json();
    console.log('Add favorite response:', data); // Debug log
    
    if (!response.ok) {
      console.error('Server error details:', data);
      throw new Error(data.message || 'Không thể thêm vào danh sách yêu thích');
    }
    
    return data;
  } catch (error) {
    console.error('Add favorite error:', error);
    throw error;
  }
};

export const removeFavorite = async (movieId) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('Không tìm thấy token đăng nhập');
    }

    const response = await fetch(`${BASE_URL}/movie/favorites/${movieId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
   
    
    if (!response.ok) {
      throw new Error(data.message || 'Không thể xóa khỏi danh sách yêu thích');
    }
    
    return data;
  } catch (error) {
    console.error('Remove favorite error:', error);
    throw error;
  }
};

export const checkMovieFavoriteStatus = async (movieId) => {
  try {
    const token = getToken();
    if (!token) {
      return false;
    }

    const response = await fetch(`${BASE_URL}/movie/favorites`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Không thể kiểm tra trạng thái yêu thích');
    }

    // Check if the movie exists in the favorites list
    return data.favoriteMovies.some(movie => movie.movieId === movieId);
  } catch (error) {
    console.error('Check favorite status error:', error);
    return false;
  }
};

