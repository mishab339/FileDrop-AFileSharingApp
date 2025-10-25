import React from 'react';
import { 
  FiFile, 
  FiImage, 
  FiVideo, 
  FiMusic, 
  FiArchive,
  FiFileText
} from 'react-icons/fi';

const FileIcon = ({ mimetype, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const getIconAndStyle = (mimetype) => {
    if (mimetype.startsWith('image/')) {
      return {
        icon: <FiImage className={`${iconSizes[size]} text-white`} />,
        className: 'file-icon image'
      };
    }
    if (mimetype.startsWith('video/')) {
      return {
        icon: <FiVideo className={`${iconSizes[size]} text-white`} />,
        className: 'file-icon video'
      };
    }
    if (mimetype.startsWith('audio/')) {
      return {
        icon: <FiMusic className={`${iconSizes[size]} text-white`} />,
        className: 'file-icon audio'
      };
    }
    if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('7z')) {
      return {
        icon: <FiArchive className={`${iconSizes[size]} text-white`} />,
        className: 'file-icon archive'
      };
    }
    if (mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('text')) {
      return {
        icon: <FiFileText className={`${iconSizes[size]} text-white`} />,
        className: 'file-icon document'
      };
    }
    return {
      icon: <FiFile className={`${iconSizes[size]} text-white`} />,
      className: 'file-icon default'
    };
  };

  const { icon, className } = getIconAndStyle(mimetype);

  return (
    <div className={`${className} ${sizeClasses[size]} hover:scale-110 transition-transform duration-200`}>
      {icon}
    </div>
  );
};

export default FileIcon;