import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { 
  FiUpload, 
  FiShare2, 
  FiShield, 
  FiClock, 
  FiDownload, 
  FiEye,
  FiCheckCircle,
  FiArrowRight
} from 'react-icons/fi';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <FiUpload className="w-6 h-6" />,
      title: 'Easy Upload',
      description: 'Drag and drop files or click to upload. Support for all file types with progress tracking.'
    },
    {
      icon: <FiShare2 className="w-6 h-6" />,
      title: 'Secure Sharing',
      description: 'Generate secure links with password protection and expiration dates.'
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: 'Privacy First',
      description: 'Your files are encrypted and stored securely. You control who has access.'
    },
    {
      icon: <FiClock className="w-6 h-6" />,
      title: 'Expiration Control',
      description: 'Set automatic expiration dates for your shared files to maintain control.'
    },
    {
      icon: <FiDownload className="w-6 h-6" />,
      title: 'Download Tracking',
      description: 'Monitor download counts and view statistics for your shared files.'
    },
    {
      icon: <FiEye className="w-6 h-6" />,
      title: 'File Preview',
      description: 'Preview images and documents before downloading with our built-in viewer.'
    }
  ];

  const stats = [
    { label: 'Files Shared', value: '10,000+' },
    { label: 'Active Users', value: '5,000+' },
    { label: 'Storage Used', value: '50TB+' },
    { label: 'Countries', value: '100+' }
  ];

  return (
    <>
      <Helmet>
        <title>FileShare - Secure File Sharing Made Simple</title>
        <meta name="description" content="Upload, share and manage files securely with FileShare. Drag & drop upload, password protection, expiration dates, and more." />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 md:pt-0">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in-up">

              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="block text-gray-900">Share Moments</span>
                <span className="block gradient-text">Not Just Files</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                Blazing Fast. Endlessly Simple.
                <span className="block mt-2 font-semibold text-primary-700">
                  Advanced security meets stunning design.
                </span>
              </p>
              
              <div className="flex flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-12 px-4 sm:px-0">
                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/upload" 
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3.5 sm:py-3 px-4 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                    >
                      <FiUpload className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span>Upload</span>
                    </Link>
                    <Link 
                      to="/folders" 
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 font-semibold py-3.5 sm:py-3 px-4 sm:px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                    >
                      <FiEye className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span>View Files</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/register" 
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3.5 sm:py-3 px-4 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                    >
                      <span className="mr-2">🚀</span>
                      <span className="hidden sm:inline">Get Started Free</span>
                      <span className="sm:hidden">Get Started</span>
                    </Link>
                    <Link 
                      to="/login" 
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 font-semibold py-3.5 sm:py-3 px-4 sm:px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                    >
                      <span>Sign In</span>
                      <FiArrowRight className="w-4 h-4 ml-2 flex-shrink-0" />
                    </Link>
                  </>
                )}
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30">
                  <FiShield className="w-6 h-6 text-primary-600" />
                  <span className="font-semibold text-gray-700">Bank-level Security</span>
                </div>
                <div className="flex items-center justify-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30">
                  <FiClock className="w-6 h-6 text-accent-600" />
                  <span className="font-semibold text-gray-700">Instant Sharing</span>
                </div>
                <div className="flex items-center justify-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/30">
                  <FiDownload className="w-6 h-6 text-primary-600" />
                  <span className="font-semibold text-gray-700">Smart Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Features Section */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gray-50"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Everything you need to
                <span className="block gradient-text">share files perfectly</span>
              </h2>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Powerful features designed to make file sharing simple, secure, and delightfully efficient.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="feature-card animate-fade-in-up group" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-white"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Simple as
                <span className="gradient-text"> 1-2-3</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get started in minutes with our beautifully simple process
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500 group-hover:shadow-primary-500/50">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                  <div className="absolute -inset-4 bg-primary-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-700 transition-colors duration-300">
                  Upload
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Drag and drop your files or click to browse. Lightning-fast upload with real-time progress.
                </p>
              </div>

              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-accent-500 to-accent-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500 group-hover:shadow-accent-500/50">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                  <div className="absolute -inset-4 bg-accent-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-accent-700 transition-colors duration-300">
                  Configure
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Set password protection, expiration dates, and access permissions with intuitive controls.
                </p>
              </div>

              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-accent-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500 group-hover:shadow-primary-500/50">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-700 transition-colors duration-300">
                  Share
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Get beautiful shareable links instantly. Track downloads, views, and engagement analytics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-accent-600 to-primary-800"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          

          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                Ready to transform
                <span className="block">your file sharing?</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                Join thousands of creators, professionals, and teams who trust FileShare 
                for their most important files.
              </p>
              
              {!isAuthenticated && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link 
                    to="/register" 
                    className="bg-white text-primary-700 hover:bg-gray-50 font-semibold py-3 px-8 rounded-xl transition-all duration-300 inline-flex items-center justify-center shadow-xl hover:shadow-white/25 hover:scale-105"
                  >
                    <span className="mr-2">🚀</span>
                    Create Free Account
                    <FiArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                  
                  <Link 
                    to="/login" 
                    className="border-2 border-white/80 text-white hover:bg-white hover:text-primary-700 font-semibold py-3 px-8 rounded-xl transition-all duration-300 inline-flex items-center justify-center backdrop-blur-sm hover:scale-105"
                  >
                    Sign In
                    <FiArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              )}
              
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-center space-x-3 text-white/90">
                  <FiCheckCircle className="w-6 h-6 text-green-400" />
                  <span className="font-medium">Free forever plan</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-white/90">
                  <FiCheckCircle className="w-6 h-6 text-green-400" />
                  <span className="font-medium">No credit card required</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-white/90">
                  <FiCheckCircle className="w-6 h-6 text-green-400" />
                  <span className="font-medium">Setup in 30 seconds</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <FiUpload className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">FileShare</span>
                </div>
                <p className="text-gray-400">
                  Secure file sharing made simple. Upload, share, and manage your files with advanced security features.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Features</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>Secure Upload</li>
                  <li>Password Protection</li>
                  <li>Expiration Dates</li>
                  <li>Download Tracking</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>Help Center</li>
                  <li>Contact Us</li>
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>About Us</li>
                  <li>Blog</li>
                  <li>Careers</li>
                  <li>Press</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 FileShare. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
