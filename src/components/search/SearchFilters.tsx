import React from 'react';
import { FiFilter, FiChevronDown } from 'react-icons/fi';

export interface FilterOptions {
  category?: string;
  year?: string;
  country?: string;
  sort_field?: string;
  sort_type?: string;
  sort_lang?: string;
}

interface SearchFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  className?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFilterChange, className = '' }) => {
  const [showFilters, setShowFilters] = React.useState(false);

  const categories = [
    { id: '', name: 'Tất cả thể loại' },
    { id: 'hanh-dong', name: 'Hành Động' },
    { id: 'hai-huoc', name: 'Hài Hước' },
    { id: 'tinh-cam', name: 'Tình Cảm' },
    { id: 'tam-ly', name: 'Tâm Lý' },
    { id: 'khoa-hoc', name: 'Khoa Học' },
    { id: 'kinh-di', name: 'Kinh Dị' },
  ];

  const years = [
    { id: '', name: 'Tất cả năm' },
    ...Array.from({ length: 10 }, (_, i) => {
      const year = new Date().getFullYear() - i;
      return { id: year.toString(), name: year.toString() };
    }),
  ];

  const countries = [
    { id: '', name: 'Tất cả quốc gia' },
    { id: 'trung-quoc', name: 'Trung Quốc' },
    { id: 'han-quoc', name: 'Hàn Quốc' },
    { id: 'my', name: 'Mỹ' },
    { id: 'nhat-ban', name: 'Nhật Bản' },
    { id: 'viet-nam', name: 'Việt Nam' },
    { id: 'thai-lan', name: 'Thái Lan' },
  ];

  const sortFields = [
    { id: 'modified.time', name: 'Ngày cập nhật' },
    { id: '_id', name: 'ID phim' },
    { id: 'year', name: 'Năm phát hành' },
  ];

  const sortTypes = [
    { id: 'desc', name: 'Giảm dần' },
    { id: 'asc', name: 'Tăng dần' },
  ];

  const languages = [
    { id: '', name: 'Tất cả ngôn ngữ' },
    { id: 'vietsub', name: 'Vietsub' },
    { id: 'thuyet-minh', name: 'Thuyết minh' },
    { id: 'long-tieng', name: 'Lồng tiếng' },
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
          <span>Bộ lọc</span>
          <FiChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Sắp xếp:</span>
            <select
              value={filters.sort_field || 'modified.time'}
              onChange={(e) => handleFilterChange('sort_field', e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {sortFields.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={filters.sort_type || 'desc'}
              onChange={(e) => handleFilterChange('sort_type', e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-1 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {sortTypes.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-800 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Thể loại</label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Năm</label>
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
            <label className="block text-sm font-medium text-gray-400 mb-1">Quốc gia</label>
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
            <label className="block text-sm font-medium text-gray-400 mb-1">Ngôn ngữ</label>
            <select
              value={filters.sort_lang || ''}
              onChange={(e) => handleFilterChange('sort_lang', e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
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
