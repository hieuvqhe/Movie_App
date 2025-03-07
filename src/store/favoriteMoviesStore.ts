import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useAuthStore from './authStore';
import { getFavoriteMovies, addFavorite, removeFavorite } from '../api/userApi';

// Types
export interface FavoriteMovie {
  _id: string;
  movieId: string;
  name: string;
  slug: string;
  thumbUrl: string;
  posterUrl?: string;
  type: string;
  year: string;
  quality?: string;
  origin_name?: string;
}

interface FavoriteMoviesState {
  // State
  favorites: FavoriteMovie[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchFavorites: () => Promise<void>;
  addFavorite: (movieData: Omit<FavoriteMovie, '_id'>) => Promise<boolean>;
  removeFavorite: (movieId: string) => Promise<boolean>;
  isFavorite: (movieId: string) => boolean;
}

// Create the store
const useFavoriteMoviesStore = create<FavoriteMoviesState>()(
  persist(
    (set, get) => ({
      // Initial state
      favorites: [],
      isLoading: false,
      error: null,
      
      // Actions
      fetchFavorites: async () => {
        // Check if user is logged in
        const isLoggedIn = useAuthStore.getState().checkLoginStatus;
        
        if (!isLoggedIn) {
          set({ favorites: [], error: 'User is not logged in' });
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const response = await getFavoriteMovies();
          if (response && response.favoriteMovies) {
            set({ 
              favorites: response.favoriteMovies.map(movie => ({
                ...movie,
                _id: movie._id || movie.movieId // Use movieId as fallback if _id doesn't exist
              })), 
              isLoading: false 
            });
          } else {
            set({ favorites: [], isLoading: false });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch favorites',
            isLoading: false 
          });
        }
      },
      
      addFavorite: async (movieData) => {
        // Check if user is logged in
        const isLoggedIn = useAuthStore.getState().checkLoginStatus;
        
        if (!isLoggedIn) {
          set({ error: 'User is not logged in' });
          return false;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          await addFavorite(movieData);
          // Refresh favorites list
          await get().fetchFavorites();
          return true;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add favorite',
            isLoading: false 
          });
          return false;
        }
      },
      
      removeFavorite: async (movieId) => {
        // Check if user is logged in
        const isLoggedIn = useAuthStore.getState().checkLoginStatus;
        
        if (!isLoggedIn) {
          set({ error: 'User is not logged in' });
          return false;
        }
        
        // Set loading state but only for the specific operation, not the whole list
        set({ isLoading: true, error: null });
        
        try {
          // Call the API to remove the favorite
          await removeFavorite(movieId);
          
          // Directly update the local state instead of fetching again
          set(state => ({
            favorites: state.favorites.filter(movie => movie.movieId !== movieId),
            isLoading: false
          }));
          
          return true;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to remove favorite',
            isLoading: false 
          });
          return false;
        }
      },
      
      isFavorite: (movieId) => {
        return get().favorites.some(movie => movie.movieId === movieId);
      }
    }),
    {
      name: 'favorite-movies-storage',
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);

export default useFavoriteMoviesStore;
