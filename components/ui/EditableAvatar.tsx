'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Camera } from 'lucide-react';
import Avatar, { AvatarProps } from './Avatar';
import styles from './EditableAvatar.module.css';

interface EditableAvatarProps extends Omit<AvatarProps, 'onChange'> {
  onChange: (file: File | null) => void;
  className?: string;
}

export function EditableAvatar({ 
  src, 
  alt, 
  size = 'lg',
  onChange,
  className = ''
}: EditableAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  // Removed direct file input click, will be handled by modal

  return (
    <div 
      className={`${styles.container} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Avatar src={src} alt={alt} size={size} />
      
      <div className={`${styles.overlay} ${isHovered ? styles.visible : ''}`}>
        <button 
          type="button" 
          className={styles.changeButton}
          onClick={(e) => {
            e.stopPropagation();
            // Call the parent's onChange with null to indicate we want to show the modal
            onChange?.(null as any);
          }}
          aria-label="Change profile picture"
        >
          <Camera className={styles.icon} />
        </button>
      </div>
    </div>
  );
}
