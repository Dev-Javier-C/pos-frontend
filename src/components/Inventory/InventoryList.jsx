import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import inventoryService from '../../services/inventoryService';
import { Edit, Trash, Plus } from 'lucide-react';
import ItemForm from './ItemForm';
import AdvancedSearch from './AdvancedSearch';

const InventoryList = () => {
  const { state: { user } } = useAuth();
  const { theme } = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  
  // Filtering and sorting state
  const [sortConfig, setSortConfig] = useState({ field: 'name', direction: 'asc' });

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Initial load
  useEffect(() => {
    loadItems();
  }, []);

  // Load inventory items
  const loadItems = async (filters = {}) => {
    try {
      setLoading(true);
      const items = await inventoryService.getItems(filters, sortConfig);
      setItems(items);
      setCurrentSearchTerm(filters.search || '');
      setError(null);
    } catch (err) {
      setError('Failed to load inventory items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    setSortConfig(prevSort => {
      const newConfig = {
        field,
        direction: prevSort.field === field && prevSort.direction === 'asc' ? 'desc' : 'asc'
      };
      loadItems({}, newConfig);
      return newConfig;
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await inventoryService.deleteItem(id, user.id);
      loadItems();
    } catch (err) {
      setError('Failed to delete item');
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setShowForm(true);
  };

  const handleSave = async (savedItem) => {
    await loadItems();
  };

  // Highlight search matches in text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    try {
      const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const parts = text.toString().split(new RegExp(`(${escapedSearchTerm})`, 'gi'));
      return parts.map((part, i) => 
        part.toLowerCase() === searchTerm.toLowerCase() ? 
          <span key={i} className={theme === 'dark' ? 'bg-yellow-500/30' : 'bg-yellow-200'}>{part}</span> : part
      );
    } catch (err) {
      console.error('Error highlighting text:', err);
      return text;
    }
  };

  const canEdit = user.role === 'admin' || user.role === 'manager';
  const canDelete = user.role === 'admin';

  if (loading) return (
    <div className={`flex justify-center p-8 ${theme === 'dark' ? 'text-gray-300' : ''}`}>
      Loading...
    </div>
  );
  
  if (error) return (
    <div className={`p-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
      {error}
    </div>
  );

  return (
    <div className="p-4">
      {/* Advanced Search Component */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <AdvancedSearch onSearch={loadItems} />
        </div>
        {canEdit && (
          <button
            className={`ml-4 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
              theme === 'dark'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            onClick={handleAdd}
          >
            <Plus className="h-5 w-5" />
            Add Item
          </button>
        )}
      </div>

      {/* Inventory Table */}
      <div className={`overflow-x-auto rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} transition-colors duration-200`}>
        <table className="min-w-full">
          <thead className={`${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
            <tr>
              <th 
                className={`px-6 py-3 text-left cursor-pointer ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Name
                  {sortConfig.field === 'name' && (
                    <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className={`px-6 py-3 text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Description</th>
              <th 
                className={`px-6 py-3 text-left cursor-pointer ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}
                onClick={() => handleSort('quantity')}
              >
                <div className="flex items-center gap-2">
                  Quantity
                  {sortConfig.field === 'quantity' && (
                    <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className={`px-6 py-3 text-left cursor-pointer ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center gap-2">
                  Price
                  {sortConfig.field === 'price' && (
                    <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className={`px-6 py-3 text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Category</th>
              {(canEdit || canDelete) && <th className={`px-6 py-3 text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Actions</th>}
            </tr>
          </thead>
          <tbody className={`${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
            {items.map(item => (
              <tr key={item.id} className={`${
                theme === 'dark'
                  ? 'hover:bg-gray-700/50'
                  : 'hover:bg-gray-50'
              } transition-colors duration-200`}>
                <td className={`px-6 py-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                  {highlightText(item.name, currentSearchTerm)}
                </td>
                <td className={`px-6 py-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                  {highlightText(item.description, currentSearchTerm)}
                </td>
                <td className={`px-6 py-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>{item.quantity}</td>
                <td className={`px-6 py-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>${item.price.toFixed(2)}</td>
                <td className={`px-6 py-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>{item.category}</td>
                {(canEdit || canDelete) && (
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {canEdit && (
                        <button
                          className={`transition-colors duration-200 ${
                            theme === 'dark'
                              ? 'text-blue-400 hover:text-blue-300'
                              : 'text-blue-600 hover:text-blue-800'
                          }`}
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className={`transition-colors duration-200 ${
                            theme === 'dark'
                              ? 'text-red-400 hover:text-red-300'
                              : 'text-red-600 hover:text-red-800'
                          }`}
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td 
                  colSpan={(canEdit || canDelete) ? 6 : 5} 
                  className={`px-6 py-4 text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}
                >
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Item Form Modal */}
      {showForm && (
        <ItemForm
          item={selectedItem}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default InventoryList; 