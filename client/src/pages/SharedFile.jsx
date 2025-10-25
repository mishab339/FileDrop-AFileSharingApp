import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  FiDownload, 
  FiEye, 
  FiLock, 
  FiClock, 
  FiFile, 
  FiImage, 
  FiVideo, 
  FiMusic, 
  FiArchive,
  FiAlertCircle,
  FiCheckCircle,
  FiX
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const SharedFile = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchFile();
  }, [shareId]);

  const fetchFile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/files/shared/${shareId}`);
      setFile(response.data.file);
      // Don't show password form initially - only show when user clicks download
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Error fetching file:', error);
      if (error.response?.status === 404) {
        toast.error('File not found');
      } else if (error.response?.status === 410) {
        toast.error('File has expired');
      } else {
        toast.error('Failed to load file');
      }
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    console.log('Download clicked - hasPassword:', file.hasPassword, 'password entered:', !!password);
    
    // If file has password and user hasn't entered it yet, show form
    if (file.hasPassword && !password.trim()) {
      console.log('Showing password form');
      setShowPasswordForm(true);
      return; // Don't proceed with download
    }

    console.log('Attempting download with password:', password ? 'yes' : 'no');
    
    try {
      setDownloading(true);
      const response = await axios.post(`/api/files/shared/${shareId}/download`, 
        file.hasPassword ? { password: password } : {},
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('File downloaded successfully!');
      setShowPasswordForm(false);
      setPassword('');
    } catch (error) {
      console.error('Download error:', error);
      if (error.response?.status === 401) {
        toast.error('Incorrect password');
        // Keep form open for retry
        setShowPasswordForm(true);
      } else {
        toast.error('Download failed');
      }
    } finally {
      setDownloading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    handleDownload();
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return <FiImage className="w-8 h-8 text-green-500" />;
    if (mimetype.startsWith('video/')) return <FiVideo className="w-8 h-8 text-red-500" />;
    if (mimetype.startsWith('audio/')) return <FiMusic className="w-8 h-8 text-purple-500" />;
    if (mimetype.includes('zip') || mimetype.includes('rar')) return <FiArchive className="w-8 h-8 text-orange-500" />;
    return <FiFile className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isExpired = file?.expiresAt && new Date() > new Date(file.expiresAt);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">File Not Found</h1>
          <p className="text-gray-600 mb-6">The file you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{file.originalName} - FileShare</title>
        <meta name="description" content={`Download ${file.originalName} from FileShare`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
            {/* File Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="flex justify-center mb-3 sm:mb-4">
                {getFileIcon(file.mimetype)}
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 px-2 break-words">
                {file.originalName}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {formatFileSize(file.size)} • {file.category}
              </p>
            </div>

            {/* File Status */}
            <div className="mb-4 sm:mb-6">
              {isExpired ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start sm:items-center">
                    <FiClock className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-red-800">File Expired</h3>
                      <p className="text-xs sm:text-sm text-red-600 mt-0.5">
                        This file is no longer available for download.
                      </p>
                    </div>
                  </div>
                </div>
              ) : file.hasPassword ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start sm:items-center">
                    <FiLock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-yellow-800">Password Protected</h3>
                      <p className="text-xs sm:text-sm text-yellow-600 mt-0.5">
                        This file is protected with a password.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start sm:items-center">
                    <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-green-800">Ready to Download</h3>
                      <p className="text-xs sm:text-sm text-green-600 mt-0.5">
                        This file is ready for download.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Password Form */}
            {showPasswordForm && !isExpired && (
              <div className="mb-4 sm:mb-6">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 sm:p-5 border-2 border-yellow-200 shadow-md">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center mr-3 shadow-sm">
                      <FiLock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900">
                        Password Required
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                        This file is protected. Enter the password to download.
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          className="w-full px-4 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all"
                          autoFocus
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={downloading || !password.trim()}
                        className="w-full inline-flex items-center justify-center bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-sm sm:text-base py-3 sm:py-3.5 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {downloading ? (
                          <>
                            <div className="loading-spinner mr-2"></div>
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <FiDownload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                            <span>Download File</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* File Information */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">File Information</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs sm:text-sm text-gray-600">File Size</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs sm:text-sm text-gray-600">File Type</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 truncate ml-2">
                    {file.mimetype}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs sm:text-sm text-gray-600">Downloads</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {file.downloadCount}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs sm:text-sm text-gray-600">Views</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {file.viewCount}
                  </span>
                </div>
                {file.expiresAt && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-xs sm:text-sm text-gray-600">Expires</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900">
                      {format(new Date(file.expiresAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs sm:text-sm text-gray-600">Uploaded</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {format(new Date(file.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {file.description && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{file.description}</p>
              </div>
            )}

            {/* Download Button */}
            <div className="text-center">
              {isExpired ? (
                <button
                  disabled
                  className="inline-flex items-center justify-center btn-secondary opacity-50 cursor-not-allowed w-full sm:w-auto text-sm sm:text-base py-3 sm:py-3 px-6 sm:px-8"
                >
                  <FiClock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>File Expired</span>
                </button>
              ) : (
                <>
                  {!showPasswordForm ? (
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="inline-flex items-center justify-center btn-primary w-full sm:w-auto text-base sm:text-lg py-3 sm:py-3 px-6 sm:px-8 disabled:opacity-50 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      {downloading ? (
                        <>
                          <div className="loading-spinner mr-2"></div>
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <FiDownload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                          <span>{file.hasPassword ? 'Enter Password to Download' : 'Download File'}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500 px-4">
                      Please enter the password above to download this file
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 text-center">
              <p className="text-xs sm:text-sm text-gray-500">
                Powered by{' '}
                <span className="font-medium text-primary-600">FileShare</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SharedFile;
