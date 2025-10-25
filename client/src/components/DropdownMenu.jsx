import React, { useState, useRef, useEffect } from 'react';
import { FiMoreVertical } from 'react-icons/fi';

const DropdownMenu = ({ children, className = "", onCardLeave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // Locked state when clicked
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // Reset when parent card is unhovered
  useEffect(() => {
    if (onCardLeave) {
      const handleReset = () => {
        setIsLocked(false);
        setIsOpen(false);
      };
      return () => handleReset;
    }
  }, [onCardLeave]);

  // Click outside handler for locked state
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isLocked && 
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target)) {
        setIsLocked(false);
        setIsOpen(false);
      }
    };

    if (isLocked) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLocked]);

  const calculateDropdownPosition = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 200;
      
      if (buttonRect.bottom + dropdownHeight > viewportHeight - 20) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  };

  const handleMouseEnter = () => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    if (!isLocked) {
      calculateDropdownPosition();
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isLocked) {
      // Add a small delay before closing
      closeTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 300); // 300ms delay
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    calculateDropdownPosition();
    
    if (isLocked) {
      // If already locked, unlock and close
      setIsLocked(false);
      setIsOpen(false);
    } else {
      // Lock the dropdown open
      setIsLocked(true);
      setIsOpen(true);
    }
  };

  const handleItemClick = (callback) => (e) => {
    e.stopPropagation();
    
    // Clear any pending timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    setIsLocked(false);
    setIsOpen(false);
    if (callback) callback(e);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`relative inline-block ${className}`} 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        ref={buttonRef}
        className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
        onClick={handleClick}
        aria-label="More options"
      >
        <FiMoreVertical className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div 
          className={`absolute right-0 w-40 sm:w-44 bg-white rounded-lg shadow-xl border border-gray-200 z-[60] animate-fade-in ${
            dropdownPosition === 'top' 
              ? 'bottom-full mb-1.5 sm:mb-2' 
              : 'top-full mt-1.5 sm:mt-2'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1.5 sm:py-2">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  onClick: handleItemClick(child.props.onClick)
                });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ children, onClick, className = "", variant = "default" }) => {
  const baseClasses = "flex items-center w-full px-2.5 py-2 sm:px-3 sm:py-2.5 text-sm font-medium transition-colors duration-150 rounded-md mx-1";
  const variantClasses = {
    default: "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
    danger: "text-red-600 hover:bg-red-50 hover:text-red-700"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const DropdownDivider = () => (
  <div className="border-t border-gray-200 my-1 mx-2" />
);

export default DropdownMenu;