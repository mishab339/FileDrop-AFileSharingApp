# FileShare - Complete Project Feature Document (PFD)

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Detailed Module Specifications](#detailed-module-specifications)
3. [Database Schema Design](#database-schema-design)
4. [API Design Patterns](#api-design-patterns)
5. [Edge Case Handling](#edge-case-handling)
6. [User Personas & Workflows](#user-personas--workflows)
7. [Security Architecture](#security-architecture)
8. [Performance & Scalability](#performance--scalability)

---

## System Architecture Overview

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │   MongoDB       │
│   (Port 3000)   │◄──►│   (Port 5000)   │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐            ┌─────▼─────┐         ┌──────▼──────┐
    │ Vite    │            │ Multer    │         │ Mongoose    │
    │ Build   │            │ File      │         │ ODM         │
    │ System  │            │ Handler   │         │ Layer       │
    └─────────┘            └───────────┘         └─────────────┘
```

### File Stream Handling Architecture
```
Client Upload Flow:
┌─────────────┐  FormData   ┌──────────────┐  Stream   ┌─────────────┐
│ React       │────────────►│ Multer       │──────────►│ File System │
│ Dropzone    │             │ Middleware   │           │ (uploads/)  │
└─────────────┘             └──────────────┘           └─────────────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │ MongoDB      │
                            │ Metadata     │
                            └──────────────┘

Download Flow:
┌─────────────┐  Request    ┌──────────────┐  Stream   ┌─────────────┐
│ Client      │────────────►│ Express      │◄──────────│ File System │
│ Browser     │◄────────────│ Response     │           │ (uploads/)  │
└─────────────┘  File Blob  └──────────────┘           └─────────────┘
```

### Component Interaction Flow
1. **Authentication Layer**: JWT tokens validate all requests
2. **Middleware Stack**: Auth → Validation → Multer → Route Handler
3. **File Processing**: Stream handling with real-time progress tracking
4. **Database Operations**: Mongoose ODM with transaction support
5. **Response Handling**: Structured JSON responses with error handling

---

## Detailed Module Specifications

### 1. Authentication Module

#### JWT Lifecycle Management
```javascript
// Token Structure
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "ObjectId",
    "email": "user@example.com",
    "role": "user|admin",
    "iat": 1640995200,
    "exp": 1641600000
  }
}

// Token Generation Flow
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};
```

#### Email Verification Flow
```
Registration → Email Sent → Verification Token → Account Activation
     │              │              │                    │
     ▼              ▼              ▼                    ▼
┌─────────┐  ┌─────────────┐  ┌──────────┐  ┌─────────────────┐
│ User    │  │ Nodemailer  │  │ Crypto   │  │ Database Update │
│ Submits │  │ SMTP        │  │ Token    │  │ isVerified:true │
│ Form    │  │ Transport   │  │ (24hrs)  │  │                 │
└─────────┘  └─────────────┘  └──────────┘  └─────────────────┘
```

#### Password Reset Security
```javascript
// Reset Token Generation (Crypto-based)
const crypto = require('crypto');

const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  return { resetToken, hashedToken };
};

// Security Features:
// - 15-minute expiration
// - One-time use tokens
// - Cryptographically secure random generation
// - SHA-256 hashing for storage
```

### 2. File/Folder System

#### Nested Folder Data Structure
```javascript
// Folder Schema (Parent-Child Relationships)
const folderSchema = {
  _id: ObjectId,
  name: String,
  parentFolder: ObjectId | null,  // null for root folders
  user: ObjectId,
  color: String,
  path: String,  // Computed path: "/parent/child/grandchild"
  level: Number, // Depth level for query optimization
  children: [ObjectId], // Array of child folder IDs
  createdAt: Date,
  updatedAt: Date,
  isDeleted: Boolean,
  deletedAt: Date
};

// Path Generation Algorithm
const generateFolderPath = async (folderId) => {
  const folder = await Folder.findById(folderId);
  if (!folder.parentFolder) return `/${folder.name}`;
  
  const parentPath = await generateFolderPath(folder.parentFolder);
  return `${parentPath}/${folder.name}`;
};
```

#### Soft Delete vs Permanent Delete Logic
```javascript
// Soft Delete Implementation
const softDeleteFile = async (fileId, userId) => {
  const file = await File.findOneAndUpdate(
    { _id: fileId, user: userId, isDeleted: false },
    { 
      isDeleted: true, 
      deletedAt: new Date(),
      deletedBy: userId 
    },
    { new: true }
  );
  
  // File remains in filesystem, metadata marked as deleted
  return file;
};

// Permanent Delete Implementation
const permanentDeleteFile = async (fileId) => {
  const file = await File.findById(fileId);
  
  // 1. Remove from filesystem
  await fs.unlink(file.filePath);
  
  // 2. Remove from database
  await File.findByIdAndDelete(fileId);
  
  // 3. Update user storage usage
  await User.findByIdAndUpdate(file.user, {
    $inc: { storageUsed: -file.size }
  });
};

// Cascade Delete for Folders
const deleteFolderCascade = async (folderId, permanent = false) => {
  const folder = await Folder.findById(folderId);
  
  // Get all child folders recursively
  const childFolders = await getChildFoldersRecursive(folderId);
  
  // Get all files in folder and subfolders
  const folderIds = [folderId, ...childFolders.map(f => f._id)];
  const files = await File.find({ folder: { $in: folderIds } });
  
  if (permanent) {
    // Delete all files permanently
    for (const file of files) {
      await permanentDeleteFile(file._id);
    }
    // Delete folders
    await Folder.deleteMany({ _id: { $in: folderIds } });
  } else {
    // Soft delete all files and folders
    await File.updateMany(
      { folder: { $in: folderIds } },
      { isDeleted: true, deletedAt: new Date() }
    );
    await Folder.updateMany(
      { _id: { $in: folderIds } },
      { isDeleted: true, deletedAt: new Date() }
    );
  }
};
```

### 3. Sharing Engine

#### ShareID Generation & Management
```javascript
// Unique ShareID Generation
const generateShareId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
};

// Share Link Structure
const shareLink = {
  shareId: "unique-share-id",
  fileId: ObjectId,
  isPublic: Boolean,
  password: String | null,  // Hashed if protected
  expiresAt: Date | null,
  createdBy: ObjectId,
  accessCount: Number,
  lastAccessed: Date,
  isActive: Boolean
};
```

#### Password Protection Flow
```javascript
// Password-Protected Share Access
const accessProtectedShare = async (shareId, password) => {
  const share = await Share.findOne({ shareId, isActive: true });
  
  if (!share) throw new Error('Share not found');
  if (share.expiresAt && share.expiresAt < new Date()) {
    throw new Error('Share expired');
  }
  
  if (share.password) {
    const isValidPassword = await bcrypt.compare(password, share.password);
    if (!isValidPassword) throw new Error('Invalid password');
  }
  
  // Update access tracking
  await Share.findByIdAndUpdate(share._id, {
    $inc: { accessCount: 1 },
    lastAccessed: new Date()
  });
  
  return share;
};
```

#### Link Expiration Cron Job Logic
```javascript
// Cron Job for Expired Links Cleanup
const cron = require('node-cron');

// Run every hour to check for expired shares
cron.schedule('0 * * * *', async () => {
  try {
    const expiredShares = await Share.updateMany(
      { 
        expiresAt: { $lt: new Date() },
        isActive: true 
      },
      { 
        isActive: false,
        deactivatedAt: new Date(),
        deactivationReason: 'expired'
      }
    );
    
    console.log(`Deactivated ${expiredShares.modifiedCount} expired shares`);
  } catch (error) {
    console.error('Error in share cleanup cron:', error);
  }
});

// Automatic cleanup of old inactive shares (30 days)
cron.schedule('0 2 * * *', async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  await Share.deleteMany({
    isActive: false,
    deactivatedAt: { $lt: thirtyDaysAgo }
  });
});
```

---

## Database Schema Design

### User Schema with Indexing
```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false  // Don't include in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  storageUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  maxStorage: {
    type: Number,
    default: 5 * 1024 * 1024 * 1024  // 5GB in bytes
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ role: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });
```

### File Schema with Relationships
```javascript
const fileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  sizeFormatted: String,  // Human readable size
  filePath: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  shareId: {
    type: String,
    unique: true,
    sparse: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    select: false
  },
  expiresAt: Date,
  description: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  downloadCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
