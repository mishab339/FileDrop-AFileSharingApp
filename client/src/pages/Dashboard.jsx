import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { 
  FiUpload, 
  FiSearch, 
  FiFilter, 
  FiGrid, 
  FiList, 
  FiMoreVertical,
  FiDownload,
  FiShare2,
  FiEdit,
  FiTrash2,
  FiEye,
  FiClock,
  FiLock,
  FiGlobe,
  FiFile,
  FiImage,
  FiVideo,
  FiMusic,
  FiArchive,
  FiX
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // Edit modal state
  const [editingFile, setEditingFile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    isPublic: false,
    password: '',
    expiresAt: '',
    description: '',
    tags: []
  });

  // Password modal state for downloads
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [downloadPassword, setDownloadPassword] = useState('');

  useEffect(() => {
    fetchFiles();
  }, [searchTerm, filterCategory, sortBy, sortOrder, currentPage]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        search: searchTerm,
        category: filterCategory,
        sortBy,
        sortOrder
      });

      const response = await axios.get(`/api/files/my-files?${params}`);
      console.log('Fetched files:', response.data.files);
      console.log('Files with passwords:', response.data.files.filter(f => f.password).map(f => f.originalName));
      setFiles(response.data.files);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, fileName, hasPassword = false) => {
    console.log('Download clicked - fileId:', fileId, 'hasPassword:', hasPassword);
    
    // If file has password protection, show password modal
    if (hasPassword) {
      const file = files.find(f => f.id === fileId);
      console.log('Password protected file found:', file);
      setDownloadingFile(file);
      setShowPasswordModal(true);
      return;
    }

    try {
      const response = await axios.post(`/api/files/download/${fileId}`, {}, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      if (error.response?.status === 401) {
        toast.error('Incorrect password');
      } else {
        toast.error('Failed to download file');
      }
    }
  };

  const handlePasswordDownload = async (e) => {
    e.preventDefault();
    
    if (!downloadPassword.trim()) {
      toast.error('Please enter a password');
      return;
    }

    try {
      const response = await axios.post(`/api/files/download/${downloadingFile.id}`, {
        password: downloadPassword
      }, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', downloadingFile.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('File downloaded successfully');
      setShowPasswordModal(false);
      setDownloadingFile(null);
      setDownloadPassword('');
    } catch (error) {
      console.error('Error downloading file:', error);
      if (error.response?.status === 401) {
        toast.error('Incorrect password');
      } else {
        toast.error('Failed to download file');
      }
    }
  };

  const handleShare = (shareId) => {
    const shareUrl = `${window.location.origin}/shared/${shareId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  const handleEdit = async (fileId) => {
    try {
      // Fetch file details
      const response = await axios.get(`/api/files/${fileId}`);
      const fileData = response.data.file;
      
      setEditingFile(fileData);
      setEditForm({
        isPublic: fileData.isPublic || false,
        password: '',
        expiresAt: fileData.expiresAt ? new Date(fileData.expiresAt).toISOString().slice(0, 16) : '',
        description: fileData.description || '',
        tags: fileData.tags || []
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching file details:', error);
      toast.error('Failed to load file details');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Submitting file update...');
      
      const updateData = {
        isPublic: editForm.isPublic,
        description: editForm.description || '',
        tags: editForm.tags.filter(tag => tag.trim() !== '')
      };
      
      // Only include password if provided (and not empty)
      if (editForm.password && editForm.password.trim() !== '') {
        updateData.password = editForm.password.trim();
      } else {
        // Send empty string to remove password
        updateData.password = '';
      }
      
      // Handle expiration date
      if (editForm.expiresAt && editForm.expiresAt.trim() !== '') {
        updateData.expiresAt = new Date(editForm.expiresAt).toISOString();
      } else {
        updateData.expiresAt = null;
      }
      
      console.log('Update data:', updateData);
      
      const response = await axios.put(`/api/files/${editingFile.id}`, updateData);
      
      console.log('Update response:', response.data);
      toast.success('File updated successfully');
      setShowEditModal(false);
      setEditingFile(null);
      fetchFiles();
    } catch (error) {
      console.error('Error updating file:', error);
      console.error('Error response:', error.response?.data);
      
      // Show detailed error message
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.message).join(', ');
        toast.error(`Validation failed: ${errorMessages}`);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update file');
      }
    }
  };

  const handleAddTag = () => {
    setEditForm(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const handleRemoveTag = (index) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleTagChange = (index, value) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await axios.delete(`/api/files/${fileId}`);
      toast.success('File deleted successfully');
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedFiles.length} files?`)) return;

    try {
      await Promise.all(selectedFiles.map(id => axios.delete(`/api/files/${id}`)));
      toast.success(`${selectedFiles.length} files deleted successfully`);
      setSelectedFiles([]);
      fetchFiles();
    } catch (error) {
      console.error('Error deleting files:', error);
      toast.error('Failed to delete files');
    }
  };

  const handleSelectFile = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    setSelectedFiles(
      selectedFiles.length === files.length 
        ? [] 
        : files.map(file => file.id)
    );
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return <FiImage className="w-5 h-5 text-green-500" />;
    if (mimetype.startsWith('video/')) return <FiVideo className="w-5 h-5 text-red-500" />;
    if (mimetype.startsWith('audio/')) return <FiMusic className="w-5 h-5 text-purple-500" />;
    if (mimetype.includes('zip') || mimetype.includes('rar')) return <FiArchive className="w-5 h-5 text-orange-500" />;
    return <FiFile className="w-5 h-5 text-gray-500" />;
  };

  const getCategoryOptions = () => [
    { value: '', label: 'All Categories' },
    { value: 'image/', label: 'Images' },
    { value: 'video/', label: 'Videos' },
    { value: 'audio/', label: 'Audio' },
    { value: 'application/pdf', label: 'Documents' },
    { value: 'application/zip', label: 'Archives' }
  ];

  const getSortOptions = () => [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'originalName', label: 'Name' },
    { value: 'size', label: 'Size' },
    { value: 'downloadCount', label: 'Downloads' }
  ];

  if (loading && files.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Files - FileShare</title>
        <meta name="description" content="Manage your uploaded files, view statistics, and control sharing settings." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Files</h1>
                <p className="mt-2 text-gray-600">
                  Manage your uploaded files and sharing settings
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Link
                  to="/upload"
                  className="btn-primary inline-flex items-center"
                >
                  <FiUpload className="w-5 h-5 mr-2" />
                  Upload Files
                </Link>
              </div>
            </div>

            {/* Storage usage */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Storage Used</span>
                <span>
                  {user?.storageUsed ? Math.round((user.storageUsed / (1024 * 1024 * 1024)) * 100) / 100 : 0}GB / 
                  {user?.maxStorage ? Math.round(user.maxStorage / (1024 * 1024 * 1024)) : 5}GB
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${user?.storageUsed && user?.maxStorage 
                      ? Math.min((user.storageUsed / user.maxStorage) * 100, 100) 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="input-field"
                >
                  {getCategoryOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="input-field"
                >
                  {getSortOptions().map(option => (
                    <React.Fragment key={option.value}>
                      <option value={`${option.value}-desc`}>
                        {option.label} (Newest)
                      </option>
                      <option value={`${option.value}-asc`}>
                        {option.label} (Oldest)
                      </option>
                    </React.Fragment>
                  ))}
                </select>

                {/* View mode */}
                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-600'}`}
                  >
                    <FiGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-600'}`}
                  >
                    <FiList className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk actions */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 p-4 bg-primary-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-primary-700">
                  {selectedFiles.length} file(s) selected
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={handleBulkDelete}
                    className="btn-danger text-sm"
                  >
                    <FiTrash2 className="w-4 h-4 mr-1" />
                    Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedFiles([])}
                    className="btn-secondary text-sm"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Files Grid/List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="loading-spinner"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <FiFile className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterCategory 
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first file to get started'
                }
              </p>
              <Link to="/upload" className="btn-primary">
                <FiUpload className="w-5 h-5 mr-2" />
                Upload Files
              </Link>
            </div>
          ) : (
            <>
              {/* Select all checkbox */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFiles.length === files.length && files.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Select all ({files.length} files)
                  </span>
                </label>
              </div>

              {/* Files display */}
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }>
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`file-card ${selectedFiles.includes(file.id) ? 'ring-2 ring-primary-500' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => handleSelectFile(file.id)}
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />

                      {/* File icon */}
                      <div className="flex-shrink-0">
                        {getFileIcon(file.mimetype)}
                      </div>

                      {/* File info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {file.originalName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {file.sizeFormatted} • {format(new Date(file.createdAt), 'MMM d, yyyy')}
                        </p>
                        
                        {/* File status indicators */}
                        <div className="flex items-center space-x-2 mt-2">
                          {file.isPublic ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FiGlobe className="w-3 h-3 mr-1" />
                              Public
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <FiLock className="w-3 h-3 mr-1" />
                              Private
                            </span>
                          )}
                          
                          {file.password && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <FiLock className="w-3 h-3 mr-1" />
                              Protected
                            </span>
                          )}
                          
                          {file.expiresAt && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <FiClock className="w-3 h-3 mr-1" />
                              Expires
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <FiDownload className="w-3 h-3 mr-1" />
                            {file.downloadCount}
                          </span>
                          <span className="flex items-center">
                            <FiEye className="w-3 h-3 mr-1" />
                            {file.viewCount}
                          </span>
                        </div>
                      </div>

                      {/* Actions menu */}
                      <div className="flex-shrink-0">
                        <div className="relative group">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <FiMoreVertical className="w-5 h-5" />
                          </button>
                          
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="py-1">
                              <button 
                                onClick={() => handleDownload(file.id, file.originalName, !!file.password)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <FiDownload className="w-4 h-4 mr-3" />
                                Download
                              </button>
                              <button 
                                onClick={() => handleShare(file.shareId)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <FiShare2 className="w-4 h-4 mr-3" />
                                Share
                              </button>
                              <button 
                                onClick={() => handleEdit(file.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <FiEdit className="w-4 h-4 mr-3" />
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(file.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <FiTrash2 className="w-4 h-4 mr-3" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit File Settings
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                {/* File Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(editingFile.mimetype)}
                    <div>
                      <h3 className="font-medium text-gray-900">{editingFile.originalName}</h3>
                      <p className="text-sm text-gray-500">{editingFile.sizeFormatted}</p>
                    </div>
                  </div>
                </div>

                {/* Visibility */}
                <div className="mb-6">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={editForm.isPublic}
                      onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="font-medium text-gray-900">Make file public</span>
                      <p className="text-sm text-gray-500">Anyone with the link can access this file</p>
                    </div>
                  </label>
                </div>

                {/* Password Protection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Protection (Optional)
                  </label>
                  <div className="flex items-center space-x-2">
                    <FiLock className="text-gray-400" />
                    <input
                      type="password"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      placeholder="Enter password to protect file"
                      className="input-field flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to remove password or keep existing password
                  </p>
                </div>

                {/* Expiration Date */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date (Optional)
                  </label>
                  <div className="flex items-center space-x-2">
                    <FiClock className="text-gray-400" />
                    <input
                      type="datetime-local"
                      value={editForm.expiresAt}
                      onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })}
                      className="input-field flex-1"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    File will be automatically deleted after this date
                  </p>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Add a description for this file"
                    rows={3}
                    maxLength={500}
                    className="input-field w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editForm.description.length}/500 characters
                  </p>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (Optional)
                  </label>
                  {editForm.tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => handleTagChange(index, e.target.value)}
                        placeholder="Enter tag"
                        className="input-field flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="btn-secondary text-sm mt-2"
                  >
                    + Add Tag
                  </button>
                </div>

                {/* Share Link */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Share Link
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/shared/${editingFile.shareId}`}
                      readOnly
                      className="input-field flex-1 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleShare(editingFile.shareId)}
                      className="btn-secondary"
                    >
                      <FiShare2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password Download Modal */}
      {showPasswordModal && downloadingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Password Required
                </h2>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setDownloadingFile(null);
                    setDownloadPassword('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg mb-4">
                  {getFileIcon(downloadingFile.mimetype)}
                  <div>
                    <h3 className="font-medium text-gray-900">{downloadingFile.originalName}</h3>
                    <p className="text-sm text-gray-500">{downloadingFile.sizeFormatted}</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordDownload}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter password to download this file
                  </label>
                  <div className="flex items-center space-x-2 mb-4">
                    <FiLock className="text-gray-400" />
                    <input
                      type="password"
                      value={downloadPassword}
                      onChange={(e) => setDownloadPassword(e.target.value)}
                      placeholder="Enter password"
                      className="input-field flex-1"
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setDownloadingFile(null);
                        setDownloadPassword('');
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Download
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
