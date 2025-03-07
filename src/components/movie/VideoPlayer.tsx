import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiSkipForward,
  FiSkipBack,
  FiChevronRight,
  FiSettings,
  FiChevronsRight,
  FiChevronsLeft,
  FiX,
} from "react-icons/fi";
import { BiLoaderCircle } from "react-icons/bi";
import { TbGauge } from "react-icons/tb";
import { MdHighQuality } from "react-icons/md";

interface VideoPlayerProps {
  url: string;
  thumbnail?: string;
  onError?: () => void;
  episodes?: Episode[];
  currentEpisodeIndex?: number;
  onEpisodeChange?: (index: number) => void;
}

interface Episode {
  name: string;
  slug: string;
  link_m3u8: string;
}

// Available playback speeds
const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// Mock resolutions for the demo - actual resolutions would come from HLS manifest
const RESOLUTIONS = ["Auto", "1080p", "720p", "480p", "360p"];

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  thumbnail,
  onError,
  episodes = [],
  currentEpisodeIndex = 0,
  onEpisodeChange,
}) => {
  // Core video state
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [error, setError] = useState<any>(null);

  // Add focus state to track keyboard control availability
  const [isFocused, setIsFocused] = useState(false);

  // Track if video has started playing to avoid using the light prop after initial play
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

  // New state for additional features
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentResolution, setCurrentResolution] = useState("Auto");
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showResolutionMenu, setShowResolutionMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // Refs
  const playerRef = useRef<ReactPlayer>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Add new refs for seeking state management
  const isSeeking = useRef(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  // Add retry count ref for error handling
  const MAX_RETRIES = 3;
  const retryCount = useRef(0);

  // Calculate if next/previous episodes are available
  const hasNextEpisode =
    episodes.length > 0 && currentEpisodeIndex < episodes.length - 1;
  const hasPrevEpisode = episodes.length > 0 && currentEpisodeIndex > 0;

  // Hide controls after inactivity
  useEffect(() => {
    if (controlsVisible) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      controlsTimeoutRef.current = setTimeout(() => {
        if (
          playing &&
          !showSettingsMenu &&
          !showSpeedMenu &&
          !showResolutionMenu
        ) {
          setControlsVisible(false);
        }
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [
    controlsVisible,
    playing,
    showSettingsMenu,
    showSpeedMenu,
    showResolutionMenu,
  ]);

  // Add effect to handle focus events
  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const container = playerContainerRef.current;
    if (container) {
      container.addEventListener("focus", handleFocus);
      container.addEventListener("blur", handleBlur);
    }

    return () => {
      if (container) {
        container.removeEventListener("focus", handleFocus);
        container.removeEventListener("blur", handleBlur);
      }
    };
  }, []);

  // Add effect to handle episode changes and load the new video
  useEffect(() => {
    if (episodes.length > 0) {
      const newUrl = episodes[currentEpisodeIndex].link_m3u8;
      // Don't reload if it's the initial render and the URL matches
      if (playerRef.current && newUrl !== url) {
        playerRef.current.seekTo(0);
        setPlayed(0);
        setHasStartedPlaying(false);
        setPlaying(true);
        // Reset retry count when changing episodes
        retryCount.current = 0;
      }
    }
  }, [currentEpisodeIndex, episodes]);

  // Basic player controls - modified play/pause handler
  const handlePlayPause = () => {
    // If playing for the first time, mark as started
    if (!hasStartedPlaying && !playing) {
      setHasStartedPlaying(true);
    }
    setPlaying(!playing);
  };

  const handleMute = () => {
    setMuted(!muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && muted) {
      setMuted(false);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPlayed = parseFloat(e.target.value);
    setPlayed(newPlayed);
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const newTime = parseFloat(target.value);

    // Skip if currently seeking to prevent multiple rapid seek operations
    if (isSeeking.current) return;

    isSeeking.current = true;
    playerRef.current?.seekTo(newTime);

    // Reset seeking state after a delay
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      isSeeking.current = false;
    }, 500);
  };

  const handleProgress = (state: { played: number; loaded: number }) => {
    // Don't update if controls are hidden or if user is currently seeking
    if (!controlsVisible || isSeeking.current) return;
    setPlayed(state.played);
    setLoaded(state.loaded);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  // Enhanced buffer handling
  const handleBuffer = () => {
    setBuffering(true);
    // Increase buffer when loading
    const player = playerRef.current?.getInternalPlayer();
    if (player?.hls?.config) {
      player.hls.config.maxBufferLength = 60;
    }
  };

  const handleBufferEnd = () => {
    setBuffering(false);
  };

  // Enhanced error handling with retry logic
  const handleError = (err: any) => {
    console.error("Video playback error:", err);
    
    // Classify error type
    const errorMessage = err?.message || String(err);
    const isNetworkError = errorMessage.includes('Network Error') || 
                          errorMessage.includes('network') || 
                          errorMessage.includes('fetch');
    const isHlsError = errorMessage.includes('hlsError') || 
                      errorMessage.includes('hls');

    if (retryCount.current < MAX_RETRIES) {
      retryCount.current += 1;
      console.log(`Retry attempt ${retryCount.current} of ${MAX_RETRIES}`);
      
      setTimeout(() => {
        if (isHlsError) {
          // For HLS-specific errors, reset the player completely
          setHasStartedPlaying(false);
          setTimeout(() => setPlaying(true), 1000);
        } else {
          // For other errors, just seek to current position and resume
          setPlaying(true);
          playerRef.current?.seekTo(played);
        }
      }, 2000);
      return;
    }

    // If all retries failed, show error
    setError(err);
    // Reset seeking state when an error occurs
    isSeeking.current = false;
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    if (onError) {
      onError();
    }
  };

  // Add handler for when video starts playing
  const handlePlay = () => {
    setHasStartedPlaying(true);
  };

  // New functionality
  const handleForward = () => {
    const player = playerRef.current;
    if (player) {
      const currentTime = player.getCurrentTime();
      const newTime = Math.min(currentTime + 10, duration);
      player.seekTo(newTime);
    }
  };

  const handleRewind = () => {
    const player = playerRef.current;
    if (player) {
      const currentTime = player.getCurrentTime();
      const newTime = Math.max(currentTime - 10, 0);
      player.seekTo(newTime);
    }
  };

  const handleNextEpisode = () => {
    if (hasNextEpisode && onEpisodeChange) {
      onEpisodeChange(currentEpisodeIndex + 1);
      // Reset player state
      setHasStartedPlaying(false);
      setPlaying(true);
      setError(null);
    }
  };

  const handlePrevEpisode = () => {
    if (hasPrevEpisode && onEpisodeChange) {
      onEpisodeChange(currentEpisodeIndex - 1);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const handleResolutionChange = (resolution: string) => {
    setCurrentResolution(resolution);
    setShowResolutionMenu(false);
    // In a real implementation, you'd switch the HLS quality here
  };

  const toggleSettings = () => {
    setShowSettingsMenu(!showSettingsMenu);
    setShowSpeedMenu(false);
    setShowResolutionMenu(false);
  };

  const toggleSpeedMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSpeedMenu(!showSpeedMenu);
    setShowResolutionMenu(false);
  };

  const toggleResolutionMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowResolutionMenu(!showResolutionMenu);
    setShowSpeedMenu(false);
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const showControls = () => {
    setControlsVisible(true);
  };

  // Add keyboard controls handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isFocused) return;

    switch (e.key) {
      case "ArrowLeft":
        handleRewind();
        e.preventDefault();
        break;
      case "ArrowRight":
        handleForward();
        e.preventDefault();
        break;
      case "ArrowUp":
        setVolume((v) => {
          const newVolume = Math.min(v + 0.1, 1);
          if (newVolume > 0 && muted) setMuted(false);
          return newVolume;
        });
        e.preventDefault();
        break;
      case "ArrowDown":
        setVolume((v) => {
          const newVolume = Math.max(v - 0.1, 0);
          if (newVolume === 0 && !muted) setMuted(true);
          return newVolume;
        });
        e.preventDefault();
        break;
      case " ": // Space key for play/pause
        handlePlayPause();
        e.preventDefault();
        break;
    }
  };

  // Clean up timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Add heartbeat to maintain connection
  useEffect(() => {
    const heartbeat = setInterval(() => {
      if (playerRef.current && playing) {
        // Send HEAD request to keep the connection alive
        fetch(url, { method: 'HEAD' }).catch(() => {});
      }
    }, 300000); // 5 minutes

    return () => clearInterval(heartbeat);
  }, [playing, url]);

  return (
    <div
      ref={playerContainerRef}
      tabIndex={0} // Make the container focusable
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
      onMouseMove={showControls}
      onClick={(e) => {
        handlePlayPause();
        playerContainerRef.current?.focus();
      }}
      onKeyDown={handleKeyDown}
    >
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-50">
          <span className="text-red-500 text-lg mb-2">
            Video không tải được
          </span>
          <p className="text-sm text-gray-300">
            Vui lòng thử lại hoặc chọn server khác
          </p>
        </div>
      )}

      {/* Enhanced buffering UI */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
          <div className="flex flex-col items-center">
            <BiLoaderCircle className="animate-spin text-white" size={48} />
            <span className="text-white mt-2">Đang tải...</span>
          </div>
        </div>
      )}

      {/* Modified ReactPlayer - only use light prop for initial load */}
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={playing}
        volume={volume}
        muted={muted}
        playbackRate={playbackSpeed}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onBuffer={handleBuffer}
        onBufferEnd={handleBufferEnd}
        onError={handleError}
        onPlay={handlePlay}
        // Only use light prop before video has ever played
        light={!hasStartedPlaying && thumbnail ? thumbnail : false}
        config={{
          file: {
            forceHLS: true,
            hlsOptions: {
              maxLoadingDelay: 4,
              maxBufferLength: 60,
              maxBufferSize: 60 * 1000 * 1000, // 60MB
              liveSyncDuration: 30,
              debug: false,
              lowLatencyMode: false,
              startLevel: -1, // Auto
            },
            attributes: {
              poster: hasStartedPlaying ? undefined : thumbnail,
              controlsList: "nodownload",
            },
          },
        }}
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      {/* Center Play Button - Only show when paused and video has started */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
        onClick={(e) => e.stopPropagation()}
      >
        {!playing && hasStartedPlaying && controlsVisible && (
          <button
            className="bg-white/30 backdrop-blur-sm rounded-full p-4 hover:bg-white/50 transition-colors"
            onClick={handlePlayPause}
          >
            <FiPlay className="text-white" size={24} />
          </button>
        )}
      </div>

      {/* Custom Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 
          transition-opacity duration-300 flex flex-col justify-end
          ${
            controlsVisible && (playing || hasStartedPlaying)
              ? "opacity-100"
              : "opacity-0"
          }`}
        onClick={(e) => {
          e.stopPropagation(); // Prevent double triggering play/pause
          handlePlayPause();
          playerContainerRef.current?.focus(); // Ensure player gets focus
        }}
      >
        {/* Center Play/Pause Button */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          onClick={(e) => e.stopPropagation()}
        >
          {!playing && (
            <button
              className="bg-white/30 backdrop-blur-sm rounded-full p-4 hover:bg-white/50 transition-colors"
              onClick={handlePlayPause}
            >
              <FiPlay className="text-white" size={24} />
            </button>
          )}
        </div>



     
        {/* Next/Previous Episode Controls - Top Right */}
        {(hasNextEpisode || hasPrevEpisode) && (
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              disabled={!hasPrevEpisode}
              className={`bg-black/50 rounded-md px-3 py-1.5 text-white text-sm flex items-center ${
                !hasPrevEpisode
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-black/70 hover:text-red-500"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handlePrevEpisode();
              }}
            >
              <FiSkipBack size={16} className="mr-1" /> Tập trước
            </button>

            <button
              disabled={!hasNextEpisode}
              className={`bg-black/50 rounded-md px-3 py-1.5 text-white text-sm flex items-center ${
                !hasNextEpisode
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-black/70 hover:text-red-500"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleNextEpisode();
              }}
            >
              Tập sau <FiSkipForward size={16} className="ml-1" />
            </button>
          </div>
        )}
        {/* Controls Bar */}
        <div
          className="p-2 sm:p-4 flex flex-col gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-white text-xs sm:text-sm">
              {formatTime(duration * played)}
            </span>
            <div className="flex-1 group">
              <input
                type="range"
                min={0}
                max={0.999999}
                step="any"
                value={played}
                onChange={handleSeekChange}
                onMouseUp={handleSeekMouseUp}
                className="w-full cursor-pointer accent-red-500 h-1 bg-gray-400 rounded-full
                  group-hover:h-2 transition-all appearance-none"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${
                    played * 100
                  }%, rgba(255, 255, 255, 0.3) ${
                    played * 100
                  }%, rgba(255, 255, 255, 0.3) ${
                    loaded * 100
                  }%, rgba(255, 255, 255, 0.1) ${
                    loaded * 100
                  }%, rgba(255, 255, 255, 0.1) 100%)`,
                }}
              />
            </div>
            <span className="text-white text-xs sm:text-sm">
              {formatTime(duration)}
            </span>
          </div>

          

          {/* Controls buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-red-500 transition-colors"
              >
                {playing ? <FiPause size={20} /> : <FiPlay size={20} />}
              </button>

              <button
                onClick={handleRewind}
                className="text-white hover:text-red-500 transition-colors hidden sm:block"
              >
                <FiChevronsLeft size={20} />
              </button>

              <button
                onClick={handleForward}
                className="text-white hover:text-red-500 transition-colors hidden sm:block"
              >
                <FiChevronsRight size={20} />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleMute}
                  className="text-white hover:text-red-500 transition-colors"
                >
                  {muted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 accent-red-500 h-1 cursor-pointer hidden sm:block"
                />
              </div>

              {/* Current episode display */}
              {episodes.length > 1 && (
                <span className="text-white pl-5 text-xs hidden sm:block">
                  Tập {currentEpisodeIndex + 1}/{episodes.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Settings Menu */}
              <div className="relative">
                <button
                  onClick={toggleSettings}
                  className="text-white hover:text-red-500 transition-colors"
                >
                  <FiSettings
                    size={20}
                    className={showSettingsMenu ? "animate-spin" : ""}
                  />
                </button>

                {showSettingsMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden w-48">
                    <div className="py-1">
                      {/* Speed selection */}
                      <button
                        onClick={toggleSpeedMenu}
                        className="flex w-full items-center justify-between px-4 py-2 hover:bg-gray-700 text-white text-sm"
                      >
                        <div className="flex items-center">
                          <TbGauge className="mr-2" size={18} />
                          <span>Tốc độ</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-300">
                            {playbackSpeed}x
                          </span>
                          <FiChevronRight className="ml-1" size={16} />
                        </div>
                      </button>

                      {/* Resolution selection */}
                      <button
                        onClick={toggleResolutionMenu}
                        className="flex w-full items-center justify-between px-4 py-2 hover:bg-gray-700 text-white text-sm"
                      >
                        <div className="flex items-center">
                          <MdHighQuality className="mr-2" size={18} />
                          <span>Chất lượng</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-300">
                            {currentResolution}
                          </span>
                          <FiChevronRight className="ml-1" size={16} />
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Resolution Submenu */}

                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden w-48">
                    <div className="py-1">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 text-white">
                        <button
                          onClick={toggleSpeedMenu}
                          className="hover:text-gray-300"
                        >
                          <FiX size={16} />
                        </button>
                        <span className="text-sm font-medium">Tốc độ</span>
                        <div className="w-4"></div> {/* Spacer */}
                      </div>
                      {PLAYBACK_SPEEDS.map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`flex w-full items-center px-4 py-2 hover:bg-gray-700 text-sm ${
                            playbackSpeed === speed
                              ? "text-red-500 font-medium"
                              : "text-white"
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {showResolutionMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden w-48">
                    <div className="py-1">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 text-white">
                        <button
                          onClick={toggleResolutionMenu}
                          className="hover:text-gray-300"
                        >
                          <FiX size={16} />
                        </button>
                        <span className="text-sm font-medium">Chất lượng</span>
                        <div className="w-4"></div> {/* Spacer */}
                      </div>
                      {RESOLUTIONS.map((resolution) => (
                        <button
                          key={resolution}
                          onClick={() => handleResolutionChange(resolution)}
                          className={`flex w-full items-center px-4 py-2 hover:bg-gray-700 text-sm ${
                            currentResolution === resolution
                              ? "text-red-500 font-medium"
                              : "text-white"
                          }`}
                        >
                          {resolution}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen button */}
              <button
                onClick={toggleFullScreen}
                className="text-white hover:text-red-500 transition-colors"
              >
                <FiMaximize size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
