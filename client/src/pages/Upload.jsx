import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDropzone } from 'react-dropzone';
import { useLocation } from 'react-router-dom';
import { 
  FiUpload, 
  FiX, 
  FiCheck, 
  FiAlertCircle,
  FiFile,
  FiImage,
  FiVideo,
  FiMusic,
  FiArchive,
  FiClock,
  FiLock,
  FiGlobe
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const Upload = () => {
  const location = useLocation();
  const folderId = location.state?.folderId || null;
  
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending', // pending, uploading, completed, error
      progress: 0,
      error: null
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);
  console.log(onDrop)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.aac', '.m4a'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-7z-compressed': ['.7z'],
      'text/plain': ['.txt']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: true
  });

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <FiImage className="w-5 h-5 text-green-500" />;
    if (type.startsWith('video/')) return <FiVideo className="w-5 h-5 text-red-500" />;
    if (type.startsWith('audio/')) return <FiMusic className="w-5 h-5 text-purple-500" />;
    if (type.includes('zip') || type.includes('rar')) return <FiArchive className="w-5 h-5 text-orange-500" />;
    return <FiFile className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    
    files.forEach(fileObj => {
      formData.append('files', fileObj.file);
    });
    
    // Add folder ID if present
    if (folderId) {
      formData.append('folderId', folderId);
    }
  
    try {
      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({
            ...prev,
            total: percentCompleted
          }));
        },
      });
      setUploadedFiles(response.data.files);
      setFiles([]);
      toast.success(`${response.data.files.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const copyShareLink = (shareId) => {
    const link = `${window.location.origin}/shared/${shareId}`;
    navigator.clipboard.writeText(link);
    toast.success('Share link copied to clipboard!');
  };

  return (
    <>
      <Helmet>
        <title>Upload Files - FileShare</title>
        <meta name="description" content="Upload your files securely with drag and drop support, progress tracking, and instant sharing." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full mb-6">
              <FiUpload className="w-4 h-4 text-primary-700 mr-2" />
              <span className="text-sm font-semibold text-primary-700">File Upload Center</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Upload Your Files
              <span className="block gradient-text">Beautifully & Securely</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Drag and drop your files or click to browse. Lightning-fast uploads with real-time progress tracking.
              <span className="block mt-2 text-lg font-medium text-primary-700">
                Support for all file types up to 100MB each.
              </span>
            </p>
          </div>

          {/* Upload Area */}
          <div className="mb-12">
            <div
              {...getRootProps()}
              className={`relative overflow-hidden cursor-pointer transition-all duration-500 ${
                isDragActive 
                  ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 scale-[1.02] shadow-2xl shadow-primary-500/25' 
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gradient-to-br hover:from-primary-50/50 hover:to-accent-50/50'
              } ${
                uploading ? 'pointer-events-none opacity-50' : ''
              } border-2 border-dashed rounded-3xl p-16 text-center bg-white/60 backdrop-blur-sm shadow-xl`}
            >
              <input {...getInputProps()} />
              
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-pattern opacity-10"></div>
              
              <div className="relative text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-8 transition-all duration-500 ${
                  isDragActive 
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white scale-110 shadow-2xl' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 hover:from-primary-500 hover:to-primary-600 hover:text-white hover:scale-110'
                }`}>
                  <FiUpload className="w-12 h-12" />
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {isDragActive ? 'Drop your files here!' : 'Upload your files'}
                </h3>
                
                <p className="text-lg text-gray-600 mb-6">
                  Drag & drop files here or{' '}
                  <span className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                    click to browse
                  </span>
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-2xl mx-auto mb-6">
                  <div className="flex items-center justify-center space-x-2 p-3 bg-white/80 rounded-xl border border-gray-200">
                    <FiImage className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">Images</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 p-3 bg-white/80 rounded-xl border border-gray-200">
                    <FiVideo className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-gray-700">Videos</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 p-3 bg-white/80 rounded-xl border border-gray-200">
                    <FiMusic className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">Audio</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 p-3 bg-white/80 rounded-xl border border-gray-200">
                    <FiFile className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Docs</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 p-3 bg-white/80 rounded-xl border border-gray-200">
                    <FiArchive className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">Archives</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 font-medium">
                  Maximum file size: 100MB • All file types supported
                </p>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mb-12 animate-fade-in">
              <div className="card-glass p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                      <FiUpload className="w-6 h-6 text-white animate-bounce" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Uploading Files</h3>
                      <p className="text-gray-600">Please don't close this page...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary-600">
                      {uploadProgress.total || 0}%
                    </div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                </div>
                
                <div className="progress-bar mb-4">
                  <div 
                    className="progress-fill animate-pulse"
                    style={{ width: `${uploadProgress.total || 0}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <div className="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                  <span className="ml-3 font-medium">Processing your files...</span>
                </div>
              </div>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      Files to Upload ({files.length})
                    </h3>
                    <button
                      onClick={uploadFiles}
                      disabled={uploading}
                      className="btn-primary flex items-center justify-center gap-2 text-sm sm:text-base py-2.5 sm:py-3 px-4 sm:px-5 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {uploading ? (
                        <>
                          <div className="loading-spinner flex-shrink-0"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <FiUpload className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span>Upload All</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {files.map((fileObj) => (
                    <div key={fileObj.id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex-shrink-0">
                          {getFileIcon(fileObj.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                            {fileObj.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 font-medium">
                            {formatFileSize(fileObj.size)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {fileObj.status === 'completed' && (
                            <FiCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                          )}
                          {fileObj.status === 'error' && (
                            <FiAlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                          )}
                          
                          <button
                            onClick={() => removeFile(fileObj.id)}
                            className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            aria-label="Remove file"
                          >
                            <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Uploaded Files ({uploadedFiles.length})
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {getFileIcon(file.mimetype)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                              {file.originalName}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">
                              {file.sizeFormatted} • {file.category}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center flex-shrink-0">
                          <button
                            onClick={() => copyShareLink(file.shareId)}
                            className="btn-secondary flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4"
                          >
                            <FiGlobe className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="hidden xs:inline">Copy Link</span>
                            <span className="xs:hidden">Copy</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Upload Tips */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-600 rounded-3xl"></div>
            <div className="absolute inset-0 bg-black/10 rounded-3xl"></div>
            
            <div className="relative p-8 md:p-12">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  ✨ Pro Upload Tips
                </h3>
                <p className="text-white/90 text-lg">
                  Make the most of your file sharing experience
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FiClock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Lightning Fast</h4>
                      <p className="text-white/80">
                        Our optimized servers ensure rapid uploads, even for large files up to 100MB.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FiLock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Bank-Level Security</h4>
                      <p className="text-white/80">
                        All files are encrypted in transit and at rest with AES-256 encryption.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FiGlobe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Instant Sharing</h4>
                      <p className="text-white/80">
                        Get beautiful, shareable links immediately after upload with one click.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FiFile className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Universal Support</h4>
                      <p className="text-white/80">
                        Upload any file type - images, videos, documents, archives, and more.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Upload;
