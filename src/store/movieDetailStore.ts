import { create } from 'zustand';
import useAuthStore from './authStore';

// Types
export interface Episode {
  name: string;
  slug: string;
  link_m3u8: string;
}

export interface ServerEpisode {
  server_name: string;
  server_data: Episode[];
}

export interface MovieDetail {
  _id: string;
  slug: string;
  name: string;
  origin_name?: string;
  content: string;
  type: string;
  status: string;
  thumb_url?: string;
  poster_url?: string;
  time: string;
  quality: string;
  lang: string;
  year: string;
  actor: string[];
  director: string[];
  category: Array<{ id: string; name: string }>;
  country: Array<{ id: string; name: string }>;
}

interface MovieDetailState {
  // State
  currentMovie: MovieDetail | null;
  episodes: ServerEpisode[];
  selectedEpisode: Episode | null;
  relatedMovies: { _id: string; name: string; slug: string; thumb_url?: string }[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchMovieDetail: (slug: string) => Promise<void>;
  selectEpisode: (episode: Episode) => void;
  clearMovieDetail: () => void;
}

// Mock API function
const mockFetchMovieDetail = async (slug: string): Promise<{
  movie: MovieDetail;
  episodes: ServerEpisode[];
  related: any[];
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock implementation
  const isSeries = slug.includes('series');
  
  const mockMovie: MovieDetail = {
    _id: `movie-${slug}`,
    slug,
    name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    origin_name: `Original ${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget felis euismod, rhoncus lectus id, dignissim nisl. Nullam eget felis euismod, rhoncus lectus id, dignissim nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget felis euismod, rhoncus lectus id, dignissim nisl.',
    type: isSeries ? 'series' : 'single',
    status: 'completed',
    thumb_url: `https://www.wallpaperflare.com/desktop-error-error-404-not-found-wallpaper-bvzch`,
    poster_url: `https://pbs.twimg.com/media/BPUYIBHCMAAAftR?format=jpg&name=360x360`,
    time: isSeries ? '45 phút/tập' : '120 phút',
    quality: 'HD',
    lang: 'Vietsub',
    year: '2023',
    actor: ['Actor 1', 'Actor 2', 'Actor 3'],
    director: ['Director 1', 'Director 2'],
    category: [
      { id: '1', name: 'Action' },
      { id: '2', name: 'Drama' }
    ],
    country: [
      { id: '1', name: 'USA' }
    ]
  };
  
  // Create episodes if it's a series
  const mockEpisodes: ServerEpisode[] = isSeries 
    ? [
        {
          server_name: 'Server #1',
          server_data: Array(10).fill(null).map((_, index) => ({
            name: `Tập ${index + 1}`,
            slug: `${slug}-episode-${index + 1}`,
            link_m3u8: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
          }))
        }
      ]
    : [
        {
          server_name: 'Server #1',
          server_data: [
            {
              name: 'Full',
              slug: `${slug}-full`,
              link_m3u8: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
            }
          ]
        }
      ];
  
  // Mock related movies
  const mockRelated = Array(6).fill(null).map((_, index) => ({
    _id: `related-${index}`,
    name: `Related Movie ${index + 1}`,
    slug: `related-movie-${index + 1}`,
    thumb_url: `https://c4.wallpaperflare.com/wallpaper/225/137/236/desktop-error-error-404-error-404-wallpaper-preview.jpg`,
  }));
  
  return {
    movie: mockMovie,
    episodes: mockEpisodes,
    related: mockRelated
  };
};

// Create the store
const useMovieDetailStore = create<MovieDetailState>()((set) => ({
  // Initial state
  currentMovie: null,
  episodes: [],
  selectedEpisode: null,
  relatedMovies: [],
  isLoading: false,
  error: null,
  
  // Actions
  fetchMovieDetail: async (slug) => {
    set({ isLoading: true, error: null });
    
    try {
      const { movie, episodes, related } = await mockFetchMovieDetail(slug);
      
      set({ 
        currentMovie: movie,
        episodes: episodes,
        selectedEpisode: episodes[0]?.server_data[0] || null,
        relatedMovies: related,
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch movie details',
        isLoading: false 
      });
    }
  },
  
  selectEpisode: (episode) => {
    set({ selectedEpisode: episode });
  },
  
  clearMovieDetail: () => {
    set({
      currentMovie: null,
      episodes: [],
      selectedEpisode: null,
      relatedMovies: []
    });
  }
}));

export default useMovieDetailStore;
