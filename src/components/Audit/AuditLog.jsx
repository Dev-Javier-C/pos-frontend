import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import auditService from '../../services/auditService';
import { Download, Filter, RefreshCw, Trash } from 'lucide-react';
import { format } from 'date-fns';

const AuditLog = () => {
  const { state: { user } } = useAuth();
  const { theme } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtering state
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    entityType: '',
    startDate: '',
    endDate: ''
  });

  // Load audit logs
  const loadLogs = async () => {
    try {
      setLoading(true);
      const logs = await auditService.getLogs(filters);
      setLogs(logs);
      setError(null);
    } catch (err) {
      setError('Failed to load audit logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle export
  const handleExport = async () => {
    try {
      const csvContent = await auditService.exportLogs(filters);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export logs');
      console.error(err);
    }
  };

  // Handle clear logs (admin only)
  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
      return;
    }

    try {
      await auditService.clearLogs();
      loadLogs();
    } catch (err) {
      setError('Failed to clear logs');
      console.error(err);
    }
  };

  const isAdmin = user.role === 'admin';

  const inputClasses = `px-3 py-2 border rounded-lg transition-colors duration-200 ${
    theme === 'dark'
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
      : 'border-gray-200 focus:ring-2 focus:ring-blue-500'
  }`;

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
      {/* Filter Bar */}
      <div className={`flex flex-wrap gap-4 mb-6 p-4 rounded-lg shadow transition-colors duration-200 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center gap-2">
          <Filter className={theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} />
          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Filters:</span>
        </div>
        
        <select
          name="action"
          className={inputClasses}
          value={filters.action}
          onChange={handleFilterChange}
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
        </select>

        <select
          name="entityType"
          className={inputClasses}
          value={filters.entityType}
          onChange={handleFilterChange}
        >
          <option value="">All Types</option>
          <option value="inventory_item">Inventory Item</option>
          <option value="user">User</option>
        </select>

        <input
          type="date"
          name="startDate"
          className={inputClasses}
          value={filters.startDate}
          onChange={handleFilterChange}
          placeholder="Start Date"
        />

        <input
          type="date"
          name="endDate"
          className={inputClasses}
          value={filters.endDate}
          onChange={handleFilterChange}
          placeholder="End Date"
        />

        <button
          onClick={loadLogs}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
            theme === 'dark'
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors duration-200"
        >
          <Download className="h-4 w-4" />
          Export
        </button>

        {isAdmin && (
          <button
            onClick={handleClearLogs}
            className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors duration-200"
          >
            <Trash className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Logs Table */}
      <div className={`overflow-x-auto rounded-lg shadow transition-colors duration-200 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <table className="min-w-full">
          <thead className={theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Timestamp
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Action
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Entity Type
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Entity ID
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                User
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                Changes
              </th>
            </tr>
          </thead>
          <tbody className={`${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
            {logs.map(log => (
              <tr key={log.id} className={`transition-colors duration-200 ${
                theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
              }`}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    theme === 'dark' ? (
                      log.action === 'create' ? 'bg-green-900/50 text-green-300' :
                      log.action === 'update' ? 'bg-blue-900/50 text-blue-300' :
                      log.action === 'delete' ? 'bg-red-900/50 text-red-300' :
                      'bg-gray-900/50 text-gray-300'
                    ) : (
                      log.action === 'create' ? 'bg-green-100 text-green-800' :
                      log.action === 'update' ? 'bg-blue-100 text-blue-800' :
                      log.action === 'delete' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    )
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {log.entityType}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {log.entityId}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  {log.user}
                </td>
                <td className={`px-6 py-4 text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  <pre className={`whitespace-pre-wrap font-mono text-xs ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {JSON.stringify(log.changes, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLog; 