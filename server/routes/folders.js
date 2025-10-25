const express = require('express');
const { auth } = require('../middleware/auth');
const Folder = require('../models/Folder');
const File = require('../models/File');

const router = express.Router();

// @route   POST /api/folders
// @desc    Create a new folder
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, parentFolder, color } = req.body;

    console.log('Create folder request:', { name, parentFolder, owner: req.user.id });

    // Validate folder name
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Folder name is required'
      });
    }

    // Check if folder with same name exists in same parent
    const existingFolder = await Folder.findOne({
      owner: req.user.id,
      name: name.trim(),
      parentFolder: parentFolder || null,
      isActive: true
    });

    if (existingFolder) {
      return res.status(400).json({
        success: false,
        message: 'A folder with this name already exists in this location'
      });
    }

    // If parentFolder is provided, verify it exists and user owns it
    if (parentFolder) {
      const parent = await Folder.findOne({
        _id: parentFolder,
        owner: req.user.id,
        isActive: true
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Parent folder not found'
        });
      }
    }

    // Create folder
    const folder = await Folder.create({
      name: name.trim(),
      owner: req.user.id,
      parentFolder: parentFolder || null,
      color: color || '#3b82f6'
    });

    console.log('Folder created:', folder._id);

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      folder: {
        id: folder._id,
        name: folder.name,
        parentFolder: folder.parentFolder,
        color: folder.color,
        createdAt: folder.createdAt
      }
    });

  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating folder',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/folders
// @desc    Get user's folders and files in current directory
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { folderId } = req.query;
    const currentFolder = folderId || null;

    console.log('Get folders request - folderId:', currentFolder, 'user:', req.user.id);

    // Get folders in current directory
    const folders = await Folder.find({
      owner: req.user.id,
      parentFolder: currentFolder,
      isActive: true
    }).sort({ name: 1 });

    // Get files in current directory
    const files = await File.find({
      uploader: req.user.id,
      folder: currentFolder,
      isActive: true
    })
    .select('-path +password')
    .sort({ originalName: 1 });

    // Get current folder info if not root
    let currentFolderInfo = null;
    if (currentFolder) {
      currentFolderInfo = await Folder.findOne({
        _id: currentFolder,
        owner: req.user.id,
        isActive: true
      });

      if (!currentFolderInfo) {
        return res.status(404).json({
          success: false,
          message: 'Folder not found'
        });
      }
    }

    // Get breadcrumb path
    const breadcrumbs = [];
    if (currentFolderInfo) {
      let current = currentFolderInfo;
      breadcrumbs.unshift({
        id: current._id,
        name: current.name
      });

      while (current.parentFolder) {
        current = await Folder.findById(current.parentFolder);
        if (current) {
          breadcrumbs.unshift({
            id: current._id,
            name: current.name
          });
        } else {
          break;
        }
      }
    }

    res.json({
      success: true,
      currentFolder: currentFolderInfo ? {
        id: currentFolderInfo._id,
        name: currentFolderInfo.name,
        parentFolder: currentFolderInfo.parentFolder,
        color: currentFolderInfo.color
      } : null,
      breadcrumbs,
      folders: folders.map(folder => ({
        id: folder._id,
        name: folder.name,
        color: folder.color,
        createdAt: folder.createdAt,
        type: 'folder'
      })),
      files: files.map(file => ({
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        sizeFormatted: file.sizeFormatted,
        mimetype: file.mimetype,
        category: file.category,
        shareId: file.shareId,
        isPublic: file.isPublic,
        password: file.password ? true : false,
        downloadCount: file.downloadCount,
        viewCount: file.viewCount,
        expiresAt: file.expiresAt,
        createdAt: file.createdAt,
        type: 'file'
      }))
    });

  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching folders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/folders/:id
// @desc    Rename or update folder
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, color } = req.body;

    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user.id,
      isActive: true
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    if (name) {
      // Check for duplicate name in same location
      const existingFolder = await Folder.findOne({
        owner: req.user.id,
        name: name.trim(),
        parentFolder: folder.parentFolder,
        isActive: true,
        _id: { $ne: folder._id }
      });

      if (existingFolder) {
        return res.status(400).json({
          success: false,
          message: 'A folder with this name already exists in this location'
        });
      }

      folder.name = name.trim();
    }

    if (color) {
      folder.color = color;
    }

    await folder.save();

    res.json({
      success: true,
      message: 'Folder updated successfully',
      folder: {
        id: folder._id,
        name: folder.name,
        color: folder.color
      }
    });

  } catch (error) {
    console.error('Update folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating folder'
    });
  }
});

// @route   DELETE /api/folders/:id
// @desc    Delete folder (and optionally its contents)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user.id,
      isActive: true
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Check if folder has contents
    const subFolders = await Folder.countDocuments({
      parentFolder: folder._id,
      isActive: true
    });

    const files = await File.countDocuments({
      folder: folder._id,
      isActive: true
    });

    if (subFolders > 0 || files > 0) {
      return res.status(400).json({
        success: false,
        message: `Folder contains ${subFolders} folder(s) and ${files} file(s). Please delete or move them first.`
      });
    }

    // Soft delete
    folder.isActive = false;
    await folder.save();

    res.json({
      success: true,
      message: 'Folder deleted successfully'
    });

  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting folder'
    });
  }
});

// @route   POST /api/folders/:id/move
// @desc    Move folder to another location
// @access  Private
router.post('/:id/move', auth, async (req, res) => {
  try {
    const { targetFolderId } = req.body;

    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user.id,
      isActive: true
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Cannot move folder into itself or its subfolders
    if (targetFolderId === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot move folder into itself'
      });
    }

    // If target is not null, verify it exists
    if (targetFolderId) {
      const targetFolder = await Folder.findOne({
        _id: targetFolderId,
        owner: req.user.id,
        isActive: true
      });

      if (!targetFolder) {
        return res.status(404).json({
          success: false,
          message: 'Target folder not found'
        });
      }
    }

    // Check for name conflict
    const existingFolder = await Folder.findOne({
      owner: req.user.id,
      name: folder.name,
      parentFolder: targetFolderId || null,
      isActive: true,
      _id: { $ne: folder._id }
    });

    if (existingFolder) {
      return res.status(400).json({
        success: false,
        message: 'A folder with this name already exists in the target location'
      });
    }

    folder.parentFolder = targetFolderId || null;
    await folder.save();

    res.json({
      success: true,
      message: 'Folder moved successfully'
    });

  } catch (error) {
    console.error('Move folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while moving folder'
    });
  }
});

module.exports = router;