fileSchema.index({ user: 1, isDeleted: 1 });
fileSchema.index({ folder: 1, isDeleted: 1 });
fileSchema.index({ shareId: 1 });
fileSchema.index({ isPublic: 1, expiresAt: 1 });
fileSchema.index({ mimetype: 1 });
fileSchema.index({ tags: 1 });
fileSchema.index({ createdAt: -1 });

// Text index for search functionality
fileSchema.index({
  originalName: 'text',
  description: 'text',
  tags: 'text'
});
```

### Folder Schema with Hierarchy
```javascript
const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  color: {
    type: String,
    default: '#3b82f6',
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Invalid color format'
    }
  },
  path: String,  // Computed full path
  level: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Indexes for hierarchy queries
folderSchema.index({ user: 1, parentFolder: 1, isDeleted: 1 });
folderSchema.index({ user: 1, isDeleted: 1 });
folderSchema.index({ parentFolder: 1 });
folderSchema.index({ level: 1 });

// Compound unique index to prevent duplicate folder names in same parent
folderSchema.index(
  { name: 1, parentFolder: 1, user: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
```

---

## API Design Patterns

### Middleware Stack Architecture
```javascript
// Complete Middleware Stack
app.use(helmet());  // Security headers
app.use(cors(corsOptions));  // CORS configuration
app.use(express.json({ limit: '10mb' }));  // JSON parsing
app.use(express.urlencoded({ extended: true }));  // URL encoding
app.use(rateLimit(rateLimitOptions));  // Rate limiting

// Route-specific middleware chain
router.post('/upload',
  authenticate,           // JWT verification
  validateFileUpload,     // Input validation
  checkStorageLimit,      // Storage quota check
  multer.array('files'),  // File upload handling
  uploadController        // Route handler
);
```

### Authentication Middleware
```javascript
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user deactivated.'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};
```

### Validation Middleware
```javascript
const { body, validationResult } = require('express-validator');

const validateFileUpload = [
  body('folderId')
    .optional()
    .isMongoId()
    .withMessage('Invalid folder ID'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];
```

### Error Handling Middleware
```javascript
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error
  console.error(err);
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

---

## Edge Case Handling

### Interrupted Upload Recovery
```javascript
// Multer configuration with cleanup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Cleanup incomplete uploads
const cleanupIncompleteUploads = async () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  const files = await fs.readdir(uploadsDir);
  
  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const stats = await fs.stat(filePath);
    
    // Remove files older than 1 hour that aren't in database
    if (Date.now() - stats.mtime.getTime() > 3600000) {
      const fileExists = await File.findOne({ filename: file });
      if (!fileExists) {
        await fs.unlink(filePath);
        console.log(`Cleaned up incomplete upload: ${file}`);
      }
    }
  }
};

// Run cleanup every hour
setInterval(cleanupIncompleteUploads, 3600000);
```

### Duplicate Filename Handling
```javascript
const handleDuplicateFilename = async (originalName, userId, folderId) => {
  let filename = originalName;
  let counter = 1;
  
  while (true) {
    const existingFile = await File.findOne({
      originalName: filename,
      user: userId,
      folder: folderId,
      isDeleted: false
    });
    
    if (!existingFile) break;
    
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    filename = `${name} (${counter})${ext}`;
    counter++;
  }
  
  return filename;
};
```

### Storage Limit Breach Prevention
```javascript
const checkStorageLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Calculate total size of uploaded files
    const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
    
    if (user.storageUsed + totalSize > user.maxStorage) {
      // Clean up uploaded files
      for (const file of req.files) {
        await fs.unlink(file.path);
      }
      
      return res.status(413).json({
        success: false,
        message: 'Storage limit exceeded',
        details: {
          currentUsage: user.storageUsed,
          maxStorage: user.maxStorage,
          attemptedUpload: totalSize,
          available: user.maxStorage - user.storageUsed
        }
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
```

### Concurrent Access Handling
```javascript
// File locking for concurrent operations
const fileLocks = new Map();

const acquireFileLock = (fileId) => {
  return new Promise((resolve) => {
    const checkLock = () => {
      if (!fileLocks.has(fileId)) {
        fileLocks.set(fileId, true);
        resolve();
      } else {
        setTimeout(checkLock, 100);
      }
    };
    checkLock();
  });
};

const releaseFileLock = (fileId) => {
  fileLocks.delete(fileId);
};

// Usage in file operations
const updateFileWithLock = async (fileId, updateData) => {
  await acquireFileLock(fileId);
  
  try {
    const file = await File.findByIdAndUpdate(fileId, updateData, { new: true });
    return file;
  } finally {
    releaseFileLock(fileId);
  }
};
```

---

## User Personas & Workflows

### Guest User Journey
```
1. Landing Page Access
   ├── View public file shares (no auth required)
   ├── Download public files
   └── Access password-protected shares
   
2. Registration Flow
   ├── Email/Password signup
   ├── Email verification
   └── Account activation

Technical Implementation:
- Public share routes bypass authentication
- Rate limiting on public endpoints
- Temporary session for password-protected downloads
```

### Registered User Technical Workflow
```
1. Authentication Flow
   POST /api/auth/login
   ├── Credential validation
   ├── JWT token generation
   ├── User session creation
   └── Storage usage calculation

2. File Management Operations
   ├── Upload: POST /api/files/upload
   │   ├── Multer file processing
   │   ├── Storage limit validation
   │   ├── Metadata extraction
   │   └── Database record creation
   │
   ├── Organization: POST /api/folders
   │   ├── Folder hierarchy validation
   │   ├── Path generation
   │   └── Permission checks
   │
   └── Sharing: PUT /api/files/:id
       ├── ShareID generation
       ├── Access control setup
       └── Expiration scheduling

3. File Access Patterns
   ├── Stream-based downloads
   ├── Preview generation
   └── Access logging
```

### Admin User Technical Workflow
```
1. System Monitoring
   GET /api/admin/stats
   ├── Aggregation pipelines for metrics
   ├── Real-time user activity
   └── Storage analytics

2. User Management
   ├── PUT /api/admin/users/:id (role changes)
   ├── Account activation/deactivation
   └── Storage limit modifications

3. File System Administration
   ├── Soft delete operations
   ├── Permanent cleanup procedures
   └── System maintenance tasks

Technical Features:
- Role-based middleware protection
- Audit logging for admin actions
- Bulk operation capabilities
- System health monitoring
```

---

## Security Architecture

### Multi-Layer Security Implementation
```javascript
// 1. Input Sanitization
const sanitizeInput = (req, res, next) => {
  // Remove potential XSS vectors
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };
  
  sanitize(req.body);
  sanitize(req.query);
  next();
};

// 2. Rate Limiting Configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
};

// 3. File Type Validation
const allowedMimeTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // ... more types
];

const validateFileType = (req, res, next) => {
  for (const file of req.files) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `File type ${file.mimetype} not allowed`
      });
    }
  }
  next();
};
```

### Encryption & Data Protection
```javascript
// File encryption at rest (optional enhancement)
const crypto = require('crypto');

const encryptFile = (buffer, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(buffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
};

const decryptFile = (encryptedData, key, iv) => {
  const decipher = crypto.createDecipher('aes-256-cbc', key, Buffer.from(iv, 'hex'));
  
  let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted;
};
```

---

## Performance & Scalability

### Database Optimization Strategies
```javascript
// 1. Aggregation Pipeline for Analytics
const getUserStorageStats = async (userId) => {
  return await File.aggregate([
    { $match: { user: ObjectId(userId), isDeleted: false } },
    {
      $group: {
        _id: '$mimetype',
        totalSize: { $sum: '$size' },
        fileCount: { $sum: 1 },
        avgSize: { $avg: '$size' }
      }
    },
    { $sort: { totalSize: -1 } }
  ]);
};

// 2. Pagination with Cursor-based Approach
const getPaginatedFiles = async (userId, cursor, limit = 20) => {
  const query = { 
    user: userId, 
    isDeleted: false,
    ...(cursor && { _id: { $gt: cursor } })
  };
  
  return await File.find(query)
    .sort({ _id: 1 })
    .limit(limit)
    .populate('folder', 'name color');
};

// 3. Caching Strategy
const Redis = require('redis');
const redis = Redis.createClient();

const cacheUserFiles = async (userId) => {
  const cacheKey = `user_files:${userId}`;
  const files = await File.find({ user: userId, isDeleted: false });
  
  await redis.setex(cacheKey, 300, JSON.stringify(files)); // 5 min cache
  return files;
};
```

### File Streaming Optimization
```javascript
// Efficient file streaming for large files
const streamFile = (req, res, filePath, mimetype) => {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  if (range) {
    // Support for partial content (video streaming, resume downloads)
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    
    const file = fs.createReadStream(filePath, { start, end });
    
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mimetype,
    });
    
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': mimetype,
    });
    
    fs.createReadStream(filePath).pipe(res);
  }
};
```

### Scalability Considerations
```javascript
// 1. Database Connection Pooling
const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  bufferCommands: false,
};

// 2. File Storage Sharding Strategy
const getShardedPath = (userId, filename) => {
  const userHash = crypto.createHash('md5').update(userId).digest('hex');
  const shard = userHash.substring(0, 2); // First 2 chars for sharding
  
  return path.join('uploads', shard, userId, filename);
};

// 3. Background Job Processing
const Queue = require('bull');
const fileProcessingQueue = new Queue('file processing');

fileProcessingQueue.process('generateThumbnail', async (job) => {
  const { fileId, filePath } = job.data;
  
  // Generate thumbnail using Sharp
  const thumbnailPath = await generateThumbnail(filePath);
  
  // Update database with thumbnail path
  await File.findByIdAndUpdate(fileId, { thumbnailPath });
});
```

---

This comprehensive PFD provides the technical depth needed for implementing, maintaining, and scaling the FileShare application. Each module is designed with security, performance, and maintainability in mind, following industry best practices and modern development patterns.