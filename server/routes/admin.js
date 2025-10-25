const express = require('express');
const { auth, admin } = require('../middleware/auth');
const File = require('../models/File');
const User = require('../models/User');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(auth);
router.use(admin);

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });

    // Get total files
    const totalFiles = await File.countDocuments();
    const activeFiles = await File.countDocuments({ isActive: true });
    const publicFiles = await File.countDocuments({ isPublic: true });

    // Get storage statistics
    const storageStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalStorageUsed: { $sum: '$storageUsed' },
          averageStorageUsed: { $avg: '$storageUsed' },
          maxStorageUsed: { $max: '$storageUsed' }
        }
      }
    ]);

    // Get file type distribution
    const fileTypeStats = await File.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$mimetype',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get recent uploads (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUploads = await File.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      isActive: true
    });

    // Get top uploaders
    const topUploaders = await User.aggregate([
      {
        $lookup: {
          from: 'files',
          localField: '_id',
          foreignField: 'uploader',
          as: 'files'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          fileCount: { $size: '$files' },
          storageUsed: 1
        }
      },
      { $sort: { fileCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          verified: verifiedUsers
        },
        files: {
          total: totalFiles,
          active: activeFiles,
          public: publicFiles,
          recentUploads
        },
        storage: storageStats[0] || {
          totalStorageUsed: 0,
          averageStorageUsed: 0,
          maxStorageUsed: 0
        },
        fileTypes: fileTypeStats,
        topUploaders
      }
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching admin statistics'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = { [sortBy]: sortOrder };
    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @route   GET /api/admin/files
// @desc    Get all files with pagination
// @access  Private (Admin only)
router.get('/files', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const query = {};
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { filename: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = { [sortBy]: sortOrder };
    const skip = (page - 1) * limit;

    const files = await File.find(query)
      .populate('uploader', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await File.countDocuments(query);

    res.json({
      success: true,
      files,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalFiles: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching files'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user status or role
// @access  Private (Admin only)
router.put('/users/:id', async (req, res) => {
  try {
    const { isActive, role, maxStorage } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (role !== undefined) user.role = role;
    if (maxStorage !== undefined) user.maxStorage = maxStorage;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        maxStorage: user.maxStorage,
        storageUsed: user.storageUsed
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
});

// @route   PUT /api/admin/files/:id/soft-delete
// @desc    Soft delete file (mark as inactive)
// @access  Private (Admin only)
router.put('/files/:id/soft-delete', async (req, res) => {
  try {
    console.log('Admin soft delete request for file ID:', req.params.id);
    
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Mark file as inactive (soft delete)
    file.isActive = false;
    file.deletedAt = new Date();
    file.deletedBy = req.user.id;
    await file.save();

    console.log('File soft deleted:', file.originalName);

    res.json({
      success: true,
      message: 'File soft deleted successfully'
    });

  } catch (error) {
    console.error('Soft delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while soft deleting file'
    });
  }
});

// @route   DELETE /api/admin/files/:id/permanent
// @desc    Permanently delete file (remove from database and disk)
// @access  Private (Admin only)
router.delete('/files/:id/permanent', async (req, res) => {
  try {
    console.log('Admin permanent delete request for file ID:', req.params.id);
    
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete physical file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', file.path);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Physical file deleted');
    }

    // Delete thumbnail if exists
    const thumbnailPath = path.join(path.dirname(filePath), 'thumbnails', `thumb_${file.filename}`);
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
      console.log('Thumbnail deleted');
    }

    // Update user's storage usage
    const user = await User.findById(file.uploader);
    if (user) {
      user.storageUsed = Math.max(0, user.storageUsed - file.size);
      await user.save();
      console.log('User storage updated');
    }

    // Permanently delete from database
    await File.findByIdAndDelete(req.params.id);
    console.log('File permanently deleted from database');

    res.json({
      success: true,
      message: 'File permanently deleted successfully'
    });

  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while permanently deleting file'
    });
  }
});

// @route   DELETE /api/admin/files/:id
// @desc    Delete file (admin override) - deprecated, use soft-delete or permanent instead
// @access  Private (Admin only)
router.delete('/files/:id', async (req, res) => {
  try {
    console.log('Admin delete request for file ID:', req.params.id);
    console.log('Admin user:', req.user.id, 'Role:', req.user.role);
    
    const file = await File.findById(req.params.id);
    if (!file) {
      console.log('File not found in database');
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    console.log('File found:', file.originalName, 'Uploader:', file.uploader);

    // Delete physical file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', file.path);
    console.log('File path:', filePath);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Physical file deleted');
    } else {
      console.log('Physical file not found on disk');
    }

    // Delete thumbnail if exists
    const thumbnailPath = path.join(path.dirname(filePath), 'thumbnails', `thumb_${file.filename}`);
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
      console.log('Thumbnail deleted');
    }

    // Update user's storage usage
    const user = await User.findById(file.uploader);
    if (user) {
      const oldStorage = user.storageUsed;
      user.storageUsed = Math.max(0, user.storageUsed - file.size);
      await user.save();
      console.log(`User storage updated: ${oldStorage} -> ${user.storageUsed}`);
    } else {
      console.log('User not found for storage update');
    }

    // Soft delete the file record
    file.isActive = false;
    await file.save();
    console.log('File marked as inactive');

    res.json({
      success: true,
      message: 'File deleted successfully by admin'
    });
    console.log('Delete operation completed successfully');

  } catch (error) {
    console.error('Admin delete file error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data
// @access  Private (Admin only)
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Daily uploads for the period
    const dailyUploads = await File.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // User registrations
    const dailyRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // File type distribution
    const fileTypeDistribution = await File.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            $cond: {
              if: { $regexMatch: { input: '$mimetype', regex: '^image/' } },
              then: 'Images',
              else: {
                $cond: {
                  if: { $regexMatch: { input: '$mimetype', regex: '^video/' } },
                  then: 'Videos',
                  else: {
                    $cond: {
                      if: { $regexMatch: { input: '$mimetype', regex: '^audio/' } },
                      then: 'Audio',
                      else: {
                        $cond: {
                          if: { $regexMatch: { input: '$mimetype', regex: 'application/pdf' } },
                          then: 'Documents',
                          else: 'Other'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        dailyUploads,
        dailyRegistrations,
        fileTypeDistribution,
        period: days
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
});

module.exports = router;
