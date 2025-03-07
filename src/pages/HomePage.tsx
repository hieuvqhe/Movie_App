import React, { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import Banner from '../components/home/Banner';
import MovieRow from '../components/home/MovieRow';
import { Loader } from '../components/common';
import { getNewMovies, getCategoryMovies, getMoviesByYear } from '../api/movieApi';

interface Movie {
  _id: string;
  slug: string;
  name: string;
  year?: string;
  thumb_url?: string;
  poster_url?: string;
}

// Lazy-loaded MovieRow component
const MovieRowLazy: React.FC<{
  title: string;
  category: string;
  fetchMovies: () => Promise<any>;
}> = ({ title, category, fetchMovies }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use intersection observer with threshold
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '200px 0px', // Load slightly before the element comes into view
  });

  useEffect(() => {
    if (inView && !isLoading && !movies.length) {
      const loadData = async () => {
        try {
          setIsLoading(true);
   
          const data = await fetchMovies();
          
          if (data?.data?.items && data.data.items.length > 0) {
            setMovies(data.data.items);
          } else if (data?.items && data.items.length > 0) {
            setMovies(data.items);
          } else {
            setError(`No ${title} movies found`);
          }
        } catch (err) {
          console.error(`Error loading ${title}:`, err);
          setError(`Could not load ${title}`);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadData();
    }
  }, [inView, fetchMovies, title, isLoading, movies.length]);

  return (
    <div ref={ref} className="min-h-[100px]">
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 w-48 rounded"></div>
          <div className="flex space-x-4 overflow-x-auto">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="flex-none w-36 h-52 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      ) : movies.length > 0 ? (
        <MovieRow title={title} movies={movies} category={category} />
      ) : error ? (
        <div className="text-red-500 py-4">{error}</div>
      ) : (
        <div className="h-8 bg-gray-800 w-full rounded opacity-20"></div>
      )}
    </div>
  );
};

const HomePage: React.FC = () => {
  const [bannerMovies, setBannerMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [newMovies, setNewMovies] = useState<Movie[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create memoized fetch functions for lazy components
  const fetchTvSeries = useCallback(() => getCategoryMovies('phim-bo', 1, 12), []);
  const fetchSingleMovies = useCallback(() => getCategoryMovies('phim-le', 1, 12), []);
  const fetchTvShows = useCallback(() => getCategoryMovies('tv-shows', 1, 12), []);
  const fetchAnimation = useCallback(() => getCategoryMovies('hoat-hinh', 1, 12), []);
  const fetchVietsub = useCallback(() => getCategoryMovies('phim-vietsub', 1, 12), []);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsInitialLoading(true);
        setError(null);
  
        // 1. Fetch movies for banner from getMoviesByYear (2025)
        const bannerMoviesData = await getMoviesByYear(2025, 1, 10);
      
        
        // Process banner movies - handle the nested data structure properly
        if (bannerMoviesData?.data?.items && bannerMoviesData.data.items.length > 0) {
          // Transform the data to include proper image URLs
          const processedMovies = bannerMoviesData.data.items.map((movie: { poster_url: string; thumb_url: string; }) => ({
            ...movie,
            // Ensure poster_url is a full URL
            poster_url: movie.poster_url?.startsWith('http') 
              ? movie.poster_url 
              : `${bannerMoviesData.data?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com'}/${movie.poster_url}`,
            // Ensure thumb_url is a full URL
            thumb_url: movie.thumb_url?.startsWith('http') 
              ? movie.thumb_url 
              : `${bannerMoviesData.data?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com'}/${movie.thumb_url}`
          }));
          
          setBannerMovies(processedMovies);
     
        } else {
          console.error('No movies found for the banner');
        }
  
        // 2. Lấy phim mới cập nhật từ getNewMovies
        const popularMoviesData = await getNewMovies(1, 12);
        if (popularMoviesData?.items && popularMoviesData.items.length > 0) {
          setPopularMovies(popularMoviesData.items);
        } else {
          console.error('No popular movies found');
        }
  
        // 3. Lấy phim năm 2025 (giữ nguyên như cũ)
        const new2025MoviesData = await getMoviesByYear(2025, 1, 12);
        if (new2025MoviesData?.data?.items && new2025MoviesData.data.items.length > 0) {
          setNewMovies(new2025MoviesData.data.items);
        } else if (new2025MoviesData?.items && new2025MoviesData.items.length > 0) {
          setNewMovies(new2025MoviesData.items);
        }
  
        setIsInitialLoading(false);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Không thể tải danh sách phim. Vui lòng thử lại sau.');
        setIsInitialLoading(false);
      }
    };
  
    fetchInitialData();
  }, []);
  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 p-4">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-red-500 text-xl font-bold mb-4">Lỗi</h2>
          <p className="text-white mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Banner Section - Always visible at the top */}
      {bannerMovies.length > 0 && <Banner movies={bannerMovies} />}
      
      {/* Movie Categories - Loaded in priority order */}
      <div className="space-y-8 pt-6 pb-10 px-4 max-w-7xl mx-auto">
        {/* High priority rows - load immediately */}
        {popularMovies.length > 0 && (
          <MovieRow 
            title="Phim mới cập nhật" 
            movies={popularMovies} 
            category="phim-moi-cap-nhat" 
          />
        )}
        
        {newMovies.length > 0 && (
          <MovieRow 
            title="Phim năm 2025" 
            movies={newMovies} 
            category="phim-nam-2025" 
          />
        )}
        
        {/* Lazy loaded rows - loaded when scrolled into view */}
        <MovieRowLazy 
          title="Phim bộ" 
          category="phim-bo"
          fetchMovies={fetchTvSeries} 
        />
        
        <MovieRowLazy 
          title="Phim lẻ" 
          category="phim-le"
          fetchMovies={fetchSingleMovies} 
        />
        
        <MovieRowLazy 
          title="TV Shows" 
          category="tv-shows"
          fetchMovies={fetchTvShows} 
        />
        
        <MovieRowLazy 
          title="Hoạt hình" 
          category="hoat-hinh"
          fetchMovies={fetchAnimation} 
        />
        
        <MovieRowLazy 
          title="Phim Vietsub" 
          category="phim-vietsub"
          fetchMovies={fetchVietsub} 
        />
      </div>
    </div>
  );
};

export default HomePage;
