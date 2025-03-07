import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchMovies } from '../api/movieApi';
import { addFavorite, removeFavorite, checkMovieFavoriteStatus } from '../api/userApi';
import { MovieCard } from '../components/common';
import SearchBar from '../components/search/SearchBar';
import SearchFilters, { FilterOptions } from '../components/search/SearchFilters';
import Pagination from '../components/common/Pagination';
import { Loader } from '../components/common';
import { FiSearch } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Updated Movie interface to match API response
interface Movie {
  _id: string;
  name: string;
  slug: string;
  origin_name?: string;
  poster_url?: string;
  thumb_url?: string;
  year?: number | string;
  quality?: string;
  lang?: string;
  episode_current?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  }[];
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const pageParam = searchParams.get('page');
  const initialPage = pageParam ? parseInt(pageParam, 10) : 1;
  
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    category: searchParams.get('category') || undefined,
    year: searchParams.get('year') || undefined,
    country: searchParams.get('country') || undefined,
    sort_field: searchParams.get('sort_field') || 'modified.time',
    sort_type: searchParams.get('sort_type') || 'desc',
    sort_lang: searchParams.get('sort_lang') || undefined,
  });
  const [favoriteStatus, setFavoriteStatus] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  
  const resultsPerPage = 24; // Match API default

  // Update URL with search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (initialQuery) params.set('q', initialQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (filters.category) params.set('category', filters.category);
    if (filters.year) params.set('year', filters.year);
    if (filters.country) params.set('country', filters.country);
    if (filters.sort_field && filters.sort_field !== 'modified.time') params.set('sort_field', filters.sort_field);
    if (filters.sort_type && filters.sort_type !== 'desc') params.set('sort_type', filters.sort_type);
    if (filters.sort_lang) params.set('sort_lang', filters.sort_lang);
    
    setSearchParams(params);
  }, [initialQuery, currentPage, filters, setSearchParams]);

  // Fetch search results using searchMovies API
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!initialQuery) {
        setSearchResults([]);
        setTotalResults(0);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Prepare search parameters for the API
        const searchParams = {
          keyword: initialQuery,
          page: currentPage,
          limit: resultsPerPage,
          ...filters
        };
        
        // Remove undefined values
        Object.keys(searchParams).forEach(key => 
          searchParams[key] === undefined && delete searchParams[key]
        );

        // Call the actual API function from movieApi.js
        const response = await searchMovies(searchParams);
        
        if (response.status === 'success' && response?.data?.items) {
          setSearchResults(response.data.items);
          setTotalResults(response.data.pagination.totalItems);
          setTotalPages(response.data.pagination.totalPages);
        } else {
          setSearchResults([]);
          setTotalResults(0);
          setError(response.msg || 'No results found');
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError(err instanceof Error ? err.message : 'Failed to load search results');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [initialQuery, currentPage, filters]);

  // Fetch favorite status for all displayed movies
  useEffect(() => {
    const checkFavorites = async () => {
      if (!searchResults.length) return;
      
      const statusMap: Record<string, boolean> = {};
      
      // Check favorite status for each movie in parallel
      await Promise.all(
        searchResults.map(async (movie) => {
          try {
            const isFavorited = await checkMovieFavoriteStatus(movie._id);
            statusMap[movie._id] = isFavorited;
          } catch (error) {
            console.error(`Error checking favorite status for ${movie._id}:`, error);
            statusMap[movie._id] = false;
          }
        })
      );
      
      setFavoriteStatus(statusMap);
    };
    
    checkFavorites();
  }, [searchResults]);

  const handleSearch = (query: string) => {
    if (query !== initialQuery) {
      // Reset to first page when performing a new search
      setCurrentPage(1);
      setSearchParams({ q: query });
    }
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    // Reset to first page when changing filters
    setCurrentPage(1);
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top after page change
    window.scrollTo(0, 0);
  };

  // Helper function to format image URLs
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://phimimg.com/${url}`;
  };

  // Handle favorite toggle with proper API calls
  const handleFavoriteToggle = useCallback(async (movie: Movie) => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('accessToken');
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    
    const movieId = movie._id;
    const currentStatus = favoriteStatus[movieId] || false;
    
    try {
      // Optimistically update UI
      setFavoriteStatus(prev => ({
        ...prev,
        [movieId]: !currentStatus
      }));
      
      if (!currentStatus) {
        // Add to favorites
        const movieData = {
          movieId: movie._id,
          name: movie.name,
          slug: movie.slug,
          thumbUrl: movie.thumb_url || movie.poster_url || '',
          year: movie.year,
          type: 'movie' // Default type
        };
        
        await addFavorite(movieData);
        toast.success('Đã thêm vào danh sách yêu thích');
      } else {
        // Remove from favorites
        await removeFavorite(movieId);
        toast.success('Đã xóa khỏi danh sách yêu thích');
      }
    } catch (error) {
      // Revert on error
      setFavoriteStatus(prev => ({
        ...prev,
        [movieId]: currentStatus
      }));
      
      const errorMsg = error instanceof Error ? error.message : 'Đã xảy ra lỗi';
      toast.error(errorMsg);
      console.error('Favorite toggle error:', error);
    }
  }, [favoriteStatus, navigate]);

  const handleWatch = useCallback((movieId: string, slug: string) => {
    navigate(`/movie/${slug || movieId}`);
  }, [navigate]);

  return (
    <div className="bg-gray-900 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-6">Tìm kiếm phim</h1>
        
        {/* Search input and filters */}
        <div className="mb-8">
          <SearchBar 
            initialQuery={initialQuery} 
            onSearch={handleSearch} 
            className="mb-4"
          />
          
          <SearchFilters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
          />
        </div>

        {/* Search results */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : error ? (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => handleSearch(initialQuery)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : searchResults.length > 0 ? (
          <>
            <div className="text-gray-300 mb-6">
              Tìm thấy {totalResults} kết quả cho "{initialQuery}"
              {filters.category && ` trong thể loại "${filters.category}"`}
              {filters.year && ` từ năm ${filters.year}`}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {searchResults.map(movie => (
                <MovieCard
                  key={movie._id}
                  id={movie._id}
                  title={movie.name}
                  posterUrl={getImageUrl(movie.poster_url || movie.thumb_url)}
                  slug={movie.slug}
                  year={typeof movie.year === 'string' ? parseInt(movie.year, 10) || undefined : movie.year}
                  isFavorited={favoriteStatus[movie._id] || false}
                  onFavoriteToggle={() => handleFavoriteToggle(movie)}
                  onWatch={() => handleWatch(movie._id, movie.slug)}
                />
              ))}
            </div>
            
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-10"
              />
            )}
          </>
        ) : initialQuery ? (
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <div className="text-gray-300 text-lg mb-3">Không tìm thấy kết quả cho "{initialQuery}"</div>
            <p className="text-gray-500">Thử điều chỉnh tìm kiếm hoặc bộ lọc</p>
          </div>
        ) : (
          <div className="bg-gray-800 p-12 rounded-lg text-center">
            <FiSearch className="mx-auto text-gray-500 mb-4" size={48} />
            <h2 className="text-xl text-gray-300 mb-2">Tìm kiếm phim và chương trình TV yêu thích</h2>
            <p className="text-gray-500">Nhập từ khóa vào ô tìm kiếm phía trên</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
