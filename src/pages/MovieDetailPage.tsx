import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMovieDetail, getSimilarMovies } from "../api/movieApi";
import { Loader } from "../components/common";
import VideoPlayer from "../components/movie/VideoPlayer";
import useAuthStore from "../store/authStore";
import useFavoriteMoviesStore from "../store/favoriteMoviesStore";
import Button from "../components/common/Button/Button";
import { FiPlay, FiRefreshCw, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { toast } from "react-hot-toast";

// Default image to use when movie poster/thumbnail is missing
const DEFAULT_IMAGE = "https://via.placeholder.com/300x450?text=No+Image";

// Types based on API response structure
interface Episode {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

interface ServerData {
  server_name: string;
  server_data: Episode[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Country {
  id: string;
  name: string;
  slug: string;
}

interface MovieDetail {
  _id: string;
  name: string;
  origin_name?: string;
  content?: string;
  type?: string;
  status?: string;
  thumb_url?: string;
  poster_url?: string;
  year?: number | string;
  time?: string;
  episode_current?: string;
  episode_total?: string;
  quality?: string;
  lang?: string;
  actor?: string[];
  director?: string[];
  category?: Category[];
  country?: Country[];
}

// New interface for similar movies
interface SimilarMovie {
  _id: string;
  name: string;
  slug: string;
  thumb_url: string;
  poster_url?: string;
  year?: string;
  quality?: string;
}

const MovieDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [movieDetail, setMovieDetail] = useState<MovieDetail | null>(null);
  const [episodes, setEpisodes] = useState<ServerData[]>([]);
  const [selectedServer, setSelectedServer] = useState<string>("");
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  
  // Add similar movies state
  const [similarMovies, setSimilarMovies] = useState<SimilarMovie[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState<boolean>(false);
  
  // Carousel scroll ref and state
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Use auth and favorites stores
  const { user } = useAuthStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavoriteMoviesStore();

  // Add a state for player errors
  const [playerError, setPlayerError] = useState<boolean>(false);

  // Add a state to control video player visibility
  const [showPlayer, setShowPlayer] = useState<boolean>(false);

  // Fetch movie details
  useEffect(() => {
    const getMovieDetails = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const data = await fetchMovieDetail(slug);

        if (data && data.movie) {
          setMovieDetail(data.movie);
          setEpisodes(data.episodes || []);

          // Select first server by default if available
          if (data.episodes && data.episodes.length > 0) {
            setSelectedServer(data.episodes[0].server_name);

            // For movies, automatically select the first episode but don't show player yet
            if (
              data.movie.type === "single" ||
              data.episodes[0].server_data.length === 1
            ) {
              setSelectedEpisode(data.episodes[0].server_data[0]);
              // Don't set showPlayer to true here
            }
          }
          
          // Fetch similar movies once we have the movie details
          fetchSimilarMovies(data.movie);
        } else {
          setError("Không tìm thấy thông tin phim");
        }
      } catch (err) {
        setError("Không thể tải thông tin phim");
        console.error("Error fetching movie details:", err);
      } finally {
        setLoading(false);
      }
    };

    getMovieDetails();
  }, [slug]);

  // Fetch similar movies based on current movie
  const fetchSimilarMovies = async (movie: MovieDetail) => {
    try {
      setLoadingSimilar(true);
      const response = await getSimilarMovies(movie, 12);
      
      if (response.status === 'success' && response.data && response.data.items) {
        setSimilarMovies(response.data.items);
      }
    } catch (error) {
      console.error('Error loading similar movies:', error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  // Function to handle server selection
  const handleServerChange = useCallback(
    (serverName: string) => {
      setSelectedServer(serverName);

      // When changing server, find the same episode (by name) if possible
      const serverData = episodes.find((s) => s.server_name === serverName);
      if (serverData && selectedEpisode) {
        const matchingEpisode = serverData.server_data.find(
          (ep) => ep.name === selectedEpisode.name
        );
        if (matchingEpisode) {
          setSelectedEpisode(matchingEpisode);
        } else {
          // If no matching episode, select first episode
          setSelectedEpisode(serverData.server_data[0]);
        }
      } else if (serverData) {
        // If no episode was selected, select first episode
        setSelectedEpisode(serverData.server_data[0]);
      }
    },
    [episodes, selectedEpisode]
  );
  useEffect(() => {
    setCurrentChunkIndex(0);
  }, [selectedServer]);

  // Handle episode selection
  const handleEpisodeSelect = useCallback((episode: Episode) => {
    setSelectedEpisode(episode);
    setShowPlayer(true); // Show player when an episode is selected

    // Scroll to player when episode is selected
    const playerElement = document.getElementById("video-player");
    if (playerElement) {
      playerElement.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Handle "Xem Phim" button click
  const handleWatchMovie = useCallback(() => {
    if (selectedEpisode) {
      setShowPlayer(true); // Show player when button is clicked
      // Scroll to player
      const playerElement = document.getElementById("video-player");
      if (playerElement) {
        playerElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [selectedEpisode]);

  // Toggle favorite status
  const handleToggleFavorite = useCallback(async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      return;
    }

    if (!movieDetail) return;

    try {
      const currentMovieId = movieDetail._id;
      const isCurrentlyFavorite = isFavorite(currentMovieId);

      if (isCurrentlyFavorite) {
        // Remove from favorites
        const success = await removeFavorite(currentMovieId);
        if (success) {
          toast.success("Đã xóa khỏi danh sách yêu thích");
        }
      } else {
        // Add to favorites - Fix structure for all movie types
        const movieData = {
          movieId: movieDetail._id,
          name: movieDetail.name,
          slug: movieDetail.slug,
          thumbUrl: movieDetail.thumb_url || "",
          posterUrl: movieDetail.poster_url || "",
          // Ensure type is never empty - explicitly set single movies to 'single'
          type: movieDetail.type === "single" ? "movie" : // Chuyển đổi 'single' -> 'movie'
          movieDetail.type === "movie" ? "movie" : // Giữ nguyên nếu đã là movie
          movieDetail.type || "movie", // Mặc định là 'movie'
          // Make sure year is a non-empty string
          year: typeof movieDetail.year === 'number' ? 
                movieDetail.year.toString() : 
                movieDetail.year?.toString() || "2023",
          // Ensure quality has a default value
          quality: movieDetail.quality || "HD",
          // Optional field, can be empty
          origin_name: movieDetail.origin_name || ""
        };
        
        console.log("Sending movie data:", movieData); // Debug the payload
        
        const success = await addFavorite(movieData);
        if (success) {
          toast.success("Đã thêm vào danh sách yêu thích");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Có lỗi xảy ra khi thực hiện thao tác");
    }
  }, [movieDetail, user, isFavorite, addFavorite, removeFavorite]);

  // Check if the current movie is in favorites
  const isCurrentMovieFavorite = movieDetail ? isFavorite(movieDetail._id) : false;

  // Handle player errors
  const handlePlayerError = () => {
    setPlayerError(true);
  };

  // Reset player error when changing episodes
  // Trong MovieDetailPage
  useEffect(() => {
    if (selectedEpisode) {
      const serverContainingEpisode = episodes.find((server) =>
        server.server_data.some((ep) => ep.slug === selectedEpisode.slug)
      );
      if (serverContainingEpisode) {
        setSelectedServer(serverContainingEpisode.server_name);
      }
    }
  }, [selectedEpisode, episodes]);

  // Carousel scroll handlers
  const handlePrevScroll = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -carouselRef.current.offsetWidth * 0.75, behavior: 'smooth' });
    }
  };

  const handleNextScroll = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: carouselRef.current.offsetWidth * 0.75, behavior: 'smooth' });
    }
  };

  // Navigate to a similar movie
  const handleSimilarMovieClick = (movieSlug: string) => {
    navigate(`/movie/${movieSlug}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Loader />
      </div>
    );
  }

  if (error || !movieDetail) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 p-4">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-red-500 text-xl font-bold mb-4">Lỗi</h2>
          <p className="text-white mb-6">
            {error || "Không tìm thấy thông tin phim"}
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => window.location.reload()}
            icon={<FiRefreshCw />}
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // Helper function to format image URLs
  const getImageUrl = (url?: string) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `https://phimimg.com/${url}`;
  };

  // Current server episodes
  const currentServerEpisodes =
    episodes.find((server) => server.server_name === selectedServer)
      ?.server_data || [];

  // Check if movie is a series or has multiple episodes
  const isSeriesOrMultiEpisode =
    movieDetail.type === "series" ||
    movieDetail.type === "hoathinh" ||
    movieDetail.type === "tvshows" ||
    (episodes.length > 0 && episodes[0].server_data.length > 1);

  return (
    <div className="bg-gray-900 min-h-screen pb-12 relative">
      {/* Conditional rendering based on showPlayer state */}
      {!showPlayer ? (
        // Hero Banner - Only show when player is hidden
        <div
          className="w-full h-[30vh] md:h-[40vh] lg:h-[80vh] bg-center bg-cover relative z-0"
          style={{
            backgroundImage: `url(${getImageUrl(
              movieDetail.thumb_url || movieDetail.poster_url
            )})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
        </div>
      ) : (
        // Video Player Section - Show when player is visible
        <div className="w-full bg-gray-900 pt-6">
          <div className="container mx-auto px-4">
            <div
              id="video-player"
              className="w-full rounded-lg overflow-hidden shadow-xl"
            >
              {selectedEpisode && (
                <>
                  <VideoPlayer
                    url={selectedEpisode.link_m3u8}
                    thumbnail={getImageUrl(
                      movieDetail.thumb_url || movieDetail.poster_url
                    )}
                    onError={handlePlayerError}
                    episodes={currentServerEpisodes} // Thêm dòng này
                    currentEpisodeIndex={currentServerEpisodes.findIndex(
                      (ep) => ep.slug === selectedEpisode.slug
                    )}
                    onEpisodeChange={(index) => {
                      const newEpisode = currentServerEpisodes[index];
                      setSelectedEpisode(newEpisode);
                    }}
                  />

                  {/* Show error UI if the player fails */}
                  {playerError && (
                    <div className="bg-gray-800 p-4 mt-2 rounded-lg">
                      <p className="text-yellow-500 font-medium mb-2">
                        Không thể phát video từ server này.
                      </p>
                      <p className="text-gray-300 text-sm">
                        Vui lòng thử chọn server khác hoặc tải lại trang.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 mt-10 relative">
        {/* Movie Content */}
        <div
          className={`flex flex-col md:flex-row md:space-x-8 ${
            !showPlayer ? "-mt-32" : "mt-8"
          } relative z-10`}
        >
          {/* Poster */}
          <div className="md:w-1/3 lg:w-1/4 mb-6 md:mb-0">
            <div className="rounded-lg overflow-hidden shadow-2xl">
              <img
                src={getImageUrl(
                  movieDetail.poster_url || movieDetail.thumb_url
                )}
                alt={movieDetail.name}
                className="w-full object-cover"
              />
            </div>

            {/* Mobile Action Buttons */}
            <div className="mt-4 flex flex-col space-y-3 md:hidden">
              {selectedEpisode && (
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleWatchMovie}
                  icon={<FiPlay />}
                >
                  Xem Phim
                </Button>
              )}

              <Button
                variant={isCurrentMovieFavorite ? "secondary" : "outline"}
                size="md"
                fullWidth
                onClick={handleToggleFavorite}
                icon={
                  isCurrentMovieFavorite ? (
                    <HeartSolid className="w-5 h-5 text-rose-500" />
                  ) : (
                    <HeartOutline className="w-5 h-5" />
                  )
                }
              >
                {isCurrentMovieFavorite ? "Đã Thích" : "Yêu Thích"}
              </Button>
            </div>
          </div>

          {/* Movie Details */}
          <div className="md:w-2/3 lg:w-3/4">
            {/* Title and Original Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {movieDetail.name}
            </h1>

            {movieDetail.origin_name &&
              movieDetail.origin_name !== movieDetail.name && (
                <h2 className="text-gray-400 text-lg mb-4">
                  {movieDetail.origin_name}
                </h2>
              )}

            {/* Status and Info Pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {movieDetail.quality && (
                <span className="bg-red-600 text-white px-2 py-1 text-xs font-medium rounded">
                  {movieDetail.quality}
                </span>
              )}

              {movieDetail.lang && (
                <span className="bg-blue-600 text-white px-2 py-1 text-xs font-medium rounded">
                  {movieDetail.lang}
                </span>
              )}

              {movieDetail.year && (
                <span className="bg-gray-700 text-white px-2 py-1 text-xs font-medium rounded">
                  {movieDetail.year}
                </span>
              )}

              {movieDetail.time && (
                <span className="bg-gray-700 text-white px-2 py-1 text-xs font-medium rounded">
                  {movieDetail.time}
                </span>
              )}

              {movieDetail.episode_current && (
                <span className="bg-green-600 text-white px-2 py-1 text-xs font-medium rounded">
                  {movieDetail.episode_current}
                </span>
              )}
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex space-x-4 mb-6">
              {selectedEpisode && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleWatchMovie}
                  icon={<FiPlay />}
                >
                  Xem Phim
                </Button>
              )}

              <Button
                variant={isCurrentMovieFavorite ? "secondary" : "outline"}
                size="md"
                onClick={handleToggleFavorite}
                icon={
                  isCurrentMovieFavorite ? (
                    <HeartSolid className="w-5 h-5 text-rose-500" />
                  ) : (
                    <HeartOutline className="w-5 h-5" />
                  )
                }
              >
                {isCurrentMovieFavorite ? "Đã Thích" : "Yêu Thích"}
              </Button>
            </div>

            {/* Server Selection */}
            {episodes.length > 1 && (
              <div className="mb-6">
                <h3 className="text-white text-lg font-medium mb-3">
                  Chọn Server:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {episodes.map((server) => (
                    <Button
                      key={server.server_name}
                      variant={
                        selectedServer === server.server_name
                          ? "primary"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleServerChange(server.server_name)}
                    >
                      {server.server_name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Episode List */}
          {/* Episode List */}
{isSeriesOrMultiEpisode && (
  <div className="mb-6">
    <h3 className="text-white text-lg font-medium mb-3">Tập Phim:</h3>
    
    {/* Pagination controls */}
    {currentServerEpisodes.length > 50 && (
      <div className="flex flex-wrap gap-2 mb-3">
        {Array.from({ length: Math.ceil(currentServerEpisodes.length / 50) }).map((_, index) => {
          const start = index * 50;
          const end = Math.min((index + 1) * 50, currentServerEpisodes.length);
          
          return (
            <button
            key={index}
            onClick={() => setCurrentChunkIndex(index)}
            className={`
              px-3 py-1 text-sm rounded-md transition-colors
              ${
                currentChunkIndex === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            `}
          >
            {start + 1}-{end} {/* Hiển thị số tập chính xác */}
          </button>
          );
        })}
      </div>
    )}

  
{/* Episode List */}
{isSeriesOrMultiEpisode && (
  <div className="mb-6">

    

    {/* Episode grid - Giữ nguyên sử dụng component Button */}
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
      {currentServerEpisodes
        .slice(currentChunkIndex * 50, (currentChunkIndex + 1) * 50)
        .map((episode) => (
          <Button
            key={`${selectedServer}-${episode.slug}`}
            variant={
              selectedEpisode?.slug === episode.slug
                ? "primary"
                : "outline"
            }
            size="sm"
            onClick={() => handleEpisodeSelect(episode)}
            className="!w-auto !h-auto py-2"
          >
            {episode.name}
          </Button>
        ))}
    </div>
  </div>
)}
  </div>
)}
            {/* Movie Description */}
            {movieDetail.content && (
              <div className="mb-6">
                <h3 className="text-white text-lg font-medium mb-2">
                  Nội dung phim:
                </h3>
                <div
                  className="text-gray-300"
                  dangerouslySetInnerHTML={{ __html: movieDetail.content }}
                ></div>
              </div>
            )}

            {/* Movie Info */}
            <div className="space-y-4 text-sm">
              {/* Categories */}
              {movieDetail.category && movieDetail.category.length > 0 && (
                <div className="flex flex-wrap">
                  <span className="text-gray-400 font-medium w-24">
                    Thể loại:
                  </span>
                  <div className="flex-1 text-white">
                    {movieDetail.category.map((cat, idx) => (
                      <React.Fragment key={cat.id}>
                        <span className="hover:text-red-500 cursor-pointer">
                          {cat.name}
                        </span>
                        {idx < movieDetail.category!.length - 1 && (
                          <span className="mx-1">•</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Countries */}
              {movieDetail.country && movieDetail.country.length > 0 && (
                <div className="flex flex-wrap">
                  <span className="text-gray-400 font-medium w-24">
                    Quốc gia:
                  </span>
                  <div className="flex-1 text-white">
                    {movieDetail.country.map((country, idx) => (
                      <React.Fragment key={country.id}>
                        <span className="hover:text-red-500 cursor-pointer">
                          {country.name}
                        </span>
                        {idx < movieDetail.country!.length - 1 && (
                          <span className="mx-1">•</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Directors */}
              {movieDetail.director && movieDetail.director.length > 0 && (
                <div className="flex flex-wrap">
                  <span className="text-gray-400 font-medium w-24">
                    Đạo diễn:
                  </span>
                  <div className="flex-1 text-white">
                    {movieDetail.director.join(", ")}
                  </div>
                </div>
              )}

              {/* Actors */}
              {movieDetail.actor && movieDetail.actor.length > 0 && (
                <div className="flex flex-wrap">
                  <span className="text-gray-400 font-medium w-24">
                    Diễn viên:
                  </span>
                  <div className="flex-1 text-white">
                    {movieDetail.actor.join(", ")}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Movies Section */}
      <div className="justify-center items-center bg-gray-900 p-4 max-w-6xl mx-auto">
  {similarMovies.length > 0 && (
    <div className="mt-8 pb-4">
      <h2 className="text-xl font-bold text-white mb-3">Phim tương tự</h2>
      
      <div className="relative">
        <button 
          onClick={handlePrevScroll}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-60 p-1.5 rounded-full hover:bg-opacity-80 transition-all"
        >
          <FiChevronLeft className="text-white text-xl" />
        </button>
        
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loadingSimilar ? (
            <div className="flex justify-center items-center w-full py-6">
              <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            similarMovies.map((movie) => (
              <div 
                key={movie._id} 
                className="flex-none w-32 sm:w-40 snap-start cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src={movie.poster_url || movie.thumb_url || DEFAULT_IMAGE}
                    alt={movie.name}
                    className="w-full h-48 sm:h-56 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_IMAGE;
                    }}
                  />
                  {movie.quality && (
                    <span className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded">
                      {movie.quality}
                    </span>
                  )}
                </div>
                <h3 className="text-white font-medium mt-1 line-clamp-1 text-sm">{movie.name}</h3>
                {movie.year && (
                  <span className="text-gray-400 text-xs">{movie.year}</span>
                )}
              </div>
            ))
          )}
        </div>
        
        <button 
          onClick={handleNextScroll}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-60 p-1.5 rounded-full hover:bg-opacity-80 transition-all"
        >
          <FiChevronRight className="text-white text-xl" />
        </button>
      </div>
    </div>
  )}
</div>
    </div>
  );
};

export default MovieDetailPage;
