const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const mime = require('mime-types');

const File = require('../models/File');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { upload, handleMulterError } = require('../config/multer');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/files/upload
// @desc    Upload single or multiple files
// @access  Private
router.post('/upload', auth, (req, res, next) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = [];
    const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
    const folderId = req.body.folderId || null;

    // Check user's storage limit
    const user = await User.findById(req.user.id);
    if (user.storageUsed + totalSize > user.maxStorage) {
      return res.status(400).json({
        success: false,
        message: 'Upload would exceed storage limit'
      });
    }

    const files = req.files.map(file => {
      const shareId = uuidv4();
      return {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        uploader: req.user.id,
        folder: folderId,
        shareId: shareId
      };
    });

    const savedFiles = await File.insertMany(files);

    // Update user's storage usage
    user.storageUsed += totalSize;
    await user.save();

    // Generate thumbnails for images
    for (const file of savedFiles) {
      if (file.mimetype.startsWith('image/')) {
        try {
          const thumbnailPath = path.join(path.dirname(file.path), 'thumbnails');
          if (!fs.existsSync(thumbnailPath)) {
            fs.mkdirSync(thumbnailPath, { recursive: true });
          }
          
          const thumbnailFilename = `thumb_${file.filename}`;
          const thumbnailFullPath = path.join(thumbnailPath, thumbnailFilename);
          
          await sharp(file.path)
            .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toFile(thumbnailFullPath);
        } catch (error) {
          // Thumbnail generation failed, continue without thumbnail
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `${savedFiles.length} file(s) uploaded successfully`,
      files: savedFiles.map(file => ({
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        sizeFormatted: file.sizeFormatted,
        mimetype: file.mimetype,
        category: file.category,
        shareId: file.shareId,
        createdAt: file.createdAt
      }))
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload'
    });
  }
});

// @route   GET /api/files/my-files
// @desc    Get user's files
// @access  Private
router.get('/my-files', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const query = {
      uploader: req.user.id,
      isActive: true
    };

    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.mimetype = { $regex: category, $options: 'i' };
    }

    const sort = { [sortBy]: sortOrder };
    const skip = (page - 1) * limit;

    const files = await File.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-path +password');

    const total = await File.countDocuments(query);

    res.json({
      success: true,
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
        password: file.password ? true : false, // Only return boolean, not actual password
        downloadCount: file.downloadCount,
        viewCount: file.viewCount,
        expiresAt: file.expiresAt,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      })),
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

// @route   GET /api/files/:id
// @desc    Get file details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      uploader: req.user.id,
      isActive: true
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.json({
      success: true,
      file: {
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        sizeFormatted: file.sizeFormatted,
        mimetype: file.mimetype,
        category: file.category,
        shareId: file.shareId,
        isPublic: file.isPublic,
        downloadCount: file.downloadCount,
        viewCount: file.viewCount,
        lastDownloaded: file.lastDownloaded,
        expiresAt: file.expiresAt,
        description: file.description,
        tags: file.tags,
        createdAt: file.createdAt
      }
    });

  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching file'
    });
  }
});

