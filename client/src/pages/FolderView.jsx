import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FiFolder,
  FiFile,
  FiPlus,
  FiHome,
  FiChevronRight,
  FiMoreVertical,
  FiDownload,
  FiShare2,
  FiEdit,
  FiTrash2,
  FiUpload,
  FiGrid,
  FiList,
  FiSearch,
  FiLock,
  FiGlobe,
  FiClock,
  FiX,
  FiEye,
  FiImage,
  FiVideo,
  FiMusic,
  FiArchive
} from 'react-icons/fi';
import FileIcon from '../components/FileIcon';
import DropdownMenu, { DropdownItem, DropdownDivider } from '../components/DropdownMenu';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const FolderView = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const currentFolderId = searchParams.get('folder') || null;
  
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, images, videos, documents, others
  const [sortBy, setSortBy] = useState('name'); // name, date, size
  
  // Folder creation modal
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');

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

  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#f97316'  // orange
  ];

  useEffect(() => {
    fetchFolderContents();
  }, [currentFolderId]);

  const fetchFolderContents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentFolderId) {
        params.append('folderId', currentFolderId);
      }

      const response = await axios.get(`/api/folders?${params}`);
      setFolders(response.data.folders);
      setFiles(response.data.files);
      setCurrentFolder(response.data.currentFolder);
      setBreadcrumbs(response.data.breadcrumbs);
    } catch (error) {
      console.error('Error fetching folder contents:', error);
      toast.error('Failed to load folder contents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      await axios.post('/api/folders', {
        name: newFolderName.trim(),
        parentFolder: currentFolderId,
        color: selectedColor
      });

      toast.success('Folder created successfully');
      setShowCreateFolder(false);
      setNewFolderName('');
      setSelectedColor('#3b82f6');
      fetchFolderContents();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error(error.response?.data?.message || 'Failed to create folder');
    }
  };

  const handleFolderClick = (folderId) => {
    setSearchParams({ folder: folderId });
  };

  const handleBreadcrumbClick = (folderId) => {
    if (folderId) {
      setSearchParams({ folder: folderId });
    } else {
      setSearchParams({});
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm('Are you sure you want to delete this folder?')) return;

    try {
      await axios.delete(`/api/folders/${folderId}`);
      toast.success('Folder deleted successfully');
      fetchFolderContents();
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error(error.response?.data?.message || 'Failed to delete folder');
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await axios.delete(`/api/files/${fileId}`);
      toast.success('File deleted successfully');
      fetchFolderContents();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleDownload = async (fileId, fileName, hasPassword = false) => {
    // If file has password protection, show password modal
    if (hasPassword) {
      const file = files.find(f => f.id === fileId);
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
      const updateData = {
        isPublic: editForm.isPublic,
        description: editForm.description || '',
        tags: editForm.tags.filter(tag => tag.trim() !== '')
      };
      
      // Only include password if provided (and not empty)
      if (editForm.password && editForm.password.trim() !== '') {
        updateData.password = editForm.password.trim();
      } else {
        updateData.password = '';
      }
      
      // Handle expiration date
      if (editForm.expiresAt && editForm.expiresAt.trim() !== '') {
        updateData.expiresAt = new Date(editForm.expiresAt).toISOString();
      } else {
        updateData.expiresAt = null;
      }
      
      await axios.put(`/api/files/${editingFile.id}`, updateData);
      
      toast.success('File updated successfully');
      setShowEditModal(false);
      setEditingFile(null);
      fetchFolderContents();
    } catch (error) {
      console.error('Error updating file:', error);
      
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

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return <FiImage className="w-5 h-5 text-green-500" />;
    if (mimetype.startsWith('video/')) return <FiVideo className="w-5 h-5 text-red-500" />;
    if (mimetype.startsWith('audio/')) return <FiMusic className="w-5 h-5 text-purple-500" />;
    if (mimetype.includes('zip') || mimetype.includes('rar')) return <FiArchive className="w-5 h-5 text-orange-500" />;
    return <FiFile className="w-5 h-5 text-gray-500" />;
  };

  // Filter and search functions
  const getFilteredAndSortedData = () => {
    let filteredFolders = [...folders];
    let filteredFiles = [...files];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredFolders = filteredFolders.filter(folder =>
        folder.name.toLowerCase().includes(searchLower)
      );
      filteredFiles = filteredFiles.filter(file =>
        file.originalName.toLowerCase().includes(searchLower) ||
        file.description?.toLowerCase().includes(searchLower) ||
        file.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply file type filter
    if (filterType !== 'all') {
      filteredFiles = filteredFiles.filter(file => {
        const mime = file.mimetype.toLowerCase();
        switch (filterType) {
          case 'images':
            return mime.startsWith('image/');
          case 'videos':
            return mime.startsWith('video/');
          case 'documents':
            return mime.includes('pdf') || mime.includes('document') || mime.includes('text');
          case 'others':
            return !mime.startsWith('image/') && !mime.startsWith('video/') && 
                   !mime.includes('pdf') && !mime.includes('document');
          default:
            return true;
        }
      });
    }

    // Apply sorting
    if (sortBy === 'name') {
      filteredFolders.sort((a, b) => a.name.localeCompare(b.name));
      filteredFiles.sort((a, b) => a.originalName.localeCompare(b.originalName));
    } else if (sortBy === 'date') {
      filteredFolders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      filteredFiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'size') {
      filteredFiles.sort((a, b) => b.size - a.size);
    }

    return { filteredFolders, filteredFiles };
  };

  const { filteredFolders, filteredFiles } = getFilteredAndSortedData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your files...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Files - FileShare</title>
      </Helmet>

      <div className="pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full mb-4">
                <FiFolder className="w-4 h-4 text-primary-700 mr-2" />
                <span className="text-sm font-semibold text-primary-700">File Manager</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                My Files
                <span className="block gradient-text text-3xl md:text-4xl">Organized & Secure</span>
              </h1>
            </div>
            
            {/* Breadcrumbs */}
            <div className="flex items-center justify-center">
              <nav className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30 shadow-lg">
                <div className="flex items-center space-x-3 text-sm">
                  <button
                    onClick={() => handleBreadcrumbClick(null)}
                    className="flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-200 font-medium"
                  >
                    <FiHome className="w-4 h-4" />
                    <span className="ml-2">My Files</span>
                  </button>
                  
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.id}>
                      <FiChevronRight className="w-4 h-4 text-gray-400" />
                      <button
                        onClick={() => handleBreadcrumbClick(crumb.id)}
                        className="text-gray-600 hover:text-primary-600 transition-colors duration-200 font-medium"
                      >
                        {crumb.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </nav>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Action Buttons - Full width on mobile */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4">
              <button
                onClick={() => setShowCreateFolder(true)}
                className="btn-primary flex items-center justify-center space-x-2 text-sm sm:text-base py-2.5 sm:py-3 px-4 sm:px-5"
              >
                <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="truncate">New Folder</span>
              </button>
              
              <button
                onClick={() => navigate('/upload', { state: { folderId: currentFolderId } })}
                className="btn-secondary flex items-center justify-center space-x-2 text-sm sm:text-base py-2.5 sm:py-3 px-4 sm:px-5"
              >
                <FiUpload className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="truncate">Upload Files</span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1.5 sm:p-2 border border-white/30 shadow-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-primary-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                }`}
                aria-label="Grid view"
              >
                <FiGrid className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-primary-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                }`}
                aria-label="List view"
              >
                <FiList className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/30 shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            {/* Search - Full width on mobile */}
            <div className="mb-3 sm:mb-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search files and folders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter and Sort - Side by side on mobile */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* Filter by type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 sm:mb-2">
                  File Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="input-field text-xs sm:text-sm py-2 sm:py-3"
                >
                  <option value="all">All Files</option>
                  <option value="images">Images</option>
                  <option value="videos">Videos</option>
                  <option value="documents">Documents</option>
                  <option value="others">Others</option>
                </select>
              </div>

              {/* Sort by */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field text-xs sm:text-sm py-2 sm:py-3"
                >
                  <option value="name">Name</option>
                  <option value="date">Date</option>
                  <option value="size">Size</option>
                </select>
              </div>
            </div>

            {/* Results count & Clear button */}
            {(searchTerm || filterType !== 'all') && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Found <span className="font-bold text-primary-700">{filteredFolders.length}</span> folder(s) and <span className="font-bold text-primary-700">{filteredFiles.length}</span> file(s)
                  {searchTerm && (
                    <span className="block xs:inline"> matching "{searchTerm}"</span>
                  )}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                  }}
                  className="text-xs sm:text-sm font-semibold text-primary-600 hover:text-primary-700 underline transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          {filteredFolders.length === 0 && filteredFiles.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                {searchTerm || filterType !== 'all' ? (
                  <>
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
                      <FiSearch className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">No results found</h3>
                    <p className="text-gray-600 mb-8 text-lg">Try adjusting your search terms or filters to find what you're looking for.</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterType('all');
                      }}
                      className="btn-primary"
                    >
                      Clear All Filters
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
                      <FiFolder className="w-12 h-12 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Your file space awaits</h3>
                    <p className="text-gray-600 mb-8 text-lg">Create folders to organize your files or start uploading to get started.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => setShowCreateFolder(true)}
                        className="btn-primary"
                      >
                        <FiPlus className="w-5 h-5 mr-2" />
                        Create Folder
                      </button>
                      <button
                        onClick={() => navigate('/upload', { state: { folderId: currentFolderId } })}
                        className="btn-secondary"
                      >
                        <FiUpload className="w-5 h-5 mr-2" />
                        Upload Files
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6' : 'space-y-3'}>
              {/* Folders */}
              {filteredFolders.map((folder) => (
                <div
                  key={folder.id}
                  className={viewMode === 'grid' 
                    ? 'relative bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer animate-fade-in-up transition-all duration-300 group'
                    : 'relative bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg hover:shadow-xl cursor-pointer animate-fade-in-up transition-all duration-300 group'
                  }
                  onClick={() => handleFolderClick(folder.id)}
                >
                  {viewMode === 'grid' ? (
                    // Grid View Layout
                    <div className="text-center p-4 sm:p-6">
                      {/* Color-coded accent bar */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                        style={{ backgroundColor: folder.color }}
                      />
                      
                      <div className="w-14 h-14 sm:w-18 sm:h-18 mx-auto mb-4 sm:mb-5 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-gray-50 to-gray-100">
                        <FiFolder className="w-7 h-7 sm:w-9 sm:h-9" style={{ color: folder.color }} />
                      </div>
                      
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors duration-200 mb-2 px-1">
                        {folder.name}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">
                        {format(new Date(folder.createdAt), 'MMM d, yyyy')}
                      </p>
                      
                      {/* Subtle glow effect on hover */}
                      <div 
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                        style={{ 
                          background: `radial-gradient(circle at center, ${folder.color}40, transparent 70%)`,
                          filter: 'blur(20px)'
                        }}
                      />
                    </div>
                  ) : (
                    // List View Layout
                    <div className="flex items-center justify-between p-4 sm:p-5">
                      {/* Color-coded left border */}
                      <div 
                        className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                        style={{ backgroundColor: folder.color }}
                      />
                      
                      <div className="flex items-center space-x-4 sm:space-x-5 flex-1 min-w-0 ml-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-gray-50 to-gray-100">
                          <FiFolder className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: folder.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors duration-200">
                            {folder.name}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-500 font-medium truncate">
                            {format(new Date(folder.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      {/* Subtle glow effect on hover */}
                      <div 
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-15 transition-opacity duration-300 pointer-events-none"
                        style={{ 
                          background: `linear-gradient(90deg, ${folder.color}20, transparent 50%)`,
                          filter: 'blur(15px)'
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Menu Button */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1.5 shadow-lg border border-white/40">
                      <DropdownMenu>
                        <DropdownItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id);
                          }}
                          variant="danger"
                        >
                          <FiTrash2 className="w-4 h-4 mr-2" />
                          Delete Folder
                        </DropdownItem>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}

              {/* Files */}
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={viewMode === 'grid' 
                    ? 'relative bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer animate-fade-in-up transition-all duration-300 group'
                    : 'relative bg-white/80 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg hover:shadow-xl cursor-pointer animate-fade-in-up transition-all duration-300 group'
                  }
                  onClick={() => navigate(`/files/${file.id}`)}
                >
                  {viewMode === 'grid' ? (
                    // Grid View Layout
                    <div className="text-center p-4 sm:p-6">
                      {/* File preview area */}
                      <div className="mb-4 sm:mb-5 flex justify-center">
                        <div className="p-4 sm:p-5 bg-gradient-to-br from-gray-50/80 to-gray-100/80 backdrop-blur-sm rounded-2xl shadow-inner border border-gray-200/50 group-hover:scale-105 transition-transform duration-300">
                          <FileIcon mimetype={file.mimetype} size="lg" />
                        </div>
                      </div>
                      
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate group-hover:text-primary-700 transition-colors duration-200 mb-3 px-1 sm:px-2">
                        {file.originalName}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4 truncate px-1">
                        {file.sizeFormatted} • {format(new Date(file.createdAt), 'MMM d, yyyy')}
                      </p>
                      
                      {/* File status indicators - responsive */}
                      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4">
                        {file.isPublic ? (
                          <span className="inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold bg-green-100/80 text-green-700 border border-green-200/60 backdrop-blur-sm">
                            <FiGlobe className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">Public</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold bg-gray-100/80 text-gray-700 border border-gray-200/60 backdrop-blur-sm">
                            <FiLock className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">Private</span>
                          </span>
                        )}
                        
                        {file.password && (
                          <span className="inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold bg-yellow-100/80 text-yellow-700 border border-yellow-200/60 backdrop-blur-sm">
                            <FiLock className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">Protected</span>
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex justify-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center bg-gray-50/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-200/50">
                          <FiDownload className="w-3 h-3 mr-1" />
                          {file.downloadCount}
                        </span>
                        <span className="flex items-center bg-gray-50/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-200/50">
                          <FiEye className="w-3 h-3 mr-1" />
                          {file.viewCount}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // List View Layout
                    <div className="flex items-center justify-between p-4 sm:p-5">
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 p-2 bg-gradient-to-br from-gray-50/80 to-gray-100/80 backdrop-blur-sm rounded-xl border border-gray-200/50 group-hover:scale-105 transition-transform duration-300">
                          <FileIcon mimetype={file.mimetype} size="md" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors duration-200">
                            {file.originalName}
                          </h3>
                          <p className="text-sm sm:text-base text-gray-500 font-medium truncate mb-2">
                            {file.sizeFormatted} • {format(new Date(file.createdAt), 'MMM d, yyyy')}
                          </p>
                          
                          {/* File status indicators - responsive */}
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            {file.isPublic ? (
                              <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-semibold bg-green-100/80 text-green-700 border border-green-200/60 backdrop-blur-sm">
                                <FiGlobe className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                <span className="hidden xs:inline">Public</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-semibold bg-gray-100/80 text-gray-700 border border-gray-200/60 backdrop-blur-sm">
                                <FiLock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                <span className="hidden xs:inline">Private</span>
                              </span>
                            )}
                            
                            {file.password && (
                              <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-semibold bg-yellow-100/80 text-yellow-700 border border-yellow-200/60 backdrop-blur-sm">
                                <FiLock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                <span className="hidden xs:inline">Protected</span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Stats - hidden on very small screens */}
                        <div className="hidden sm:flex items-center space-x-3 text-sm text-gray-500">
                          <span className="flex items-center bg-gray-50/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-200/50">
                            <FiDownload className="w-3 h-3 mr-1" />
                            {file.downloadCount}
                          </span>
                          <span className="flex items-center bg-gray-50/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-200/50">
                            <FiEye className="w-3 h-3 mr-1" />
                            {file.viewCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Menu Button - Integrated design */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1.5 shadow-lg border border-white/40">
                      <DropdownMenu>
                        <DropdownItem onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(file.id, file.originalName, !!file.password);
                        }}>
                          <FiDownload className="w-4 h-4 mr-2" />
                          Download
                        </DropdownItem>
                        <DropdownItem onClick={(e) => {
                          e.stopPropagation();
                          handleShare(file.shareId);
                        }}>
                          <FiShare2 className="w-4 h-4 mr-2" />
                          Share Link
                        </DropdownItem>
                        <DropdownItem onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(file.id);
                        }}>
                          <FiEdit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownItem>
                        <DropdownDivider />
                        <DropdownItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id);
                          }}
                          variant="danger"
                        >
                          <FiTrash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Folder</h2>
            
            <form onSubmit={handleCreateFolder}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className="input-field w-full"
                  autoFocus
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Color
                </label>
                <div className="flex space-x-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-gray-900' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateFolder(false);
                    setNewFolderName('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit File Modal */}
      {showEditModal && editingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit File Settings</h2>
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
                      <p className="text-sm text-gray-500">{formatBytes(editingFile.size)}</p>
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
                  <button type="submit" className="btn-primary">
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
                <h2 className="text-xl font-bold text-gray-900">Password Required</h2>
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
                    <p className="text-sm text-gray-500">{formatBytes(downloadingFile.size)}</p>
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
                    <button type="submit" className="btn-primary">
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

export default FolderView;
