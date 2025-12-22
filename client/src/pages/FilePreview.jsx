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
  FiRefreshCw
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
          const previewResponse = await axios.get(`/api/files/preview/${fileId}`, {
            responseType: 'blob'
          });

          const imageBlob = new Blob([previewResponse.data], { type: fileType });
          const imageUrl = URL.createObjectURL(imageBlob);

          setPreviewUrl(imageUrl);
        } catch (previewError) {
          console.error('Error loading preview:', previewError.response?.status, previewError.response?.data);

          // Fallback: try using the download endpoint for images
          if (fileType.startsWith('image/')) {
            try {
              const downloadResponse = await axios.post(`/api/files/download/${fileId}`, {}, {
                responseType: 'blob'
              });
              const imageBlob = new Blob([downloadResponse.data], { type: fileType });
              const imageUrl = URL.createObjectURL(imageBlob);

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
      toast.error('Failed to download file');
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
      toast.error(error.response?.data?.message || 'Failed to update file');
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

      <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/folders')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-lg transition-all duration-200"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 truncate">{file.originalName}</h1>
                <p className="text-gray-600">
                  {formatBytes(file.size)} • {format(new Date(file.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                className="btn-primary flex items-center space-x-2"
              >
                <FiDownload className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={handleShare}
                className="btn-secondary flex items-center space-x-2"
              >
                <FiShare2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button
                onClick={handleEdit}
                className="btn-secondary flex items-center space-x-2"
              >
                <FiEdit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger flex items-center space-x-2"
              >
                <FiTrash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Preview Section */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="text-center">
                  {previewUrl ? (
                    <div className="relative">
                      {file.mimetype.startsWith('image/') ? (
                        <img
                          src={previewUrl}
                          alt={file.originalName}
                          className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                          onError={() => {
                            setPreviewUrl(null);
                          }}
                          onLoad={() => {
                            // Image loaded successfully
                          }}
                        />
                      ) : file.mimetype === 'application/pdf' ? (
                        <div className="relative">
                          <iframe
                            src={previewUrl}
                            className="w-full h-96 rounded-lg shadow-md border border-gray-200"
                            title={file.originalName}
                            onError={() => {
                              setPreviewUrl(null);
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
                            PDF Preview
                          </div>
                        </div>
                      ) : file.mimetype.startsWith('text/') ? (
                        <div className="relative">
                          <iframe
                            src={previewUrl}
                            className="w-full h-96 rounded-lg shadow-md border border-gray-200 bg-white"
                            title={file.originalName}
                            onError={() => {
                              setPreviewUrl(null);
                            }}
                          />
                          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
                            Text Preview
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="py-16">
                      <div className="mb-6">
                        <FileIcon mimetype={file.mimetype} size="lg" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                        {file.originalName}
                      </h3>
                      
                      {/* Preview Status Message */}
                      <div className="mb-6">
                        {(file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype.startsWith('text/')) ? (
                          <div className="bg-yellow-50/80 backdrop-blur-sm border border-yellow-200 rounded-lg p-4 mb-4">
                            <p className="text-yellow-800 font-medium">Preview not available</p>
                            <p className="text-yellow-700 text-sm mt-1">
                              The preview failed to load. You can download the file to view it.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-blue-800 font-medium">Preview not supported</p>
                            <p className="text-blue-700 text-sm mt-1">
                              This file type doesn't support preview. Download to view the content.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={handleDownload}
                          className="btn-primary flex items-center justify-center"
                        >
                          <FiDownload className="w-4 h-4 mr-2" />
                          Download File
                        </button>
                        
                        {(file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype.startsWith('text/')) && (
                          <button
                            onClick={() => window.location.reload()}
                            className="btn-secondary flex items-center justify-center"
                          >
                            <FiRefreshCw className="w-4 h-4 mr-2" />
                            Retry Preview
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* File Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
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
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
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
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50/80 rounded-lg">
                    <FiDownload className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{file.downloadCount}</p>
                    <p className="text-sm text-gray-600">Downloads</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50/80 rounded-lg">
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Edit File Settings</h2>

            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                {/* Public/Private Toggle */}
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={editForm.isPublic}
                      onChange={(e) => setEditForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Make file public</span>
                  </label>
                </div>

                {/* Password Protection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Protection (optional)
                  </label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password to protect file"
                    className="input-field"
                  />
                </div>

                {/* Expiration Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={editForm.expiresAt}
                    onChange={(e) => setEditForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="input-field"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add a description for this file"
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
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
      )}
    </>
  );
};

export default FilePreview