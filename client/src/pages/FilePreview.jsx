import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiArrowLeft,
  FiDownload,
  FiShare2,
  FiEdit,
  FiTrash2,
  FiEye,
  FiClock,
  FiUser,
  FiCalendar,
  FiHardDrive,
  FiLock,
  FiGlobe,
  FiX
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import FileIcon from '../components/FileIcon';

const FilePreview = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
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
  const [downloadPassword, setDownloadPassword] = useState('');

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    fetchFileDetails();

    // Cleanup blob URL when component unmounts
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [fileId]);

  // Cleanup blob URL when previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchFileDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/files/${fileId}`);
      setFile(response.data.file);

      // Generate preview URL for supported file types
      const fileType = response.data.file.mimetype;
      if (fileType.startsWith('image/') || fileType === 'application/pdf' || fileType.startsWith('text/')) {
        try {
          console.log('Attempting to load preview for file:', fileId, 'type:', fileType);
          const previewResponse = await axios.get(`/api/files/preview/${fileId}`, {
            responseType: 'blob'
          });
          console.log('Preview response received, size:', previewResponse.data.size);
          const imageBlob = new Blob([previewResponse.data], { type: fileType });
          const imageUrl = URL.createObjectURL(imageBlob);
          console.log('Blob URL created:', imageUrl);
          setPreviewUrl(imageUrl);
        } catch (previewError) {
          console.error('Error loading preview:', previewError.response?.status, previewError.response?.data);

          // Fallback: try using the download endpoint for images
          if (fileType.startsWith('image/')) {
            try {
              console.log('Trying fallback download endpoint for image preview');
              const downloadResponse = await axios.post(`/api/files/download/${fileId}`, {}, {
                responseType: 'blob'
              });
              const imageBlob = new Blob([downloadResponse.data], { type: fileType });
              const imageUrl = URL.createObjectURL(imageBlob);
              console.log('Fallback blob URL created:', imageUrl);
              setPreviewUrl(imageUrl);
            } catch (downloadError) {
              console.error('Fallback download also failed:', downloadError);
              setPreviewUrl(null);
            }
          } else {
            setPreviewUrl(null);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching file details:', error);
      toast.error('Failed to load file details');
      navigate('/folders');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.post(`/api/files/download/${fileId}`, {}, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      
      // If 401 error, it means password is required
      if (error.response?.status === 401) {
        setShowPasswordModal(true);
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
      const response = await axios.post(`/api/files/download/${fileId}`, {
        password: downloadPassword
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('File downloaded successfully');
      setShowPasswordModal(false);
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

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/shared/${file.shareId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  const handleEdit = () => {
    setEditForm({
      isPublic: file.isPublic || false,
      password: '',
      expiresAt: file.expiresAt ? new Date(file.expiresAt).toISOString().slice(0, 16) : '',
      description: file.description || '',
      tags: file.tags || []
    });
    setShowEditModal(true);
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        isPublic: editForm.isPublic,
        description: editForm.description || '',
        tags: editForm.tags.filter(tag => tag.trim() !== '')
      };

      if (editForm.password && editForm.password.trim() !== '') {
        updateData.password = editForm.password.trim();
      } else {
        updateData.password = '';
      }

      if (editForm.expiresAt && editForm.expiresAt.trim() !== '') {
        updateData.expiresAt = new Date(editForm.expiresAt).toISOString();
      } else {
        updateData.expiresAt = null;
      }

      await axios.put(`/api/files/${fileId}`, updateData);

      toast.success('File updated successfully');
      setShowEditModal(false);
      fetchFileDetails(); // Refresh file data
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await axios.delete(`/api/files/${fileId}`);
      toast.success('File deleted successfully');
      navigate('/folders');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading file...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">File not found</h2>
          <p className="text-gray-600 mb-4">The file you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/folders')} className="btn-primary">
            Back to Files
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{file.originalName} - FileShare</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            {/* Back Button and Title */}
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
              <button
                onClick={() => navigate('/folders')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-lg transition-all duration-200 flex-shrink-0"
                aria-label="Back to files"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">{file.originalName}</h1>
                <p className="text-sm sm:text-base text-gray-600">
                  {formatBytes(file.size)} • {format(new Date(file.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Action Buttons - Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <button
                onClick={handleDownload}
                className="btn-primary flex items-center justify-center space-x-2 text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4"
              >
                <FiDownload className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={handleShare}
                className="btn-secondary flex items-center justify-center space-x-2 text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4"
              >
                <FiShare2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button
                onClick={handleEdit}
                className="btn-secondary flex items-center justify-center space-x-2 text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4"
              >
                <FiEdit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger flex items-center justify-center space-x-2 text-sm sm:text-base py-2.5 sm:py-3 px-3 sm:px-4"
              >
                <FiTrash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Preview Section */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="text-center">
                  {previewUrl ? (
                    <div className="relative">
                      {file.mimetype.startsWith('image/') ? (
                        <img
                          src={previewUrl}
                          alt={file.originalName}
                          className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                          onError={(e) => {
                            console.error('Image failed to load:', e);
                            setPreviewUrl(null);
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully');
                          }}
                        />
                      ) : file.mimetype === 'application/pdf' ? (
                        <iframe
                          src={previewUrl}
                          className="w-full h-96 rounded-lg shadow-md"
                          title={file.originalName}
                          onError={() => {
                            console.error('PDF failed to load');
                            setPreviewUrl(null);
                          }}
                        />
                      ) : file.mimetype.startsWith('text/') ? (
                        <iframe
                          src={previewUrl}
                          className="w-full h-96 rounded-lg shadow-md border"
                          title={file.originalName}
                          onError={() => {
                            console.error('Text file failed to load');
                            setPreviewUrl(null);
                          }}
                        />
                      ) : null}
                    </div>
                  ) : (
                    <div className="py-16">
                      <FileIcon mimetype={file.mimetype} size="lg" />
                      <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                        {file.originalName}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {(file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype.startsWith('text/'))
                          ? 'Preview failed to load'
                          : 'Preview not available for this file type'
                        }
                      </p>
                      {(file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype.startsWith('text/')) && (
                        <button
                          onClick={handleDownload}
                          className="btn-primary"
                        >
                          <FiDownload className="w-4 h-4 mr-2" />
                          Download to View
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* File Info */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">File Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FiHardDrive className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Size</p>
                      <p className="text-sm text-gray-600">{formatBytes(file.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FiCalendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Created</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(file.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <FiUser className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Owner</p>
                      <p className="text-sm text-gray-600">{file.user?.name || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy & Access */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Access</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {file.isPublic ? (
                      <FiGlobe className="w-5 h-5 text-green-500" />
                    ) : (
                      <FiLock className="w-5 h-5 text-gray-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">Visibility</p>
                      <p className="text-sm text-gray-600">
                        {file.isPublic ? 'Public' : 'Private'}
                      </p>
                    </div>
                  </div>

                  {file.password && (
                    <div className="flex items-center space-x-3">
                      <FiLock className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Password</p>
                        <p className="text-sm text-gray-600">Protected</p>
                      </div>
                    </div>
                  )}

                  {file.expiresAt && (
                    <div className="flex items-center space-x-3">
                      <FiClock className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Expires</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(file.expiresAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <FiDownload className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{file.downloadCount}</p>
                    <p className="text-sm text-gray-600">Downloads</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <FiEye className="w-6 h-6 text-accent-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{file.viewCount}</p>
                    <p className="text-sm text-gray-600">Views</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
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
                    <FileIcon mimetype={file.mimetype} size="md" />
                    <div>
                      <h3 className="font-medium text-gray-900">{file.originalName}</h3>
                      <p className="text-sm text-gray-500">{formatBytes(file.size)}</p>
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
                      value={`${window.location.origin}/shared/${file.shareId}`}
                      readOnly
                      className="input-field flex-1 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleShare}
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

      {/* Password Modal for Downloads */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Password Protected</h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setDownloadPassword('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              This file is password protected. Please enter the password to download.
            </p>

            <form onSubmit={handlePasswordDownload}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={downloadPassword}
                  onChange={(e) => setDownloadPassword(e.target.value)}
                  placeholder="Enter file password"
                  className="input-field"
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
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
                  <FiDownload className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FilePreview;

