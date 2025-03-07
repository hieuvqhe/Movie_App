import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiMenu, FiUser, FiLogIn, FiUserPlus, FiHeart, 
  FiLogOut, FiHome, FiFilm, FiTv, FiX 
} from 'react-icons/fi';
import useAuthStore from '../../../store/authStore';
import useUIStore from '../../../store/uiStore';
import { debounce } from 'lodash';
import { searchMovies } from '../../../api/movieApi';
import Button from '../../../components/common/Button/Button';
interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className = '' }) => {
  const { user, checkLoginStatus, logout } = useAuthStore();
  const isLoggedIn = !!user;
  const { 
    showMenu, toggleMenu,
    showUserMenu, toggleUserMenu,
    showLogoutModal, toggleLogoutModal,
    searchQuery, setSearchQuery 
  } = useUIStore();

  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    checkLoginStatus();
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        toggleUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [checkLoginStatus, toggleUserMenu]);

  // Add this useEffect to log when user changes for debugging
  useEffect(() => {
    if (user) {
      console.log('User in Navbar updated:', user.name);
    }
  }, [user]);

  const debouncedSearch = debounce(async (query: string) => {
    if (query.trim()) {
      try {
        const results = await searchMovies(query, 1, 7);
        setSearchResults(results?.data?.items || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    toggleUserMenu(false);
    toggleLogoutModal(false);
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      if (showMenu) toggleMenu(false);
    }
  };

  // Helper function to get image URL with proper base
  const getImageUrl = (url?: string) => {
    if (!url) return 'https://pbs.twimg.com/media/BPUYIBHCMAAAftR?format=jpg&name=360x360';
    return url.startsWith('http') ? url : `https://phimimg.com/${url}`;
  };

  return (
    <nav className={`bg-gray-900 text-white shadow-lg ${className}`} style={{ position: 'static', top: 'auto', zIndex: 10 }}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-red-600 font-bold text-2xl tracking-wider">PHIMHAY</Link>

          <div className="hidden md:flex space-x-8">
            <Link to="/" className="flex items-center hover:text-red-500 transition-colors"><FiHome className="mr-1" /> Home</Link>
            <Link to="/category/phim-le" className="flex items-center hover:text-red-500 transition-colors"><FiFilm className="mr-1" /> Movies</Link>
            <Link to="/category/tv-shows" className="flex items-center hover:text-red-500 transition-colors"><FiTv className="mr-1" /> TV Shows</Link>
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-800 rounded-full px-3 py-1 flex-grow max-w-md mx-8 relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm kiếm phim..."
              aria-label="Search movies"
              className="bg-transparent border-none outline-none flex-grow text-sm text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            <button type="submit" className="ml-2 text-gray-400 hover:text-white" aria-label="Submit search">
              <FiSearch />
            </button>
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-gray-800 rounded-md shadow-lg mt-1 z-50 overflow-hidden max-h-[70vh] overflow-y-auto">
                {searchResults.map((movie) => (
                  <Link
                    key={movie._id}
                    to={`/movie/${movie.slug}`}
                    className="flex items-center px-3 py-2 hover:bg-gray-700 transition-colors text-white border-b border-gray-700 last:border-b-0"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setShowDropdown(false);
                    }}
                  >
                    {/* Movie thumbnail */}
                    <div className="flex-shrink-0 w-10 h-14 mr-3 overflow-hidden rounded bg-gray-700">
                      <img
                        src={getImageUrl(movie.poster_url || movie.thumb_url)}
                        alt={movie.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.src = 'https://pbs.twimg.com/media/BPUYIBHCMAAAftR?format=jpg&name=360x360';
                        }}
                      />
                    </div>
                    
                    {/* Movie info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{movie.name}</p>
                      <div className="flex items-center text-xs text-gray-400">
                        {movie.year && <span className="mr-2">{movie.year}</span>}
                        {movie.quality && <span className="bg-red-600 text-white px-1 rounded-sm mr-1 text-xs">{movie.quality}</span>}
                        {movie.episode_current && <span>{movie.episode_current}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </form>

          <div className="hidden md:block relative" ref={userMenuRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleUserMenu()}
              icon={<FiUser />}
              className="rounded-full"
            >
              {isLoggedIn ? `Hello ${user?.name || localStorage.getItem('userName') || 'User'}` : 'Login'}
            </Button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-2 z-50">
                {isLoggedIn ? (
                  <>
                    <Link to="/profile" className="flex items-center px-4 py-2 hover:bg-gray-700 transition-colors"><FiUser className="mr-2" /> Profile</Link>
                    <Link to="/favorites" className="flex items-center px-4 py-2 hover:bg-gray-700 transition-colors"><FiHeart className="mr-2" /> Favorites</Link>
                    <button onClick={() => toggleLogoutModal(true)} className="w-full text-left flex items-center px-4 py-2 hover:bg-gray-700 text-red-500 transition-colors">
                      <FiLogOut className="mr-2" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center px-4 py-2 hover:bg-gray-700 transition-colors"><FiLogIn className="mr-2" /> Login</Link>
                    <Link to="/register" className="flex items-center px-4 py-2 hover:bg-gray-700 transition-colors"><FiUserPlus className="mr-2" /> Register</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Button
              variant="icon"
              onClick={() => toggleMenu()}
              icon={<FiMenu size={24} />}
            >
              {''}
            </Button>
          </div>
        </div>
      </div>

      {showMenu && (
        <div className="md:hidden bg-gray-800 px-4 pt-2 pb-4">
          <form onSubmit={handleSearch} className="flex items-center bg-gray-700 rounded-full px-3 py-2 mb-4 relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm kiếm phim..."
              aria-label="Search movies"
              className="bg-transparent border-none outline-none flex-grow text-sm text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            <button type="submit" className="ml-2 text-gray-400 hover:text-white" aria-label="Submit search">
              <FiSearch />
            </button>
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-gray-800 rounded-md shadow-lg mt-1 z-50 overflow-hidden max-h-[60vh] overflow-y-auto">
                {searchResults.map((movie) => (
                  <Link
                    key={movie._id}
                    to={`/movie/${movie.slug}`}
                    className="flex items-center px-3 py-2 hover:bg-gray-700 transition-colors text-white border-b border-gray-700 last:border-b-0"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setShowDropdown(false);
                      toggleMenu(false); // Close mobile menu when selecting a result
                    }}
                  >
                    {/* Movie thumbnail */}
                    <div className="flex-shrink-0 w-10 h-14 mr-3 overflow-hidden rounded bg-gray-700">
                      <img
                        src={getImageUrl(movie.thumb_url || movie.poster_url)}
                        alt={movie.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://pbs.twimg.com/media/BPUYIBHCMAAAftR?format=jpg&name=360x360';
                        }}
                      />
                    </div>
                    
                    {/* Movie info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{movie.name}</p>
                      <div className="flex items-center text-xs text-gray-400">
                        {movie.year && <span className="mr-2">{movie.year}</span>}
                        {movie.quality && <span className="bg-red-600 text-white px-1 rounded-sm mr-1 text-xs">{movie.quality}</span>}
                        {movie.episode_current && <span>{movie.episode_current}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </form>
          
          <Link to="/" className="block py-2 hover:text-red-500 transition-colors flex items-center"><FiHome className="mr-2" /> Home</Link>
          <Link to="/movies" className="block py-2 hover:text-red-500 transition-colors flex items-center"><FiFilm className="mr-2" /> Movies</Link>
          <Link to="/tv-shows" className="block py-2 hover:text-red-500 transition-colors flex items-center"><FiTv className="mr-2" /> TV Shows</Link>
          
          <div className="border-t border-gray-700 my-2"></div>
          
          {isLoggedIn ? (
            <>
              <Link to="/profile" className="block py-2 hover:text-red-500 transition-colors flex items-center"><FiUser className="mr-2" /> Profile</Link>
              <Link to="/favorites" className="block py-2 hover:text-red-500 transition-colors flex items-center"><FiHeart className="mr-2" /> Favorites</Link>
              <button onClick={() => { toggleMenu(false); toggleLogoutModal(true); }} className="w-full text-left py-2 hover:text-red-500 transition-colors flex items-center">
                <FiLogOut className="mr-2" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 hover:text-red-500 transition-colors flex items-center"><FiLogIn className="mr-2" /> Login</Link>
              <Link to="/register" className="block py-2 hover:text-red-500 transition-colors flex items-center"><FiUserPlus className="mr-2" /> Register</Link>
            </>
          )}
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-xl font-bold mb-4">Xác nhận đăng xuất</h3>
            <p className="mb-6">Bạn có chắc chắn muốn đăng xuất?</p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleLogoutModal(false)}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;