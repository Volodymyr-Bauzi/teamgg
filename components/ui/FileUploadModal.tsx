'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Upload, Crop, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './FileUploadModal.module.css';
import { ImageCropper } from './ImageCropper';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: File, croppedUrl: string) => void;
  previewUrl?: string;
  maxSizeMB?: number;
  aspectRatio?: number;
  isLoading?: boolean;
}

export function UploadModal({
  isOpen,
  onClose,
  onSave,
  previewUrl: initialPreviewUrl,
  maxSizeMB = 5,
  aspectRatio = 1,
  isLoading = false,
}: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl || null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const originalFileRef = useRef<File | null>(null);
  
  // Update local preview URL when the prop changes
  useEffect(() => {
    setPreviewUrl(initialPreviewUrl || null);
  }, [initialPreviewUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB`);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setCroppedImage(null);
    originalFileRef.current = file;
    setIsCropping(true);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      handleFileChange({ target: { files: e.dataTransfer.files } } as any);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context error');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
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

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const croppedUrl = URL.createObjectURL(blob);
        resolve(croppedUrl);
      }, 'image/jpeg', 0.9);
    });
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

  const handleCropComplete = useCallback(
    async (_: any, croppedPixels: any) => {
      setCroppedAreaPixels(croppedPixels);
      if (previewUrl && croppedPixels) {
        try {
          const croppedUrl = await getCroppedImg(previewUrl, croppedPixels);
          setCroppedImage(croppedUrl);
        } catch (err) {
          console.error(err);
          setError('Cropping failed');
        }
      }
    },
    [previewUrl]
  );

  const handleSave = async () => {
    if (!croppedImage || !originalFileRef.current) return;
    
    try {
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      const file = new File([blob], originalFileRef.current.name, {
        type: blob.type || 'image/jpeg', // Default to jpeg if type not available
      });
      
      onSave(file, croppedImage);
    } catch (err) {
      console.error('Error saving cropped image:', err);
      setError('Failed to save image. Please try again.');
    }
  };

  const handleStartCropping = () => setIsCropping(true);
  const handleCancelCropping = () => {
    setIsCropping(false);
    setCroppedImage(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    setPreviewUrl(null);
    setCroppedImage(null);
    setIsCropping(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`${styles.modalContent} ${isDragging ? styles.dragging : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>Upload Profile Picture</h3>
          <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div
          className={styles.modalBody}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className={styles.fileInput}
          />

          {isCropping && previewUrl ? (
            <div className={styles.cropperWrapper}>
              <ImageCropper
                image={croppedImage || previewUrl}
                onCropComplete={handleCropComplete}
                onCancel={handleCancelCropping}
                onSave={handleSave}
                aspect={aspectRatio}
              />
            </div>
          ) : (
            <>
              <div className={styles.dropZone} onClick={handleClick}>
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
              </div>

              {error && <p className={styles.errorText}>{error}</p>}

              {previewUrl && (
                <div className={styles.actions}>
                  <Button onClick={handleClose}>
                    Cancel
                  </Button>
                  <div className={styles.actionGroup}>
                    <Button
                      onClick={handleStartCropping}
                      className={styles.cropButton}
                    >
                      <Crop size={16} />
                      <span>Adjust</span>
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                      className={styles.uploadButton}
                    >
                      {isLoading ? 'Saving...' : 'Save Picture'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
