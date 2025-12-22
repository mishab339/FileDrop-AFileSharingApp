import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { 
  FiUser, 
  FiMail, 
  FiShield, 
  FiHardDrive, 
  FiEdit3, 
  FiSave, 
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    try {
      // Here you would typically make an API call to update user profile
      // For now, we'll just update the local state
      updateUser({ name: formData.name });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setPasswordLoading(true);
    try {
      await axios.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success('Password changed successfully');
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswords({
        current: false,
        new: false,
        confirm: false
      });
    } catch (error) {
      console.error('Error changing password:', error);
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercentage = user?.storageUsed && user?.maxStorage 
    ? (user.storageUsed / user.maxStorage) * 100 
    : 0;

  return (
    <>
      <Helmet>
        <title>Profile - FileShare</title>
        <meta name="description" content="Manage your FileShare profile, storage settings, and account preferences." />
      </Helmet>

      <div className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="mt-2 text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                {/* Header */}
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-white/60">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">Profile Information</h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage your personal details</p>
                    </div>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center justify-center btn-secondary text-sm sm:text-base w-full sm:w-auto"
                      >
                        <FiEdit3 className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Edit Profile</span>
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                          onClick={handleSave}
                          disabled={loading}
                          className="inline-flex items-center justify-center btn-primary disabled:opacity-50 text-sm sm:text-base order-1 sm:order-1"
                        >
                          <FiSave className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="inline-flex items-center justify-center btn-secondary text-sm sm:text-base order-2 sm:order-2"
                        >
                          <FiX className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="space-y-6 sm:space-y-8">
                    {/* Name Field */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 sm:space-x-4 p-4 bg-gray-50/80 rounded-lg border border-gray-200">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <FiUser className="w-6 h-6 text-gray-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                              {user?.name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">Your display name</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        Email Address
                      </label>
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-gray-50/80 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <FiMail className="w-6 h-6 text-gray-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                {user?.email}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">Primary email</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {user?.isEmailVerified ? (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                <FiCheckCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                <FiAlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                                <span>Unverified</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 flex items-start px-1">
                          <FiAlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" />
                          <span>Email address cannot be changed. Contact support if you need assistance.</span>
                        </p>
                      </div>
                    </div>

                    {/* Account Status */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        Account Status
                      </label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 bg-gray-50/80 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <FiShield className="w-6 h-6 text-gray-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-base sm:text-lg font-semibold text-gray-900 capitalize">
                              {user?.role}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">Account type</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                            <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
                            <span>Active</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Information */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/20">
                <div className="px-6 py-4 border-b border-gray-200 bg-white/60">
                  <h2 className="text-lg font-medium text-gray-900">Storage Usage</h2>
                </div>

                <div className="px-6 py-6">
                  <div className="space-y-4">
                    {/* Storage Bar */}
                    <div>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Used Storage</span>
                        <span>{formatBytes(user?.storageUsed || 0)} / {formatBytes(user?.maxStorage || 0)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            storagePercentage > 90 ? 'bg-red-500' : 
                            storagePercentage > 75 ? 'bg-yellow-500' : 'bg-primary-600'
                          }`}
                          style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {storagePercentage.toFixed(1)}% used
                      </p>
                    </div>

                    {/* Storage Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiHardDrive className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Total Storage</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatBytes(user?.maxStorage || 0)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiUser className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Used Storage</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatBytes(user?.storageUsed || 0)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiShield className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Available</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatBytes((user?.maxStorage || 0) - (user?.storageUsed || 0))}
                        </span>
                      </div>
                    </div>

                    {/* Upgrade Button */}
                    <div className="pt-4 border-t border-gray-200">
                      <button className="w-full btn-primary">
                        Upgrade Storage
                      </button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Get more storage space for your files
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/20">
                <div className="px-6 py-4 border-b border-gray-200 bg-white/60">
                  <h2 className="text-lg font-medium text-gray-900">Account Actions</h2>
                </div>

                <div className="px-6 py-6">
                  <div className="space-y-3">
                    {user?.googleId ? (
                      <div className="p-4 bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-200">
                        <div className="flex items-start space-x-3">
                          <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Google Account</p>
                            <p className="text-xs text-blue-700 mt-1">
                              Password changes are managed through your Google account. 
                              Visit Google Account settings to update your password.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setShowChangePassword(true)}
                        className="w-full btn-secondary text-left flex items-center"
                      >
                        <FiLock className="w-4 h-4 mr-3" />
                        Change Password
                      </button>
                    )}
                    <button className="w-full btn-secondary text-left">
                      Download Data
                    </button>
                    <button className="w-full btn-secondary text-left">
                      Privacy Settings
                    </button>
                    <button className="w-full btn-danger text-left">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl max-w-md w-full border border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <FiLock className="w-5 h-5 mr-2" />
                  Change Password
                </h2>
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setShowPasswords({
                      current: false,
                      new: false,
                      confirm: false
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="input-field pr-12"
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.current ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="input-field pr-12"
                      placeholder="Enter your new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.new ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="input-field pr-12"
                      placeholder="Confirm your new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.confirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Match Indicator */}
                {passwordData.newPassword && passwordData.confirmPassword && (
                  <div className="flex items-center space-x-2 text-sm">
                    {passwordData.newPassword === passwordData.confirmPassword ? (
                      <>
                        <FiCheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <FiAlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setShowPasswords({
                        current: false,
                        new: false,
                        confirm: false
                      });
                    }}
                    className="flex-1 btn-secondary"
                    disabled={passwordLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={passwordLoading || passwordData.newPassword !== passwordData.confirmPassword}
                  >
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
