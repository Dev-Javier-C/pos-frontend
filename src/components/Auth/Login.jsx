import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { state: appState } = useApp();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // For demo purposes, we'll simulate authentication
      // In production, this would be an API call
      const user = appState.users.find(u => 
        u.username === credentials.username && u.password === credentials.password
      );

      if (!user) {
        throw new Error('Invalid username or password');
      }

      // Login successful
      await login(user);
      
      // Redirect to the page they were trying to access, or dashboard
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900 placeholder-gray-500'} rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Username"
                value={credentials.username}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${theme === 'dark' ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900 placeholder-gray-500'} rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={credentials.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className={`rounded-md ${theme === 'dark' ? 'bg-red-900' : 'bg-red-50'} p-4`}>
              <div className="flex">
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-red-200' : 'text-red-800'}`}>
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className={`flex items-center justify-center px-4 py-2 border ${
                theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-5 w-5 mr-2" />
                  Switch to Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5 mr-2" />
                  Switch to Dark Mode
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 