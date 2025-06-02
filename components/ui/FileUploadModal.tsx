'use client';

import { useState, useCallback, useRef, DragEvent } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import styles from './FileUploadModal.module.css';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  onUpload: () => void;
  accept?: string;
  maxSizeMB?: number;
  previewUrl?: string;
  isLoading?: boolean;
}

export function FileUploadModal({
  isOpen,
  onClose,
  onFileSelect,
  onUpload,
  accept = 'image/*',
  maxSizeMB = 5,
  previewUrl = '',
  isLoading = false,
}: FileUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
  };

  const validateAndProcessFile = (file: File) => {
    setError('');
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Check file size (default 5MB)
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size should be less than ${maxSizeMB}MB`);
      return;
    }
    
    onFileSelect(file);
    onClose();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`${styles.modalContent} ${isDragging ? styles.dragging : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        
        <div className={styles.modalBody}>
          <div 
            className={styles.dropZone} 
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div className={styles.previewContainer}>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className={styles.previewImage}
                />
              </div>
            ) : (
              <div className={styles.dropZoneContent}>
                <Upload size={48} className={styles.uploadIcon} />
                <h3 className={styles.title}>Drag and drop your image here</h3>
                <p className={styles.description}>or click to browse files</p>
                <p className={styles.smallText}>
                  Supports JPG, PNG up to {maxSizeMB}MB
                </p>
              </div>
            )}
            {error && <p className={styles.errorText}>{error}</p>}
          </div>
          
          {previewUrl && (
            <div className={styles.actions}>
              <button 
                className={styles.cancelButton}
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className={styles.uploadButton}
                onClick={onUpload}
                disabled={!previewUrl || isLoading}
              >
                {isLoading ? 'Uploading...' : 'Upload Picture'}
              </button>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className={styles.fileInput}
            accept={accept}
          />
        </div>
      </div>
    </div>
  );
}
