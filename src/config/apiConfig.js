// Configuration for all API endpoints in the application

// User API base URL
export const USER_API_BASE_URL = 'https://movie-app-api-production-870f.up.railway.app/api/v1';

// Movie API base URLs
export const MOVIE_API_BASE_URL = 'https://phimapi.com';
export const MOVIE_IMAGE_BASE_URL = 'https://phimimg.com';

// API endpoints for user operations
export const USER_ENDPOINTS = {
  LOGIN: `${USER_API_BASE_URL}/user/login`,
  REGISTER: `${USER_API_BASE_URL}/user/register`,
  PROFILE: `${USER_API_BASE_URL}/user/profile`,
  UPDATE_PROFILE: `${USER_API_BASE_URL}/user/update`,
  FAVORITES: `${USER_API_BASE_URL}/movie/favorites`,
};

// API endpoints for movie operations
export const MOVIE_ENDPOINTS = {
  NEW_MOVIES: `${MOVIE_API_BASE_URL}/danh-sach/phim-moi-cap-nhat`,
  CATEGORY: `${MOVIE_API_BASE_URL}/v1/api/danh-sach`,
  MOVIE_DETAIL: `${MOVIE_API_BASE_URL}/phim`,
  SEARCH: `${MOVIE_API_BASE_URL}/v1/api/tim-kiem`,
};
