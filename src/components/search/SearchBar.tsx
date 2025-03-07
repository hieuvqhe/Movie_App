import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';

interface SearchSuggestion {
  id: string;
  name: string;
  slug: string;
  thumb?: string;
  year?: string;
}

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ initialQuery = '', onSearch, className = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle outside clicks to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      
      try {
        // In a real app, you'd call your API here
        // For now, we'll simulate a delay and return mock data
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockSuggestions = [
          { id: '1', name: 'The Matrix', slug: 'the-matrix', year: '1999', thumb: 'https://via.placeholder.com/50x75' },
          { id: '2', name: 'Matrix Reloaded', slug: 'matrix-reloaded', year: '2003', thumb: 'https://via.placeholder.com/50x75' },
          { id: '3', name: 'Matrix Revolutions', slug: 'matrix-revolutions', year: '2003', thumb: 'https://via.placeholder.com/50x75' },
        ].filter(movie => movie.name.toLowerCase().includes(query.toLowerCase()));
        
        setSuggestions(mockSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (query) fetchSuggestions();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    navigate(`/movie/${suggestion.slug}`);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setQuery('');
    setSuggestions([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for movies, TV shows, actors..."
            className="w-full bg-gray-800 text-white px-4 py-3 pl-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" size={20} />
          </div>
          {query && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
              onClick={handleClearSearch}
            >
              <FiX size={20} />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && query.length >= 2 && (
        <div 
          ref={suggestionsRef}
          className="absolute mt-2 w-full bg-gray-800 rounded-lg shadow-lg z-20 overflow-hidden border border-gray-700"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">Loading suggestions...</div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map(suggestion => (
                <li 
                  key={suggestion.id}
                  className="border-b border-gray-700 last:border-b-0"
                >
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-700 flex items-center"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.thumb && (
                      <img 
                        src={suggestion.thumb} 
                        alt={suggestion.name} 
                        className="w-8 h-12 object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="text-white font-medium">{suggestion.name}</div>
                      {suggestion.year && (
                        <div className="text-gray-400 text-sm">{suggestion.year}</div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-400">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
