import React from 'react';

export interface Episode {
  name: string;
  slug: string;
  link_m3u8: string;
}

export interface ServerEpisode {
  server_name: string;
  server_data: Episode[];
}

interface EpisodeListProps {
  episodes: ServerEpisode[];
  selectedEpisode: Episode | null;
  onSelectEpisode: (episode: Episode) => void;
}

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, selectedEpisode, onSelectEpisode }) => {
  if (!episodes || episodes.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4 text-white">Danh sách tập phim</h3>
      
      {episodes.map((server, serverIndex) => (
        <div key={serverIndex} className="mb-6">
          <h4 className="text-red-500 font-medium mb-3 text-sm uppercase">
            {server.server_name}
          </h4>
          
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {server.server_data?.map((episode, episodeIndex) => {
              const episodeNumber = episode.name.replace('Tập ', '');
              const isSelected = selectedEpisode?.slug === episode.slug;
              
              return (
                <button
                  key={`${serverIndex}-${episodeIndex}`}
                  onClick={() => onSelectEpisode(episode)}
                  className={`
                    aspect-square flex justify-center items-center rounded-md text-white font-medium
                    transition-colors focus:outline-none
                    ${isSelected ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}
                  `}
                >
                  {episodeNumber}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EpisodeList;
