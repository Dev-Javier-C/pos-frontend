import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Search, Filter, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ITEM_CATEGORIES } from '../../types';

const AdvancedSearch = ({ onSearch, initialFilters = {} }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minQuantity: '',
    maxQuantity: '',
    ...initialFilters
  });
  const [savedPresets, setSavedPresets] = useState(() => {
    const saved = localStorage.getItem('searchPresets');
    return saved ? JSON.parse(saved) : [];
  });
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, onSearch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      minQuantity: '',
      maxQuantity: ''
    });
  };

  const savePreset = () => {
    if (!presetName.trim()) return;

    const newPreset = {
      id: Date.now(),
      name: presetName,
      filters: { ...filters }
    };

    const updatedPresets = [...savedPresets, newPreset];
    setSavedPresets(updatedPresets);
    localStorage.setItem('searchPresets', JSON.stringify(updatedPresets));
    setPresetName('');
    setShowSavePreset(false);
  };

  const loadPreset = (preset) => {
    setFilters(preset.filters);
  };

  const deletePreset = (presetId) => {
    const updatedPresets = savedPresets.filter(p => p.id !== presetId);
    setSavedPresets(updatedPresets);
    localStorage.setItem('searchPresets', JSON.stringify(updatedPresets));
  };

  const inputClasses = `w-full p-2 border rounded-lg transition-colors duration-200 ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
      : 'border-gray-200 focus:ring-2 focus:ring-blue-500'
  }`;

  const searchInputClasses = `pl-10 pr-4 py-2 w-full border rounded-lg transition-colors duration-200 ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
      : 'border-gray-200 focus:ring-2 focus:ring-blue-500'
  }`;

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${
      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
    } mb-6 transition-colors duration-200`}>
      {/* Basic Search Bar */}
      <div className="p-4 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-2.5 h-5 w-5 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
          }`} />
          <input
            type="text"
            name="search"
            placeholder="Search inventory..."
            className={searchInputClasses}
            value={filters.search}
            onChange={handleInputChange}
          />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-4 py-2 transition-colors duration-200 ${
            theme === 'dark'
              ? 'text-gray-300 hover:text-gray-100'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Filter className="h-5 w-5" />
          Advanced
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-4`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Category
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleInputChange}
                className={inputClasses}
              >
                <option value="">All Categories</option>
                {Object.entries(ITEM_CATEGORIES).map(([key, value]) => (
                  <option key={key} value={value}>
                    {key.charAt(0) + key.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={handleInputChange}
                  className={inputClasses}
                  min="0"
                  step="0.01"
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={handleInputChange}
                  className={inputClasses}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Quantity Range */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Quantity Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  name="minQuantity"
                  placeholder="Min"
                  value={filters.minQuantity}
                  onChange={handleInputChange}
                  className={inputClasses}
                  min="0"
                />
                <input
                  type="number"
                  name="maxQuantity"
                  placeholder="Max"
                  value={filters.maxQuantity}
                  onChange={handleInputChange}
                  className={inputClasses}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Presets and Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex-1 flex flex-wrap gap-2">
              {savedPresets.map(preset => (
                <div
                  key={preset.id}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-700'
                      : 'bg-gray-100'
                  }`}
                >
                  <button
                    onClick={() => loadPreset(preset)}
                    className={`text-sm transition-colors duration-200 ${
                      theme === 'dark'
                        ? 'text-gray-300 hover:text-gray-100'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {preset.name}
                  </button>
                  <button
                    onClick={() => deletePreset(preset.id)}
                    className={`transition-colors duration-200 ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {showSavePreset ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Preset name"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    className={inputClasses}
                  />
                  <button
                    onClick={savePreset}
                    className={`p-2 rounded transition-colors duration-200 ${
                      theme === 'dark'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowSavePreset(false)}
                    className={`p-2 rounded transition-colors duration-200 ${
                      theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSavePreset(true)}
                  className={`flex items-center gap-2 px-3 py-1 rounded transition-colors duration-200 ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-gray-100'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  Save Preset
                </button>
              )}

              <button
                onClick={clearFilters}
                className={`px-3 py-1 rounded transition-colors duration-200 ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-gray-100'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;