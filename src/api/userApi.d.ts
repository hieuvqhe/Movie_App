/**
 * Type definitions for userApi.js
 */

interface User {
  id: string;
  userName: string;
  email?: string;
  fullName?: string;
  [key: string]: any;
}

interface LoginResponse {
  message: string;
  accessToken: string; // Changed from 'token' to 'accessToken'
  user?: User;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  user?: User;
}

interface UserProfileResponse {
  user: User;
  message?: string;
}

interface FavoriteMovie {
  movieId: string;
  name: string;
  slug: string;
  thumbUrl: string;
  type?: string;
  year?: number | string;
  [key: string]: any;
}

interface FavoritesResponse {
  favoriteMovies: FavoriteMovie[];
  message?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

// Function declarations
export function loginApi(userName: string, password: string): Promise<LoginResponse>;
export function registerApi(userName: string, password: string): Promise<RegisterResponse>;
export function getUserProfile(): Promise<UserProfileResponse>;
export function updateUserProfile(updates: Partial<User>): Promise<UserProfileResponse>;
export function updateProfile(updates: Partial<User>): Promise<UserProfileResponse>;
export function changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse>;
export function getFavoriteMovies(): Promise<FavoritesResponse>;
export function addFavorite(movieData: FavoriteMovie): Promise<ApiResponse>;
export function removeFavorite(movieId: string): Promise<ApiResponse>;
export function checkMovieFavoriteStatus(movieId: string): Promise<boolean>;
