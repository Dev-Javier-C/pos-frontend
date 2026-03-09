import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import inventoryService from '../../services/inventoryService';
import auditService from '../../services/auditService';
import { 
  AlertTriangle,
  TrendingUp,
  Package,
  DollarSign,
  Clock,
  Activity,
  ShoppingCart,
  Users
} from 'lucide-react';
import { format } from 'date-fns';

const MetricCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
  const { theme } = useTheme();
  
  const getColorClasses = () => {
    if (theme === 'dark') {
      switch (color) {
        case 'green':
          return 'bg-green-900/30 text-green-400';
        case 'yellow':
          return 'bg-yellow-900/30 text-yellow-400';
        case 'purple':
          return 'bg-purple-900/30 text-purple-400';
        default:
          return 'bg-blue-900/30 text-blue-400';
      }
    }
    return `bg-${color}-100 text-${color}-600`;
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-lg shadow-sm border transition-colors duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{title}</p>
          <p className={`mt-2 text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          {trend && (
            <p className={`mt-2 text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${getColorClasses()}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

const RecentActivity = ({ activities }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-lg shadow-sm border transition-colors duration-200`}>
      <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Recent Activity</h3>
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Activity className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {activity.action} - {activity.entityType}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>No recent activity</p>
        )}
      </div>
    </div>
  );
};

const LowStockAlert = ({ items }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-lg shadow-sm border transition-colors duration-200`}>
      <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Low Stock Alerts</h3>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className={`h-5 w-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  Current stock: {item.quantity} (Min: {item.minStock})
                </p>
              </div>
            </div>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
              Order needed
            </span>
          </div>
        ))}
        {items.length === 0 && (
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>No low stock alerts</p>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { state: { user } } = useAuth();
  const { state: appState } = useApp();
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get inventory items
        const items = await inventoryService.getItems();
        
        // Calculate metrics
        const totalItems = items.length;
        const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const lowStockItems = items.filter(item => item.quantity <= (item.minStock || 5));
        
        // Get recent activities
        const recentLogs = await auditService.getLogs({
          limit: 5,
          sortBy: 'timestamp',
          sortDirection: 'desc'
        });

        setMetrics({
          totalItems,
          totalValue,
          lowStockItems,
          recentActivities: recentLogs
        });

        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Welcome back, {user.firstName}!
        </h2>
        <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Here's what's happening with your inventory today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Items"
          value={metrics.totalItems}
          icon={Package}
          trend={5}
        />
        <MetricCard
          title="Total Value"
          value={`$${metrics.totalValue.toFixed(2)}`}
          icon={DollarSign}
          trend={8}
          color="green"
        />
        <MetricCard
          title="Low Stock Items"
          value={metrics.lowStockItems.length}
          icon={AlertTriangle}
          color="yellow"
        />
        <MetricCard
          title="Active Users"
          value={appState.users.filter(u => u.isActive).length}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Two-column layout for additional widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <RecentActivity activities={metrics.recentActivities} />
        
        {/* Low Stock Alerts */}
        <LowStockAlert items={metrics.lowStockItems} />
      </div>
    </div>
  );
};

export default Dashboard; 