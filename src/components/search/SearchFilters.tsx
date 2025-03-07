import React from 'react';
import { FiFilter, FiChevronDown } from 'react-icons/fi';

export interface FilterOptions {
  genre?: string;
  year?: string;
  country?: string;
  type?: 'movie' | 'tvshow' | 'all';
  sort?: 'relevance' | 'latest' | 'oldest' | 'rating';
}

interface SearchFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  className?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFilterChange, className = '' }) => {
  const [showFilters, setShowFilters] = React.useState(false);

  const genres = [
    { id: '', name: 'All Genres' },
    { id: 'action', name: 'Action' },
    { id: 'comedy', name: 'Comedy' },
    { id: 'drama', name: 'Drama' },
    { id: 'horror', name: 'Horror' },
    { id: 'sci-fi', name: 'Sci-Fi' },
    { id: 'romance', name: 'Romance' },
  ];

  const years = [
    { id: '', name: 'All Years' },
    ...Array.from({ length: 50 }, (_, i) => {
      const year = new Date().getFullYear() - i;
      return { id: year.toString(), name: year.toString() };
    }),
  ];

  const countries = [
    { id: '', name: 'All Countries' },
    { id: 'us', name: 'United States' },
    { id: 'kr', name: 'South Korea' },
    { id: 'jp', name: 'Japan' },
    { id: 'cn', name: 'China' },
    { id: 'vn', name: 'Vietnam' },
  ];

  const types = [
    { id: 'all', name: 'All Types' },
    { id: 'movie', name: 'Movies' },
    { id: 'tvshow', name: 'TV Shows' },
  ];

  const sortOptions = [
    { id: 'relevance', name: 'Relevance' },
    { id: 'latest', name: 'Latest' },
    { id: 'oldest', name: 'Oldest' },
    { id: 'rating', name: 'Rating' },
  ];

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <FiFilter />
          <span>Filters</span>
          <FiChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Sort by:</span>
          <select
            value={filters.sort || 'relevance'}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-800 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Genre</label>
            <select
              value={filters.genre || ''}
              onChange={(e) => handleFilterChange('genre', e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Year</label>
            <select
              value={filters.year || ''}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Country</label>
            <select
              value={filters.country || ''}
              onChange={(e) => handleFilterChange('country', e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
            <select
              value={filters.type || 'all'}
              onChange={(e) => handleFilterChange('type', e.target.value as 'movie' | 'tvshow' | 'all')}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