// @route   GET /api/files/preview/:id
// @desc    Preview file (for images, PDFs, etc.)
// @access  Private
router.get('/preview/:id', auth, async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      uploader: req.user.id,
      isActive: true
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    if (file.isExpired()) {
      console.log('File has expired');
      return res.status(410).json({
        success: false,
        message: 'File has expired'
      });
    }

    // Check if file type supports preview
    const supportedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'text/plain', 'text/html', 'text/css', 'text/javascript', 'application/json'
    ];

    if (!supportedTypes.includes(file.mimetype)) {
      return res.status(415).json({
        success: false,
        message: 'File type not supported for preview'
      });
    }

    // Construct absolute file path
    const filePath = path.isAbsolute(file.path) 
      ? file.path 
      : path.join(__dirname, '..', file.path);

    if (!fs.existsSync(filePath)) {
      console.error('File not found on disk for preview:', filePath);
      return res.status(404).json({
        success: false,
        message: 'File not found on disk'
      });
    }

    // Increment view count for preview
    await file.incrementView();

    // Set appropriate headers for preview
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Content-Disposition', 'inline'); // Display inline, not as download

    // For images, we might want to resize for preview
    if (file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml') {
      try {
        // Check if sharp is available and file is not SVG
        const previewBuffer = await sharp(filePath)
          .resize(800, 800, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ quality: 85 })
          .toBuffer();
        
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Length', previewBuffer.length);
        res.send(previewBuffer);
        console.log('Image preview served successfully:', file.originalName);
      } catch (sharpError) {
        console.error('Sharp processing error, serving original:', sharpError);
        // Fallback to serving original file
        try {
          res.setHeader('Content-Type', file.mimetype);
          const fileBuffer = fs.readFileSync(filePath);
          res.setHeader('Content-Length', fileBuffer.length);
          res.send(fileBuffer);
          console.log('Original image served as fallback:', file.originalName);
        } catch (fileError) {
          console.error('Error serving original file:', fileError);
          return res.status(500).json({
            success: false,
            message: 'Error serving file'
          });
        }
      }
    } else if (file.mimetype === 'image/svg+xml') {
      // Serve SVG files directly
      try {
        res.setHeader('Content-Type', 'image/svg+xml');
        const fileBuffer = fs.readFileSync(filePath);
        res.setHeader('Content-Length', fileBuffer.length);
        res.send(fileBuffer);
        console.log('SVG preview served successfully:', file.originalName);
      } catch (svgError) {
        console.error('Error serving SVG:', svgError);
        return res.status(500).json({
          success: false,
          message: 'Error serving SVG file'
        });
      }
    } else {
      // For non-images (PDFs, text files), serve the original
      try {
        res.setHeader('Content-Type', file.mimetype);
        const fileBuffer = fs.readFileSync(filePath);
        res.setHeader('Content-Length', fileBuffer.length);
        res.send(fileBuffer);
        console.log('File preview served successfully:', file.originalName);
      } catch (fileError) {
        console.error('Error serving file:', fileError);
        return res.status(500).json({
          success: false,
          message: 'Error serving file'
        });
      }
    }

  } catch (error) {
    console.error('Preview error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Server error during preview',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// @route   GET /api/files/download/:id
// @desc    Download file
// @access  Private
router.post('/download/:id', auth, async (req, res) => {
  try {
    console.log('Download request for file ID:', req.params.id);
    
    const { password } = req.body;
    const file = await File.findOne({
      _id: req.params.id,
      uploader: req.user.id,
      isActive: true
    }).select('+password');

    if (!file) {
      console.log('File not found in database');
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    console.log('File found:', file.originalName, 'Path:', file.path);

    if (file.isExpired()) {
      console.log('File has expired');
      return res.status(410).json({
        success: false,
        message: 'File has expired'
      });
    }

    // Check password if file is password protected
    if (file.password) {
      if (!password || file.password !== password) {
        console.log('Password required or incorrect password provided');
        return res.status(401).json({
          success: false,
          message: 'Incorrect password',
          requiresPassword: true
        });
      }
    }

    // Construct file path - handle both relative and absolute paths
    let filePath;
    if (path.isAbsolute(file.path)) {
      filePath = file.path;
    } else {
      // If path starts with 'uploads/', use it directly from server root
      filePath = path.join(__dirname, '..', file.path);
    }

    console.log('Resolved file path:', filePath);

    if (!fs.existsSync(filePath)) {
      console.error('File not found on disk:', filePath);
      return res.status(404).json({
        success: false,
        message: 'File not found on disk'
      });
    }

    // Increment download count
    await file.incrementDownload();

    // Set proper headers
    res.setHeader('Content-Type', file.mimetype || mime.lookup(file.originalName) || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);

    console.log('Starting file download:', file.originalName);
    res.download(filePath, file.originalName, (err) => {
      if (err) {
        console.error('Error during file download:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading file'
          });
        }
      } else {
        console.log('File downloaded successfully:', file.originalName);
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Server error during download',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// @route   GET /api/files/shared/:shareId
// @desc    Get shared file (public access)
// @access  Public
router.get('/shared/:shareId', async (req, res) => {
  try {
    const file = await File.findOne({
      shareId: req.params.shareId,
      isActive: true
    }).select('+password'); // Include password field to check if file is password-protected

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    if (file.isExpired()) {
      return res.status(410).json({
        success: false,
        message: 'File has expired'
      });
    }

    // Increment view count
    await file.incrementView();

    res.json({
      success: true,
      file: {
        id: file._id,
        originalName: file.originalName,
        size: file.size,
        sizeFormatted: file.sizeFormatted,
        mimetype: file.mimetype,
        category: file.category,
        downloadCount: file.downloadCount,
        viewCount: file.viewCount,
        hasPassword: !!file.password, // Now this will correctly check if password exists
        expiresAt: file.expiresAt,
        description: file.description,
        createdAt: file.createdAt
      }
    });

  } catch (error) {
    console.error('Get shared file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching shared file'
    });
  }
});

// @route   POST /api/files/shared/:shareId/download
// @desc    Download shared file
// @access  Public
router.post('/shared/:shareId/download', validate(schemas.downloadShared), async (req, res) => {
  try {
    console.log('Shared download request for shareId:', req.params.shareId);
    console.log('Request body:', req.body);

    const { password } = req.body;
    const file = await File.findOne({
      shareId: req.params.shareId,
      isActive: true
    }).select('+password');

    if (!file) {
      console.log('Shared file not found');
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    console.log('Shared file found:', file.originalName);
    console.log('File has password:', !!file.password);
    console.log('Password provided:', !!password);
    console.log('Password in DB:', file.password);
    console.log('Password from user:', password);

    if (file.isExpired()) {
      console.log('Shared file has expired');
      return res.status(410).json({
        success: false,
        message: 'File has expired'
      });
    }

    // Check password if file is password protected
    if (file.password) {
      if (!password) {
        console.log('Password required but not provided');
        return res.status(401).json({
          success: false,
          message: 'Password required'
        });
      }
      
      if (file.password !== password) {
        console.log('Incorrect password - Expected:', file.password, 'Got:', password);
        return res.status(401).json({
          success: false,
          message: 'Incorrect password'
        });
      }
      
      console.log('Password verified successfully');
    }

    // Construct file path - handle both relative and absolute paths
    let filePath;
    if (path.isAbsolute(file.path)) {
      filePath = file.path;
    } else {
      filePath = path.join(__dirname, '..', file.path);
    }

    console.log('Resolved shared file path:', filePath);

    if (!fs.existsSync(filePath)) {
      console.error('Shared file not found on disk:', filePath);
      return res.status(404).json({
        success: false,
        message: 'File not found on disk'
      });
    }

    // Increment download count
    await file.incrementDownload();

    // Set proper headers
    res.setHeader('Content-Type', file.mimetype || mime.lookup(file.originalName) || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);

    console.log('Starting shared file download:', file.originalName);
    res.download(filePath, file.originalName, (err) => {
      if (err) {
        console.error('Error during shared file download:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading file'
          });
        }
      } else {
        console.log('Shared file downloaded successfully:', file.originalName);
      }
    });

  } catch (error) {
    console.error('Download shared file error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Server error during download',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// @route   PUT /api/files/:id
// @desc    Update file settings
// @access  Private
router.put('/:id', auth, validate(schemas.updateFile), async (req, res) => {
  try {
    console.log('Update file request for ID:', req.params.id);
    console.log('Update data received:', JSON.stringify(req.body, null, 2));

    const file = await File.findOne({
      _id: req.params.id,
      uploader: req.user.id,
      isActive: true
    });

    if (!file) {
      console.log('File not found for update');
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const { isPublic, password, expiresAt, description, tags } = req.body;

    // Update fields only if provided
    if (isPublic !== undefined) {
      file.isPublic = isPublic;
      console.log('Updated isPublic:', isPublic);
    }
    
    if (password !== undefined) {
      // If password is empty string or null, remove password protection
      if (password === '' || password === null) {
        file.password = undefined;
        console.log('Password protection removed');
      } else {
        file.password = password;
        console.log('Password protection set');
      }
    }
    
    if (expiresAt !== undefined) {
      file.expiresAt = expiresAt;
      console.log('Updated expiresAt:', expiresAt);
    }
    
    if (description !== undefined) {
      file.description = description;
      console.log('Updated description');
    }
    
    if (tags !== undefined) {
      file.tags = tags;
      console.log('Updated tags:', tags);
    }

    await file.save();
    console.log('File updated successfully:', file.originalName);

    res.json({
      success: true,
      message: 'File updated successfully',
      file: {
        id: file._id,
        isPublic: file.isPublic,
        hasPassword: !!file.password,
        expiresAt: file.expiresAt,
        description: file.description,
        tags: file.tags
      }
    });

  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/files/:id
// @desc    Delete file
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Delete request for file ID:', req.params.id);

    // Validate ID format
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      console.error('Invalid file ID provided:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'Invalid file ID'
      });
    }

    const file = await File.findOne({
      _id: req.params.id,
      uploader: req.user.id,
      isActive: true
    });

    if (!file) {
      console.log('File not found for deletion');
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    console.log('Deleting file:', file.originalName);

    // Construct file path - handle both relative and absolute paths
    let filePath;
    if (path.isAbsolute(file.path)) {
      filePath = file.path;
    } else {
      filePath = path.join(__dirname, '..', file.path);
    }

    // Delete physical file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Physical file deleted:', filePath);
    } else {
      console.warn('Physical file not found:', filePath);
    }

    // Delete thumbnail if exists
    const thumbnailPath = path.join(path.dirname(filePath), 'thumbnails', `thumb_${file.filename}`);
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
      console.log('Thumbnail deleted:', thumbnailPath);
    }

    // Update user's storage usage
    const user = await User.findById(req.user.id);
    if (user) {
      user.storageUsed = Math.max(0, user.storageUsed - file.size);
      await user.save();
      console.log('User storage updated:', user.storageUsed);
    }

    // Soft delete the file record
    file.isActive = false;
    await file.save();

    console.log('File successfully deleted:', file.originalName);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
