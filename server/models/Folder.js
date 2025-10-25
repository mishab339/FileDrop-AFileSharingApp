const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Folder name is required'],
    trim: true,
    maxlength: [100, 'Folder name cannot exceed 100 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null // null means root folder
  },
  path: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#3b82f6' // Default blue color
  },
  isShared: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
folderSchema.index({ owner: 1, parentFolder: 1 });
folderSchema.index({ owner: 1, isActive: 1 });

// Virtual to get folder size (sum of all files in folder)
folderSchema.virtual('size').get(function() {
  return this._size || 0;
});

module.exports = mongoose.model('Folder', folderSchema);
