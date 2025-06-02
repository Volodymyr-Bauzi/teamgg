'use client';

import { User } from 'lucide-react';
import styles from './Avatar.module.css';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function Avatar({ src, alt = '', size = 'md', className = '' }: AvatarProps) {
  const sizeClass = styles[`size-${size}`] || '';
  
  return (
    <div className={`${styles.avatar} ${sizeClass} ${className}`}>
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className={styles.image}
          onError={(e) => {
            // Fallback to icon if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      ) : null}
      {!src && (
        <div className={styles.fallback}>
          <User className={styles.icon} />
        </div>
      )}
    </div>
  );
}

export default Avatar;
