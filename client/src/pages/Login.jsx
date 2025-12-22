import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowLeft } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <>
      <Helmet>
        <title>Login - FileShare</title>
        <meta name="description" content="Sign in to your FileShare account to access your files and upload new ones." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <FiMail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">FileShare</span>
            </Link>
          </div>
          <h2 className="mt-6 sm:mt-8 text-center text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 sm:mt-3 text-center text-sm sm:text-base text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
            >
              Create one now
            </Link>
          </p>
        </div>

        <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 backdrop-blur-sm py-6 sm:py-8 px-4 sm:px-6 md:px-10 shadow-xl border border-white/20 rounded-2xl">
            <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <FiMail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10 sm:pl-12 text-sm sm:text-base py-3 sm:py-3.5"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <FiLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base py-3 sm:py-3.5"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <FiEye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-0">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary inline-flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base py-3 sm:py-3.5 shadow-lg hover:shadow-xl transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner mr-2"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign in</span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-2 bg-white/80 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-5 sm:mt-6">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full inline-flex justify-center items-center py-2.5 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FcGoogle className="w-5 h-5 mr-2" />
                  <span>Continue with Google</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 text-center px-4">
          <Link
            to="/"
            className="inline-flex items-center text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to home</span>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Login;
