import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFavoriteMoviesStore from '../store/favoriteMoviesStore';
import useAuthStore from '../store/authStore';
import { HeartIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

const DEFAULT_IMAGE = 'https://www.mockofun.com/wp-content/uploads/2019/10/movie-poster-credits-178.jpg';
const ITEMS_PER_PAGE = 10;

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  movieName: string;
}

const DeleteConfirmModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, movieName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4">Xác nhận xóa</h3>
        <p className="text-gray-300 mb-6">
          Bạn có chắc chắn muốn xóa phim "<span className="font-semibold text-white">{movieName}</span>" khỏi danh sách yêu thích?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

const FavoriteMoviePage = () => {
  const navigate = useNavigate();
  const { favorites, isLoading, error, fetchFavorites, removeFavorite } = useFavoriteMoviesStore();
  const { checkLoginStatus } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, movieId: '', movieName: '' });
  const [currentPage, setCurrentPage] = useState(1);

  // Thêm logic phân trang
  const totalPages = Math.ceil(favorites.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentFavorites = favorites.slice(startIndex, endIndex);

  useEffect(() => {
    checkAuthAndLoadFavorites();
  }, [checkLoginStatus]);

  const checkAuthAndLoadFavorites = async () => {
    if (!checkLoginStatus) {
      toast.error('Vui lòng đăng nhập để xem phim yêu thích');
      navigate('/login');
      return;
    }
    
    await fetchFavorites();
  };

  // Thêm hàm xử lý phân trang
  const handlePageChange = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchFavorites();
    setCurrentPage(1); // Reset về trang đầu khi làm mới
    setIsRefreshing(false);
    toast.success('Đã làm mới danh sách phim yêu thích');
  };

  const openDeleteModal = (movieId: string, movieName: string) => {
    setDeleteModal({ isOpen: true, movieId, movieName });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, movieId: '', movieName: '' });
  };

  const handleRemoveFavorite = async () => {
    try {
      const success = await removeFavorite(deleteModal.movieId);
      if (success) {
        toast.success('Đã xóa phim khỏi danh sách yêu thích');
      }
    } catch (err) {
      toast.error('Không thể xóa phim khỏi danh sách yêu thích');
    }
  };

  const handleMovieClick = (slug: string) => {
    navigate(`/movie/${slug}`);
  };

  const getImageUrl = (movie: any) => {
    // Ưu tiên posterUrl với chất lượng cao hơn
    if (movie.posterUrl) {
      return movie.posterUrl.startsWith('http') 
        ? movie.posterUrl 
        : `https://image.tmdb.org/t/p/w500${movie.posterUrl}`;
    }
    
    // Fallback đến thumbUrl nếu không có poster
    if (movie.thumbUrl) {
      return movie.thumbUrl.startsWith('http') 
        ? movie.thumbUrl 
        : `https://image.tmdb.org/t/p/w300${movie.thumbUrl}`;
    }
    
    return DEFAULT_IMAGE;
  };

  const EmptyFavorites = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <HeartIcon className="w-16 h-16 text-gray-500" />
      <h3 className="text-xl font-bold text-white mt-5 mb-2">Không có phim yêu thích</h3>
      <p className="text-gray-400 text-center mb-8">
        Các phim bạn đánh dấu yêu thích sẽ xuất hiện tại đây
      </p>
      <button 
        onClick={() => navigate('/')}
        className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition duration-200"
      >
        Duyệt phim
      </button>
    </div>
  );

  if (isLoading && !isRefreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-white">Đang tải danh sách phim...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Phim Yêu Thích ({favorites.length})</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            >
              {isRefreshing ? 'Đang làm mới...' : 'Làm mới'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <EmptyFavorites />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {currentFavorites.map((movie) => (
                <div key={movie.movieId || movie._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition hover:shadow-2xl hover:scale-105">
                  <div className="relative cursor-pointer" onClick={() => handleMovieClick(movie.slug)}>
                    <img
                      src={getImageUrl(movie)}
                      alt={movie.name}
                      className="w-full h-64 object-cover object-center"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_IMAGE;
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent's onClick
                        openDeleteModal(movie.movieId, movie.name);
                      }}
                      className="absolute top-2 right-2 bg-black bg-opacity-60 p-2 rounded-full hover:bg-red-600 transition duration-200"
                    >
                      <XMarkIcon className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                  <div 
                    className="p-4 cursor-pointer" 
                    onClick={() => handleMovieClick(movie.slug)}
                  >
                    <div className="text-white font-bold mb-2 hover:text-red-500">
                      {movie.name}
                    </div>
                    <div className="flex flex-wrap items-center text-sm text-gray-400">
                      <span>{movie.year}</span>
                      {movie.quality && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="text-red-500 font-medium">{movie.quality}</span>
                        </>
                      )}
                      {movie.origin_name && (
                        <span className="w-full mt-1 text-gray-500 text-xs truncate">{movie.origin_name}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Phần điều khiển phân trang */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                
                <span className="text-white">
                  Trang {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      <DeleteConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleRemoveFavorite}
        movieName={deleteModal.movieName}
      />
    </div>
  );
};

export default FavoriteMoviePage;