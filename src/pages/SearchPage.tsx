import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMovies } from '../api/movieApi';
import { MovieCard } from '../components/common';
import SearchBar from '../components/search/SearchBar';
import SearchFilters, { FilterOptions } from '../components/search/SearchFilters';
import Pagination from '../components/common/Pagination';
import { Loader } from '../components/common';
import { FiSearch } from 'react-icons/fi';

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
    genre: searchParams.get('genre') || undefined,
    year: searchParams.get('year') || undefined,
    country: searchParams.get('country') || undefined,
    type: (searchParams.get('type') as 'movie' | 'tvshow' | 'all') || 'all',
    sort: (searchParams.get('sort') as 'relevance' | 'latest' | 'oldest' | 'rating') || 'relevance',
  });
  
  const resultsPerPage = 24; // Match API default

  // Update URL with search parameters
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (initialQuery) params.set('q', initialQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (filters.genre) params.set('genre', filters.genre);
    if (filters.year) params.set('year', filters.year);
    if (filters.country) params.set('country', filters.country);
    if (filters.type && filters.type !== 'all') params.set('type', filters.type);
    if (filters.sort && filters.sort !== 'relevance') params.set('sort', filters.sort);
    
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
        // Call the actual API function from movieApi.js
        const response = await searchMovies(initialQuery, currentPage, resultsPerPage);
        
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
              {filters.genre && ` trong thể loại "${filters.genre}"`}
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
                  year={movie.year}
                  quality={movie.quality}
                  lang={movie.lang}
                  episodeCurrent={movie.episode_current}
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
