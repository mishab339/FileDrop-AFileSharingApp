import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  FiUsers, 
  FiFile, 
  FiHardDrive, 
  FiTrendingUp, 
  FiEye, 
  FiDownload,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiTrash2,
  FiEdit,
  FiShield,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingFileId, setDeletingFileId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab, currentPage, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'overview') {
        const [statsRes, analyticsRes] = await Promise.all([
          axios.get('/api/admin/stats'),
          axios.get('/api/admin/analytics')
        ]);
        setStats(statsRes.data.stats);
        setAnalytics(analyticsRes.data.analytics);
      } else if (activeTab === 'users') {
        const response = await axios.get(`/api/admin/users?page=${currentPage}&search=${searchTerm}`);
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.totalPages);
      } else if (activeTab === 'files') {
        const response = await axios.get(`/api/admin/files?page=${currentPage}&search=${searchTerm}`);
        setFiles(response.data.files);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      if (action === 'toggle-status') {
        await axios.put(`/api/admin/users/${userId}`, { isActive: !users.find(u => u._id === userId)?.isActive });
        toast.success('User status updated');
      } else if (action === 'change-role') {
        const newRole = users.find(u => u._id === userId)?.role === 'admin' ? 'user' : 'admin';
        await axios.put(`/api/admin/users/${userId}`, { role: newRole });
        toast.success('User role updated');
      }
      fetchData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleFileAction = async (fileId, action) => {
    try {
      if (action === 'soft-delete') {
        if (window.confirm('Soft delete this file? The file will be marked as inactive but can be restored.')) {
          setDeletingFileId(fileId);
          
          await axios.put(`/api/admin/files/${fileId}/soft-delete`);
          
          toast.success('File soft deleted successfully!', {
            icon: '🗑️',
            duration: 3000
          });
          
          setDeletingFileId(null);
          
          // Refresh data to show updated status
          fetchData();
        } else {
          setDeletingFileId(null);
        }
      } else if (action === 'permanent-delete') {
        if (window.confirm('⚠️ PERMANENTLY DELETE this file? This action CANNOT be undone. The file will be removed from the database and disk forever.')) {
          setDeletingFileId(fileId);
          
          await axios.delete(`/api/admin/files/${fileId}/permanent`);
          
          toast.success('File permanently deleted!', {
            icon: '🔥',
            duration: 3000,
            style: {
              background: '#fee2e2',
              color: '#991b1b'
            }
          });
          
          setDeletingFileId(null);
          
          // Refresh data to remove from list
          fetchData();
        } else {
          setDeletingFileId(null);
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setDeletingFileId(null);
      
      if (error.response?.data?.message) {
        toast.error(`Delete failed: ${error.response.data.message}`);
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else if (error.response?.status === 404) {
        toast.error('File not found. It may have been already deleted.');
      } else {
        toast.error('Failed to delete file. Please try again.');
      }
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - FileShare</title>
        <meta name="description" content="Admin dashboard for managing users, files, and system analytics." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Manage users, files, and monitor system performance
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', name: 'Overview', icon: FiTrendingUp },
                  { id: 'users', name: 'Users', icon: FiUsers },
                  { id: 'files', name: 'Files', icon: FiFile }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FiUsers className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FiFile className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Files</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.files.total}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FiHardDrive className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Storage Used</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatBytes(stats.storage.totalStorageUsed)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FiTrendingUp className="w-8 h-8 text-orange-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Recent Uploads</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.files.recentUploads}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Daily Uploads Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Uploads</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.dailyUploads || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id.day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* File Type Distribution */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">File Type Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics?.fileTypeDistribution || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {(analytics?.fileTypeDistribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Uploaders */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Uploaders</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Files
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Storage Used
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.topUploaders?.map((user, index) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary-600">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.fileCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatBytes(user.storageUsed)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Storage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary-600">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatBytes(user.storageUsed)} / {formatBytes(user.maxStorage)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(user.createdAt), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => handleUserAction(user._id, 'toggle-status')}
                                className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                  user.isActive 
                                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300' 
                                    : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:border-green-300'
                                }`}
                              >
                                {user.isActive ? (
                                  <>
                                    <FiAlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                    <span>Deactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <FiCheckCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                    <span>Activate</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleUserAction(user._id, 'change-role')}
                                className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                  user.role === 'admin'
                                    ? 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                    : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 hover:border-purple-300'
                                }`}
                              >
                                <FiShield className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                <span>{user.role === 'admin' ? 'Make User' : 'Make Admin'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
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
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="flex items-center space-x-4">
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
              </div>

              {/* Files Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Owner
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Downloads
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uploaded
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {files.map((file) => {
                        const isDeleting = deletingFileId === file._id;
                        const isSoftDeleted = !file.isActive; // Check database field
                        
                        return (
                        <tr key={file._id} className={isSoftDeleted ? 'bg-gray-50 opacity-75' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                  <FiFile className="w-5 h-5 text-gray-500" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {file.originalName}
                                  {isSoftDeleted && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                      Soft Deleted
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">{file.mimetype}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{file.uploader?.name}</div>
                            <div className="text-sm text-gray-500">{file.uploader?.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatBytes(file.size)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {file.downloadCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(new Date(file.createdAt), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {isSoftDeleted ? (
                              <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                  onClick={() => handleFileAction(file._id, 'permanent-delete')}
                                  disabled={isDeleting}
                                  className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                    isDeleting
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                      : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300'
                                  }`}
                                >
                                  <FiTrash2 className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                  <span>{isDeleting ? 'Deleting...' : 'Permanent Delete'}</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                  onClick={() => handleFileAction(file._id, 'soft-delete')}
                                  disabled={isDeleting}
                                  className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                    isDeleting
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                      : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 hover:border-orange-300'
                                  }`}
                                >
                                  <FiAlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                  <span>{isDeleting ? 'Deleting...' : 'Soft Delete'}</span>
                                </button>
                                <button
                                  onClick={() => handleFileAction(file._id, 'permanent-delete')}
                                  disabled={isDeleting}
                                  className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                    isDeleting
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                      : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300'
                                  }`}
                                >
                                  <FiTrash2 className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                  <span>{isDeleting ? 'Deleting...' : 'Permanent'}</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
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
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
