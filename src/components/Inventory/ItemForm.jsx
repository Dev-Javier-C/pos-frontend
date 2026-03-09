import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import inventoryService from '../../services/inventoryService';
import { X } from 'lucide-react';

const ItemForm = ({ item = null, onClose, onSave }) => {
  const { state: { user } } = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    price: 0,
    category: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        category: item.category
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let savedItem;
      if (item) {
        savedItem = await inventoryService.updateItem(item.id, formData, user.id);
      } else {
        savedItem = await inventoryService.addItem(formData, user.id);
      }
      onSave(savedItem);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = `w-full p-2 border rounded transition-colors duration-200 ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
      : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
  }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg w-full max-w-md transition-colors duration-200`}>
        <div className={`flex justify-between items-center p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {item ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button
            onClick={onClose}
            className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-200`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className={`mb-4 p-3 rounded ${theme === 'dark' ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-700'}`}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={inputClasses}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className={inputClasses}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  required
                  className={inputClasses}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={inputClasses}
              >
                <option value="">Select a category</option>
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="supplies">Supplies</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 ${
                theme === 'dark'
                  ? 'text-gray-300 hover:text-gray-100'
                  : 'text-gray-600 hover:text-gray-800'
              } transition-colors duration-200`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Saving...' : item ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm; 