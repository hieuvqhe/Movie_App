import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategoryMovies } from '../api/movieApi';
import { Loader } from '../components/common';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Movie {
  _id: string;
  slug: string;
  name: string;
  year?: string;
  thumb_url?: string;
  poster_url?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  // Add this state in the main component body
  const [jumpToPage, setJumpToPage] = useState('');

  // Helper function to get human-readable category name
  const getCategoryDisplayName = (slug: string): string => {
    const categories: { [key: string]: string } = {
      'phim-moi-cap-nhat': 'Phim mới cập nhật',
      'phim-bo': 'Phim bộ',
      'phim-le': 'Phim lẻ',
      'tv-shows': 'TV Shows',
      'hoat-hinh': 'Hoạt hình',
      'phim-vietsub': 'Phim Vietsub',
      'phim-thuyet-minh': 'Phim thuyết minh',
      'phim-long-tieng': 'Phim lồng tiếng',
    };
    
    return categories[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Load movies for the current category and page
  const loadCategoryMovies = async (pageNumber: number = 1) => {
    if (!category) return;
    
    setLoading(true);
    try {
      const data = await getCategoryMovies(category, pageNumber, 10);
      
      // Check if response has nested data structure
      if (data?.data?.items) {
        setMovies(data.data.items);
        
        // Extract pagination info if available
        if (data.data.params?.pagination) {
          setPagination({
            currentPage: pageNumber,
            totalPages: Math.ceil(data.data.params.pagination.totalItems / 10),
            totalItems: data.data.params.pagination.totalItems
          });
        }
      } else if (data?.items) {
        // Alternative data structure
        setMovies(data.items);
        setPagination({
          currentPage: pageNumber,
          totalPages: Math.ceil((data.totalItems || 100) / 10),
          totalItems: data.totalItems || 100
        });
      } else {
        setMovies([]);
        setError('Không tìm thấy phim trong danh mục này');
      }
      
      // Set category display name
      setCategoryName(getCategoryDisplayName(category));
    } catch (err) {
      console.error('Error loading category movies:', err);
      setError('Có lỗi xảy ra khi tải danh sách phim');
    } finally {
      setLoading(false);
    }
  };

  // Load movies when category changes or page changes
  useEffect(() => {
    window.scrollTo(0, 0);
    loadCategoryMovies(1);
  }, [category]);

  // Function to handle page changes
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > pagination.totalPages) return;
    
    window.scrollTo(0, 0);
    loadCategoryMovies(pageNumber);
  };

  // Helper function to format image URLs
  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `https://phimimg.com/${url}`;
  };

  // Generate pagination buttons with Tailwind CSS classes
  const renderPagination = () => {
    const { currentPage, totalPages } = pagination;
    const buttons = [];
    
    // Previous page button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center justify-center w-10 h-10 rounded-md ${
          currentPage === 1 
            ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
            : "bg-gray-800 text-white hover:bg-gray-700"
        }`}
      >
        <FiChevronLeft size={18} />
      </button>
    );
    
    // First page
    if (currentPage > 3) {
      buttons.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className={`w-10 h-10 rounded-md ${
            currentPage === 1
              ? "bg-red-600 text-white"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          1
        </button>
      );
      
      if (currentPage > 4) {
        buttons.push(
          <span key="ellipsis1" className="px-3 py-2 text-gray-400">
            ...
          </span>
        );
      }
    }
    
    // Page numbers around current page
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 rounded-md ${
            i === currentPage
              ? "bg-red-600 text-white"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Last page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        buttons.push(
          <span key="ellipsis2" className="px-3 py-2 text-gray-400">
            ...
          </span>
        );
      }
      
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`w-10 h-10 rounded-md ${
            currentPage === totalPages
              ? "bg-red-600 text-white"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
        >
          {totalPages}
        </button>
      );
    }
    
    // Next page button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center justify-center w-10 h-10 rounded-md ${
          currentPage === totalPages 
            ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
            : "bg-gray-800 text-white hover:bg-gray-700"
        }`}
      >
        <FiChevronRight size={18} />
      </button>
    );
    
    return buttons;
  };

  // Convert quick navigation to use Tailwind CSS classes directly
  const quickNavigationComponent = (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        const pageNum = parseInt(jumpToPage);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pagination.totalPages) {
          handlePageChange(pageNum);
        }
        setJumpToPage('');
      }} 
      className="flex items-center mt-4 justify-center"
    >
      <span className="text-gray-300 mr-2">Đi đến trang:</span>
      <input
        type="text"
        value={jumpToPage}
        onChange={(e) => setJumpToPage(e.target.value)}
        className="bg-gray-700 border border-gray-600 rounded px-3 py-1 w-16 text-white text-center"
        placeholder={`1-${pagination.totalPages}`}
      />
      <button
        type="submit"
        className="ml-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium"
      >
        Đi
      </button>
    </form>
  );

  if (loading && pagination.currentPage === 1) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{categoryName}</h1>
          <div className="h-1 w-24 bg-red-600 rounded"></div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-100 px-4 py-3 rounded mb-8">
            <p>{error}</p>
          </div>
        )}
        
        {/* Movies Grid */}
        {!loading && movies.length === 0 && !error ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h3 className="text-xl text-gray-300">Không tìm thấy phim trong danh mục này</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {movies.map(movie => (
              <Link 
                to={`/movie/${movie.slug}`} 
                key={movie._id} 
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105"
              >
                <div className="aspect-[2/3] relative">
                  <img 
                    src={getImageUrl(movie.poster_url || movie.thumb_url)} 
                    alt={movie.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4">
                      <span className="text-white font-medium">{movie.name}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white text-sm font-medium line-clamp-2 mb-1">{movie.name}</h3>
                  {movie.year && (
                    <p className="text-gray-400 text-xs">{movie.year}</p>
                  )}
                </div>
              </Link>
            ))}
            
            {/* Loading skeleton placeholders */}
            {loading && Array.from({ length: 5 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="aspect-[2/3] bg-gray-700 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Enhanced Pagination with custom buttons */}
        {pagination.totalPages > 1 && (
          <div className="mt-12">
            {/* Page buttons */}
            <div className="flex justify-center space-x-2 flex-wrap gap-y-2">
              {renderPagination()}
            </div>
            
            {/* Quick jump navigation - for large page counts */}
            {pagination.totalPages > 10 && quickNavigationComponent}
            
            {/* Current page indicator */}
            <div className="text-center text-gray-400 mt-4">
              Trang {pagination.currentPage} trên {pagination.totalPages}
            </div>
          </div>
        )}
        
        {/* Category info */}
        <div className="mt-12 bg-gray-800/50 rounded-lg p-6">
          <h2 className="text-xl text-white font-medium mb-4">
            {categoryName} - Trang {pagination.currentPage}/{pagination.totalPages}
          </h2>
          <p className="text-gray-400">
            Danh sách {categoryName.toLowerCase()} hay nhất, cập nhật liên tục. Khám phá thêm nhiều phim thú vị khác trong kho phim đa dạng của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
