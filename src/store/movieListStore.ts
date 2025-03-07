import { create } from 'zustand';

// Types
export interface Movie {
  _id: string;
  slug: string;
  name: string;
  origin_name?: string;
  poster_url?: string;
  thumb_url?: string;
  year?: string;
  category?: Array<{ id: string; name: string }>;
}

type MovieCategory = 'popular' | 'trending' | 'new' | 'action' | 'comedy' | 'drama';

interface MovieListState {
  // State
  movies: Record<MovieCategory, Movie[]>;
  genreMovies: Record<string, Movie[]>;
  searchResults: Movie[];
  searchQuery: string;
  isLoading: Record<string, boolean>;
  errors: Record<string, string | null>;
  
  // Actions
  fetchMovies: (category: MovieCategory) => Promise<void>;
  fetchMoviesByGenre: (genreId: string) => Promise<void>;
  searchMovies: (query: string) => Promise<void>;
  clearSearch: () => void;
}

// Mock API functions
const mockFetchMovies = async (category: MovieCategory): Promise<Movie[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return mock data based on category
  return Array(12).fill(null).map((_, index) => ({
    _id: `${category}-${index}`,
    slug: `${category}-movie-${index}`,
    name: `${category.charAt(0).toUpperCase() + category.slice(1)} Movie ${index + 1}`,
    origin_name: `Original ${category.charAt(0).toUpperCase() + category.slice(1)} Movie ${index + 1}`,
    poster_url: `https://via.placeholder.com/300x450?text=${category}+${index + 1}`,
    thumb_url: `https://via.placeholder.com/300x450?text=${category}+${index + 1}`,
    year: `${2020 + (index % 3)}`,
    category: [
      { id: '1', name: 'Action' },
      { id: '2', name: 'Drama' }
    ]
  }));
};

const mockFetchMoviesByGenre = async (genreId: string): Promise<Movie[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Map genreId to genre name for demo
  const genreMap: Record<string, string> = {
    '1': 'Action',
    '2': 'Drama',
    '3': 'Comedy',
    '4': 'Horror'
  };
  
  const genreName = genreMap[genreId] || 'Unknown';
  
  // Return mock data
  return Array(8).fill(null).map((_, index) => ({
    _id: `genre-${genreId}-${index}`,
    slug: `${genreName.toLowerCase()}-movie-${index}`,
    name: `${genreName} Movie ${index + 1}`,
    poster_url: `https://via.placeholder.com/300x450?text=${genreName}+${index + 1}`,
    thumb_url: `https://via.placeholder.com/300x450?text=${genreName}+${index + 1}`,
    year: `${2020 + (index % 3)}`,
    category: [
      { id: genreId, name: genreName }
    ]
  }));
};

const mockSearchMovies = async (query: string): Promise<Movie[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simple mock implementation
  return Array(5).fill(null).map((_, index) => ({
    _id: `search-${index}`,
    slug: `search-result-${index}`,
    name: `Movie matching "${query}" ${index + 1}`,
    poster_url: `https://via.placeholder.com/300x450?text=Search+${index + 1}`,
    thumb_url: `https://via.placeholder.com/300x450?text=Search+${index + 1}`,
    year: `${2020 + (index % 3)}`,
  }));
};

// Create the store
const useMovieListStore = create<MovieListState>()((set, get) => ({
  // Initial state
  movies: {
    popular: [],
    trending: [],
    new: [],
    action: [],
    comedy: [],
    drama: []
  },
  genreMovies: {},
  searchResults: [],
  searchQuery: '',
  isLoading: {
    popular: false,
    trending: false,
    new: false,
    action: false,
    comedy: false,
    drama: false,
    search: false
  },
  errors: {
    popular: null,
    trending: null,
    new: null,
    action: null,
    comedy: null,
    drama: null,
    search: null
  },
  
  // Actions
  fetchMovies: async (category) => {
    set(state => ({
      isLoading: { ...state.isLoading, [category]: true },
      errors: { ...state.errors, [category]: null }
    }));
    
    try {
      const moviesData = await mockFetchMovies(category);
      
      set(state => ({
        movies: { ...state.movies, [category]: moviesData },
        isLoading: { ...state.isLoading, [category]: false }
      }));
    } catch (error) {
      set(state => ({
        errors: { 
          ...state.errors, 
          [category]: error instanceof Error ? error.message : 'Failed to fetch movies'
        },
        isLoading: { ...state.isLoading, [category]: false }
      }));
    }
  },
  
  fetchMoviesByGenre: async (genreId) => {
    set(state => ({
      isLoading: { ...state.isLoading, [`genre-${genreId}`]: true },
      errors: { ...state.errors, [`genre-${genreId}`]: null }
    }));
    
    try {
      const moviesData = await mockFetchMoviesByGenre(genreId);
      
      set(state => ({
        genreMovies: { ...state.genreMovies, [genreId]: moviesData },
        isLoading: { ...state.isLoading, [`genre-${genreId}`]: false }
      }));
    } catch (error) {
      set(state => ({
        errors: { 
          ...state.errors, 
          [`genre-${genreId}`]: error instanceof Error ? error.message : 'Failed to fetch genre movies'
        },
        isLoading: { ...state.isLoading, [`genre-${genreId}`]: false }
      }));
    }
  },
  
  searchMovies: async (query) => {
    set(state => ({
      searchQuery: query,
      isLoading: { ...state.isLoading, search: true },
      errors: { ...state.errors, search: null }
    }));
    
    if (!query.trim()) {
      set(state => ({
        searchResults: [],
        isLoading: { ...state.isLoading, search: false }
      }));
      return;
    }
    
    try {
      const results = await mockSearchMovies(query);
      
      set(state => ({
        searchResults: results,
        isLoading: { ...state.isLoading, search: false }
      }));
    } catch (error) {
      set(state => ({
        errors: { 
          ...state.errors, 
          search: error instanceof Error ? error.message : 'Failed to search movies'
        },
        isLoading: { ...state.isLoading, search: false }
      }));
    }
  },
  
  clearSearch: () => {
    set({
      searchResults: [],
      searchQuery: ''
    });
  }
}));

export default useMovieListStore;
