'use client';

import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import { X, Upload, Crop } from 'lucide-react';
import { Button } from './CustomButton';
import { ImageCropper } from './ImageCropper';
import styles from './FileUploadModal.module.css';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  previewUrl?: string;
  maxSizeMB?: number;
  aspectRatio?: number;
  onPreviewUrlChange?: (url: string) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = (props) => {
  const {
    isOpen,
    onClose,
    onFileSelect,
    previewUrl: initialPreviewUrl,
    maxSizeMB = 5,
    aspectRatio = 1,
    onPreviewUrlChange,
  } = props;
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use local state for preview URL if not provided via props
  const previewUrl = initialPreviewUrl || localPreviewUrl;
  
  const updatePreviewUrl = (url: string) => {
    setLocalPreviewUrl(url);
    onPreviewUrlChange?.(url);
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = useCallback(async () => {
    if (!previewUrl || !croppedAreaPixels) return;
    
    try {
      const croppedImageUrl = await getCroppedImg(previewUrl, croppedAreaPixels);
      setCroppedImage(croppedImageUrl);
      setIsCropping(false);
    } catch (e) {
      console.error('Error cropping image:', e);
      setError('Failed to crop image');
    }
  }, [previewUrl, croppedAreaPixels]);

  const handleUpload = useCallback(async () => {
    if (croppedImage) {
      try {
        // Convert the cropped image URL to a File object
        const response = await fetch(croppedImage);
        const blob = await response.blob();
        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
        onFileSelect(file);
        onClose();
      } catch (e) {
        console.error('Error uploading image:', e);
        setError('Failed to upload image');
      }
    }
  }, [croppedImage, onFileSelect, onClose]);

  const handleSave = useCallback(async () => {
    if (croppedImage) {
      try {
        // Convert the cropped image URL to a File object
        const response = await fetch(croppedImage);
        const blob = await response.blob();
        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
        onFileSelect(file);
        onClose();
      } catch (e) {
        console.error('Error saving image:', e);
        setError('Failed to save image');
      }
    } else if (previewUrl) {
      // If no cropping was done, use the original image
      try {
        const response = await fetch(previewUrl);
        const blob = await response.blob();
        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
        onFileSelect(file);
        onClose();
      } catch (e) {
        console.error('Error saving original image:', e);
        setError('Failed to save image');
      }
    }
  }, [croppedImage, previewUrl, onFileSelect, onClose]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateAndSetFile(file)) {
        const url = URL.createObjectURL(file);
        updatePreviewUrl(url);
        setIsCropping(true);
        // Reset cropping state when new file is dropped
        setCroppedImage(null);
        setCroppedAreaPixels(null);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateAndSetFile(file)) {
        const url = URL.createObjectURL(file);
        updatePreviewUrl(url);
        setIsCropping(true);
      }
    }
  };
  
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateAndSetFile(file)) {
        const url = URL.createObjectURL(file);
        updatePreviewUrl(url);
        setIsCropping(true);
      }
    }
  };

  const validateAndSetFile = (file: File) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return false;
    }

    // Check file size (default 5MB)
    const maxSize = (maxSizeMB || 5) * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      setError(`File size should be less than ${maxSizeMB || 5}MB`);
      return false;
    }

    setError('');
    onFileSelect(file);
    return true;
  };

  const getCroppedImg = async (imageSrc: string, pixelCrop: any) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not create canvas context');
    }

    // Set canvas size to the cropped size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // Return as a blob URL
    return new Promise<string>((resolve) => {
      canvas.toBlob((file) => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        resolve(url);
      }, 'image/jpeg', 0.9);
    });
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleCropComplete = useCallback(async (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
    
    if (previewUrl && croppedAreaPixels) {
      try {
        const croppedImg = await getCroppedImg(
          previewUrl,
          croppedAreaPixels
        );
        setCroppedImage(croppedImg);
      } catch (e) {
        console.error('Error cropping image:', e);
        setError('Failed to crop image');
      }
    }
  }, [previewUrl]);

  const handleStartCropping = () => {
    setIsCropping(true);
  };

  const handleCancelCropping = () => {
    setIsCropping(false);
    setCroppedImage(null);
  };

  if (!isOpen) return null;
  
  const renderModalContent = () => {
    if (isCropping && previewUrl) {
      return (
        <div className={styles.cropperWrapper}>
          <ImageCropper
            image={croppedImage || previewUrl}
            onCropComplete={handleCropComplete}
            onCancel={handleCancelCropping}
            onSave={handleSave}
            shape="round"
          />
        </div>
      );
    }

    return (
      <>
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
                src={croppedImage || previewUrl} 
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
            <Button 
              variant="outline"
              onClick={onClose}
              disabled={false}
            >
              Cancel
            </Button>
            <div className={styles.actionGroup}>
              <Button 
                variant="outline"
                onClick={handleStartCropping}
                disabled={!previewUrl}
                className={styles.cropButton}
              >
                <Crop size={16} />
                <span>Adjust</span>
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!previewUrl}
                className={styles.uploadButton}
              >
                Save Picture
              </Button>
            </div>
          </div>
        )}
      </>
    );
  };



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
          {renderModalContent()}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className={styles.fileInput}
            accept="image/*"
          />
        </div>
      </div>
    </div>
  );
}
