import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';

const NavLink = ({ to, icon: Icon, children, onClick }) => {
  const location = useLocation();
  const { theme } = useTheme();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        isActive
          ? theme === 'dark'
            ? 'bg-gray-700 text-indigo-400 shadow-lg shadow-gray-900/50'
            : 'bg-indigo-100 text-indigo-700'
          : theme === 'dark'
            ? 'text-gray-300 hover:bg-gray-700 hover:text-indigo-300 hover:shadow-md hover:shadow-gray-900/30'
            : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className={`h-5 w-5 transition-transform duration-200 ${theme === 'dark' && !isActive ? 'group-hover:scale-110' : ''}`} />
      <span>{children}</span>
    </Link>
  );
};

const Navigation = () => {
  const { state: { isAuthenticated, user }, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (!isAuthenticated) return null;

  const isAdmin = user.role === 'admin';
  const isManager = user.role === 'manager';

  return (
    <nav className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <span className={`ml-2 text-xl font-semibold transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'text-white group-hover:text-indigo-400' 
                  : 'text-gray-900'
              }`}>
                IMS
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <NavLink to="/dashboard" icon={LayoutDashboard}>
              Dashboard
            </NavLink>
            <NavLink to="/inventory" icon={Package}>
              Inventory
            </NavLink>
            {(isAdmin || isManager) && (
              <NavLink to="/audit" icon={ClipboardList}>
                Audit Logs
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/users" icon={Users}>
                Users
              </NavLink>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-indigo-300 hover:shadow-md hover:shadow-gray-900/30'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
              ) : (
                <Moon className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={toggleProfileDropdown}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-indigo-300 hover:shadow-md hover:shadow-gray-900/30'
                    : 'text-gray-600 hover:bg-gray-100'
                } focus:outline-none`}
              >
                <span>{user.username}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-48 ${
                  theme === 'dark'
                    ? 'bg-gray-800 ring-1 ring-gray-700'
                    : 'bg-white'
                } rounded-lg shadow-lg py-1 z-10`}>
                  <Link
                    to="/settings"
                    className={`block px-4 py-2 transition-all duration-200 ${
                      theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-indigo-300'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </div>
                  </Link>
                  <button
                    onClick={logout}
                    className={`block w-full text-left px-4 py-2 transition-all duration-200 ${
                      theme === 'dark'
                        ? 'text-red-400 hover:bg-gray-700 hover:text-red-300'
                        : 'text-red-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Theme Toggle for Mobile */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-200 ${
                theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-indigo-300'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
              ) : (
                <Moon className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
              )}
            </button>

            <button
              onClick={toggleMobileMenu}
              className={`transition-colors duration-200 ${
                theme === 'dark'
                  ? 'text-gray-300 hover:text-indigo-300'
                  : 'text-gray-500 hover:text-gray-600'
              } focus:outline-none`}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className={`px-2 pt-2 pb-3 space-y-1 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <NavLink
              to="/dashboard"
              icon={LayoutDashboard}
              onClick={closeMobileMenu}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/inventory"
              icon={Package}
              onClick={closeMobileMenu}
            >
              Inventory
            </NavLink>
            {(isAdmin || isManager) && (
              <NavLink
                to="/audit"
                icon={ClipboardList}
                onClick={closeMobileMenu}
              >
                Audit Logs
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/users"
                icon={Users}
                onClick={closeMobileMenu}
              >
                Users
              </NavLink>
            )}

            {/* Profile Section in Mobile Menu */}
            <div className={`pt-4 pb-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="px-2 space-y-1">
                <Link
                  to="/settings"
                  onClick={closeMobileMenu}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-indigo-300'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    logout();
                  }}
                  className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    theme === 'dark'
                      ? 'text-red-400 hover:bg-gray-700 hover:text-red-300'
                      : 'text-red-600 hover:bg-gray-100'
                  }`}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 