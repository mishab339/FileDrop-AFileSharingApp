import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiUpload, FiFolder, FiHome } from 'react-icons/fi';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
              <FiUpload className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              FileShare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              <FiHome className="w-4 h-4" />
              <span>Home</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/folders"
                className={`nav-link ${isActive('/folders') ? 'active' : ''}`}
              >
                <FiFolder className="w-4 h-4" />
                <span>My Files</span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Storage indicator */}
                <div className="bg-white/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-200">
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold text-primary-600">
                      {user?.storageUsed ? Math.round((user.storageUsed / (1024 * 1024 * 1024)) * 100) / 100 : 0}GB
                    </span>
                    <span className="text-gray-400"> / {user?.maxStorage ? Math.round(user.maxStorage / (1024 * 1024 * 1024)) : 5}GB</span>
                  </div>
                </div>

                {/* User dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none bg-white/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-200 hover:bg-white/80 transition-all duration-200">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                      <FiUser className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-medium">{user?.name}</span>
                  </button>

                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 animate-slide-down">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl mx-2 transition-all duration-200"
                      >
                        <FiSettings className="w-5 h-5" />
                        <span>Profile Settings</span>
                      </Link>
                      
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-accent-50 hover:text-accent-700 rounded-xl mx-2 transition-all duration-200"
                        >
                          <FiUser className="w-5 h-5" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      
                      <div className="border-t border-gray-200 my-2 mx-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl mx-2 transition-all duration-200"
                      >
                        <FiLogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/60"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium py-1.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link
                to="/"
                className={`flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FiHome className="w-4 h-4" />
                <span>Home</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/folders"
                    className={`flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/folders') 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiFolder className="w-4 h-4" />
                    <span>My Files</span>
                  </Link>

                  <Link
                    to="/profile"
                    className={`flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/profile') 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiSettings className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className={`flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium ${
                        isActive('/admin') 
                          ? 'text-primary-600 bg-primary-50' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FiUser className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
