import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  getNewMovies, 
  getCategoryMovies, 
  fetchMovieDetail, 
  searchMovies 
} from '../api/movieApi';
import {
  getFavoriteMovies,
  addFavorite,
  removeFavorite,
  checkMovieFavoriteStatus
} from '../api/userApi';
import { useAuth } from './AuthContext';

const MovieContext = createContext();

export const useMovies = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
  const [newMovies, setNewMovies] = useState([]);
  const [categoryMovies, setCategoryMovies] = useState({});
  const [currentMovie, setCurrentMovie] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { isAuthenticated } = useAuth();

  // Load favorites when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated]);

  // Load new movies
  const loadNewMovies = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getNewMovies(page);
      setNewMovies(data?.data?.items || []);
      return data;
    } catch (err) {
      setError('Không thể tải danh sách phim mới');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load movies by category
  const loadCategoryMovies = async (category, page = 1, limit = 10) => {
    setLoading(true);
    try {
      const data = await getCategoryMovies(category, page, limit);
      setCategoryMovies(prev => ({
        ...prev,
        [category]: data?.data?.items || []
      }));
      return data;
    } catch (err) {
      setError(`Không thể tải danh sách phim thể loại: ${category}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get movie details
  const getMovieDetail = async (slug) => {
    setLoading(true);
    try {
      const data = await fetchMovieDetail(slug);
      setCurrentMovie(data?.movie || data);
      return data;
    } catch (err) {
      setError('Không thể tải chi tiết phim');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Search for movies
  const search = async (keyword, page = 1, limit = 24) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return { items: [] };
    }
    
    setLoading(true);
    try {
      const data = await searchMovies(keyword, page, limit);
      setSearchResults(data?.data?.items || []);
      return data;
    } catch (err) {
      setError('Tìm kiếm thất bại');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load favorite movies
  const loadFavorites = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const data = await getFavoriteMovies();
      setFavorites(data?.favoriteMovies || []);
      return data;
    } catch (err) {
      console.error('Error loading favorites:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add movie to favorites
  const addToFavorites = async (movieData) => {
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để thêm phim vào danh sách yêu thích');
      return false;
    }
    
    setLoading(true);
    try {
      await addFavorite(movieData);
      // Refresh favorites list
      await loadFavorites();
      return true;
    } catch (err) {
      setError('Không thể thêm vào danh sách yêu thích');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove movie from favorites
  const removeFromFavorites = async (movieId) => {
    if (!isAuthenticated) return false;
    
    setLoading(true);
    try {
      await removeFavorite(movieId);
      // Update local state
      setFavorites(prev => prev.filter(movie => movie.movieId !== movieId));
      return true;
    } catch (err) {
      setError('Không thể xóa khỏi danh sách yêu thích');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if movie is in favorites
  const isMovieFavorite = async (movieId) => {
    if (!isAuthenticated) return false;
    
    try {
      return await checkMovieFavoriteStatus(movieId);
    } catch (err) {
      console.error('Error checking favorite status:', err);
      return false;
    }
  };

  const value = {
    newMovies,
    categoryMovies,
    currentMovie,
    favorites,
    searchResults,
    loading,
    error,
    loadNewMovies,
    loadCategoryMovies,
    getMovieDetail,
    search,
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    isMovieFavorite,
    setError,
  };

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};
